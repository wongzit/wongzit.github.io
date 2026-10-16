/**
 * Dependency-free, orthographic 3D molecule / transition-vector viewer.
 * Vectors use Gaussian's printed components directly. Emission reverses only
 * the displayed magnetic vector; no calculation or source object is changed.
 * Atom coordinates are centered on their arithmetic centroid in angstroms.
 * Display gains multiply raw vector lengths; they are never physical units.
 *
 * Bonds are a visual distance heuristic, not inferred bond orders: 0.4 A < d
 * <= 1.2(r_i+r_j). Selected covalent radii follow Cordero et al., Dalton Trans.
 * 2008, DOI 10.1039/B801115J. Unlisted elements use a stated 1.2 A fallback.
 */

import { buildMoleculeBild, hasVisibleBildVectors } from './molecule-exports.js';

const NS = 'http://www.w3.org/2000/svg';
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const AXES = ['x', 'y', 'z'];
const RADII = Object.freeze({
  1: 0.31, 2: 0.28, 3: 1.28, 4: 0.96, 5: 0.84, 6: 0.76, 7: 0.71,
  8: 0.66, 9: 0.57, 10: 0.58, 11: 1.66, 12: 1.41, 13: 1.21,
  14: 1.11, 15: 1.07, 16: 1.05, 17: 1.02, 18: 1.06, 19: 2.03,
  20: 1.76, 26: 1.32, 29: 1.32, 30: 1.22, 35: 1.20, 47: 1.45,
  53: 1.39, 79: 1.36,
});
const SYMBOLS = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V',
  'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
  'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
  'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf',
  'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po',
  'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm',
  'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs',
  'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'];
const COLORS = { 1: '#ffffff', 6: '#63716d', 7: '#6589bd', 8: '#c66b69',
  9: '#83ad83', 15: '#d6a86a', 16: '#d7c274', 17: '#83ad83', 35: '#ac7a64', 53: '#9277ae' };
const VECTOR_COLORS = { electric: '#126c65', magnetic: '#8b1e2d' };
const DEFAULT_CAMERA = Object.freeze({ yaw: -0.6, pitch: 0.42, zoom: 1 });
let nextViewerId = 0;

export const getElementSymbol = (number) => SYMBOLS[number] || `Z${number}`;
const symbol = getElementSymbol;
const radius = (number) => RADII[number] ?? 1.2;
const validAtom = (atom) => atom && Number.isInteger(atom.atomicNumber)
  && atom.atomicNumber > 0 && atom.atomicNumber <= 118 && AXES.every((key) => finite(atom[key]));
const format = (value) => !finite(value) ? 'not printed' : value === 0 ? '0' : Number(value.toPrecision(5)).toString();
const components = (value) => `(${AXES.map((key) => format(value[key])).join(', ')})`;

/** Return raw and family-adjusted vectors without mutating parser state. */
export function getViewerVectors(state, family = 'absorption') {
  if (family !== 'absorption' && family !== 'emission') throw new RangeError('Viewer family must be absorption or emission.');
  const read = (value, sign) => {
    if (!value || !AXES.every((key) => finite(value[key]))) return null;
    const raw = Object.fromEntries(AXES.map((key) => [key, value[key]]));
    const magnitude = Math.hypot(raw.x, raw.y, raw.z);
    if (!finite(magnitude)) return null;
    const drawn = Object.fromEntries(AXES.map((key) => [key, raw[key] * sign === 0 ? 0 : raw[key] * sign]));
    return { raw, drawn, magnitude, sign };
  };
  return {
    family,
    electric: read(state?.electricDipole, 1),
    magnetic: read(state?.magneticDipole, family === 'emission' ? -1 : 1),
  };
}

/** Center valid atoms at their arithmetic centroid, preserving source records. */
export function prepareMoleculeGeometry(geometry) {
  const warnings = [];
  const source = Array.isArray(geometry?.atoms) ? geometry.atoms : [];
  const unit = geometry?.units;
  if (source.length && unit != null && !/^angstroms?$/i.test(unit)) {
    return { atoms: [], centroid: { x: 0, y: 0, z: 0 }, radius: 0,
      orientation: geometry?.orientation ?? null, sourceLine: geometry?.sourceLine ?? null,
      warnings: ['Geometry is unavailable because its coordinates are not in angstroms.'] };
  }
  const usable = source.map((atom, originalIndex) => ({ atom, originalIndex })).filter(({ atom }) => validAtom(atom));
  if (usable.length < source.length) warnings.push(`${source.length - usable.length} invalid or dummy atom(s) were omitted from the viewer.`);
  const centroid = Object.fromEntries(AXES.map((key) => [key,
    usable.length ? usable.reduce((sum, { atom }) => sum + atom[key] / usable.length, 0) : 0]));
  const atoms = usable.map(({ atom, originalIndex }) => ({ ...atom, originalIndex,
    x: atom.x - centroid.x, y: atom.y - centroid.y, z: atom.z - centroid.z }));
  if (atoms.some((atom) => !AXES.every((key) => finite(atom[key])))) {
    return { atoms: [], centroid: { x: 0, y: 0, z: 0 }, radius: 0,
      orientation: geometry?.orientation ?? null, sourceLine: geometry?.sourceLine ?? null,
      warnings: ['Geometry coordinates exceed the supported numeric range.'] };
  }
  let extent = 0;
  for (const atom of atoms) extent = Math.max(extent, Math.hypot(atom.x, atom.y, atom.z));
  if (!finite(extent)) {
    return { atoms: [], centroid: { x: 0, y: 0, z: 0 }, radius: 0,
      orientation: geometry?.orientation ?? null, sourceLine: geometry?.sourceLine ?? null,
      warnings: ['Geometry extent exceeds the supported numeric range.'] };
  }
  return { atoms, centroid, radius: extent, orientation: geometry?.orientation ?? null,
    sourceLine: geometry?.sourceLine ?? null, warnings };
}

/** Infer display-only bonds by covalent-radius distances, using spatial bins. */
export function inferMoleculeBonds(atoms) {
  if (!Array.isArray(atoms)) throw new TypeError('Atoms must be an array.');
  let largestRadius = 0;
  for (const atom of atoms) if (validAtom(atom)) largestRadius = Math.max(largestRadius, radius(atom.atomicNumber));
  if (!largestRadius) return [];
  const cellSize = 2.4 * largestRadius;
  const bins = new Map();
  const keyFor = (x, y, z) => `${x},${y},${z}`;
  const bonds = [];
  for (let i = 0; i < atoms.length; i += 1) {
    const atom = atoms[i];
    if (!validAtom(atom)) continue;
    const cell = AXES.map((key) => Math.floor(atom[key] / cellSize));
    const visited = new Set();
    for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) for (let dz = -1; dz <= 1; dz += 1) {
      const nearby = bins.get(keyFor(cell[0] + dx, cell[1] + dy, cell[2] + dz)) ?? [];
      for (const j of nearby) {
        if (visited.has(j)) continue;
        visited.add(j);
        const other = atoms[j];
        const distance = Math.hypot(atom.x - other.x, atom.y - other.y, atom.z - other.z);
        const cutoff = 1.2 * (radius(atom.atomicNumber) + radius(other.atomicNumber));
        if (distance > 0.4 && distance <= cutoff) bonds.push({ i: j, j: i, distance });
      }
    }
    const key = keyFor(...cell);
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(i);
  }
  return bonds;
}

/** Orthographic 3D projection: positive depth is closer to the viewer. */
export function projectMoleculePoint(point, camera = {}) {
  const { yaw = 0, pitch = 0, scale = 1, centerX = 0, centerY = 0 } = camera;
  if (!point || !AXES.every((key) => finite(point[key]))
    || ![yaw, pitch, scale, centerX, centerY].every(finite) || scale <= 0) {
    throw new RangeError('Projection requires finite coordinates and a positive scale.');
  }
  const x = Math.cos(yaw) * point.x + Math.sin(yaw) * point.z;
  const z = -Math.sin(yaw) * point.x + Math.cos(yaw) * point.z;
  const y = Math.cos(pitch) * point.y - Math.sin(pitch) * z;
  const depth = Math.sin(pitch) * point.y + Math.cos(pitch) * z;
  return { x: centerX + x * scale, y: centerY - y * scale, depth };
}

/**
 * Mount a self-contained native SVG viewer with pointer/keyboard/touch controls.
 * setData accepts {geometry,state,family}. Geometry changes reset the camera and
 * choose one common initial gain for both vectors; subsequent state/family
 * changes preserve camera and gains. User controls can change gains independently.
 */
export function createMoleculeViewer(container) {
  if (!container?.ownerDocument || typeof container.append !== 'function') throw new TypeError('A DOM container is required.');
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  const id = `molecule-${++nextViewerId}`;
  const listeners = [];
  const html = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const svgNode = (tag, attrs = {}, text) => {
    const node = doc.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text != null) node.textContent = text;
    return node;
  };
  const listen = (node, name, handler, options) => {
    node.addEventListener(name, handler, options);
    listeners.push(() => node.removeEventListener(name, handler, options));
  };
  const widget = html('div', 'molecule-widget');
  const controls = html('div', 'molecule-controls');
  controls.setAttribute('aria-label', 'Molecule viewer controls');
  const checkbox = (labelText) => {
    const label = html('label', 'molecule-check');
    const input = html('input'); input.type = 'checkbox'; input.checked = true;
    label.append(input, doc.createTextNode(labelText)); controls.append(label);
    return input;
  };
  const showElectric = checkbox('Electric μ');
  const showMagnetic = checkbox('Magnetic m');
  const showHydrogen = checkbox('Hydrogens');
  const showAxes = checkbox('XYZ axes');
  const gainControl = (labelText) => {
    const label = html('label', 'molecule-gain');
    const input = html('input'); input.type = 'number'; input.min = '0'; input.step = 'any'; input.value = '1';
    input.setAttribute('aria-label', labelText);
    input.title = 'Positive visual display factor multiplied by the raw printed vector; no physical property changes.';
    label.append(doc.createTextNode(labelText), input); controls.append(label);
    return input;
  };
  const electricGainInput = gainControl('μ display gain');
  const magneticGainInput = gainControl('m display gain');
  const button = (labelText, ariaLabel = labelText) => {
    const node = html('button', 'molecule-reset', labelText); node.type = 'button';
    node.setAttribute('aria-label', ariaLabel); controls.append(node); return node;
  };
  const zoomIn = button('+', 'Zoom in');
  const zoomOut = button('−', 'Zoom out');
  const fitButton = button('Fit vector scales');
  const resetButton = button('Reset view');
  const pngButton = button('Download PNG');
  pngButton.title = 'Save the current molecular picture, including rotation, zoom and visibility.';
  const bildContentLabel = html('label', 'molecule-gain molecule-bild-content');
  const bildContent = html('select');
  bildContent.setAttribute('aria-label', 'BILD content');
  bildContent.title = 'Select BILD file content. This setting does not change the live molecule view or PNG.';
  for (const [value, text] of [['molecule', 'Molecule + vectors'], ['vectors-only', 'Vectors only']]) {
    const option = html('option', '', text); option.value = value; bildContent.append(option);
  }
  bildContent.value = 'molecule';
  bildContentLabel.append(doc.createTextNode('BILD content'), bildContent);
  controls.append(bildContentLabel);
  const bildButton = button('Download BILD');
  bildButton.title = 'Save the visible molecule and vectors as a 3D BILD drawing for ChimeraX.';
  const surface = svgNode('svg', { class: 'molecule-stage', viewBox: '0 0 640 400',
    tabindex: 0, role: 'img', 'aria-label': 'Interactive 3D molecule and transition vectors. Drag or use arrow keys to rotate; plus and minus to zoom; Home to reset.' });
  surface.style.touchAction = 'none';
  surface.style.width = '100%';
  surface.style.display = 'block';
  surface.setAttribute('aria-describedby', `${id}-caption`);
  const legend = html('div', 'molecule-legend');
  legend.append(html('span', 'molecule-electric', '━ Electric μ · solid teal'),
    html('span', 'molecule-magnetic', '━ Magnetic m · solid dark red'));
  const readouts = html('div', 'molecule-vector-readout');
  const electricReadout = html('div', 'molecule-vector-value molecule-electric');
  const magneticReadout = html('div', 'molecule-vector-value molecule-magnetic');
  readouts.append(electricReadout, magneticReadout);
  const status = html('p', 'molecule-status'); status.setAttribute('role', 'status');
  const exportStatus = html('p', 'molecule-export-status'); exportStatus.setAttribute('role', 'status'); exportStatus.hidden = true;
  const caption = html('p', 'molecule-caption', 'Drag to rotate · +/− or wheel to zoom. Coordinates are Å; vector lengths are display gain × printed atomic-unit components. Display gains change only the drawing. Bonds are inferred by distance. PNG saves this view; BILD saves the selected content in the original Gaussian frame for ChimeraX. BILD content changes only the BILD file.');
  caption.id = `${id}-caption`;
  widget.append(controls, surface, legend, readouts, status, exportStatus, caption);
  container.append(widget);

  let currentGeometry;
  let geometry = prepareMoleculeGeometry(null);
  let bonds = [];
  let vectors = getViewerVectors(null);
  let stateNumber = null;
  let camera = { ...DEFAULT_CAMERA };
  let gains = { electric: 1, magnetic: 1 };
  let destroyed = false;
  let drag = null;
  let frame = null;
  let gainError = '';
  let sourceName = '';
  let exportingPng = false;

  const exportFilename = (extension) => {
    const stem = sourceName.replace(/\.(?:log|out|txt)$/i, '').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 100) || 'molecule';
    return `${stem}_state-${stateNumber ?? 'unknown'}_${vectors.family}.${extension}`;
  };
  const downloadBlob = (blob, filename) => {
    const url = win.URL.createObjectURL(blob);
    const link = html('a'); link.href = url; link.download = filename;
    link.click();
    win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
  };
  const reportExport = (message, failed = false) => {
    exportStatus.hidden = false;
    exportStatus.textContent = message;
    exportStatus.dataset.failed = String(failed);
  };

  async function exportPng() {
    if (exportingPng || destroyed) return;
    const filename = exportFilename('png');
    exportingPng = true; pngButton.disabled = true;
    try {
      // Serialize a snapshot before waiting for image decoding. Changes made
      // during export cannot change the camera, visibility or vector convention.
      const clone = surface.cloneNode(true);
      const bounds = surface.getBoundingClientRect();
      const width = Math.max(1, Math.round((bounds.width || 640) * 2));
      const height = Math.max(1, Math.round((bounds.height || 400) * 2));
      clone.setAttribute('xmlns', NS);
      clone.setAttribute('width', width); clone.setAttribute('height', height);
      clone.removeAttribute('class'); clone.removeAttribute('tabindex');
      clone.removeAttribute('aria-describedby'); clone.removeAttribute('style');
      clone.setAttribute('font-family', win.getComputedStyle(surface).fontFamily);
      const background = svgNode('defs');
      const gradient = svgNode('radialGradient', { id: `${id}-png-background`, cx: '50%', cy: '50%', r: '70.7%' });
      gradient.append(svgNode('stop', { offset: '20%', 'stop-color': '#ffffff' }),
        svgNode('stop', { offset: '100%', 'stop-color': '#f6f8f4' }));
      background.append(gradient);
      clone.prepend(background, svgNode('rect', { width: 640, height: 400, fill: `url(#${id}-png-background)` }));
      const svg = new win.XMLSerializer().serializeToString(clone);
      const imageUrl = win.URL.createObjectURL(new win.Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      let image;
      try {
        image = await new Promise((resolve, reject) => {
          const nextImage = new win.Image();
          nextImage.onload = () => resolve(nextImage);
          nextImage.onerror = () => reject(new Error('The molecular image could not be rendered.'));
          nextImage.src = imageUrl;
        });
      } finally { win.URL.revokeObjectURL(imageUrl); }
      const canvas = doc.createElement('canvas'); canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('PNG export is unavailable in this browser.');
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG export failed.')), 'image/png'));
      if (destroyed) return;
      downloadBlob(blob, filename);
      reportExport(`Downloaded ${filename} · ${width} × ${height} pixels.`);
    } catch (error) { if (!destroyed) reportExport(error.message || 'PNG export failed.', true); }
    finally { exportingPng = false; if (!destroyed) render(); }
  }

  function exportBild() {
    try {
      const text = buildMoleculeBild({ geometry, bonds, vectors, gains,
        visible: { electric: showElectric.checked, magnetic: showMagnetic.checked, hydrogens: showHydrogen.checked, axes: showAxes.checked },
        stateNumber, sourceName, vectorsOnly: bildContent.value === 'vectors-only' });
      const filename = bildContent.value === 'vectors-only'
        ? exportFilename('bild').replace(/\.bild$/, '_vectors-only.bild') : exportFilename('bild');
      downloadBlob(new win.Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
      reportExport(`Downloaded ${filename}. Open it with File → Open in ChimeraX.`);
    } catch (error) { reportExport(error.message || 'BILD export failed.', true); }
  }

  const updateGainInputs = () => {
    electricGainInput.value = String(Number(gains.electric.toPrecision(7)));
    magneticGainInput.value = String(Number(gains.magnetic.toPrecision(7)));
    electricGainInput.setCustomValidity(''); magneticGainInput.setCustomValidity('');
  };
  const fitVectorScales = () => {
    const maxMagnitude = Math.max(vectors.electric?.magnitude ?? 0, vectors.magnetic?.magnitude ?? 0);
    const target = Math.max(geometry.radius, 1.5) * 1.05;
    const value = maxMagnitude ? target / maxMagnitude : 1;
    const common = finite(value) && value > 0 ? value : 1;
    gains = { electric: common, magnetic: common };
    gainError = ''; updateGainInputs();
  };
  const resetView = () => {
    if (destroyed) return;
    camera = { ...DEFAULT_CAMERA };
    fitVectorScales();
    render();
  };
  const changeZoom = (factor) => {
    camera.zoom = Math.max(0.15, Math.min(8, camera.zoom * factor));
    render();
  };
  const schedule = () => {
    if (destroyed || frame !== null) return;
    if (win?.requestAnimationFrame) frame = win.requestAnimationFrame(() => { frame = null; render(); });
    else render();
  };

  function renderReadout(node, name, vector, isMagnetic) {
    node.replaceChildren();
    const heading = html('strong', '', `${name}: `);
    node.append(heading);
    if (!vector) { node.append(doc.createTextNode('not printed')); return; }
    node.append(doc.createTextNode(`|${isMagnetic ? 'm' : 'μ'}| = ${format(vector.magnitude)} a.u.; printed ${components(vector.raw)}`));
    if (isMagnetic && vectors.family === 'emission') {
      node.append(html('span', 'molecule-drawn-components', `; drawn −m = ${components(vector.drawn)}`));
    }
  }

  function render() {
    if (destroyed) return;
    const family = vectors.family;
    widget.dataset.family = family;
    widget.dataset.stateNumber = stateNumber ?? '';
    surface.dataset.yaw = String(camera.yaw);
    surface.dataset.pitch = String(camera.pitch);
    surface.dataset.zoom = String(camera.zoom);
    for (const key of AXES) surface.setAttribute(`data-centroid-${key}`, String(geometry.centroid[key]));
    renderReadout(electricReadout, 'Electric μ · length gauge', vectors.electric, false);
    renderReadout(magneticReadout, 'Magnetic m', vectors.magnetic, true);
    showElectric.disabled = !vectors.electric;
    showMagnetic.disabled = !vectors.magnetic;
    electricGainInput.disabled = !vectors.electric;
    magneticGainInput.disabled = !vectors.magnetic;
    const haveData = Boolean(geometry.atoms.length || vectors.electric || vectors.magnetic);
    pngButton.disabled = !haveData || exportingPng;
    const vectorsOnly = bildContent.value === 'vectors-only';
    const haveVisibleVectors = hasVisibleBildVectors({ geometry, vectors, gains,
      visible: { electric: showElectric.checked, magnetic: showMagnetic.checked } });
    bildButton.disabled = vectorsOnly ? !haveVisibleVectors : !haveData;
    bildButton.title = vectorsOnly
      ? haveVisibleVectors ? 'Save only the visible electric and magnetic vectors, without atoms, bonds or XYZ axes.'
        : 'Show at least one finite, nonzero electric or magnetic vector to export vectors-only BILD.'
      : 'Save the visible molecule and vectors as a 3D BILD drawing for ChimeraX.';
    surface.dataset.axesVisible = String(showAxes.checked);
    const visible = { electric: showElectric.checked, magnetic: showMagnetic.checked };
    let extent = Math.max(geometry.radius + 0.5, 1.8);
    for (const kind of ['electric', 'magnetic']) {
      if (visible[kind] && vectors[kind]) extent = Math.max(extent, vectors[kind].magnitude * gains[kind]);
    }
    const scale = 150 / extent * camera.zoom;
    const projection = { yaw: camera.yaw, pitch: camera.pitch, scale, centerX: 320, centerY: 200 };
    const project = (point) => projectMoleculePoint(point, projection);
    const origin = project({ x: 0, y: 0, z: 0 });
    const title = svgNode('title', {}, `3D molecular frame${stateNumber == null ? '' : ` · state ${stateNumber}`} · ${family}`);
    const description = svgNode('desc', {}, 'Orthographic projection with depth-sorted atoms and inferred bonds. Electric vectors use printed length-gauge components. Emission reverses only the magnetic drawing. Visual gains are separate from angstrom coordinates.');
    const defs = svgNode('defs');
    for (const [kind, color] of Object.entries({ ...VECTOR_COLORS, axis: '#a9b5aa' })) {
      const marker = svgNode('marker', { id: `${id}-${kind}-arrow`, viewBox: '0 0 8 8', refX: 7, refY: 4,
        markerWidth: 3.5, markerHeight: 3.5, orient: 'auto-start-reverse' });
      marker.append(svgNode('path', { d: 'M0 0 L8 4 L0 8 Z', fill: color })); defs.append(marker);
    }
    const axes = svgNode('g', { class: 'molecule-axes', 'aria-hidden': true, visibility: showAxes.checked ? 'visible' : 'hidden' });
    const axisLength = Math.max(1.1, Math.min(2.5, geometry.radius * 0.7));
    for (const key of AXES) {
      const endpoint = project({ x: key === 'x' ? axisLength : 0, y: key === 'y' ? axisLength : 0, z: key === 'z' ? axisLength : 0 });
      axes.append(svgNode('line', { x1: origin.x, y1: origin.y, x2: endpoint.x, y2: endpoint.y,
        stroke: '#bdc9bd', 'stroke-width': 1, 'stroke-dasharray': '3 5', 'marker-end': `url(#${id}-axis-arrow)` }),
      svgNode('text', { x: endpoint.x + 5, y: endpoint.y - 4, fill: '#819080', 'font-size': 13 }, key.toUpperCase()));
    }
    const molecule = svgNode('g', { class: 'molecule-model' });
    const projected = geometry.atoms.map(project);
    const drawables = [];
    for (const bond of bonds) {
      const a = geometry.atoms[bond.i], b = geometry.atoms[bond.j];
      if (!showHydrogen.checked && (a.atomicNumber === 1 || b.atomicNumber === 1)) continue;
      const p = projected[bond.i], q = projected[bond.j];
      drawables.push({ depth: (p.depth + q.depth) / 2, node: svgNode('line', {
        class: 'molecule-bond', x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: '#a0aca5',
        'stroke-width': Math.max(1.2, Math.min(5, scale * 0.12)), 'stroke-linecap': 'round',
        'data-bond-i': bond.i, 'data-bond-j': bond.j,
      }) });
    }
    geometry.atoms.forEach((atom, index) => {
      if (!showHydrogen.checked && atom.atomicNumber === 1) return;
      const point = projected[index];
      const atomRadius = Math.max(2.3, Math.min(14, scale * Math.min(radius(atom.atomicNumber), 1.1) * 0.27));
      const group = svgNode('g', { class: 'molecule-atom', 'data-atomic-number': atom.atomicNumber,
        'data-center-number': atom.centerNumber ?? atom.originalIndex + 1 });
      group.append(svgNode('title', {}, `${symbol(atom.atomicNumber)} ${atom.centerNumber ?? atom.originalIndex + 1} · centered (${format(atom.x)}, ${format(atom.y)}, ${format(atom.z)}) Å`),
        svgNode('circle', { cx: point.x, cy: point.y, r: atomRadius, fill: COLORS[atom.atomicNumber] ?? '#b69cbd', stroke: atom.atomicNumber === 1 ? '#a6b2a7' : '#ffffff', 'stroke-width': 1.1 }));
      if (atom.atomicNumber !== 6 && (atom.atomicNumber !== 1 || atomRadius > 4)) {
        group.append(svgNode('text', { x: point.x, y: point.y + 3.2, 'text-anchor': 'middle',
          fill: atom.atomicNumber === 1 ? '#66736b' : '#ffffff', 'font-size': Math.min(12, atomRadius * 1.4),
          'font-weight': 600, 'pointer-events': 'none' }, symbol(atom.atomicNumber)));
      }
      drawables.push({ depth: point.depth, node: group });
    });
    drawables.sort((a, b) => a.depth - b.depth).forEach(({ node }) => molecule.append(node));
    const arrows = svgNode('g', { class: 'molecule-vectors' });
    for (const kind of ['electric', 'magnetic']) {
      const vector = vectors[kind];
      if (!vector) continue;
      const display = Object.fromEntries(AXES.map((key) => [key, vector.drawn[key] * gains[kind]]));
      const endpoint = project(display);
      const group = svgNode('g', { class: `molecule-vector molecule-${kind}`, 'data-vector': kind,
        'data-family': family, 'data-gain': gains[kind], 'data-raw-magnitude': vector.magnitude,
        'data-origin-x': 0, 'data-origin-y': 0, 'data-origin-z': 0,
        visibility: visible[kind] ? 'visible' : 'hidden' });
      for (const key of AXES) {
        group.setAttribute(`data-raw-${key}`, vector.raw[key]);
        group.setAttribute(`data-drawn-${key}`, vector.drawn[key]);
        group.setAttribute(`data-display-${key}`, display[key]);
      }
      const name = kind === 'electric' ? 'μ' : 'm';
      group.append(svgNode('title', {}, `${name}: printed ${components(vector.raw)} a.u.; drawn ${components(vector.drawn)} × ${format(gains[kind])}`));
      if (vector.magnitude > 0) {
        group.append(svgNode('line', { x1: origin.x, y1: origin.y, x2: endpoint.x, y2: endpoint.y,
          stroke: VECTOR_COLORS[kind], 'stroke-width': 3, 'stroke-dasharray': 'none',
          'stroke-linecap': 'round', 'marker-end': `url(#${id}-${kind}-arrow)` }));
      }
      if (Math.hypot(endpoint.x - origin.x, endpoint.y - origin.y) < 3) {
        group.append(svgNode('circle', { cx: origin.x, cy: origin.y, r: kind === 'electric' ? 4 : 6,
          fill: 'none', stroke: VECTOR_COLORS[kind], 'stroke-width': 1.5 }));
      }
      group.append(svgNode('text', { x: endpoint.x + 9, y: endpoint.y + (kind === 'electric' ? -7 : 15),
        fill: VECTOR_COLORS[kind], 'font-size': 16, 'font-weight': 700,
        stroke: '#ffffff', 'stroke-width': 3, 'paint-order': 'stroke' }, `${name}${vector.magnitude === 0 ? ' = 0' : ''}`));
      arrows.append(group);
    }
    surface.replaceChildren(title, description, defs, axes, molecule,
      svgNode('circle', { cx: origin.x, cy: origin.y, r: 2.5, fill: '#809080', 'aria-hidden': true }), arrows);
    const geometryStatus = geometry.atoms.length
      ? `${geometry.atoms.length} atoms · ${bonds.length} inferred bonds · ${geometry.orientation || 'molecular'} orientation${geometry.sourceLine ? ` · source line ${geometry.sourceLine}` : ''}.`
      : `Geometry unavailable; available vectors${showAxes.checked ? ' and XYZ axes' : ''} are shown at the origin.`;
    const convention = family === 'emission'
      ? 'FL/CPL drawing: electric vector unchanged; magnetic vector reversed (−m).'
      : 'UV/ECD drawing: both vectors use their raw printed directions.';
    status.textContent = [geometryStatus, convention, !vectors.electric && !vectors.magnetic
      ? 'No complete transition vectors were printed for this state.' : '', ...geometry.warnings, gainError].filter(Boolean).join(' ');
  }

  function setData({ geometry: nextGeometry = null, state = null, family = 'absorption', sourceName: nextSourceName = '' } = {}) {
    if (destroyed) return;
    const nextVectors = getViewerVectors(state, family);
    const geometryChanged = nextGeometry !== currentGeometry;
    const firstVectorData = !vectors.electric && !vectors.magnetic
      && (nextVectors.electric || nextVectors.magnetic);
    vectors = nextVectors;
    stateNumber = Number.isInteger(state?.number) ? state.number : null;
    sourceName = String(nextSourceName ?? '');
    if (geometryChanged) {
      currentGeometry = nextGeometry;
      geometry = prepareMoleculeGeometry(nextGeometry);
      bonds = inferMoleculeBonds(geometry.atoms);
      camera = { ...DEFAULT_CAMERA };
      fitVectorScales();
    } else if (firstVectorData) fitVectorScales();
    render();
  }

  for (const input of [showElectric, showMagnetic, showHydrogen, showAxes]) listen(input, 'change', render);
  listen(bildContent, 'change', render);
  for (const [kind, input] of [['electric', electricGainInput], ['magnetic', magneticGainInput]]) {
    listen(input, 'input', () => {
      const value = Number(input.value);
      if (!input.value || !finite(value) || value <= 0 || !finite(value * (vectors[kind]?.magnitude ?? 1))) {
        gainError = 'Enter a finite positive vector display gain.';
        input.setCustomValidity(gainError); status.textContent = gainError; return;
      }
      input.setCustomValidity(''); gainError = ''; gains[kind] = value; render();
    });
  }
  listen(resetButton, 'click', resetView);
  listen(pngButton, 'click', exportPng);
  listen(bildButton, 'click', exportBild);
  listen(fitButton, 'click', () => { fitVectorScales(); render(); });
  listen(zoomIn, 'click', () => changeZoom(1.2));
  listen(zoomOut, 'click', () => changeZoom(1 / 1.2));
  listen(surface, 'wheel', (event) => { event.preventDefault(); changeZoom(Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.008)); }, { passive: false });
  listen(surface, 'keydown', (event) => {
    if (event.key === 'Home') { event.preventDefault(); resetView(); return; }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(1.2); return; }
    if (event.key === '-' || event.key === '−') { event.preventDefault(); changeZoom(1 / 1.2); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    camera.yaw += event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
    camera.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
      camera.pitch + (event.key === 'ArrowUp' ? -0.12 : event.key === 'ArrowDown' ? 0.12 : 0)));
    render();
  });
  listen(surface, 'pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    event.preventDefault(); surface.focus();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    surface.setPointerCapture?.(event.pointerId);
  });
  listen(surface, 'pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const rect = surface.getBoundingClientRect();
    camera.yaw += (event.clientX - drag.x) / Math.max(rect.width, 1) * Math.PI * 2;
    camera.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
      camera.pitch + (event.clientY - drag.y) / Math.max(rect.height, 1) * Math.PI));
    drag = { ...drag, x: event.clientX, y: event.clientY }; schedule();
  });
  const endDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (surface.hasPointerCapture?.(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    drag = null;
  };
  listen(surface, 'pointerup', endDrag);
  listen(surface, 'pointercancel', endDrag);
  render();
  return {
    setData,
    resetView,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach((remove) => remove());
      if (frame !== null) win?.cancelAnimationFrame?.(frame);
      widget.remove();
    },
  };
}
