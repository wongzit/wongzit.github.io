/**
 * Gaussian TD excited-state text parser. No dependencies; runs in browsers and Node.
 *
 * Values are preserved at the precision printed by Gaussian. Transition dipoles
 * are in Gaussian's printed atomic units; R values are the printed 10^-40 cgs
 * values, never the optional R(au) column. Orbital amplitudes are signed printed
 * coefficients, not probabilities or normalized percentages.
 *
 * Each returned job is one excitation set. Optimization steps, repeated tables,
 * and Link1 calculations are deliberately kept separate to prevent accidental
 * association of properties belonging to different geometries.
 */

const NUMERIC_TOKEN = /^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[DEde][+-]?\d+)?|(?:inf(?:inity)?|nan))$/i;
const UNAVAILABLE_TOKEN = /^(?:\*+|[+-]?nan|[+-]?inf(?:inity)?)$/i;
const STATE_HEADER = /^\s*Excited\s+State\s+(\d+)\s*:\s*(.*?)\s*$/i;
const ORBITAL_TRANSITION = /^\s*(\d+)\s*([AB]?)\s*(->|<-)\s*(\d+)\s*([AB]?)\s+([^\s]+)\s*$/i;
const ORIENTATION_HEADER = /^\s*(Standard|Input|Z[-\s]?Matrix)\s+orientation\s*:\s*$/i;
// NIST 2022 CODATA Bohr radius, converted from meters to angstroms:
// https://physics.nist.gov/cuu/pdf/wallet_2022.pdf
const BOHR_TO_ANGSTROM = 0.529177210544;

function asNumber(token) {
  if (token == null || UNAVAILABLE_TOKEN.test(token)) return null;
  if (!NUMERIC_TOKEN.test(token)) return null;
  const number = Number(token.replace(/[dD]/g, 'E'));
  return Number.isFinite(number) ? number : null;
}

function isDataToken(token) {
  return NUMERIC_TOKEN.test(token) || UNAVAILABLE_TOKEN.test(token);
}

function addWarning(target, message) {
  if (!target.includes(message)) target.push(message);
}

function emptyState(number) {
  return {
    number,
    label: '',
    energyEv: null,
    wavelengthNm: null,
    oscillatorStrength: null,
    spinSquared: null,
    transitions: [],
    electricDipole: null,
    electricDipoleVelocity: null,
    magneticDipole: null,
    rotatoryStrengthLength: null,
    rotatoryStrengthVelocity: null,
  };
}

function parseState(header, lineNumber) {
  const state = emptyState(Number(header[1]));
  const body = header[2];
  const energy = /(\S+)\s+eV\b/i.exec(body);
  const wavelength = /(\S+)\s+nm\b/i.exec(body);
  const oscillator = /\bf\s*=\s*(\S+)/i.exec(body);
  const spin = /<\s*S\s*(?:\*\*|\^)?\s*2\s*>\s*=\s*(\S+)/i.exec(body);
  state.label = (energy ? body.slice(0, energy.index) : body.split(/\bf\s*=/i)[0]).trim();
  state.energyEv = asNumber(energy?.[1]);
  state.wavelengthNm = asNumber(wavelength?.[1]);
  state.oscillatorStrength = asNumber(oscillator?.[1]);
  state.spinSquared = asNumber(spin?.[1]);
  state.metadata = {
    sourceLine: lineNumber,
    oscillatorStrengthSource: state.oscillatorStrength === null ? null : 'excited-state header',
  };
  return state;
}

function readRoute(lines, index) {
  const parts = [lines[index].trim()];
  let last = index;
  for (let i = index + 1; i < lines.length; i += 1) {
    const value = lines[i].trim();
    if (!value || /^[-=]{3,}$/.test(value) || /^\d+\//.test(value) || /^%/.test(value)) break;
    if (/^(?:Leave Link|\(Enter|Charge\s*=|Excited State|Gaussian|Normal termination)/i.test(value) || ORIENTATION_HEADER.test(value)) break;
    parts.push(value);
    last = i;
  }
  return { route: parts.join(' ').replace(/\s+/g, ' '), last };
}

function methodFromRoute(route) {
  if (!route) return null;
  const body = route.replace(/^\s*#\s*[pnt]?\s*/i, '');
  // A slash is the usual method/basis notation. Gaussian also prints these
  // separately, so a known method token is a useful fallback before SCF Done.
  const slash = body.match(/(?:^|\s)([^\s=]+\/[^\s]+)(?=\s|$)/);
  if (slash) return slash[1];
  return body.match(/\b(?:[RU]?(?:w?B97\w*|B3LYP|BLYP|PBE0?|PBE1PBE|CAM-B3LYP|M06(?:-2X|-HF|-L)?|M05(?:-2X)?|HF|LC-\w+|\w*B2PLYP\w*))\b/i)?.[0] ?? null;
}

function readTable(lines, startIndex, explicitHeader = null) {
  let header = explicitHeader;
  let cursor = startIndex;
  // Capitalization and line wrapping vary across Gaussian versions.
  if (header === null) {
    for (; cursor < Math.min(lines.length, startIndex + 8); cursor += 1) {
      if (/^\s*state\b/i.test(lines[cursor])) {
        header = lines[cursor];
        cursor += 1;
        break;
      }
      if (/^\s*(?:Ground to excited|Excited State|Excitation energies|Normal termination)/i.test(lines[cursor])) break;
    }
  }
  if (header === null) return { header: '', rows: [], last: startIndex - 1 };
  const rows = [];
  let last = cursor - 1;
  for (; cursor < lines.length; cursor += 1) {
    const match = /^\s*(\d+)\s+(.+?)\s*$/.exec(lines[cursor]);
    if (!match) {
      if (rows.length === 0 && (!lines[cursor].trim() || /^\s*-+\s*$/.test(lines[cursor]))) continue;
      break;
    }
    const tokens = match[2].trim().split(/\s+/);
    if (!tokens.length || !tokens.every(isDataToken)) break;
    rows.push({ number: Number(match[1]), values: tokens.map(asNumber), sourceLine: cursor + 1 });
    last = cursor;
  }
  return { header, rows, last };
}

function electricValue(row, header) {
  const [x = null, y = null, z = null] = row.values;
  const hasStrength = /Dip\.?\s*S\.?/i.test(header);
  const hasOscillator = /Osc\.?/i.test(header);
  return {
    x, y, z,
    strength: hasStrength ? (row.values[3] ?? null) : null,
    oscillatorStrength: hasOscillator ? (row.values[hasStrength ? 4 : 3] ?? null) : null,
  };
}

function readGeometry(lines, index, orientation) {
  const warnings = [];
  const sourceLine = index + 1;
  const fail = (reason, last = index) => ({
    geometry: null, last, warnings: [...warnings, `The ${orientation} orientation table at line ${sourceLine} was omitted: ${reason}.`],
  });
  let cursor = index + 1;
  let coordinateHeader = '';
  let columnHeader = '';
  let hasAtomicType = false;
  let foundColumns = false;
  let foundDivider = false;
  for (; cursor < Math.min(lines.length, index + 11); cursor += 1) {
    const line = lines[cursor];
    if (/\bCoordinates\b/i.test(line)) coordinateHeader = line;
    if (/\bX\s+Y\s+Z\b/i.test(line)) foundColumns = true;
    if (/\bType\b/i.test(line)) hasAtomicType = true;
    columnHeader += ` ${line}`;
    if (coordinateHeader && foundColumns && /^\s*-{3,}\s*$/.test(line)) {
      foundDivider = true;
      cursor += 1;
      break;
    }
    if (ORIENTATION_HEADER.test(line) || STATE_HEADER.test(line) || /^\s*(?:#|Ground to excited|Excited states from|Normal termination|Error termination|--Link1--|Link1:)/i.test(line)) return fail('its coordinate header is incomplete', cursor - 1);
  }
  if (!coordinateHeader || !foundColumns || !foundDivider || !/\bCenter\b/i.test(columnHeader) || !/\bAtomic\b/i.test(columnHeader)) return fail('its coordinate columns could not be identified');
  const explicitUnits = /Coordinates\s*\(([^)]+)\)/i.exec(coordinateHeader)?.[1]?.trim();
  let scale = 1;
  if (explicitUnits && /\bbohrs?\b|atomic units|^a\.?u\.?$/i.test(explicitUnits)) scale = BOHR_TO_ANGSTROM;
  else if (explicitUnits && !/angstroms?|ångströms?|Å/i.test(explicitUnits)) return fail(`unsupported coordinate units "${explicitUnits}"`);
  else if (!explicitUnits) warnings.push(`The ${orientation} geometry at line ${sourceLine} does not name coordinate units; Gaussian's usual angstrom units were assumed.`);
  const atoms = [];
  const centers = new Set();
  let closed = false;
  let malformed = false;
  let skippedCenters = 0;
  let last = cursor - 1;
  for (; cursor < lines.length; cursor += 1) {
    const line = lines[cursor];
    if (/^\s*-{3,}\s*$/.test(line)) {
      closed = true;
      last = cursor;
      break;
    }
    if (!/^\s*[+-]?\d+\s+/.test(line)) break;
    const tokens = line.trim().split(/\s+/);
    const expectedColumns = hasAtomicType ? 6 : 5;
    const centerNumber = asNumber(tokens[0]);
    const atomicNumber = asNumber(tokens[1]);
    const atomicType = hasAtomicType ? asNumber(tokens[2]) : 0;
    const coordinates = tokens.slice(hasAtomicType ? 3 : 2).map(asNumber);
    if (tokens.length !== expectedColumns || !Number.isInteger(centerNumber) || centerNumber < 1 || centers.has(centerNumber)
      || !Number.isInteger(atomicNumber) || atomicNumber > 118 || !Number.isInteger(atomicType)
      || coordinates.length !== 3 || coordinates.some((value) => value === null)) {
      malformed = true;
    } else {
      centers.add(centerNumber);
      if (atomicNumber <= 0) skippedCenters += 1;
      else {
        const [x, y, z] = coordinates.map((value) => value * scale);
        atoms.push({ atomicNumber, x, y, z, centerNumber });
      }
    }
    last = cursor;
  }
  if (!closed) return fail('the table is incomplete or has an unreadable row', last);
  if (malformed) return fail('one or more atoms have malformed, duplicate, or nonfinite coordinates', last);
  if (!atoms.length) return fail('no physical atomic centers were found', last);
  if (skippedCenters) warnings.push(`${skippedCenters} dummy or ghost center(s) in the ${orientation} geometry at line ${sourceLine} were omitted from the molecule view.`);
  return { geometry: { atoms, orientation, units: 'angstrom', sourceLine }, warnings, last };
}

function copyGeometry(geometry) {
  return geometry ? { ...geometry, atoms: geometry.atoms.map((atom) => ({ ...atom })) } : null;
}

/**
 * Parse a Gaussian .log/.out file without uploading or executing its contents.
 * @param {string} text Plain-text Gaussian output.
 * @param {string} [filename=''] Display metadata only.
 * @returns {{filename:string,jobs:Array,warnings:string[],metadata:object}}
 */
export function parseGaussian(text, filename = '') {
  if (typeof text !== 'string') throw new TypeError('Gaussian output must be a string.');
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  const result = {
    filename: String(filename),
    jobs: [],
    warnings: [],
    metadata: {
      format: 'Gaussian text output',
      lineCount: lines.length,
      units: {
        energyEv: 'eV',
        wavelengthNm: 'nm',
        electricDipole: 'atomic units (as printed)',
        magneticDipole: 'atomic units (Gaussian convention, as printed)',
        rotatoryStrength: '10^-40 erg·esu·cm/Gauss',
        oscillatorStrength: 'dimensionless',
        transitionCoefficient: 'signed amplitude (as printed)',
        geometry: 'angstrom',
      },
      synthetic: /SYNTHETIC\s+(?:EDUCATIONAL\s+)?(?:DEMO|FIXTURE)/i.test(text),
    },
  };
  let gaussianVersion = null;
  let context = newContext(1);
  let set = null;
  let activeState = null;

  function newContext(link1Index) {
    return {
      link1Index, route: null, method: null, basis: null, title: null,
      charge: null, multiplicity: null, normalTermination: false,
      errorTermination: false, jobs: [], excitationSetIndex: 0,
      geometry: null, geometrySeen: false, geometryWarnings: [],
    };
  }

  function ensureSet(lineNumber) {
    if (!set) {
      context.excitationSetIndex += 1;
      set = {
        states: [],
        tables: new Map(),
        warnings: [...context.geometryWarnings],
        // Geometry is captured when this response block begins. Later geometry
        // output must never rewrite an earlier excitation set's coordinate frame.
        geometry: copyGeometry(context.geometry),
        geometrySeen: context.geometrySeen,
        startLine: lineNumber,
        excitationSetIndex: context.excitationSetIndex,
      };
    }
    return set;
  }

  function finishSet(endLine) {
    if (!set) return;
    if (set.states.length === 0) {
      if (set.tables.size) addWarning(result.warnings, `Transition-property tables at line ${set.startLine} have no matching Excited State records and were not attached to another excitation set.`);
      set = null;
      activeState = null;
      return;
    }
    const job = {
      id: `job-${result.jobs.length + 1}`,
      label: `Calculation ${context.link1Index} · excitation set ${set.excitationSetIndex}`,
      method: context.method ?? methodFromRoute(context.route),
      states: set.states,
      geometry: set.geometry,
      warnings: set.warnings,
      normalTermination: context.normalTermination,
      metadata: {
        route: context.route,
        title: context.title,
        basis: context.basis,
        link1Index: context.link1Index,
        excitationSetIndex: set.excitationSetIndex,
        startLine: set.startLine,
        endLine: Math.max(set.startLine, endLine),
        gaussianVersion,
        charge: context.charge,
        multiplicity: context.multiplicity,
      },
    };
    for (const state of job.states) {
      for (const [property, table] of set.tables) {
        if (table.has(state.number)) state[property] = table.get(state.number);
      }
      if (state.oscillatorStrength === null && state.electricDipole?.oscillatorStrength !== null && state.electricDipole?.oscillatorStrength !== undefined) {
        state.oscillatorStrength = state.electricDipole.oscillatorStrength;
        state.metadata.oscillatorStrengthSource = 'electric-dipole table';
        addWarning(job.warnings, `State ${state.number}: oscillator strength was read from the electric-dipole table because the state header did not contain a finite value.`);
      }
    }
    for (const [property, table] of set.tables) {
      const unmatched = [...table.keys()].filter((number) => !job.states.some((state) => state.number === number));
      if (unmatched.length) addWarning(job.warnings, `${property}: ${unmatched.length} table row(s) have no matching excited-state header and were omitted.`);
    }
    const requested = /\bnstates\s*=\s*(\d+)/i.exec(context.route ?? '');
    if (requested && job.states.length < Number(requested[1])) addWarning(job.warnings, `The route requests ${requested[1]} states, but this excitation set contains ${job.states.length}. The output may be incomplete.`);
    const missing = (property) => job.states.filter((state) => state[property] === null).length;
    if (missing('energyEv')) addWarning(job.warnings, `${missing('energyEv')} state(s) have no finite excitation energy and cannot be broadened.`);
    if (job.states.some((state) => state.energyEv !== null && state.energyEv <= 0)) addWarning(job.warnings, 'Nonpositive excitation energies were printed; inspect the calculation before interpreting its spectrum.');
    if (missing('oscillatorStrength')) addWarning(job.warnings, `${missing('oscillatorStrength')} state(s) have no oscillator strength; their UV contribution is unavailable.`);
    if (missing('electricDipole')) addWarning(job.warnings, `Electric transition dipoles are unavailable for ${missing('electricDipole')} state(s).`);
    if (missing('magneticDipole')) addWarning(job.warnings, `Magnetic transition dipoles are unavailable for ${missing('magneticDipole')} state(s).`);
    const noRotatory = job.states.filter((state) => state.rotatoryStrengthLength === null && state.rotatoryStrengthVelocity === null).length;
    if (noRotatory) addWarning(job.warnings, `Rotatory strengths are unavailable for ${noRotatory} state(s); their ECD contribution cannot be computed.`);
    if (job.states.some((state) => state.transitions.length === 0)) addWarning(job.warnings, 'Some states contain no printed orbital amplitudes. Gaussian may suppress coefficients below its output threshold.');
    if (!job.geometry && !set.geometrySeen) addWarning(job.warnings, 'No Cartesian orientation table preceded this excitation set; the molecule view is unavailable.');
    if (job.geometry && job.geometry.orientation !== 'standard'
      && !/\b(?:nosymm(?:etry)?|symm(?:etry)?\s*=\s*(?:none|no))\b/i.test(context.route ?? '')) {
      addWarning(job.warnings, `The molecule uses ${job.geometry.orientation} orientation without an explicit NoSymm route. Its frame relative to the printed transition moments is unverified.`);
    }
    result.jobs.push(job);
    context.jobs.push(job);
    set = null;
    activeState = null;
  }

  function finishContext(endLine) {
    finishSet(endLine);
    for (const job of context.jobs) {
      job.normalTermination = context.normalTermination;
      if (context.errorTermination) addWarning(job.warnings, 'Gaussian reported an error termination for this calculation. Parsed data may be incomplete.');
      else if (!context.normalTermination) addWarning(job.warnings, 'No normal termination was found for this calculation. Parsed data may be incomplete.');
    }
  }

  function nextContext(endLine) {
    finishContext(endLine);
    context = newContext(context.link1Index + 1);
  }

  function storeTable(property, table, startLine) {
    if (set?.tables.has(property)) {
      // A repeated property table indicates a new response calculation. Never
      // overwrite it or reuse the prior set's state/property association.
      finishSet(startLine - 1);
    }
    const current = ensureSet(startLine);
    const map = new Map();
    for (const row of table.rows) {
      let value;
      if (property === 'electricDipole' || property === 'electricDipoleVelocity') value = electricValue(row, table.header);
      else if (property === 'magneticDipole') {
        const [x = null, y = null, z = null] = row.values;
        value = { x, y, z };
      } else {
        const rHeader = /R\((?:length|velocity)\)/i.exec(table.header);
        const columnsBeforeR = table.header.slice(0, rHeader?.index ?? 0).trim().split(/\s+/).filter(Boolean).length - 1;
        value = row.values[Math.max(0, columnsBeforeR)] ?? null;
      }
      if (map.has(row.number)) addWarning(current.warnings, `${property}: duplicate state ${row.number} at line ${row.sourceLine}; the last row in that table was retained.`);
      map.set(row.number, value);
      if (row.values.some((number) => number === null)) addWarning(current.warnings, `A nonfinite or overflow value in ${property} at line ${row.sourceLine} was retained as missing data.`);
      if ((property === 'electricDipole' || property === 'electricDipoleVelocity' || property === 'magneticDipole') && row.values.length < 3) addWarning(current.warnings, `An incomplete ${property} row at line ${row.sourceLine} was retained with missing components.`);
    }
    if (!table.rows.length) addWarning(current.warnings, `No readable rows were found in ${property} table at line ${startLine}.`);
    current.tables.set(property, map);
    activeState = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    if (/^\s*(?:--Link1--|Link1:\s*Proceeding)/i.test(line)) {
      if (context.route || set || context.jobs.length || context.normalTermination || context.errorTermination || context.geometrySeen) nextContext(index);
      continue;
    }
    if (/^\s*Entering Gaussian System/i.test(line)) {
      if (context.route || set || context.jobs.length || context.normalTermination || context.errorTermination || context.geometrySeen) nextContext(index);
      continue;
    }
    const version = /^\s*(Gaussian\s+(?:98|03|09|16)\s*:\s*.+)/i.exec(line);
    if (version) gaussianVersion = version[1].trim();
    if (/^\s*#/.test(line)) {
      if (context.route || set || context.jobs.length || context.normalTermination || context.errorTermination || context.geometrySeen) nextContext(index);
      const route = readRoute(lines, index);
      context.route = route.route;
      context.method = methodFromRoute(route.route);
      index = route.last;
      continue;
    }
    const orientation = ORIENTATION_HEADER.exec(line);
    if (orientation) {
      // New geometry output marks a new calculation geometry even when an old
      // response banner is absent. Discard orphan property tables rather than
      // attaching their values to states evaluated at the new coordinates.
      if (set && (set.states.length || set.tables.size)) finishSet(index);
      const name = orientation[1].toLowerCase();
      const kind = name.startsWith('z') ? 'z-matrix' : name;
      const parsed = readGeometry(lines, index, kind);
      // Input/Z-matrix output begins a fresh geometry frame; it invalidates any
      // earlier step's standard orientation. A following standard table then
      // supersedes this fallback for the same step.
      context.geometry = parsed.geometry;
      context.geometrySeen = true;
      context.geometryWarnings = parsed.warnings;
      index = Math.max(index, parsed.last);
      activeState = null;
      continue;
    }
    const method = /^\s*SCF Done:\s*E\(([^)]+)\)/i.exec(line);
    if (method) context.method = method[1];
    const basis = /^\s*Standard basis:\s*(.+)/i.exec(line);
    if (basis) context.basis = basis[1].trim();
    const charge = /^\s*Charge\s*=\s*([+-]?\d+)\s+Multiplicity\s*=\s*(\d+)/i.exec(line);
    // Fragment/model-system records can follow the supermolecule record in
    // counterpoise and ONIOM output. They must not replace whole-system metadata.
    if (charge && !/\bin\s+(?:fragment\b|model system\b)/i.test(line)) {
      context.charge = Number(charge[1]);
      context.multiplicity = Number(charge[2]);
      // The title is normally the last dashed-off block before the geometry.
      if (/^\s*-{3,}\s*$/.test(lines[index - 1] ?? '')) {
        const title = [];
        for (let previous = index - 2; previous >= Math.max(0, index - 12); previous -= 1) {
          if (/^\s*-{3,}\s*$/.test(lines[previous])) {
            if (title.length && !title.some((part) => /^#|^\d+\//.test(part))) context.title = title.reverse().join(' ');
            break;
          }
          title.push(lines[previous].trim());
        }
      }
    }
    if (/Normal termination of Gaussian/i.test(line)) {
      context.normalTermination = true;
      finishSet(lineNumber);
      for (const job of context.jobs) job.normalTermination = true;
      continue;
    }
    if (/Error termination|Convergence failure\s*--\s*run terminated/i.test(line)) {
      context.errorTermination = true;
      context.normalTermination = false;
      finishSet(lineNumber);
      continue;
    }
    if (/^\s*Excited states from\b/i.test(line)) {
      if (set && (set.states.length || set.tables.size)) finishSet(index);
      ensureSet(lineNumber);
      activeState = null;
      continue;
    }
    const dipole = /^\s*Ground to excited state\s+transition\s+(electric|velocity|magnetic)\s+dipole\s+moments?\b/i.exec(line);
    if (dipole) {
      // Standard Gaussian prints property tables before the state headers. A new
      // electric table after completed headers starts a new geometry's set.
      if (dipole[1].toLowerCase() === 'electric' && set?.states.length) finishSet(index);
      const property = { electric: 'electricDipole', velocity: 'electricDipoleVelocity', magnetic: 'magneticDipole' }[dipole[1].toLowerCase()];
      const table = readTable(lines, index + 1);
      storeTable(property, table, lineNumber);
      index = Math.max(index, table.last);
      continue;
    }
    const rotatory = /^\s*state\b.*R\((length|velocity)\)/i.exec(line);
    if (rotatory) {
      const table = readTable(lines, index + 1, line);
      storeTable(rotatory[1].toLowerCase() === 'length' ? 'rotatoryStrengthLength' : 'rotatoryStrengthVelocity', table, lineNumber);
      index = Math.max(index, table.last);
      continue;
    }
    if (/^\s*Excitation energies and oscillator strengths\s*:/i.test(line)) {
      if (set?.states.length) finishSet(index);
      ensureSet(lineNumber);
      activeState = null;
      continue;
    }
    const header = STATE_HEADER.exec(line);
    if (header) {
      const number = Number(header[1]);
      if (set?.states.some((state) => state.number === number)) finishSet(index);
      const current = ensureSet(lineNumber);
      activeState = parseState(header, lineNumber);
      current.states.push(activeState);
      continue;
    }
    const transition = ORBITAL_TRANSITION.exec(line);
    if (transition && activeState) {
      const coefficient = asNumber(transition[6]);
      if (coefficient === null) {
        addWarning(set.warnings, `State ${activeState.number}: an unreadable orbital coefficient at line ${lineNumber} was omitted.`);
        continue;
      }
      const fromSpin = transition[2].toUpperCase();
      const toSpin = transition[5].toUpperCase();
      const record = {
        from: `${transition[1]}${fromSpin}`,
        to: `${transition[4]}${toSpin}`,
        direction: transition[3],
        coefficient,
      };
      if (fromSpin || toSpin) record.spin = fromSpin === toSpin ? ({ A: 'alpha', B: 'beta' }[fromSpin] ?? null) : `${fromSpin || '?'}→${toSpin || '?'}`;
      activeState.transitions.push(record);
    }
  }
  finishContext(lines.length);
  if (!result.jobs.length) addWarning(result.warnings, 'No Gaussian excited-state records were found. Load a Gaussian TD-DFT, TD-HF, or CIS .log/.out file containing Excited State lines.');
  if (result.jobs.length > 1) addWarning(result.warnings, `${result.jobs.length} separate excitation sets were found. Select the intended calculation and geometry before interpreting a spectrum.`);
  return result;
}
