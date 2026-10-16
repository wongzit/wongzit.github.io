import { generateSpectrum, generateWavelengthSpectrum } from './spectrum.js';
import { formatContributionPercentage } from './contributions.js';
import { buildCurveRows, buildStickRows } from './exports.js';
import { calculateTransitionProperties } from './transition-properties.js';
import { createMoleculeViewer } from './molecule-viewer.js';
import { generateOverlapSpectrum, generateWavelengthOverlapSpectrum } from './overlap.js';
import { drawOverlapChart, overlapStyle } from './overlap-chart.js';

const $ = (id) => document.getElementById(id);
// Keep the single-file heading editable in index.html.
const defaultChartTitle = $('chart-title').textContent.trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const fmt = (n, digits = 3) => finite(n) ? n.toFixed(digits) : '—';
const axisLabel = { nm: 'Wavelength / nm', ev: 'Energy / eV', 'cm-1': 'Wavenumber / cm⁻¹' };
const axisUnit = { nm: 'nm', ev: 'eV', 'cm-1': 'cm⁻¹' };
const state = { files: [], datasets: [], active: 0, selected: null, mode: 'both', overlapChannel: 'both', overlap: null, sort: 'number', ascending: true, spectrum: null, plot: null, demo: false, busy: false, electricGauge: 'length' };
let toastTimer;
let worker;
let workerCounter = 0;
let fileCounter = 0;
const pending = new Map();
const moleculeViewer = createMoleculeViewer($('molecule-viewer'));

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4000);
}

function parseText(text, filename) {
  if (!worker) {
    worker = new Worker(new URL('./parser-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      data.error ? request.reject(new Error(data.error)) : request.resolve(data.result);
    };
    worker.onerror = () => {
      for (const request of pending.values()) request.reject(new Error('The parser could not start. Serve this page over HTTP(S), then try again.'));
      pending.clear();
      worker.terminate();
      worker = null;
    };
  }
  return new Promise((resolve, reject) => {
    const id = ++workerCounter;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, text, filename });
  });
}

function active() { return state.datasets[state.active]; }
function isSynthetic(item = active()) { return Boolean(item?.result.metadata?.synthetic); }
function states() { return active()?.job.states ?? []; }
function currentR(s) { return s[$('gauge').value === 'length' ? 'rotatoryStrengthLength' : 'rotatoryStrengthVelocity']; }
function isEmission() { return $('family').value === 'emission'; }
function spectrumStates() { return isEmission() ? states().filter((s) => s.number === 1) : states(); }
function seriesNames() { return isEmission() ? { uv: 'FL', ecd: 'CPL' } : { uv: 'UV–vis', ecd: 'ECD' }; }
function isOverlap() { return state.mode === 'overlap' && state.files.length > 1; }
function overlapEntries() {
  return state.files.map((file, index) => {
    const job = file.result.jobs[file.selectedJobIndex ?? 0];
    return { id: file.id, label: `${index + 1}. ${file.demo ? 'DEMO · ' : ''}${file.result.filename} · ${job.label || job.id}`, states: job.states,
      filename: file.result.filename, jobId: job.id, syntheticDemo: isSynthetic(file) };
  });
}
function selectedDataset(index) {
  state.active = index;
  const item = active();
  if (item) item.file.selectedJobIndex = item.file.result.jobs.indexOf(item.job);
  state.selected = (isEmission() ? states().find((s) => s.number === 1) : states()[0])?.number ?? null;
  $('state-search').value = '';
  $('dataset').value = String(index);
}

function renderOverlapControls() {
  const names = seriesNames();
  $('overlap-tab').hidden = state.files.length < 2;
  if (state.mode === 'overlap' && state.files.length < 2) state.mode = 'both';
  $('overlap-controls').hidden = !isOverlap();
  $('show-sticks').closest('label').hidden = isOverlap();
  document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
  $('overlap-channel').options[0].textContent = names.uv;
  $('overlap-channel').options[1].textContent = names.ecd;
  $('overlap-channel').value = state.overlapChannel;
  $('overlap-note').textContent = $('overlap-sum').checked
    ? `Sum adds raw ${names.uv}/${names.ecd} intensities with equal weight, using one selected excitation set per file. Normalization, when enabled, is applied after summing.`
    : `One selected excitation set per file. Colors identify files; all curves use the same broadening and plot range.`;
  $('overlap-note').dataset.partial = 'false';
  // Keep controls mounted while settings change so keyboard focus is retained.
  const signature = state.files.map((file) => `${file.id}:${file.selectedJobIndex ?? 0}`).join('|');
  if ($('overlap-files').dataset.signature !== signature) {
    $('overlap-files').dataset.signature = signature;
    $('overlap-files').replaceChildren(...state.files.map((file, index) => {
      const row = document.createElement('div'); row.className = 'overlap-file';
      const key = document.createElement('span'); key.className = 'overlap-file-key';
      key.style.borderColor = overlapStyle(index).color;
      key.style.borderTopStyle = overlapStyle(index).dash ? 'dashed' : 'solid';
      const label = document.createElement('label'); label.textContent = `${index + 1}. ${file.demo ? 'DEMO · ' : ''}${file.result.filename}`;
      label.title = file.result.filename;
      const id = `overlap-set-${file.id}`; label.htmlFor = id;
      const select = document.createElement('select'); select.id = id; select.dataset.fileId = file.id;
      select.setAttribute('aria-label', `Excitation set for file ${index + 1}: ${file.result.filename}`);
      select.replaceChildren(...file.result.jobs.map((job, jobIndex) => new Option(job.label || job.id, String(jobIndex))));
      select.value = String(file.selectedJobIndex ?? 0);
      select.disabled = file.result.jobs.length === 1;
      row.append(key, label, select); return row;
    }));
  }
}

async function readFiles(fileList, demo = false) {
  if (state.busy) return;
  const files = Array.from(fileList);
  if (!files.length) return;
  state.busy = true;
  $('file-input').disabled = true;
  $('load-demo').disabled = true;
  $('empty-demo').disabled = true;
  const errors = [];
  let imported = 0;
  const added = [];
  try {
    for (const file of files) {
      $('input-status').textContent = `Reading ${file.name}…`;
      if (file.size > 50 * 1024 * 1024) { errors.push(`${file.name}: exceeds the 50 MB limit.`); continue; }
      try {
        const text = await file.text();
        if (text.includes('\0')) throw new Error('This appears to be a binary file. Use Gaussian text output (.log or .out).');
        const result = await parseText(text, file.name);
        if (!result.jobs.length) throw new Error(result.warnings.join(' ') || 'No excited-state information found. Use a completed TD-DFT output.');
        added.push({ id: `file-${++fileCounter}`, result, demo: demo || Boolean(result.metadata?.synthetic), builtInDemo: demo, selectedJobIndex: 0 });
        imported += result.jobs.length;
      } catch (error) { errors.push(`${file.name}: ${error.message}`); }
    }
    if (added.length) {
      if (demo) state.files = [];
      else state.files = state.files.filter((file) => !file.builtInDemo);
      state.files.push(...added);
      state.demo = state.files.every((file) => file.demo);
      state.datasets = state.files.flatMap((file) => file.result.jobs.map((job) => ({ job, file, result: file.result, demo: file.demo })));
      state.active = state.datasets.length - added.at(-1).result.jobs.length;
      state.selected = (isEmission() ? states().find((s) => s.number === 1) : states()[0])?.number ?? null;
      updateDatasets();
      fitRange();
      render();
      toast(demo ? 'Gaussian example loaded. Select a state to inspect its details.' : `${imported} excitation set${imported === 1 ? '' : 's'} loaded. Your file stays in this browser.`);
    }
    $('input-status').textContent = errors.length ? errors.join(' ') : demo ? 'Gaussian example · demo.log' : `${state.files.length} file${state.files.length === 1 ? '' : 's'} loaded locally.`;
    $('input-status').style.color = errors.length ? '#a46535' : '';
  } finally {
    state.busy = false;
    $('file-input').disabled = false;
    $('load-demo').disabled = false;
    $('empty-demo').disabled = false;
    $('file-input').value = '';
  }
}

async function loadDemo() {
  try {
    const response = await fetch(new URL('../demo/demo.log', import.meta.url));
    if (!response.ok) throw new Error('The Gaussian example could not be loaded.');
    const text = await response.text();
    await readFiles([new File([text], 'demo.log', { type: 'text/plain' })], true);
  } catch (error) { $('input-status').textContent = `${error.message} Open this page using a local HTTP server or your website.`; }
}

function updateDatasets() {
  $('dataset-controls').hidden = !state.datasets.length;
  $('dataset').replaceChildren(...state.datasets.map((item, i) => new Option(`${item.demo ? 'DEMO · ' : ''}${item.result.filename} · ${item.job.label || `set ${i + 1}`}`, String(i))));
  $('dataset').value = String(state.active);
}

function options() {
  const config = {
    axis: $('axis').value, minX: Number($('range-min').value), maxX: Number($('range-max').value),
    fwhm: Number($('fwhm-value').value), shift: Number($('shift').value), shape: $('shape').value,
    gauge: $('gauge').value, normalize: $('normalize').checked, points: 1600, family: $('family').value,
  };
  if (!finite(config.fwhm) || config.fwhm < 0.01 || config.fwhm > 3) throw new Error('Set a linewidth between 0.01 and 3.00 eV.');
  if (!$('range-min').value || !$('range-max').value) throw new Error('Enter both plot range limits.');
  if (!$('shift').value || !finite(config.shift) || config.shift < -10 || config.shift > 10) throw new Error('Set an energy shift between −10 and 10 eV.');
  return config;
}

function fitRange() {
  try {
    const config = { axis: $('axis').value, fwhm: Number($('fwhm-value').value) || .4, shift: Number($('shift').value) || 0, points: 200, family: $('family').value };
    const spec = isOverlap() ? generateOverlapSpectrum(overlapEntries(), config).sum : generateSpectrum(states(), config);
    if (spec.minX != null) {
      const digits = $('axis').value === 'ev' ? 2 : 0;
      $('range-min').value = Math.max($('axis').value === 'ev' ? .01 : 1, spec.minX).toFixed(digits);
      $('range-max').value = spec.maxX.toFixed(digits);
    }
  } catch { /* The visible validation message is rendered with the spectrum. */ }
}

function render() {
  renderOverlapControls();
  const all = states();
  const item = active();
  const have = all.length > 0;
  const plotted = spectrumStates();
  const names = seriesNames();
  const energies = plotted.map((s) => s.energyEv).filter(finite);
  const bright = plotted.filter((s) => finite(s.oscillatorStrength)).sort((a, b) => b.oscillatorStrength - a.oscillatorStrength)[0];
  const ecdCount = plotted.filter((s) => finite(currentR(s))).length;
  $('family-note').hidden = !isEmission();
  $('gauge-label').textContent = `${names.ecd} rotatory strength`;
  $('stat-bright-label').textContent = isEmission() ? 'FIRST EXCITED STATE' : 'BRIGHTEST TRANSITION';
  $('stat-ecd-label').textContent = `${names.ecd} DATA`;
  document.querySelector('[data-mode="uv"]').textContent = names.uv;
  document.querySelector('[data-mode="ecd"]').textContent = names.ecd;
  $('legend-uv').textContent = names.uv;
  $('legend-ecd').textContent = names.ecd;
  const exportPrefix = isOverlap() ? $('overlap-sum').checked ? 'Sum · ' : 'Active file · ' : '';
  $('export-spectrum-uv').textContent = `${exportPrefix}${names.uv} curve · CSV (0.5 nm)`;
  $('export-spectrum-ecd').textContent = `${exportPrefix}${names.ecd} curve · CSV (0.5 nm)`;
  $('export-sticks').textContent = `${isOverlap() ? 'Active file · ' : ''}Oscillator strengths · CSV`;
  $('export-states').textContent = `${isOverlap() ? 'Active file · ' : ''}Excited states · CSV`;
  $('spectrum-chart').setAttribute('aria-label', `${names.uv} and ${names.ecd} spectra`);
  $('table-r-note').textContent = `R in 10⁻⁴⁰ cgs · selected ${names.ecd} gauge${isEmission() ? ' · FL/CPL plots state 1 only' : ''}`;
  $('stat-states').textContent = have ? all.length : '—';
  $('stat-state-note').textContent = have ? isEmission() ? 'FL/CPL uses state 1 only' : `${state.datasets.length} excitation set${state.datasets.length === 1 ? '' : 's'} available` : 'Awaiting a calculation';
  $('stat-energy').textContent = energies.length ? energies.length === 1 ? fmt(energies[0], 2) : `${fmt(Math.min(...energies), 2)}–${fmt(Math.max(...energies), 2)}` : '—';
  $('stat-bright').textContent = bright ? `#${bright.number} · ${fmt(bright.oscillatorStrength, 3)}` : '—';
  $('stat-bright-note').textContent = bright ? `f at ${fmt(bright.wavelengthNm, 1)} nm` : 'oscillator strength';
  $('stat-ecd').textContent = have && plotted.length ? `${ecdCount}/${plotted.length}` : '—';
  $('stat-ecd-note').textContent = `${$('gauge').value}-gauge R values`;
  $('chart-title').textContent = isOverlap() ? `${$('overlap-sum').checked ? 'Sum of' : 'Compare'} ${state.files.length} output files.` : defaultChartTitle;
  $('chart-dataset-label').textContent = isOverlap() ? `${state.files.length} files · one excitation set per file` : item ? `${isSynthetic(item) ? 'SYNTHETIC DEMO · ' : item.file.builtInDemo ? 'GAUSSIAN EXAMPLE · ' : ''}${item.result.filename} · ${item.job.label || 'excitation set'}` : 'No calculation loaded';
  $('data-badge').textContent = isOverlap() ? `${$('overlap-sum').checked ? 'SUM' : 'OVERLAP'} · ${state.files.length} FILES` : item ? isSynthetic(item) ? 'ILLUSTRATIVE DEMO' : item.file.builtInDemo ? 'GAUSSIAN EXAMPLE' : 'LOCAL CALCULATION' : 'NO DATA LOADED';
  $('spectrum-legend').hidden = isOverlap();
  $('table-source').textContent = isOverlap() && item ? `ACTIVE FILE · ${item.result.filename}` : 'BEYOND THE CURVE';
  const metadata = item?.job.metadata;
  $('dataset-meta').textContent = item ? [item.job.method, metadata?.charge != null ? `charge ${metadata.charge}` : null, metadata?.multiplicity != null ? `multiplicity ${metadata.multiplicity}` : null, item.job.normalTermination ? 'normal termination' : 'termination unconfirmed'].filter(Boolean).join(' · ') : '';
  $('state-count').textContent = all.length;
  $('chart-empty').hidden = have;
  $('chart-tooltip').hidden = true;
  $('spectrum-error').hidden = true;
  let spectrumWarnings = [];
  try {
    const config = options();
    state.spectrum = generateSpectrum(all, config);
    state.overlap = isOverlap() ? generateOverlapSpectrum(overlapEntries(), config) : null;
    spectrumWarnings = isOverlap() ? state.overlap.warnings : state.spectrum.warnings;
    if (isOverlap() && $('overlap-sum').checked) {
      const channels = state.overlapChannel === 'both' ? ['uv', 'ecd'] : [state.overlapChannel];
      const partial = channels.filter((channel) => state.overlap.sum.metadata.partialChannels[channel]);
      if (partial.length) {
        const coverage = partial.map((channel) => {
          const count = state.overlap.sum.metadata[channel === 'uv' ? 'contributingUvFiles' : 'contributingEcdFiles'];
          return `${names[channel]}: ${count}/${state.files.length} files contribute${count === state.files.length ? ', with missing state strengths' : ''}`;
        }).join('; ');
        $('overlap-note').textContent += ` Partial sum — ${coverage}.`;
        $('overlap-note').dataset.partial = 'true';
        $('data-badge').textContent += ' · PARTIAL';
      }
    }
    $('plot-note').textContent = `${isOverlap() ? $('overlap-sum').checked ? 'Sum · ' : 'Overlap · ' : ''}${names.uv}/${names.ecd}${isEmission() ? isOverlap() ? ' · state 1 per file' : ' · state 1' : ''} · ${config.shape === 'gaussian' ? 'Gaussian' : 'Lorentzian'} · FWHM ${fmt(config.fwhm, 2)} eV${config.shift ? ` · shift ${config.shift > 0 ? '+' : ''}${fmt(config.shift, 2)} eV` : ''}${isEmission() && !config.normalize ? ' · intensities ×1000' : ''}${config.normalize ? isOverlap() && $('overlap-sum').checked ? ' · sum normalized after adding' : ' · independently normalized' : ''}`;
    drawChart();
  } catch (error) {
    state.spectrum = null;
    state.overlap = null;
    state.plot = null;
    $('spectrum-chart').replaceChildren();
    $('spectrum-error').hidden = false;
    $('spectrum-error').textContent = error.message;
  }
  const sourceWarnings = isOverlap() ? state.files.flatMap((file, index) => [...file.result.warnings, ...file.result.jobs[file.selectedJobIndex ?? 0].warnings].map((warning) => `${index + 1}. ${file.result.filename}: ${warning}`)) : [...(item?.result.warnings ?? []), ...(item?.job.warnings ?? [])];
  const warnings = [...new Set([...sourceWarnings, ...(have ? spectrumWarnings : [])])];
  $('warnings').hidden = !warnings.length;
  $('warnings').innerHTML = warnings.length ? `<details><summary>${warnings.length} calculation / spectrum note${warnings.length === 1 ? '' : 's'}</summary><ul>${warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></details>` : '';
  for (const id of ['export-svg', 'export-states', 'export-json']) $(id).disabled = !have;
  const curveSpectrum = isOverlap() && $('overlap-sum').checked ? state.overlap?.sum : state.spectrum;
  $('export-spectrum-uv').disabled = !have || !curveSpectrum?.points.length || !curveSpectrum.metadata.availableUvStates;
  $('export-spectrum-ecd').disabled = !have || !curveSpectrum?.points.length || !curveSpectrum.metadata.availableEcdStates;
  $('export-sticks').disabled = !have || !state.spectrum?.sticks.length;
  $('export-svg').disabled = !have || !(isOverlap() ? state.overlap?.sum : state.spectrum)?.points.length;
  renderTable();
  renderDetail();
}

function ticks(min, max, count = 5) {
  if (!finite(min) || !finite(max) || max <= min) return [0, 1];
  const rough = (max - min) / count;
  const base = 10 ** Math.floor(Math.log10(rough));
  const factor = rough / base;
  const step = (factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 2.5 ? 2.5 : factor <= 5 ? 5 : 10) * base;
  const output = [];
  for (let n = Math.ceil(min / step) * step; n <= max + step * 1e-7 && output.length < 30; n += step) output.push(Math.abs(n) < step * 1e-7 ? 0 : n);
  return output;
}

function tickFormat(value) {
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (!value) return '0';
  if (Math.abs(value) < .01) return value.toExponential(1);
  return Number(value.toPrecision(4)).toString();
}

function drawChart() {
  if (isOverlap()) {
    state.plot = drawOverlapChart($('spectrum-chart'), { model: state.overlap, config: options(), names: seriesNames(), mode: state.overlapChannel,
      sum: $('overlap-sum').checked, axisLabel: axisLabel[$('axis').value], ticks, tickFormat });
    return;
  }
  const spec = state.spectrum;
  const svg = $('spectrum-chart');
  const config = options();
  const names = seriesNames();
  const modes = state.mode === 'both' ? ['uv', 'ecd'] : [state.mode];
  const fullWidth = Math.max(340, Math.round(svg.clientWidth || 1000));
  const compact = fullWidth < 500;
  const panelHeight = modes.length === 2 ? (compact ? 160 : 190) : (compact ? 260 : 292);
  const height = modes.length === 2 ? 2 * panelHeight + 195 : panelHeight + 125;
  const left = compact ? 70 : 86, right = compact ? 16 : 25, width = fullWidth - left - right;
  const rightEdge = fullWidth - right;
  const pitch = panelHeight + 64;
  const minX = config.minX, maxX = config.maxX;
  const scaleX = (x) => left + (x - minX) / (maxX - minX) * width;
  let markup = `<title>${esc(state.mode === 'both' ? `${names.uv} and ${names.ecd}` : names[state.mode])} spectrum</title><desc>${isEmission() ? 'Relative photon-emission envelopes from Gaussian excited state 1 only, with both intensities multiplied by 1000 before optional normalization. Use an emitting-state geometry.' : 'Absorption spectra from all printed Gaussian excited states.'} Source ${esc(active()?.result.filename || 'none')}, ${esc(active()?.job.label || 'no excitation set')}, ID ${esc(active()?.job.id || 'none')}. Broadening ${esc(config.shape)}, FWHM ${config.fwhm} eV, energy shift ${config.shift} eV; ${names.ecd} ${esc(config.gauge)} gauge. Sticks: isolated band peak heights. ${names.uv}: ${esc(spec.units.uv)}; ${names.ecd}: ${esc(spec.units.ecd)}. ${config.normalize ? 'Independently normalized.' : ''} ${isSynthetic() ? 'Synthetic educational fixture.' : active()?.file.builtInDemo ? 'Provided Gaussian example.' : ''}</desc><rect width="${fullWidth}" height="${height}" fill="white"/><defs>`;
  modes.forEach((mode, i) => { markup += `<clipPath id="plot-clip-${i}"><rect x="${left}" y="${35 + i * pitch}" width="${width}" height="${panelHeight}"/></clipPath>`; });
  markup += '</defs>';
  const panels = [];
  modes.forEach((mode, index) => {
    const top = 35 + index * pitch;
    const color = mode === 'uv' ? '#126c65' : '#8973ad';
    const values = spec.points.map((p) => p[mode]).filter(finite);
    const visibleSticks = spec.sticks.filter((s) => s.x >= minX && s.x <= maxX && finite(s[mode]));
    const plottedMax = values.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
    const sticksMax = $('show-sticks').checked ? visibleSticks.reduce((max, s) => Math.max(max, Math.abs(s[mode])), 0) : 0;
    const maxVal = Math.max(plottedMax, sticksMax) * 1.14 || 1;
    const minY = mode === 'uv' ? 0 : -maxVal;
    const maxY = maxVal;
    const scaleY = (y) => top + panelHeight - (y - minY) / (maxY - minY) * panelHeight;
    panels.push({ mode, top, height: panelHeight, minY, maxY });
    for (const y of ticks(minY, maxY, mode === 'uv' ? 4 : 5)) {
      const pos = scaleY(y);
      markup += `<line x1="${left}" x2="${rightEdge}" y1="${pos}" y2="${pos}" stroke="${y === 0 ? '#cbd7c8' : '#edf1e9'}" stroke-width="1" ${y === 0 ? '' : 'stroke-dasharray="3 5"'}/><text x="${left - 10}" y="${pos + 4}" text-anchor="end" fill="#75876d" font-size="12">${tickFormat(y)}</text>`;
    }
    const last = index === modes.length - 1;
    for (const x of ticks(minX, maxX, compact ? 4 : 7)) {
      const pos = scaleX(x);
      markup += `<line x1="${pos}" x2="${pos}" y1="${top}" y2="${top + panelHeight}" stroke="#f1f4ec" stroke-width="1"/>`;
      if (last) markup += `<text x="${pos}" y="${top + panelHeight + 26}" text-anchor="middle" fill="#95a38d" font-size="13">${tickFormat(x)}</text>`;
    }
    const ordinate = isEmission() ? `${names[mode]} / ${config.normalize ? 'normalized intensity' : 'relative intensity'}` : `${mode === 'uv' ? 'ε' : 'Δε'} / ${spec.units[mode]}`;
    markup += `<text x="${left + 10}" y="${top + 17}" fill="${color}" font-size="12" font-weight="600" letter-spacing="1">${names[mode].toUpperCase()}</text><text x="18" y="${top + panelHeight / 2}" transform="rotate(-90 18 ${top + panelHeight / 2})" text-anchor="middle" fill="#75876d" font-size="12">${esc(ordinate)}</text>`;
    if (!values.length && states().length) {
      const missing = isEmission() && !states().some((s) => s.number === 1) ? 'Excited state 1 is not present in this set' : !spec.points.length ? 'No usable positive transition energy in this set' : mode === 'ecd' ? 'No ' + config.gauge + '-gauge rotatory strengths printed' : 'No oscillator strengths printed';
      markup += `<text x="${left + width / 2}" y="${top + panelHeight / 2}" text-anchor="middle" fill="#9ba88f" font-size="${compact ? 12 : 15}">${esc(missing)}</text>`;
    } else if (values.length) {
      let d = '';
      spec.points.forEach((p) => { if (finite(p[mode])) d += `${d ? 'L' : 'M'}${scaleX(p.x).toFixed(2)},${scaleY(p[mode]).toFixed(2)}`; });
      if (mode === 'uv') markup += `<path d="${d}L${scaleX(maxX)},${scaleY(0)}L${scaleX(minX)},${scaleY(0)}Z" fill="${color}" fill-opacity="0.055" clip-path="url(#plot-clip-${index})"/>`;
      if ($('show-sticks').checked) {
        for (const stick of visibleSticks) {
          const selected = stick.stateNumber === state.selected;
          markup += `<line x1="${scaleX(stick.x)}" x2="${scaleX(stick.x)}" y1="${scaleY(0)}" y2="${scaleY(stick[mode])}" stroke="${color}" stroke-width="${selected ? 2.3 : 1}" opacity="${selected ? .8 : .27}" clip-path="url(#plot-clip-${index})"/><circle data-state="${esc(stick.stateNumber)}" role="button" tabindex="0" aria-label="Inspect state ${esc(stick.stateNumber)}, ${fmt(stick.x, 2)} ${axisUnit[config.axis]}" cx="${scaleX(stick.x)}" cy="${scaleY(stick[mode])}" r="${selected ? 4 : 3}" fill="${selected ? color : 'white'}" stroke="${color}" stroke-width="1.2" style="cursor:pointer"><title>State ${esc(stick.stateNumber)} · ${fmt(stick.x, 2)} ${axisUnit[config.axis]}</title></circle>`;
        }
      }
      markup += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" clip-path="url(#plot-clip-${index})"/>`;
    }
    markup += `<line x1="${left}" x2="${rightEdge}" y1="${top + panelHeight}" y2="${top + panelHeight}" stroke="#d3decb"/>`;
    if (last) markup += `<text x="${left + width / 2}" y="${top + panelHeight + 60}" text-anchor="middle" fill="#899c81" font-size="14">${axisLabel[config.axis]}</text>`;
  });
  if (active()?.demo) markup += `<text x="${rightEdge}" y="${height - 8}" text-anchor="end" fill="#8a9a80" font-size="11" letter-spacing=".7">${isSynthetic() ? 'SYNTHETIC EXAMPLE' : 'GAUSSIAN EXAMPLE'} · EXCITATION STUDIO</text>`;
  svg.setAttribute('viewBox', `0 0 ${fullWidth} ${height}`);
  svg.innerHTML = markup;
  state.plot = { minX, maxX, left, width, fullWidth, height, panels, config };
}

function renderTable() {
  const query = $('state-search').value.trim().toLowerCase();
  const all = states().filter((s) => `${s.number} ${s.label} ${s.transitions.map((t) => `${t.from} ${t.to}`).join(' ')}`.toLowerCase().includes(query));
  const key = state.sort;
  all.sort((a, b) => {
    const x = key === 'rotatory' ? currentR(a) : a[key];
    const y = key === 'rotatory' ? currentR(b) : b[key];
    if (!finite(x)) return finite(y) ? 1 : 0;
    if (!finite(y)) return -1;
    return (state.ascending ? 1 : -1) * (x - y);
  });
  $('states-body').innerHTML = all.length ? all.map((s) => {
    const main = [...s.transitions].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))[0];
    return `<tr data-state="${esc(s.number)}" class="${s.number === state.selected ? 'selected' : ''}" aria-selected="${s.number === state.selected}"><td><button class="state-button" aria-label="Inspect state ${esc(s.number)}">#${esc(s.number)}</button><span class="state-label">${esc(s.label)}</span></td><td>${fmt(s.energyEv)}</td><td>${fmt(s.wavelengthNm, 1)}</td><td>${fmt(s.oscillatorStrength, 4)}</td><td>${fmt(currentR(s), 2)}</td><td>${main ? `${esc(main.from)} ${main.direction === '<-' ? '←' : '→'} ${esc(main.to)}` : 'not printed'}</td></tr>`;
  }).join('') : `<tr><td colspan="6" class="empty-table">${states().length ? 'No states match this search.' : 'Your extracted excited states will appear here.'}</td></tr>`;
  document.querySelectorAll('th').forEach((th) => th.removeAttribute('aria-sort'));
  document.querySelector(`[data-sort="${state.sort}"]`)?.closest('th').setAttribute('aria-sort', state.ascending ? 'ascending' : 'descending');
}

function momentHtml(moment) {
  if (!moment) return '<p class="not-printed">Not printed in this output</p>';
  return ['x', 'y', 'z'].map((key) => `<div class="moment-row"><span>${key.toUpperCase()}</span><span>${fmt(moment[key], 6)}</span></div>`).join('');
}

function propertyNumber(value, digits = 7) {
  if (!finite(value)) return '—';
  if (value === 0) return '0';
  return Math.abs(value) < 0.0001 || Math.abs(value) >= 1e7
    ? value.toExponential(5) : Number(value.toPrecision(digits)).toString();
}

function transitionPropertiesHtml(selectedState) {
  const p = calculateTransitionProperties(selectedState, { family: $('family').value });
  const row = (key, label, value, unit = '') => `<div class="property-row"><dt>${label}</dt><dd><span data-property="${key}">${esc(value)}</span>${unit ? `<small>${unit}</small>` : ''}</dd></div>`;
  return `<section class="detail-section derived-properties"><h4>Selected state ${esc(selectedState.number)} · length gauge</h4><p class="property-convention">${isEmission() ? 'FL/CPL' : 'UV/ECD'} convention</p><dl class="property-list">${[
    row('muMagnitude', '|μ|', propertyNumber(p.muMagnitude), '10⁻²⁰ esu cm'),
    row('mMagnitude', '|m|', propertyNumber(p.mMagnitude), '10⁻²⁰ erg G⁻¹'),
    row('electricStrength', 'D = |μ|²', propertyNumber(p.electricStrength), '10⁻⁴⁰ esu² cm²'),
    row('magneticStrength', 'G = |m|²', propertyNumber(p.magneticStrength), '10⁻⁴⁰ erg² G⁻²'),
    row('cosTheta', 'cos θ', finite(p.cosTheta) ? p.cosTheta.toFixed(6) : '—'),
    row('thetaDeg', 'θ', finite(p.thetaDeg) ? p.thetaDeg.toFixed(3) : '—', 'degrees'),
    row('g', isEmission() ? 'g<sub>lum</sub>' : 'g<sub>abs</sub>', propertyNumber(p.g), 'dimensionless'),
    row('rotatoryStrengthFromVectors', 'R (derived)', propertyNumber(p.rotatoryStrengthFromVectors), '10⁻⁴⁰ cgs'),
  ].join('')}</dl><p class="property-formula">${isEmission() ? 'g = 4|μ||m|cos θ / (D + G)' : 'g = −4|μ||m|cos θ / (D + G)'}</p><p class="micro">Derived from length-gauge moments. Printed R values remain listed below.</p>${p.warnings.length ? `<details class="property-notes"><summary>Calculation notes</summary><ul>${p.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></details>` : ''}</section>`;
}

function selectedTransitionProperties() {
  const selectedState = states().find((entry) => entry.number === state.selected);
  return selectedState ? calculateTransitionProperties(selectedState, { family: $('family').value }) : null;
}

function renderDetail() {
  const s = states().find((entry) => entry.number === state.selected);
  moleculeViewer.setData({ geometry: active()?.job.geometry ?? null, state: s ?? null, family: $('family').value, sourceName: active()?.result.filename ?? '' });
  $('molecule-selection').textContent = s ? `Selected state ${s.number} · ${isEmission() ? 'FL/CPL' : 'UV/ECD'} · length-gauge μ` : 'Select a transition to inspect its vectors';
  if (!s) { $('state-detail').innerHTML = '<div class="detail-placeholder"><span aria-hidden="true">↖</span><h3>A closer look</h3><p>Select a state to inspect its orbital contributions and transition dipole moments.</p></div>'; return; }
  const transitions = s.transitions.map((t) => `<div class="transition-row"><span>${esc(t.from)} ${t.direction === '<-' ? '←' : '→'} ${esc(t.to)}</span><span title="Printed coefficient: ${esc(t.coefficient)}">c = ${formatContributionPercentage(t)}</span></div>`);
  const e = state.electricGauge === 'velocity' ? s.electricDipoleVelocity : s.electricDipole;
  $('state-detail').innerHTML = `<div><div class="detail-top"><h3>State ${esc(s.number)}</h3><span>${esc(s.label || 'Excited state')}</span></div><p class="detail-sub">${fmt(s.energyEv)} eV · ${fmt(s.wavelengthNm, 1)} nm${finite(s.spinSquared) ? ` · ⟨S²⟩ ${fmt(s.spinSquared)}` : ''}</p></div>${transitionPropertiesHtml(s)}<section class="detail-section"><h4>Orbital transitions</h4>${transitions.slice(0, 5).join('') || '<p class="not-printed">Not printed in this output</p>'}${transitions.length > 5 ? `<details class="more-transitions"><summary>${transitions.length - 5} more contributions</summary><div>${transitions.slice(5).join('')}</div></details>` : ''}</section><section class="detail-section"><h4>Transition dipole moments · a.u.</h4><div class="dipole-title"><span>Electric</span><select id="electric-gauge" aria-label="Electric transition dipole gauge"><option value="length" ${state.electricGauge === 'length' ? 'selected' : ''}>Length</option><option value="velocity" ${state.electricGauge === 'velocity' ? 'selected' : ''}>Velocity</option></select></div>${momentHtml(e)}<div class="dipole-title">Magnetic</div>${momentHtml(s.magneticDipole)}<div class="dipole-title">Rotatory strength · 10⁻⁴⁰ cgs</div><div class="moment-row"><span>L</span><span>${fmt(s.rotatoryStrengthLength, 5)}</span></div><div class="moment-row"><span>V</span><span>${fmt(s.rotatoryStrengthVelocity, 5)}</span></div></section>`;
  $('electric-gauge').addEventListener('change', (event) => { state.electricGauge = event.target.value; renderDetail(); });
}

function selectState(number) {
  state.selected = number;
  renderTable();
  renderDetail();
  if (state.spectrum) drawChart();
}

function safeFilename() {
  const source = (active()?.result.filename || 'calculation').replace(/\.(log|out|txt)$/i, '');
  return `${source}_${active()?.job.id || 'set'}`.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 140);
}
function download(contents, filename, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelectorAll('.export-menu').forEach((menu) => { menu.open = false; });
  toast(`Exported ${filename}`);
}
function csv(rows) {
  return '\uFEFF' + rows.map((row) => row.map((value) => {
    let s = value == null ? '' : String(value);
    if (typeof value === 'string' && /^[\s]*[=+@-]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
}

$('file-input').addEventListener('change', (event) => readFiles(event.target.files));
['dragenter', 'dragover'].forEach((name) => $('dropzone').addEventListener(name, (event) => { event.preventDefault(); $('dropzone').classList.add('dragover'); }));
['dragleave', 'drop'].forEach((name) => $('dropzone').addEventListener(name, (event) => { event.preventDefault(); $('dropzone').classList.remove('dragover'); }));
$('dropzone').addEventListener('drop', (event) => readFiles(event.dataTransfer.files));
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());
$('load-demo').addEventListener('click', loadDemo);
$('empty-demo').addEventListener('click', loadDemo);
$('dataset').addEventListener('change', () => { selectedDataset(Number($('dataset').value)); fitRange(); render(); });
$('clear-files').addEventListener('click', () => { state.files = []; state.datasets = []; state.active = 0; state.selected = null; state.demo = false; $('input-status').textContent = ''; updateDatasets(); render(); toast('Loaded calculations cleared.'); });
$('fwhm').addEventListener('input', () => { $('fwhm-value').value = Number($('fwhm').value).toFixed(2); render(); });
$('fwhm-value').addEventListener('input', () => { $('fwhm').value = $('fwhm-value').value; render(); });
$('family').addEventListener('change', () => {
  $('show-sticks').checked = !isEmission();
  if (isEmission()) state.selected = states().find((s) => s.number === 1)?.number ?? null;
  fitRange();
  render();
});
['shape', 'gauge', 'normalize', 'show-sticks'].forEach((id) => $(id).addEventListener('change', render));
['shift', 'range-min', 'range-max'].forEach((id) => $(id).addEventListener('input', render));
$('axis').addEventListener('change', () => { $('range-unit').textContent = axisUnit[$('axis').value]; $('range-min').step = $('axis').value === 'ev' ? '.1' : '1'; $('range-max').step = $('axis').value === 'ev' ? '.1' : '1'; fitRange(); render(); });
$('auto-range').addEventListener('click', () => { fitRange(); render(); });
$('reset-settings').addEventListener('click', () => { $('family').value = 'absorption'; $('shape').value = 'gaussian'; $('fwhm').value = '.4'; $('fwhm-value').value = '.40'; $('shift').value = '0'; $('axis').value = 'nm'; $('range-unit').textContent = 'nm'; $('gauge').value = 'length'; $('normalize').checked = false; $('show-sticks').checked = true; $('range-min').value = 180; $('range-max').value = 650; if (states().length) fitRange(); render(); });
document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
  const wasOverlap = isOverlap();
  if (button.dataset.mode === 'overlap' && !wasOverlap) state.overlapChannel = state.mode;
  state.mode = button.dataset.mode;
  if (wasOverlap !== isOverlap()) fitRange();
  render();
}));
$('overlap-channel').addEventListener('change', () => { state.overlapChannel = $('overlap-channel').value; render(); });
$('overlap-sum').addEventListener('change', render);
$('overlap-files').addEventListener('change', (event) => {
  const fileId = event.target.dataset.fileId;
  const file = state.files.find((entry) => entry.id === fileId);
  const job = file?.result.jobs[Number(event.target.value)];
  if (!job) return;
  const index = state.datasets.findIndex((item) => item.file === file && item.job === job);
  if (index < 0) return;
  selectedDataset(index); fitRange(); render();
});
$('state-search').addEventListener('input', renderTable);
document.querySelectorAll('[data-sort]').forEach((button) => button.addEventListener('click', () => { if (state.sort === button.dataset.sort) state.ascending = !state.ascending; else { state.sort = button.dataset.sort; state.ascending = true; } renderTable(); }));
$('states-body').addEventListener('click', (event) => { const row = event.target.closest('[data-state]'); if (row) selectState(Number(row.dataset.state)); });
$('spectrum-chart').addEventListener('click', (event) => { const target = event.target.closest('[data-state]'); if (target) selectState(Number(target.dataset.state)); });
$('spectrum-chart').addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && event.target.dataset.state) { event.preventDefault(); selectState(Number(event.target.dataset.state)); } });
$('spectrum-chart').addEventListener('pointermove', (event) => {
  if (!states().length || !state.plot) return;
  const plottedSeries = state.plot.overlap ? state.plot.series : [{ label: '', spectrum: state.spectrum }];
  if (!plottedSeries?.some((entry) => entry.spectrum?.points.length)) return;
  const rect = $('spectrum-chart').getBoundingClientRect();
  const plotX = (event.clientX - rect.left) / rect.width * state.plot.fullWidth;
  const plotY = (event.clientY - rect.top) / rect.height * state.plot.height;
  const panel = state.plot.panels.find((p) => plotY >= p.top && plotY <= p.top + p.height);
  if (!panel || plotX < state.plot.left || plotX > state.plot.left + state.plot.width) { $('chart-tooltip').hidden = true; return; }
  const x = state.plot.minX + (plotX - state.plot.left) / state.plot.width * (state.plot.maxX - state.plot.minX);
  const nearest = plottedSeries.map((entry) => {
    const points = entry.spectrum.points;
    const index = Math.max(0, Math.min(points.length - 1, Math.round((x - state.plot.minX) / (state.plot.maxX - state.plot.minX) * (points.length - 1))));
    const point = points[index];
    if (!point || !finite(point[panel.mode])) return null;
    const y = panel.top + panel.height - (point[panel.mode] - panel.minY) / (panel.maxY - panel.minY) * panel.height;
    return { entry, point, distance: Math.abs(y - plotY) };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance)[0];
  if (!nearest) { $('chart-tooltip').hidden = true; return; }
  const { point, entry } = nearest;
  const symbol = isEmission() ? seriesNames()[panel.mode] : panel.mode === 'uv' ? 'ε' : 'Δε';
  $('chart-tooltip').textContent = `${entry.label ? `${entry.label} · ` : ''}${fmt(point.x, state.plot.config.axis === 'ev' ? 3 : 1)} ${axisUnit[state.plot.config.axis]} · ${symbol} ${fmt(point[panel.mode], 2)} ${entry.spectrum.units[panel.mode]}`;
  const wrap = $('chart-wrap').getBoundingClientRect();
  $('chart-tooltip').hidden = false;
  $('chart-tooltip').style.left = `${Math.max(0, Math.min(event.clientX - wrap.left + 10, wrap.width - $('chart-tooltip').offsetWidth - 8))}px`;
  $('chart-tooltip').style.top = `${Math.max(0, event.clientY - wrap.top - 42)}px`;
});
$('spectrum-chart').addEventListener('pointerleave', () => { $('chart-tooltip').hidden = true; });
$('method-open').addEventListener('click', () => $('method-dialog').showModal());
$('method-close').addEventListener('click', () => $('method-dialog').close());
$('method-dialog').addEventListener('click', (event) => { if (event.target === $('method-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });
$('method-equations').innerHTML = '<p>UV and ECD curves use unit-area Gaussian or Lorentzian broadening g in energy (eV⁻¹).</p><div class="equation">ε(E) = Σ fᵢ g(E − Eᵢ) / (4.319 × 10⁻⁹ × 8065.54394)<br>Δε(E) = Σ Eᵢ Rᵢ g(E − Eᵢ) / 22.96</div><p>Both ordinates are L mol⁻¹ cm⁻¹. Rᵢ is the value printed by Gaussian in 10⁻⁴⁰ cgs. The ECD expression uses the transition-center energy approximation. Energy shifts translate band centers while retaining original intensities. These electronic envelopes omit vibronic structure and conformer averaging.</p><p>FL/CPL mode uses only state 1, with relative photon-emission weights proportional to E₁²f₁ (total FL) and E₁³R₁ (differential CPL). Both FL and CPL intensities are multiplied by 1000 for readability, including curve CSV exports and overlap/sum plots. This common factor preserves their ratio; optional independent normalization still sets each maximum absolute intensity to 1. UV/ECD scaling is unchanged. The printed R sign is retained. Relative emission envelopes use the same energy-domain broadening and do not predict absolute quantum yields.</p>';
$('export-states').addEventListener('click', () => {
  const header = ['source_file', 'excitation_set_id', 'excitation_set_label', 'synthetic_demo', 'state', 'label', 'energy_eV', 'wavelength_nm', 'oscillator_strength', 'spin_squared', 'R_length_1e-40_cgs', 'R_velocity_1e-40_cgs', 'electric_length_x_au', 'electric_length_y_au', 'electric_length_z_au', 'electric_velocity_x_au', 'electric_velocity_y_au', 'electric_velocity_z_au', 'magnetic_x_au', 'magnetic_y_au', 'magnetic_z_au', 'orbital_transitions'];
  const rows = states().map((s) => [active().result.filename, active().job.id, active().job.label, String(isSynthetic()), s.number, s.label, s.energyEv, s.wavelengthNm, s.oscillatorStrength, s.spinSquared, s.rotatoryStrengthLength, s.rotatoryStrengthVelocity, ...[s.electricDipole, s.electricDipoleVelocity, s.magneticDipole].flatMap((d) => [d?.x, d?.y, d?.z]), s.transitions.map((t) => `${t.from} ${t.direction || '->'} ${t.to} : ${t.coefficient}`).join('; ')]);
  download(csv([header, ...rows]), `${safeFilename()}_states.csv`, 'text/csv;charset=utf-8');
});
for (const series of ['uv', 'ecd']) {
  $(`export-spectrum-${series}`).addEventListener('click', () => {
    if (!state.spectrum) return;
    try {
      const summed = isOverlap() && $('overlap-sum').checked;
      const sampled = summed
        ? generateWavelengthOverlapSpectrum(overlapEntries(), { ...options(), normalizationDivisors: state.overlap.metadata.normalizationDivisors }).sum
        : generateWavelengthSpectrum(states(), { ...options(), normalizationDivisors: state.spectrum.metadata.normalizationDivisors });
      if (!sampled.points.length) throw new Error('This plot window contains no samples on the 0.5 nm grid. Widen the range.');
      const spectrumName = isEmission() ? series === 'uv' ? 'fl' : 'cpl' : series;
      download(csv(buildCurveRows(sampled, series)), `${summed ? 'all-files_sum' : safeFilename()}_${spectrumName}_0.5nm.csv`, 'text/csv;charset=utf-8');
    } catch (error) { toast(error.message); }
  });
}
$('export-sticks').addEventListener('click', () => {
  if (!state.spectrum) return;
  download(csv(buildStickRows(state.spectrum)), `${safeFilename()}_${$('family').value}_oscillator_strengths.csv`, 'text/csv;charset=utf-8');
});
$('export-json').addEventListener('click', () => { download(JSON.stringify({ schemaVersion: 1, tool: 'Excitation Studio', syntheticDemo: isSynthetic(), activeExcitationSet: state.active, selectedTransition: selectedTransitionProperties(), plotView: { mode: state.mode, overlapChannel: state.overlapChannel, sum: isOverlap() && $('overlap-sum').checked, selectedFiles: overlapEntries().map(({ states: ignored, ...entry }) => entry) }, sourceFiles: state.files.map((f) => ({ fileId: f.id, selectedExcitationSet: f.selectedJobIndex ?? 0, syntheticDemo: isSynthetic(f), ...f.result })), spectrum: state.spectrum, overlap: state.overlap }, null, 2), `${safeFilename()}_${$('family').value}_analysis.json`, 'application/json'); });
$('export-svg').addEventListener('click', () => {
  if (!state.spectrum) return;
  const clone = $('spectrum-chart').cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(state.plot.fullWidth)); clone.setAttribute('height', String(state.plot.height));
  clone.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
  clone.querySelectorAll('[tabindex]').forEach((el) => { el.removeAttribute('tabindex'); el.removeAttribute('role'); });
  const names = seriesNames();
  const channel = isOverlap() ? state.overlapChannel : state.mode;
  const exportedMode = `${isOverlap() ? $('overlap-sum').checked ? 'sum_' : 'overlap_' : ''}${channel === 'both' ? `${names.uv}_${names.ecd}` : names[channel]}`.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
  download('<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone), `${isOverlap() ? 'all-files' : safeFilename()}_${$('family').value}_${exportedMode}.svg`, 'image/svg+xml');
});
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (state.spectrum) drawChart(); }, 120); });
render();
