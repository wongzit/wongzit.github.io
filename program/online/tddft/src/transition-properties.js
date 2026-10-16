/**
 * Selected-transition properties from Gaussian's printed LENGTH-gauge electric
 * and magnetic transition vectors. This module does not read printed rotatory
 * strengths, change a calculation, or alter the spectrum model.
 *
 * User-specified angular/sign conventions:
 *   c_raw = dot(u_length, v_magnetic) / (|u_length| |v_magnetic|)
 *   absorption: cos(theta) =  c_raw; g = -4 U M cos(theta) / (D + G)
 *   emission:   cos(theta) = -c_raw; g = +4 U M cos(theta) / (D + G)
 * In either family, R_vectors = -U M c_raw and g = 4 R_vectors / (D + G).
 * Thus the same geometry has supplementary angles but identical R and g.
 * The electric-dipole-dominant approximation is g_ED = 4 R_vectors / D.
 *
 * U = 254.1746 |u_length| in 10^-20 esu cm.
 * M = 0.927401 |v_magnetic| in 10^-20 erg/G.
 * Gaussian printed magnetic transition components use Bohr magnetons, not the
 * generic atomic magnetic dipole unit 2 mu_B. D = U^2 and G = M^2 use compatible
 * Gaussian-cgs scaling of 10^-40. Vector precision is limited by printed data.
 *
 * Gaussian-specific conversions: Garner & Corminboeuf, PCCP 2023,
 * DOI 10.1039/D3CP01343J, supporting information S2.
 * Full isotropic electric+magnetic dipole g: Kubo et al., corrected supporting
 * information, equations S8–S9, DOI 10.1021/acs.jpclett.1c00143.
 */

export const TRANSITION_PROPERTY_CONSTANTS = Object.freeze({
  electricAuToScaledCgs: 254.1746,
  magneticPrintedAuToScaledCgs: 0.927401,
});

const finite = (number) => typeof number === 'number' && Number.isFinite(number);
const VECTOR_KEYS = ['x', 'y', 'z'];

function readVector(value) {
  if (!value || !VECTOR_KEYS.every((key) => finite(value[key]))) return null;
  return VECTOR_KEYS.map((key) => value[key]);
}

/**
 * Calculate selected-state metrics using the explicit family conventions above.
 * Missing or incomplete vectors remain null. Known zero vectors retain zero
 * magnitudes and strengths; their angle is undefined. R and g require both
 * vectors to be known. g is undefined when both strengths are zero, and g_ED
 * is undefined when electric strength is zero.
 *
 * @param {object|null} state Canonical parser state with electricDipole and
 * magneticDipole {x,y,z}. electricDipoleVelocity and printed R are not used.
 * @param {{family?:'absorption'|'emission'}} options
 */
export function calculateTransitionProperties(state, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Transition-property options must be an object.');
  }
  const family = options.family ?? 'absorption';
  if (family !== 'absorption' && family !== 'emission') {
    throw new RangeError('Transition family must be absorption or emission.');
  }
  const warnings = [];
  const electric = readVector(state?.electricDipole);
  const magnetic = readVector(state?.magneticDipole);
  if (!electric) warnings.push('The length-gauge electric transition dipole is missing or has a nonfinite component.');
  if (!magnetic) warnings.push('The magnetic transition dipole is missing or has a nonfinite component.');
  const electricNorm = electric ? Math.hypot(...electric) : null;
  const magneticNorm = magnetic ? Math.hypot(...magnetic) : null;
  const representable = (value, quantity) => {
    if (finite(value)) return value;
    warnings.push(`${quantity} is outside the supported numeric range.`);
    return null;
  };
  const muMagnitude = electric ? representable(electricNorm
    * TRANSITION_PROPERTY_CONSTANTS.electricAuToScaledCgs, 'Electric dipole magnitude') : null;
  const mMagnitude = magnetic ? representable(magneticNorm
    * TRANSITION_PROPERTY_CONSTANTS.magneticPrintedAuToScaledCgs, 'Magnetic dipole magnitude') : null;
  const square = (magnitude, quantity) => {
    if (magnitude === null) return null;
    const value = representable(magnitude ** 2, quantity);
    if (magnitude > 0 && value === 0) {
      warnings.push(`${quantity} is below the supported numeric range.`);
      return null;
    }
    return value;
  };
  const electricStrength = square(muMagnitude, 'Electric dipole strength');
  const magneticStrength = square(mMagnitude, 'Magnetic dipole strength');
  let cosTheta = null;
  let thetaDeg = null;
  let rotatoryStrengthFromVectors = null;
  let g = null;
  let gElectricDominant = null;
  if (electric && magnetic && muMagnitude !== null && mMagnitude !== null) {
    if (electricNorm === 0 || magneticNorm === 0) {
      rotatoryStrengthFromVectors = 0;
      warnings.push('The E–M angle is undefined because at least one transition dipole has zero magnitude.');
    } else {
      // Normalize before the dot product to avoid overflow from raw components.
      // Roundoff may place a collinear cosine a few ulps outside [-1, 1].
      const rawCosine = Math.max(-1, Math.min(1, electric.reduce((sum, component, index) => sum
        + (component / electricNorm) * (magnetic[index] / magneticNorm), 0)));
      cosTheta = family === 'emission' ? -rawCosine : rawCosine;
      if (cosTheta === 0) cosTheta = 0; // Keep orthogonal results free of -0.
      thetaDeg = Math.acos(cosTheta) * 180 / Math.PI;
      const r = rawCosine === 0 ? 0 : -muMagnitude * mMagnitude * rawCosine;
      rotatoryStrengthFromVectors = representable(r === 0 ? 0 : r, 'Vector-derived rotatory strength');
    }
    if (electricStrength !== null && magneticStrength !== null && rotatoryStrengthFromVectors !== null) {
      const scale = Math.max(electricStrength, magneticStrength);
      if (scale > 0) {
        // Scale the denominator first so its sum and 4R cannot overflow.
        const value = 4 * (rotatoryStrengthFromVectors / scale)
          / (electricStrength / scale + magneticStrength / scale);
        g = representable(value === 0 ? 0 : value, 'Dissymmetry factor');
      } else {
        warnings.push('The dissymmetry factor is undefined because both transition dipole strengths are zero.');
      }
      if (electricStrength > 0) {
        const value = 4 * (rotatoryStrengthFromVectors / electricStrength);
        gElectricDominant = representable(value === 0 ? 0 : value, 'Electric-dipole-dominant dissymmetry factor');
      } else {
        warnings.push('The electric-dipole-dominant dissymmetry factor is undefined because electric strength is zero.');
      }
    }
  }
  return {
    family,
    gauge: 'length',
    stateNumber: Number.isInteger(state?.number) && state.number > 0 ? state.number : null,
    muMagnitude,
    mMagnitude,
    electricStrength,
    magneticStrength,
    cosTheta,
    thetaDeg,
    rotatoryStrengthFromVectors,
    g,
    gElectricDominant,
    units: {
      muMagnitude: '10⁻²⁰ esu cm',
      mMagnitude: '10⁻²⁰ erg G⁻¹',
      electricStrength: '10⁻⁴⁰ esu² cm²',
      magneticStrength: '10⁻⁴⁰ erg² G⁻²',
      cosTheta: 'dimensionless',
      thetaDeg: 'degrees',
      rotatoryStrengthFromVectors: '10⁻⁴⁰ erg esu cm G⁻¹',
      g: 'dimensionless',
      gElectricDominant: 'dimensionless',
    },
    warnings,
  };
}
