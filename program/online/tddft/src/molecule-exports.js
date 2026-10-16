/**
 * Standalone UCSF ChimeraX BILD molecular-scene export. No DOM or dependencies.
 * Official directives: https://www.cgl.ucsf.edu/chimerax/docs/user/formats/bild.html
 * .arrow's optional r1/r2 are shaft/cone-base radii; rho is the shaft fraction.
 *
 * Input is the viewer snapshot, whose atoms are centered but centroid records
 * the original Gaussian translation. Every exported object is translated back
 * into that original frame. Camera rotation/zoom are deliberately not applied.
 * vectors.drawn already contains the requested magnetic emission reversal;
 * this exporter consumes that vector directly without another sign change.
 */

const AXES = ['x', 'y', 'z'];
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const vector = (value) => value && AXES.every((key) => finite(value[key])) ? value : null;
const RADII = { 1: 0.31, 2: 0.28, 3: 1.28, 4: 0.96, 5: 0.84, 6: 0.76,
  7: 0.71, 8: 0.66, 9: 0.57, 10: 0.58, 11: 1.66, 12: 1.41, 13: 1.21,
  14: 1.11, 15: 1.07, 16: 1.05, 17: 1.02, 18: 1.06, 19: 2.03,
  20: 1.76, 26: 1.32, 29: 1.32, 30: 1.22, 35: 1.2, 47: 1.45,
  53: 1.39, 79: 1.36 };
const ATOM_COLORS = { 1: '#ffffff', 6: '#63716d', 7: '#6589bd', 8: '#c66b69',
  9: '#83ad83', 15: '#d6a86a', 16: '#d7c274', 17: '#83ad83', 35: '#ac7a64', 53: '#9277ae' };
const VECTOR_COLORS = { electric: '#126c65', magnetic: '#8b1e2d' };
const cleanComment = (value) => String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim();
const number = (value) => {
  if (!finite(value)) throw new RangeError('BILD geometry requires finite numeric coordinates.');
  return value === 0 ? '0' : Number(value.toPrecision(15)).toString();
};
const xyz = (value) => AXES.map((key) => number(value[key])).join(' ');
const color = (hex) => `.color ${[1, 3, 5].map((index) => number(Number.parseInt(hex.slice(index, index + 2), 16) / 255)).join(' ')}`;

function arrowGeometry(drawn, gain, origin, kind) {
  const displacement = Object.fromEntries(AXES.map((key) => [key, drawn[key] * gain]));
  if (!vector(displacement)) throw new RangeError(`The ${kind} vector display gain exceeds the supported coordinate range.`);
  const length = Math.hypot(displacement.x, displacement.y, displacement.z);
  if (!finite(length)) throw new RangeError(`The ${kind} arrow length exceeds the supported numeric range.`);
  if (length === 0) return { reason: 'zero-length vector' };
  const end = Object.fromEntries(AXES.map((key) => [key, origin[key] + displacement[key]]));
  if (!vector(end)) throw new RangeError(`The ${kind} arrow endpoint exceeds the supported numeric range.`);
  const shaftRadius = Math.min(0.045, length * 0.05);
  const headRadius = Math.min(0.12, length * 0.14);
  if (!shaftRadius || !headRadius || AXES.every((key) => number(end[key]) === number(origin[key]))) {
    return { reason: 'displacement is below the supported rendering precision' };
  }
  return { end, shaftRadius, headRadius };
}

/** Whether a vectors-only BILD can contain at least one visible valid arrow. */
export function hasVisibleBildVectors(snapshot) {
  const origin = vector(snapshot?.geometry?.centroid ?? { x: 0, y: 0, z: 0 });
  if (!origin) return false;
  const visible = { electric: true, magnetic: true, ...snapshot?.visible };
  const gains = { electric: snapshot?.gains?.electric ?? 1, magnetic: snapshot?.gains?.magnetic ?? 1 };
  if (Object.values(gains).some((gain) => !finite(gain) || gain <= 0)) return false;
  return ['electric', 'magnetic'].some((kind) => {
    if (!visible[kind]) return false;
    const drawn = vector(snapshot?.vectors?.[kind]?.drawn);
    if (!drawn) return false;
    try { return !arrowGeometry(drawn, gains[kind], origin, kind).reason; }
    catch { return false; }
  });
}

/**
 * @param {object} snapshot Viewer snapshot: centered prepared geometry,
 * bonds [{i,j,distance}], vectors {family,electric,magnetic}, gains
 * {electric,magnetic}, visible {electric,magnetic,hydrogens,axes}, stateNumber,
 * and optional sourceName/vectorsOnly. Each vector has raw/drawn {x,y,z}
 * components. vectorsOnly excludes atoms, bonds, and coordinate axes while
 * retaining visible transition vectors at the original molecular centroid.
 * @returns {string} Complete UTF-8-compatible BILD text, ending in a newline.
 */
export function buildMoleculeBild(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new TypeError('A molecular viewer snapshot is required.');
  const geometry = snapshot.geometry ?? {};
  const atoms = Array.isArray(geometry.atoms) ? geometry.atoms : [];
  const sourceCentroid = geometry.centroid ?? { x: 0, y: 0, z: 0 };
  if (!vector(sourceCentroid)) throw new RangeError('The original geometry centroid must have finite x, y, and z coordinates.');
  const origin = { ...sourceCentroid };
  const vectors = snapshot.vectors ?? {};
  const family = vectors.family ?? snapshot.family ?? 'absorption';
  if (family !== 'absorption' && family !== 'emission') throw new RangeError('BILD spectrum family must be absorption or emission.');
  const gains = { electric: snapshot.gains?.electric ?? 1, magnetic: snapshot.gains?.magnetic ?? 1 };
  for (const [kind, gain] of Object.entries(gains)) {
    if (!finite(gain) || gain <= 0) throw new RangeError(`The ${kind} display gain must be finite and positive.`);
  }
  const visible = { electric: true, magnetic: true, hydrogens: true, axes: true, ...snapshot.visible };
  const vectorsOnly = snapshot.vectorsOnly === true;
  const lines = [
    '.comment Excitation Studio molecular scene; UCSF ChimeraX BILD format (.bild)',
    `.comment Content: ${vectorsOnly ? 'visible transition vectors only; no molecule or XYZ axes' : 'molecule and visible vectors'}.`,
    '.comment Original unrotated Gaussian coordinate frame; camera rotation and zoom are not applied.',
    '.comment Molecule coordinates and shape radii are in angstroms.',
    '.comment Vector lengths are display gain times printed atomic-unit components; these are visual scales, not angstrom-valued physical moments.',
    `.comment Source: ${cleanComment(snapshot.sourceName || 'unspecified')}`,
    `.comment Selected state: ${cleanComment(snapshot.stateNumber ?? 'unspecified')}; family: ${family}`,
    `.comment Original centroid: ${xyz(origin)}`,
    `.comment Geometry orientation: ${cleanComment(geometry.orientation || 'unavailable')}; source line: ${cleanComment(geometry.sourceLine ?? 'unavailable')}`,
    `.comment Display gains: electric=${number(gains.electric)} magnetic=${number(gains.magnetic)}`,
    '.comment Bonds are inferred display connections; this file does not encode chemical bond orders.',
  ];
  if (!vectorsOnly) {
    const originalPosition = (atom) => {
      if (!vector(atom)) return null;
      const result = Object.fromEntries(AXES.map((key) => [key, atom[key] + origin[key]]));
      if (!vector(result)) throw new RangeError('Restoring the original coordinate frame exceeds the supported numeric range.');
      return result;
    };
    const positions = atoms.map(originalPosition);
    const showAtom = (index) => positions[index] && Number.isInteger(atoms[index]?.atomicNumber)
      && atoms[index].atomicNumber > 0 && atoms[index].atomicNumber <= 118
      && (visible.hydrogens || atoms[index].atomicNumber !== 1);
    const bonds = Array.isArray(snapshot.bonds) ? snapshot.bonds : [];
    lines.push('.comment Inferred bond cylinders');
    lines.push(color('#a0aca5'));
    for (const bond of bonds) {
      if (!Number.isInteger(bond?.i) || !Number.isInteger(bond?.j) || bond.i === bond.j
        || !showAtom(bond.i) || !showAtom(bond.j)) continue;
      const start = positions[bond.i], end = positions[bond.j];
      if (Math.hypot(...AXES.map((key) => end[key] - start[key])) === 0) continue;
      lines.push(`.cylinder ${xyz(start)} ${xyz(end)} 0.06`);
    }
    lines.push('.comment Atom spheres');
    for (let i = 0; i < atoms.length; i += 1) {
      if (!showAtom(i)) continue;
      const atom = atoms[i];
      lines.push(`.comment Atom ${cleanComment(atom.centerNumber ?? i + 1)}; atomic number ${atom.atomicNumber}`);
      lines.push(color(ATOM_COLORS[atom.atomicNumber] ?? '#b69cbd'));
      const sphereRadius = Math.min(RADII[atom.atomicNumber] ?? 1.2, 1.1) * 0.27;
      lines.push(`.sphere ${xyz(positions[i])} ${number(sphereRadius)}`);
    }
  }
  if (!atoms.length) lines.push('.comment Molecular geometry unavailable; vector origin is the supplied centroid or zero.');
  if (!vectorsOnly && visible.axes) {
    const extent = finite(geometry.radius) && geometry.radius >= 0 ? geometry.radius : 0;
    const axisLength = Math.max(1.1, Math.min(2.5, extent * 0.7));
    lines.push('.comment Positive XYZ coordinate axes at the original centroid');
    lines.push(color('#a9b5aa'));
    for (const key of AXES) {
      const end = { ...origin, [key]: origin[key] + axisLength };
      lines.push(`.comment ${key.toUpperCase()} axis`);
      lines.push(`.arrow ${xyz(origin)} ${xyz(end)} 0.014 0.056 0.88`);
    }
  }
  let vectorCount = 0;
  for (const kind of ['electric', 'magnetic']) {
    const entry = vectors[kind];
    const raw = vector(entry?.raw);
    const drawn = vector(entry?.drawn);
    lines.push(`.comment ${kind === 'electric' ? 'Electric length-gauge' : 'Magnetic'} transition vector`);
    lines.push(`.comment Printed raw ${kind} a.u.: ${raw ? xyz(raw) : 'not printed'}`);
    lines.push(`.comment Family-adjusted drawn ${kind} a.u.: ${drawn ? xyz(drawn) : 'not printed'}`);
    lines.push(`.comment ${kind} display sign: ${entry?.sign === -1 ? '-1' : entry?.sign === 1 ? '+1' : 'as supplied in drawn components'}`);
    lines.push(`.comment ${kind} display gain: ${number(gains[kind])}; visibility: ${visible[kind] ? 'shown' : 'hidden'}`);
    if (!visible[kind]) continue;
    if (!drawn) { lines.push(`.comment ${kind} arrow omitted: complete drawn vector unavailable.`); continue; }
    const { end, shaftRadius, headRadius, reason } = arrowGeometry(drawn, gains[kind], origin, kind);
    if (reason) { lines.push(`.comment ${kind} arrow omitted: ${reason}.`); continue; }
    lines.push(color(VECTOR_COLORS[kind]));
    lines.push(`.arrow ${xyz(origin)} ${xyz(end)} ${number(shaftRadius)} ${number(headRadius)} 0.78`);
    vectorCount += 1;
  }
  if (vectorsOnly && !vectorCount) throw new RangeError('Vectors-only BILD requires at least one visible, finite, nonzero transition vector. Show Electric μ or Magnetic m, or choose Molecule + vectors.');
  return `${lines.join('\n')}\n`;
}
