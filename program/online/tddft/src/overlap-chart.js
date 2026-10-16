/** Native SVG rendering for one selected excitation set per imported file. */

const COLORS = ['#0072b2', '#b45d73', '#009575', '#b07800', '#6b62a2', '#c4602d', '#438ca2', '#6e7735'];
const DASHES = ['', '7 3', '2 3', '10 3 2 3', '4 2'];
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g,
  (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
let renderId = 0;

/** Stable, redundant color and line-pattern encoding for a file's index. */
export function overlapStyle(index) {
  const position = Number.isInteger(index) && index >= 0 ? index : 0;
  return { color: COLORS[position % COLORS.length], dash: DASHES[position % DASHES.length] };
}

/**
 * Render only member curves, or only the arithmetic sum, on the model's common
 * sampling grid. Source spectra and options are never modified. The returned
 * series identify the same visible spectra used for tooltip evaluation.
 */
export function drawOverlapChart(svg, {
  model, config, names, mode = 'both', sum = false, axisLabel, ticks, tickFormat,
}) {
  if (!svg || typeof svg.setAttribute !== 'function') throw new TypeError('An SVG element is required.');
  if (!model || !Array.isArray(model.series)) throw new TypeError('An overlap model is required.');
  if (!config || !finite(config.minX) || !finite(config.maxX) || config.minX >= config.maxX) {
    throw new RangeError('An increasing finite plot range is required.');
  }
  if (!['uv', 'ecd', 'both'].includes(mode)) throw new RangeError('Visible spectrum mode must be uv, ecd, or both.');
  if (typeof ticks !== 'function' || typeof tickFormat !== 'function') throw new TypeError('Tick helpers are required.');

  const fileCount = model.series.length;
  const series = sum
    ? (model.sum ? [{ id: 'sum', label: `Sum (${fileCount} ${fileCount === 1 ? 'file' : 'files'})`, spectrum: model.sum, color: '#111111', dash: '' }] : [])
    : model.series.map((entry, index) => ({ id: entry.id ?? `file-${index + 1}`,
      label: String(entry.label ?? `File ${index + 1}`), spectrum: entry.spectrum, ...overlapStyle(index) }));
  const modes = mode === 'both' ? ['uv', 'ecd'] : [mode];
  const fullWidth = Math.max(340, Math.round(svg.clientWidth || 1000));
  const compact = fullWidth < 500;
  const panelHeight = modes.length === 2 ? (compact ? 160 : 190) : (compact ? 260 : 292);
  const left = compact ? 70 : 86;
  const right = compact ? 16 : 25;
  const rightEdge = fullWidth - right;
  const width = rightEdge - left;
  const pitch = panelHeight + 64;
  const lastBottom = 35 + (modes.length - 1) * pitch + panelHeight;
  const legendTop = lastBottom + 90;
  const legendColumns = fullWidth >= 650 ? 2 : 1;
  const legendRows = Math.ceil(series.length / legendColumns);
  const height = legendTop + Math.max(legendRows, 1) * 26 + 22;
  const minX = config.minX, maxX = config.maxX;
  const scaleX = (value) => left + (value - minX) / (maxX - minX) * width;
  const identifier = `overlap-${++renderId}`;
  const emission = config.family === 'emission';
  const displayNames = { uv: names?.uv || (emission ? 'FL' : 'UV–vis'), ecd: names?.ecd || (emission ? 'CPL' : 'ECD') };
  const title = `${modes.map((channel) => displayNames[channel]).join(' and ')} · ${sum ? 'arithmetic sum' : 'file overlap'}`;
  const sourceDescription = model.series.map((entry) => String(entry.label ?? entry.id ?? 'unlabelled file')).join('; ');
  const coverageDescription = sum ? modes.map((channel) => `${displayNames[channel]}: ${model.sum.metadata[channel === 'uv' ? 'contributingUvFiles' : 'contributingEcdFiles'] ?? fileCount}/${fileCount} contributing files${model.sum.metadata.partialChannels?.[channel] ? ', partial data' : ''}`).join('; ') : '';
  const description = `One chosen excitation set per file. ${emission ? 'Each file uses Gaussian state 1 only for emission; both FL/CPL intensities are multiplied by 1000 before optional normalization.' : 'Each chosen set contributes its printed excited states.'} ${sum ? 'The sum is formed from raw intensities before any final normalization.' : 'Each file is plotted separately on a common grid.'} ${config.normalize ? (sum ? 'The final summed curves are independently normalized by channel.' : 'Individual curves are independently normalized by file and channel.') : 'No normalization is applied.'} ${config.shape === 'lorentzian' ? 'Lorentzian' : 'Gaussian'} broadening, FWHM ${config.fwhm} eV; shift ${config.shift} eV; ${displayNames.ecd} ${config.gauge} gauge. ${coverageDescription} Sources: ${sourceDescription}`;
  let markup = `<title>${escape(title)}</title><desc>${escape(description)}</desc><rect width="${fullWidth}" height="${height}" fill="white"/><defs>`;
  modes.forEach((channel, index) => {
    markup += `<clipPath id="${identifier}-${index}"><rect x="${left}" y="${35 + index * pitch}" width="${width}" height="${panelHeight}"/></clipPath>`;
  });
  markup += '</defs>';
  const panels = [];

  modes.forEach((channel, index) => {
    const top = 35 + index * pitch;
    let minimum = 0, maximum = 0, available = 0;
    for (const entry of series) {
      for (const point of entry.spectrum?.points ?? []) {
        if (!finite(point[channel])) continue;
        minimum = Math.min(minimum, point[channel]);
        maximum = Math.max(maximum, point[channel]);
        available += 1;
      }
    }
    const symmetric = Math.max(Math.abs(minimum), Math.abs(maximum)) * 1.14 || 1;
    const minY = channel === 'ecd' ? -symmetric : minimum < 0 ? minimum * 1.14 : 0;
    const maxY = channel === 'ecd' ? symmetric : maximum > 0 ? maximum * 1.14 : minY < 0 ? 0 : 1;
    const scaleY = (value) => top + panelHeight - (value - minY) / (maxY - minY) * panelHeight;
    panels.push({ mode: channel, top, height: panelHeight, minY, maxY });
    for (const value of ticks(minY, maxY, channel === 'uv' ? 4 : 5)) {
      const position = scaleY(value);
      markup += `<line x1="${left}" x2="${rightEdge}" y1="${position}" y2="${position}" stroke="${value === 0 ? '#cbd7c8' : '#edf1e9'}" stroke-width="1"${value === 0 ? '' : ' stroke-dasharray="3 5"'}/><text x="${left - 10}" y="${position + 4}" text-anchor="end" fill="#75876d" font-size="12">${escape(tickFormat(value))}</text>`;
    }
    const last = index === modes.length - 1;
    for (const value of ticks(minX, maxX, compact ? 4 : 7)) {
      const position = scaleX(value);
      markup += `<line x1="${position}" x2="${position}" y1="${top}" y2="${top + panelHeight}" stroke="#f1f4ec" stroke-width="1"/>`;
      if (last) markup += `<text x="${position}" y="${top + panelHeight + 28}" text-anchor="middle" fill="#95a38d" font-size="13">${escape(tickFormat(value))}</text>`;
    }
    const units = series.find((entry) => entry.spectrum?.units?.[channel])?.spectrum.units[channel]
      ?? (emission ? 'relative photon intensity' : config.normalize ? 'relative units' : 'L mol⁻¹ cm⁻¹');
    const ordinate = `${emission ? displayNames[channel] : channel === 'uv' ? 'ε' : 'Δε'} / ${units}`;
    markup += `<text x="${left + 10}" y="${top + 19}" fill="#576a54" font-size="12" font-weight="600" letter-spacing="1">${escape(displayNames[channel].toUpperCase())}</text><text x="18" y="${top + panelHeight / 2}" transform="rotate(-90 18 ${top + panelHeight / 2})" text-anchor="middle" fill="#75876d" font-size="12">${escape(ordinate)}</text>`;
    if (sum && model.sum.metadata.partialChannels?.[channel]) {
      const contributing = model.sum.metadata[channel === 'uv' ? 'contributingUvFiles' : 'contributingEcdFiles'] ?? 0;
      const note = contributing < fileCount ? `Partial sum · ${contributing}/${fileCount} files` : 'Partial sum · missing state data';
      markup += `<text x="${rightEdge - 8}" y="${top + 19}" text-anchor="end" fill="#9a723d" font-size="11">${escape(note)}</text>`;
    }
    for (const entry of series) {
      let path = '', connected = false;
      for (const point of entry.spectrum?.points ?? []) {
        if (!finite(point.x) || !finite(point[channel])) { connected = false; continue; }
        path += `${connected ? 'L' : 'M'}${scaleX(point.x).toFixed(2)},${scaleY(point[channel]).toFixed(2)}`;
        connected = true;
      }
      if (path) markup += `<path d="${path}" fill="none" stroke="${entry.color}" stroke-width="${sum ? 2.7 : 2.2}"${entry.dash ? ` stroke-dasharray="${entry.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${identifier}-${index})"><title>${escape(entry.label)} · ${escape(displayNames[channel])}</title></path>`;
    }
    if (!available) {
      const message = channel === 'ecd' ? `No ${config.gauge}-gauge R values available` : 'No oscillator strengths available';
      markup += `<text x="${left + width / 2}" y="${top + panelHeight / 2}" text-anchor="middle" fill="#8d9a84" font-size="${compact ? 12 : 14}">${escape(message)}</text>`;
    }
    markup += `<line x1="${left}" x2="${rightEdge}" y1="${top + panelHeight}" y2="${top + panelHeight}" stroke="#d3decb"/>`;
    if (last) markup += `<text x="${left + width / 2}" y="${top + panelHeight + 60}" text-anchor="middle" fill="#899c81" font-size="14">${escape(axisLabel ?? '')}</text>`;
  });

  const legendCell = width / legendColumns;
  const labelCharacters = Math.max(10, Math.floor((legendCell - 50) / 6.8));
  series.forEach((entry, index) => {
    const x = left + index % legendColumns * legendCell;
    const y = legendTop + Math.floor(index / legendColumns) * 26;
    const visibleLabel = entry.label.length > labelCharacters ? `${entry.label.slice(0, labelCharacters - 1)}…` : entry.label;
    markup += `<g><title>${escape(entry.label)}</title><line x1="${x}" x2="${x + 26}" y1="${y - 4}" y2="${y - 4}" stroke="${entry.color}" stroke-width="${sum ? 2.7 : 2.2}"${entry.dash ? ` stroke-dasharray="${entry.dash}"` : ''}/><text x="${x + 35}" y="${y}" fill="#65775e" font-size="13">${escape(visibleLabel)}</text></g>`;
  });
  svg.setAttribute('viewBox', `0 0 ${fullWidth} ${height}`);
  svg.setAttribute('aria-label', title);
  svg.innerHTML = markup;
  return { minX, maxX, left, width, fullWidth, height, panels, config, series, overlap: true };
}
