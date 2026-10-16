/**
 * UV and ECD simulation from discrete Gaussian TD-DFT excitation data.
 *
 * All broadening is performed in energy (eV), even when displaying wavelength.
 * FWHM always means full width at half maximum, in eV, for either line shape.
 * With g(E) normalized to unit area (eV^-1), the conventional band-envelope
 * approximation is:
 *   epsilon(E)       = sum_i f_i g(E - E_i) / (4.319e-9 * 8065.543937...)
 *   delta-epsilon(E) = sum_i E_i R_i g(E - E_i) / 22.96
 * R_i is the number printed by Gaussian in units of 10^-40 cgs, not raw cgs.
 * Both ordinates are decadic molar coefficients in L mol^-1 cm^-1; ECD uses
 * delta-epsilon = epsilon(left) - epsilon(right), retaining Gaussian's R sign.
 * The E_i factor is evaluated at the transition center (narrow-band convention).
 * An empirical shift translates band centers, retaining the original amplitudes.
 * Converting the horizontal axis does NOT multiply the ordinate by a Jacobian:
 * absorptivity at a photon energy is an observable, not a probability density.
 *
 * Primary-source derivation: New Journal of Chemistry (2010), supporting
 * information for DOI 10.1039/C0NJ00085J, ESI 17–18, equations S1–S5:
 * https://www.rsc.org/suppdata/nj/c0/c0nj00085j/c0nj00085j.pdf
 * Normalized Gaussian/Lorentzian profiles and broadening conventions also see:
 * https://psicode.org/psi4manual/master/_modules/psi4/driver/p4util/spectrum.html
 * Constants hc/e follow the exact SI h, c, and elementary charge definitions.
 * Emission mode is a relative photon-emission envelope for Gaussian state 1:
 *   FL(E)  = 1000 E_1^2 f_1 g(E - E_1)
 *   CPL(E) = 1000 k E_1^3 R_1 g(E - E_1)
 * FL means I_L + I_R; CPL means I_L - I_R. The common arbitrary scale uses
 * k = (4.319e-9 * 8065.543937...) / (2 * 22.96), so 2 CPL / FL approximates
 * 4R/D before independent normalization, under electric-dipole dominance.
 * The common factor 1000 is a display convenience for relative intensities;
 * it changes neither the CPL/FL ratio nor independently normalized curves.
 * Relative photon envelopes are reported in the energy-domain convention even
 * on a wavelength axis; no per-nm spectral-density conversion is applied.
 * Emission weights follow Einstein A proportional to E^2 f (NIST eq. 19–21),
 * and CPL proportional to E^3 R (ORCA ESD eq. 5.36 and 5.42):
 * https://physics.nist.gov/Pubs/AtSpec/node17.html
 * https://orca-manual.mpi-muelheim.mpg.de/contents/spectroscopyproperties/esd.html
 * The printed R sign is preserved; suitable emitting-state geometry and
 * transition conventions must be established by the supplied calculation.
 * These are simulated electronic envelopes, without vibronic structure,
 * conformer weighting, refractive-index corrections, or solvent calibration.
 */

export const emissionIntensityScale = 1000;

export const SPECTRUM_CONSTANTS = Object.freeze({
  hcEvNm: 1239.8419843320026,
  wavenumberPerEv: 8065.543937349211,
  oscillatorIntegralFactor: 4.319e-9,
  rotatoryIntegralFactor: 2.296e-39,
  gaussianRotatoryScale: 1e-40,
  emissionIntensityScale,
});

const AXES = new Set(['nm', 'ev', 'cm-1']);
const SHAPES = new Set(['gaussian', 'lorentzian']);
const GAUGES = new Set(['length', 'velocity']);
const FAMILIES = new Set(['absorption', 'emission']);
const MOLAR_UNITS = 'L mol⁻¹ cm⁻¹';
const finite = (value) => typeof value === 'number' && Number.isFinite(value);

function validateAxis(axis) {
  if (!AXES.has(axis)) throw new RangeError('Axis must be nm, ev, or cm-1.');
}

/** Convert positive photon energy to the selected display coordinate. */
export function energyToX(energyEv, axis = 'nm') {
  validateAxis(axis);
  if (!finite(energyEv) || energyEv <= 0) {
    throw new RangeError('Photon energy must be a finite positive number in eV.');
  }
  const x = axis === 'nm' ? SPECTRUM_CONSTANTS.hcEvNm / energyEv
    : axis === 'cm-1' ? energyEv * SPECTRUM_CONSTANTS.wavenumberPerEv : energyEv;
  if (!finite(x) || x <= 0) throw new RangeError('Converted axis value is outside the supported numeric range.');
  return x;
}

/** Convert a positive display coordinate to photon energy in eV. */
export function xToEnergy(x, axis = 'nm') {
  validateAxis(axis);
  if (!finite(x) || x <= 0) throw new RangeError('Axis values must be finite and positive.');
  const energy = axis === 'nm' ? SPECTRUM_CONSTANTS.hcEvNm / x
    : axis === 'cm-1' ? x / SPECTRUM_CONSTANTS.wavenumberPerEv : x;
  if (!finite(energy) || energy <= 0) throw new RangeError('Converted photon energy is outside the supported numeric range.');
  return energy;
}

/**
 * Generate calibrated UV/ECD curves. Input states follow gaussian.js's schema:
 * { number, energyEv, oscillatorStrength, rotatoryStrengthLength,
 *   rotatoryStrengthVelocity }. Missing values must be null, not zero.
 *
 * Options: axis ('nm'|'ev'|'cm-1'), minX/maxX (positive, increasing display
 * coordinates), fwhm (eV, > 0), shape ('gaussian'|'lorentzian'), shift (eV),
 * gauge ('length'|'velocity', ECD/CPL only), points (integer, 2–50000), normalize,
 * family ('absorption'|'emission'; emission uses exactly number === 1).
 * FWHM defaults to 0.4 eV. Emission output is relative photon intensity,
 * not molar absorptivity, an absolute emission rate, or a quantum yield.
 * A common convenience factor of 1000 scales both emission channels before
 * normalization; calibrated UV/ECD coefficients are not scaled.
 * The UV curve uses the excited-state oscillator strength reported by Gaussian.
 * Normalization independently divides each curve by its largest absolute sampled
 * value within the selected window. Physical units then become relative units.
 * Sticks use the isolated broadened band's peak height, in the curve's units;
 * their raw oscillatorStrength/rotatoryStrength are also returned explicitly.
 * If every coefficient is missing, the corresponding ordinate remains null.
 * If only some are missing, available contributions are plotted with a warning.
 * Optional normalizationDivisors: {uv, ecd}, both finite and positive, fixes
 * the normalization scale when evaluating another grid for the same model.
 */
export function generateSpectrum(states, options = {}) {
  return computeSpectrum(states, options);
}

function computeSpectrum(states, options = {}, sampleGrid = null) {
  if (!Array.isArray(states)) throw new TypeError('Excitation states must be an array.');
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Spectrum options must be an object.');
  }
  const axis = options.axis ?? 'nm';
  const shape = options.shape ?? 'gaussian';
  const gauge = options.gauge ?? 'length';
  const family = options.family ?? 'absorption';
  const emission = family === 'emission';
  const intensityScale = emission ? emissionIntensityScale : 1;
  const names = emission ? { uv: 'FL', ecd: 'CPL' } : { uv: 'UV–vis', ecd: 'ECD' };
  const symbols = emission ? { uv: 'I', ecd: 'ΔI' } : { uv: 'ε', ecd: 'Δε' };
  const fwhm = options.fwhm ?? 0.4;
  const shift = options.shift ?? 0;
  const requestedPoints = options.points ?? 1200;
  const count = sampleGrid?.length ?? requestedPoints;
  const normalize = options.normalize ?? false;
  validateAxis(axis);
  if (!SHAPES.has(shape)) throw new RangeError('Line shape must be gaussian or lorentzian.');
  if (!GAUGES.has(gauge)) throw new RangeError('ECD gauge must be length or velocity.');
  if (!FAMILIES.has(family)) throw new RangeError('Spectrum family must be absorption or emission.');
  if (!finite(fwhm) || fwhm <= 0) throw new RangeError('FWHM must be a finite positive number in eV.');
  if (!finite(shift)) throw new RangeError('Energy shift must be a finite number in eV.');
  if (!Number.isInteger(requestedPoints) || requestedPoints < 2 || requestedPoints > 50000) {
    throw new RangeError('Point count must be an integer from 2 to 50000.');
  }
  if (typeof normalize !== 'boolean') throw new TypeError('Normalization must be true or false.');
  const fixedDivisors = options.normalizationDivisors;
  if (fixedDivisors != null && (typeof fixedDivisors !== 'object'
    || !finite(fixedDivisors.uv) || fixedDivisors.uv <= 0
    || !finite(fixedDivisors.ecd) || fixedDivisors.ecd <= 0)) {
    throw new RangeError('Normalization divisors must contain finite positive uv and ecd values.');
  }
  for (const key of ['minX', 'maxX']) {
    if (options[key] != null && (!finite(options[key]) || options[key] <= 0)) {
      throw new RangeError(`${key} must be a finite positive display-axis value.`);
    }
  }
  if (options.minX != null && options.maxX != null && options.minX >= options.maxX) {
    throw new RangeError('Axis minimum must be smaller than its maximum.');
  }
  const gaussianFactor = Math.sqrt(4 * Math.log(2) / Math.PI) / fwhm;
  const halfWidth = fwhm / 2;
  const lorentzianFactor = 2 / (Math.PI * fwhm);
  const profile = shape === 'gaussian'
    ? (delta) => gaussianFactor * Math.exp(-4 * Math.log(2) * (delta / fwhm) ** 2)
    : (delta) => lorentzianFactor / (1 + (delta / halfWidth) ** 2);
  const peak = profile(0);
  if (!finite(peak) || peak <= 0) throw new RangeError('FWHM is outside the supported numeric range.');

  const warnings = [];
  const bands = [];
  let invalidEnergy = 0;
  let excludedByShift = 0;
  let missingUv = 0;
  let missingEcd = 0;
  const uvConversion = 1 / (SPECTRUM_CONSTANTS.oscillatorIntegralFactor
    * SPECTRUM_CONSTANTS.wavenumberPerEv);
  const ecdConversion = SPECTRUM_CONSTANTS.gaussianRotatoryScale
    / SPECTRUM_CONSTANTS.rotatoryIntegralFactor;
  const emissionCplFactor = ecdConversion / (2 * uvConversion);
  const rKey = gauge === 'length' ? 'rotatoryStrengthLength' : 'rotatoryStrengthVelocity';
  const candidates = emission ? states.filter((entry) => entry?.number === 1) : states;
  if (emission && !candidates.length) warnings.push('FL/CPL emission requires Gaussian state number 1; no other state was substituted.');
  if (emission && candidates.length > 1) {
    warnings.push('FL/CPL emission is unavailable because more than one Gaussian state number 1 was supplied. Select a single excitation set.');
    candidates.length = 0;
  }

  for (let i = 0; i < candidates.length; i += 1) {
    const state = candidates[i];
    if (!state || !finite(state.energyEv) || state.energyEv <= 0) {
      invalidEnergy += 1;
      continue;
    }
    const center = state.energyEv + shift;
    if (!finite(center) || center <= 0) {
      excludedByShift += 1;
      continue;
    }
    const uvFactor = emission ? state.energyEv ** 2 * intensityScale : uvConversion;
    const ecdFactor = emission ? state.energyEv ** 3 * emissionCplFactor * intensityScale : state.energyEv * ecdConversion;
    const f = finite(state.oscillatorStrength) && state.oscillatorStrength >= 0
      && finite(state.oscillatorStrength * uvFactor * peak) ? state.oscillatorStrength : null;
    const rawR = state[rKey];
    const r = finite(rawR) && finite(rawR * ecdFactor * peak) ? rawR : null;
    if (f === null) missingUv += 1;
    if (r === null) missingEcd += 1;
    bands.push({
      stateNumber: state.number ?? state.stateNumber ?? i + 1,
      energyEv: center,
      originalEnergyEv: state.energyEv,
      rawOscillatorStrength: finite(state.oscillatorStrength) ? state.oscillatorStrength : null,
      rawRotatoryStrength: finite(rawR) ? rawR : null,
      oscillatorStrength: f,
      rotatoryStrength: r,
      uvWeight: f === null ? null : f * uvFactor,
      ecdWeight: r === null ? null : r * ecdFactor,
    });
  }

  if (invalidEnergy) warnings.push(`${invalidEnergy} state(s) with missing or invalid excitation energy were omitted.`);
  if (excludedByShift) warnings.push(`${excludedByShift} state(s) were omitted because the shifted excitation energy is not positive and finite.`);
  const uvCount = bands.length - missingUv;
  const ecdCount = bands.length - missingEcd;
  const uvName = emission ? 'FL' : 'UV';
  if (bands.length && !uvCount) warnings.push(`${uvName} is unavailable: no valid oscillator strengths were found.`);
  else if (missingUv) warnings.push(`${uvName} includes ${uvCount} of ${bands.length} states; ${missingUv} missing or invalid oscillator strength(s) were omitted.`);
  if (bands.length && !ecdCount) warnings.push(`${names.ecd} is unavailable: no ${gauge}-gauge rotatory strengths were found. Missing data are not zero.`);
  else if (missingEcd) warnings.push(`${names.ecd} includes ${ecdCount} of ${bands.length} states; ${missingEcd} missing or invalid ${gauge}-gauge rotatory strength(s) were omitted.`);

  const units = { x: axis === 'ev' ? 'eV' : axis === 'cm-1' ? 'cm⁻¹' : 'nm',
    uv: emission ? normalize ? 'normalized relative intensity' : 'relative photon intensity' : normalize ? 'relative units' : MOLAR_UNITS,
    ecd: emission ? normalize ? 'normalized relative intensity' : 'relative photon intensity' : normalize ? 'relative units' : MOLAR_UNITS };
  const metadata = { axis, shape, gauge, family, names, symbols, fwhm, shift, normalize, units, intensityScale,
    availableUvStates: uvCount, availableEcdStates: ecdCount, totalStates: bands.length,
    inputStates: states.length,
    normalizationDivisors: { uv: 1, ecd: 1 },
    broadeningDomain: 'eV',
    ecdConvention: 'Transition-center energy; original amplitudes retained on shift.',
    stickConvention: 'Isolated broadened-band peak height.',
    sources: ['https://doi.org/10.1039/C0NJ00085J',
      'https://www.rsc.org/suppdata/nj/c0/c0nj00085j/c0nj00085j.pdf'] };
  if (emission) {
    metadata.emissionStateNumber = 1;
    metadata.emissionCplFactor = emissionCplFactor;
    metadata.emissionConvention = 'Relative photon emission: FL = I_L + I_R, CPL = I_L - I_R; common intensity factor 1000 is a display convenience before normalization; energy-domain envelope, printed R sign retained; no absolute quantum yield.';
    metadata.emissionWeights = { uv: '1000 E_1^2 f_1', ecd: '1000 k E_1^3 R_1' };
    metadata.sources.push('https://physics.nist.gov/Pubs/AtSpec/node17.html',
      'https://orca-manual.mpi-muelheim.mpg.de/contents/spectroscopyproperties/esd.html');
    warnings.push('FL/CPL is a relative state-1 photon-emission envelope. Use transition data at the intended emitting geometry; this calculation does not determine excited-state populations or emission quantum yields.');
  }
  if (!bands.length) {
    warnings.push(emission ? 'No usable Gaussian state 1 is available for FL/CPL emission.' : 'No states with valid positive excitation energies are available.');
    return { points: [], sticks: [], units, names, symbols, warnings, metadata, minX: null, maxX: null };
  }

  let minEnergy = Infinity;
  let maxEnergy = 0;
  for (const band of bands) {
    minEnergy = Math.min(minEnergy, band.energyEv);
    maxEnergy = Math.max(maxEnergy, band.energyEv);
  }
  const margin = Math.max(0.25, 4 * fwhm);
  const lowEnergy = Math.max(minEnergy * 0.1, minEnergy - margin);
  const highEnergy = maxEnergy + margin;
  const endpoints = [energyToX(lowEnergy, axis), energyToX(highEnergy, axis)];
  const minX = options.minX ?? Math.min(...endpoints);
  const maxX = options.maxX ?? Math.max(...endpoints);
  if (!finite(minX) || !finite(maxX) || minX >= maxX) {
    throw new RangeError('The selected axis bounds do not define a finite increasing range.');
  }

  const points = [];
  let peakUv = 0;
  let peakEcd = 0;
  let largestEnergyStep = 0;
  let previousEnergy = null;
  for (let i = 0; i < count; i += 1) {
    const x = sampleGrid ? sampleGrid[i] : i === count - 1 ? maxX : minX + ((maxX - minX) * i) / (count - 1);
    const energyEv = xToEnergy(x, axis);
    if (previousEnergy !== null) largestEnergyStep = Math.max(largestEnergyStep, Math.abs(energyEv - previousEnergy));
    previousEnergy = energyEv;
    let uv = uvCount ? 0 : null;
    let ecd = ecdCount ? 0 : null;
    for (const band of bands) {
      const value = profile(energyEv - band.energyEv);
      if (band.uvWeight !== null) uv += band.uvWeight * value;
      if (band.ecdWeight !== null) ecd += band.ecdWeight * value;
    }
    peakUv = Math.max(peakUv, Math.abs(uv ?? 0));
    peakEcd = Math.max(peakEcd, Math.abs(ecd ?? 0));
    points.push({ x, energyEv, uv, ecd });
  }
  if (largestEnergyStep > fwhm / 5) {
    warnings.push('The sampling grid is coarse compared with FWHM; increase points or narrow the plotted range to resolve sharp peaks.');
  }
  const sticks = bands.map((band) => ({
    x: energyToX(band.energyEv, axis),
    energyEv: band.energyEv,
    originalEnergyEv: band.originalEnergyEv,
    stateNumber: band.stateNumber,
    oscillatorStrength: band.oscillatorStrength,
    rotatoryStrength: band.rotatoryStrength,
    rawOscillatorStrength: band.rawOscillatorStrength,
    rawRotatoryStrength: band.rawRotatoryStrength,
    uv: band.uvWeight === null ? null : band.uvWeight * peak,
    ecd: band.ecdWeight === null ? null : band.ecdWeight * peak,
  }));
  if (normalize) {
    const uvDivisor = fixedDivisors?.uv ?? (peakUv || 1);
    const ecdDivisor = fixedDivisors?.ecd ?? (peakEcd || 1);
    for (const point of [...points, ...sticks]) {
      if (point.uv !== null) point.uv /= uvDivisor;
      if (point.ecd !== null) point.ecd /= ecdDivisor;
    }
    metadata.normalizationDivisors = { uv: uvDivisor, ecd: ecdDivisor };
  }
  return { points, sticks, units, names, symbols, warnings, metadata, minX, maxX };
}

/**
 * Evaluate the same model at every exact 0.5 nm grid position inside the current
 * display window. minX/maxX are interpreted in options.axis (nm by default),
 * then transformed to wavelength. This evaluates profiles, not interpolation.
 * Pass a displayed spectrum's metadata.normalizationDivisors with normalize:true
 * to retain its scale. No more than 50000 rows are permitted. A narrower window
 * may contain zero or one half-nanometer grid positions; these remain valid.
 */
export function generateWavelengthSpectrum(states, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Spectrum options must be an object.');
  }
  const preview = computeSpectrum(states, { ...options, points: 2 });
  const sourceAxis = preview.metadata.axis;
  let output;
  if (preview.minX === null || preview.maxX === null) {
    output = computeSpectrum(states, { ...options, axis: 'nm', minX: undefined, maxX: undefined, points: 2 }, []);
  } else {
    const endpoints = [preview.minX, preview.maxX].map((x) => energyToX(xToEnergy(x, sourceAxis), 'nm'));
    const minX = Math.min(...endpoints);
    const maxX = Math.max(...endpoints);
    const snapInteger = (value) => {
      const nearest = Math.round(value);
      return Math.abs(value - nearest) <= 16 * Number.EPSILON * Math.max(1, Math.abs(value)) ? nearest : value;
    };
    const firstIndex = Math.ceil(snapInteger(minX * 2));
    const lastIndex = Math.floor(snapInteger(maxX * 2));
    const count = Math.max(0, lastIndex - firstIndex + 1);
    if (!Number.isSafeInteger(firstIndex) || !Number.isSafeInteger(lastIndex) || count > 50000) {
      throw new RangeError('The 0.5 nm curve export exceeds 50000 rows. Narrow the plot range.');
    }
    const grid = Array.from({ length: count }, (_, i) => (firstIndex + i) / 2);
    output = computeSpectrum(states, { ...options, axis: 'nm', minX, maxX, points: 2 }, grid);
    if (!grid.length) output.warnings.push('The selected window contains no 0.5 nm sampling-grid positions.');
  }
  output.metadata.wavelengthStepNm = 0.5;
  output.metadata.sampling = 'Exact 0.5 nm grid; direct profile evaluation.';
  output.metadata.sourceAxis = sourceAxis;
  output.metadata.sourceWindow = { minX: preview.minX, maxX: preview.maxX, unit: preview.units.x };
  return output;
}
