/**
 * Pure CSV row builders. These return cells, not encoded CSV: the caller owns
 * quoting, spreadsheet-formula escaping, download names, and UTF-8 encoding.
 *
 * Curve data must come from generateWavelengthSpectrum at 0.5 nm spacing.
 * Stick data use explicitly preserved raw coefficients, never plotted heights.
 */
import { energyToX } from './spectrum.js';

const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const numberCell = (value) => finite(value) ? value : null;

function metadata(spectrum) {
  if (!spectrum || typeof spectrum !== 'object' || Array.isArray(spectrum)) {
    throw new TypeError('An evaluated spectrum is required for export.');
  }
  const settings = spectrum.metadata ?? {};
  const family = settings.family ?? 'absorption';
  if (family !== 'absorption' && family !== 'emission') {
    throw new RangeError('Spectrum family must be absorption or emission.');
  }
  return { settings, family, units: spectrum.units ?? settings.units ?? {} };
}

function wavelength(energyEv) {
  return finite(energyEv) && energyEv > 0 ? energyToX(energyEv, 'nm') : null;
}

/**
 * Build exactly two columns: wavelength and the selected curve intensity.
 * Curve data are already evaluated/normalized on a 0.5 nm wavelength grid;
 * these helpers preserve those ordinates without recomputing their scale.
 * Null/nonfinite intensities remain null (blank CSV cells), preserving real zero.
 * @param {object} spectrum Output of generateWavelengthSpectrum.
 * @param {'uv'|'ecd'} [series='uv'] UV/FL or ECD/CPL channel.
 */
export function buildCurveRows(spectrum, series = 'uv') {
  const { settings, family, units } = metadata(spectrum);
  if (series !== 'uv' && series !== 'ecd') {
    throw new RangeError('Curve series must be uv or ecd.');
  }
  if (!Array.isArray(spectrum.points)) throw new TypeError('Spectrum points must be an array.');
  if ((settings.axis ?? units.x) !== 'nm') {
    throw new RangeError('Curve CSV requires a wavelength spectrum sampled in nm.');
  }
  const step = settings.wavelengthStepNm ?? 0.5;
  if (!finite(step) || Math.abs(step - 0.5) > 1e-9) {
    throw new RangeError('Curve CSV requires a 0.5 nm wavelength step.');
  }
  let previous = null;
  for (const point of spectrum.points) {
    if (!finite(point?.x) || point.x <= 0) throw new RangeError('Curve wavelengths must be positive finite numbers.');
    if (previous !== null && Math.abs((point.x - previous) - 0.5) > 1e-7) {
      throw new RangeError('Curve CSV requires consecutive 0.5 nm wavelength samples.');
    }
    previous = point.x;
  }
  const field = family === 'emission'
    ? (series === 'uv' ? 'FL_relative_intensity' : 'CPL_relative_intensity')
    : (series === 'uv' ? 'epsilon' : 'delta_epsilon');
  return [
    ['wavelength_nm', field],
    ...spectrum.points.map((point) => [point.x, numberCell(point[series])]),
  ];
}

/**
 * Build exactly two columns: shifted wavelength and the original printed f.
 * Linewidth, line shape, plotted height, and normalization never affect f.
 * Emission exports include only Gaussian state number 1, with no substitute.
 */
export function buildStickRows(spectrum) {
  const { family } = metadata(spectrum);
  if (!Array.isArray(spectrum.sticks)) throw new TypeError('Spectrum sticks must be an array.');
  const sticks = family === 'emission'
    ? spectrum.sticks.filter((stick) => Number(stick?.stateNumber) === 1)
    : spectrum.sticks;
  return [['wavelength_nm', 'oscillator_strength_f'], ...sticks.map((stick) => [
    wavelength(stick?.energyEv), numberCell(stick?.rawOscillatorStrength),
  ])];
}
