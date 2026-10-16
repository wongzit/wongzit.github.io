/**
 * Multi-file overlap and unweighted summation of the existing spectral model.
 * Each entry is ONE selected excitation set from ONE source file. Every source
 * is evaluated on the same raw grid. Addition precedes normalization; missing
 * channels remain unavailable rather than being replaced with scientific zero.
 * In emission mode each file independently supplies its own Gaussian state 1.
 */
import { generateSpectrum, generateWavelengthSpectrum } from './spectrum.js';

const CHANNELS = ['uv', 'ecd'];
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const availabilityKey = { uv: 'availableUvStates', ecd: 'availableEcdStates' };
const divisorPair = (value) => value && typeof value === 'object' && !Array.isArray(value)
  && CHANNELS.every((channel) => finite(value[channel]) && value[channel] > 0);

function validateEntries(entries) {
  if (!Array.isArray(entries)) throw new TypeError('Overlap entries must be an array.');
  const ids = new Set();
  return entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || !Array.isArray(entry.states)) {
      throw new TypeError(`Overlap entry ${index + 1} must contain an excitation-state array.`);
    }
    if ((typeof entry.id !== 'string' && !finite(entry.id)) || String(entry.id).trim() === '') {
      throw new TypeError(`Overlap entry ${index + 1} requires a nonempty unique id.`);
    }
    const id = String(entry.id);
    if (ids.has(id)) throw new RangeError(`Duplicate overlap entry id: ${id}`);
    ids.add(id);
    return { id, label: String(entry.label ?? id), states: entry.states };
  });
}

function validateFixedDivisors(mapping, entries) {
  if (mapping == null) return;
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)
    || !mapping.series || typeof mapping.series !== 'object' || !divisorPair(mapping.sum)) {
    throw new RangeError('Overlap normalization divisors require series:{[id]:{uv,ecd}} and sum:{uv,ecd}.');
  }
  for (const entry of entries) {
    if (!Object.hasOwn(mapping.series, entry.id) || !divisorPair(mapping.series[entry.id])) {
      throw new RangeError(`Finite positive normalization divisors are required for overlap series ${entry.id}.`);
    }
  }
}

function normalizedSpectrum(raw, normalize, fixedDivisors) {
  const peaks = { uv: 0, ecd: 0 };
  for (const point of raw.points) {
    for (const channel of CHANNELS) if (finite(point[channel])) peaks[channel] = Math.max(peaks[channel], Math.abs(point[channel]));
  }
  const divisors = Object.fromEntries(CHANNELS.map((channel) => [channel,
    normalize ? fixedDivisors?.[channel] ?? (peaks[channel] || 1) : 1]));
  const scalePoint = (point) => ({ ...point,
    uv: finite(point.uv) ? point.uv / divisors.uv : null,
    ecd: finite(point.ecd) ? point.ecd / divisors.ecd : null,
  });
  const units = { ...raw.units };
  if (normalize) {
    const intensityUnit = raw.metadata.family === 'emission' ? 'normalized relative intensity' : 'relative units';
    units.uv = intensityUnit; units.ecd = intensityUnit;
  }
  return { ...raw, units, points: raw.points.map(scalePoint), sticks: raw.sticks.map(scalePoint),
    warnings: [...raw.warnings],
    metadata: { ...raw.metadata, normalize, units, normalizationDivisors: divisors } };
}

function alignUnavailableSpectrum(spectrum, template) {
  if (spectrum.points.length) {
    if (spectrum.points.length !== template.points.length
      || spectrum.points.some((point, index) => point.x !== template.points[index].x
        || point.energyEv !== template.points[index].energyEv)) {
      throw new Error('Overlap source spectra do not share the exact same sampling grid.');
    }
    return spectrum;
  }
  return { ...spectrum,
    points: template.points.map((point) => ({ x: point.x, energyEv: point.energyEv, uv: null, ecd: null })),
    minX: template.minX, maxX: template.maxX,
    metadata: { ...spectrum.metadata, axis: template.metadata.axis,
      ...(template.metadata.sourceAxis ? { sourceAxis: template.metadata.sourceAxis, sourceWindow: template.metadata.sourceWindow } : {}),
      ...(template.metadata.wavelengthStepNm ? { wavelengthStepNm: template.metadata.wavelengthStepNm, sampling: template.metadata.sampling } : {}) },
  };
}

function rawSum(series, template, sourceWarnings) {
  const warnings = [...sourceWarnings];
  const counts = { uv: 0, ecd: 0 };
  const stateCounts = { uv: 0, ecd: 0 };
  const partial = { uv: false, ecd: false };
  for (const channel of CHANNELS) {
    const key = availabilityKey[channel];
    const present = series.filter(({ spectrum }) => spectrum.metadata[key] > 0);
    counts[channel] = present.length;
    stateCounts[channel] = series.reduce((sum, { spectrum }) => sum + (spectrum.metadata[key] ?? 0), 0);
    partial[channel] = present.length < series.length
      || series.some(({ spectrum }) => (spectrum.metadata[key] ?? 0) < (spectrum.metadata.totalStates ?? 0));
    const name = template.names[channel];
    if (series.length && !present.length) warnings.push(`${name} sum is unavailable: no file has an available contribution. Missing data are not zero.`);
    else if (present.length < series.length) warnings.push(`${name} sum is partial: ${present.length} of ${series.length} files have available contributions; missing file contributions were omitted.`);
    else if (partial[channel]) warnings.push(`${name} sum is partial: some source states have missing strengths.`);
  }
  const points = template.points.map((point, index) => {
    const result = { x: point.x, energyEv: point.energyEv, uv: null, ecd: null };
    for (const channel of CHANNELS) {
      let value = 0;
      let present = false;
      for (const { spectrum } of series) {
        const contribution = spectrum.points[index]?.[channel];
        if (finite(contribution)) { value += contribution; present = true; }
      }
      if (present && !finite(value)) throw new RangeError(`The raw ${template.names[channel]} sum exceeds the supported numeric range.`);
      result[channel] = present ? (value === 0 ? 0 : value) : null;
    }
    return result;
  });
  const sticks = series.flatMap(({ id, label, spectrum }) => spectrum.sticks.map((stick) => ({
    ...stick, entryId: id, entryLabel: label,
  })));
  const metadata = { ...template.metadata,
    inputStates: series.reduce((sum, { spectrum }) => sum + (spectrum.metadata.inputStates ?? 0), 0),
    totalStates: series.reduce((sum, { spectrum }) => sum + (spectrum.metadata.totalStates ?? 0), 0),
    availableUvStates: stateCounts.uv,
    availableEcdStates: stateCounts.ecd,
    fileCount: series.length,
    contributingUvFiles: counts.uv,
    contributingEcdFiles: counts.ecd,
    partialChannels: partial,
    sumConvention: 'Unweighted pointwise addition of raw per-file curves, before any normalization.',
    normalizationConvention: 'Each channel of the raw sum is normalized independently after addition.',
    sources: [...new Set(series.flatMap(({ spectrum }) => spectrum.metadata.sources ?? template.metadata.sources ?? []))],
  };
  return { ...template, points, sticks, warnings: [...new Set(warnings)], metadata };
}

function generate(entries, options, wavelength) {
  const selected = validateEntries(entries);
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Overlap options must be an object.');
  const { normalizationDivisors: fixedDivisors, ...rawOptions } = options;
  const normalize = options.normalize ?? false;
  if (typeof normalize !== 'boolean') throw new TypeError('Normalization must be true or false.');
  validateFixedDivisors(fixedDivisors, selected);
  rawOptions.normalize = false;
  // Validate all shared scientific options even when no entries can be plotted.
  const emptyBase = generateSpectrum([], rawOptions);
  const previews = selected.map((entry) => generateSpectrum(entry.states, {
    ...rawOptions, minX: undefined, maxX: undefined, points: 2,
  }));
  const ranged = previews.filter((spectrum) => finite(spectrum.minX) && finite(spectrum.maxX));
  const minX = options.minX ?? (ranged.length ? Math.min(...ranged.map((spectrum) => spectrum.minX)) : null);
  const maxX = options.maxX ?? (ranged.length ? Math.max(...ranged.map((spectrum) => spectrum.maxX)) : null);
  const commonOptions = { ...rawOptions,
    ...(minX !== null ? { minX } : {}), ...(maxX !== null ? { maxX } : {}) };
  // Revalidate a partly user-specified range after filling its automatic bound.
  generateSpectrum([], commonOptions);
  const evaluate = wavelength ? generateWavelengthSpectrum : generateSpectrum;
  const rawSeries = selected.map((entry) => ({ id: entry.id, label: entry.label,
    spectrum: evaluate(entry.states, commonOptions) }));
  const template = rawSeries.find(({ spectrum }) => spectrum.points.length)?.spectrum
    ?? rawSeries.find(({ spectrum }) => finite(spectrum.minX) && finite(spectrum.maxX))?.spectrum
    ?? (wavelength ? generateWavelengthSpectrum([], commonOptions) : emptyBase);
  const aligned = rawSeries.map(({ id, label, spectrum }) => ({ id, label,
    spectrum: alignUnavailableSpectrum(spectrum, template) }));
  const sourceWarnings = aligned.flatMap(({ label, spectrum }) => spectrum.warnings.map((warning) => `${label}: ${warning}`));
  if (!selected.length) sourceWarnings.push('No excitation sets were selected for overlap.');
  const sum = normalizedSpectrum(rawSum(aligned, template, sourceWarnings), normalize, fixedDivisors?.sum);
  const series = aligned.map(({ id, label, spectrum }) => ({ id, label,
    spectrum: normalizedSpectrum(spectrum, normalize, fixedDivisors?.series?.[id]) }));
  return {
    series,
    sum,
    warnings: [...sum.warnings],
    metadata: {
      axis: sum.metadata.axis,
      family: sum.metadata.family,
      normalize,
      minX: sum.minX,
      maxX: sum.maxX,
      fileCount: series.length,
      commonGrid: true,
      sumConvention: sum.metadata.sumConvention,
      normalizationDivisors: { series: Object.fromEntries(series.map(({ id, spectrum }) => [id,
        { ...spectrum.metadata.normalizationDivisors }])), sum: { ...sum.metadata.normalizationDivisors } },
      ...(wavelength ? { wavelengthStepNm: 0.5, sourceAxis: options.axis ?? 'nm' } : {}),
    },
  };
}

/**
 * @param {Array<{id:string,label:string,states:Array}>} entries One selected set
 * per source file. Duplicate ids are rejected; caller owns file/set selection.
 * @param {object} options Same scientific options as generateSpectrum.
 * Optional normalizationDivisors uses {series:{[id]:{uv,ecd}},sum:{uv,ecd}}.
 */
export function generateOverlapSpectrum(entries, options = {}) {
  return generate(entries, options, false);
}

/** Exact 0.5 nm common grid, directly evaluated with the existing model. */
export function generateWavelengthOverlapSpectrum(entries, options = {}) {
  return generate(entries, options, true);
}
