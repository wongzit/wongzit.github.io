# Excitation Studio

A dependency-free, browser-based Gaussian TD-DFT workbench for Zhe Wang's GitHub Pages site. All calculation parsing and spectrum generation happen locally in the browser. There is no backend, analytics, file upload service, remote JavaScript, CDN, or API key.

## Use

Open the hosted page, choose one or more Gaussian `.log` / `.out` text files, and select an excitation set. Files up to 50 MB each are parsed in a module Web Worker. Repeated response calculations, optimization geometries and Link1 jobs remain separate. The built-in demo uses the provided `demo.log` calculation (35 excited states, 78 atoms) and is replaced when users load their own files.

The page extracts energies, wavelengths, oscillator strengths, signed orbital-transition coefficients, spin labels, electric transition dipoles in length/velocity form, magnetic transition dipoles, and length/velocity rotatory strengths. Missing properties remain null and are displayed explicitly. The UV spectrum uses the reported excited-state oscillator strength; the rotatory-strength gauge selector changes ECD or CPL only.

In the state details, the value after `c =` is displayed as a contribution percentage: `2 × c² × 100%` for unlabelled closed-shell transitions, and `c² × 100%` for alpha/beta spin-orbital transitions marked A/B. For example, `c = -0.65` displays as `84.5%` for an unlabelled transition and `42.25%` for `73A → 74A`. Percentages are calculated independently, without renormalization or clipping; hovering over the percentage shows the original signed coefficient. CSV/JSON exports preserve the raw signed coefficients.

Choose UV–vis/ECD absorption mode (all printed states) or FL/CPL emission mode (Gaussian state number 1 only). Controls include Gaussian/Lorentzian line shapes, FWHM in eV (default **0.40 eV**, including Reset), rigid energy shift, nm/eV/cm⁻¹ axes, range, sticks and independent normalization. Select a state in the table to inspect its transition contributions and moments. Export raw state CSV, separate two-column UV/ECD or FL/CPL curve CSVs at exact **0.5 nm** intervals, a two-column raw oscillator-strength stick CSV, complete JSON and vector SVG. Curve exports evaluate the model on half-nanometre grid points within the current plot window, even when the screen uses eV or cm⁻¹. They retain the on-screen normalization divisors. Each curve CSV contains only `wavelength_nm` and one intensity column: `epsilon` (UV), `delta_epsilon` (ECD), `FL_relative_intensity`, or `CPL_relative_intensity`. The stick CSV contains only `wavelength_nm` and `oscillator_strength_f`; raw f does not depend on linewidth or curve normalization. Additional metadata is excluded from curve and stick CSVs. JSON retains source/set identity, raw f/R, units, settings, references, warnings and normalization divisors. CSV cells containing untrusted spreadsheet formula prefixes are escaped.

## Multiple files: Overlap and Sum

Load two or more output files to reveal the **Overlap** tab beside UV–vis/ECD (or FL/CPL). In that tab, choose the spectrum channel or Both. Each file has a distinct color and line pattern on a common plot range and ordinate scale. All curves use the same broadening, linewidth, energy shift, axis and rotatory-strength gauge. FL/CPL uses state number 1 independently from each file.

**Files & excitation sets** chooses one excitation set per file. The app remembers those choices when you inspect another active file, change tabs or append more files. Optimization steps and Link1 jobs are alternatives within a file, not extra spectra to double-count. The table, selected-state properties, molecule and raw state/stick exports continue to follow the active calculation.

Check **Sum** to replace the individual curves with their equal-weight, point-by-point total. Raw intensities are added before normalization; if Normalize is enabled, the final sum is normalized independently for each channel. This preserves signed ECD/CPL cancellation. No population or concentration weighting is inferred. Missing channels remain unavailable or are explicitly marked as partial contributions; they are not silently substituted with zero.

The SVG button exports the current comparison or summed figure, including a file legend and source/set descriptions. In Sum view, the two-column curve CSV buttons export the sum on the same exact 0.5 nm grid and normalization scale. In individual overlap view, curve CSV buttons are explicitly labelled **Active file** and export that file's selected set. JSON includes all source files, remembered selections, the overlap curves, the sum and their normalization divisors.

## Selected-state transition properties

Selecting a state displays |μ|, |m|, D, G, cos θ, θ in degrees, g, and vector-derived R. These quantities always use the **length-gauge electric moment**, regardless of the separate raw electric-component gauge selector. Details follow the selected table row; the FL/CPL spectrum itself still uses only state 1.

For the printed length-gauge electric vector `u` and magnetic vector `v`:

```text
U = |μ| = 254.1746 × ||u||       (10^-20 esu cm)
M = |m| = 0.927401 × ||v||       (10^-20 erg/G)
D = U²                          (10^-40 esu² cm²)
G = M²                          (10^-40 erg² G^-2)
q = (u · v) / (||u|| ||v||)

UV/ECD: cos(theta) =  q; g_abs = -4 U M cos(theta) / (D + G)
FL/CPL: cos(theta) = -q; g_lum =  4 U M cos(theta) / (D + G)
theta = acos(cos(theta)) × 180/pi
R_from_vectors = -U M q          (10^-40 cgs), in either mode
```

These are the requested mode-specific angle/sign conventions. Switching mode makes the angles supplementary while preserving the sign and value of reconstructed R and g for the same transition at the same geometry. The full g expression retains the magnetic contribution in the denominator; the electric-dominant approximation `4R/D` is retained in JSON. Unknown inputs or undefined denominators remain unavailable. Known zero moments remain zero; angles are undefined when either vector has zero magnitude.

The vector-derived R is labelled separately from Gaussian's printed R, which remains the source for spectral curves. Small differences can arise from rounded printed components. Neither broadening, energy shifts nor independent curve normalization affects these metrics. JSON includes the selected state's derived values, units and convention; the simplified curve/stick CSVs remain two columns.

## Molecular structure and transition vectors

The interactive 3D region follows the selected excitation set and table row. Cartesian geometry is taken from the preceding Gaussian orientation table, preferring standard orientation within each geometry step, with input/Z-matrix orientation as a fallback. Coordinates belong only to their own calculation; an absent or unreadable geometry is shown as unavailable. The built-in Gaussian example includes its computed 78-atom molecular geometry.

Both transition vectors use solid lines: electric μ is teal and magnetic m is dark red. Their μ and m labels identify each vector; PNG and BILD exports use the same colors. The viewer uses the **raw printed a.u. components** of the length-gauge electric moment and magnetic moment. In UV/ECD both arrows keep their printed directions. In FL/CPL the electric arrow is unchanged and the magnetic arrow is reversed. This affects only the view: raw extracted vectors, printed R values, and spectral calculations are preserved.

Drag to rotate and scroll to zoom; keyboard controls and Reset view are available. Both arrows start with the same positive display gain, preserving their relative a.u. lengths. Each arrow has an adjustable positive display gain so tiny moments can be seen beside the molecule. Arrow lengths equal gain times the raw magnitude; displayed component values and magnitudes remain in a.u., without cgs conversion or unit-vector normalization. These gains are visual and do not express a conversion to the nuclear coordinates in Å. The common arrow origin is the geometric center, chosen only for display. Bonds are inferred from interatomic distances as a visual guide. If geometry is missing, available vectors can still be inspected against the XYZ axes.

The **XYZ axes** checkbox hides or shows the coordinate axes without changing the molecule or vectors. **Download PNG** saves the current drawing at twice its displayed pixel dimensions, retaining rotation, zoom, visible objects and arrow gains. The image contains the molecular view rather than the page controls.

**Download BILD** saves a `.bild` file for **ChimeraX → File → Open**, using the [official BILD format](https://www.cgl.ucsf.edu/chimerax/docs/user/formats/bild.html). It contains the visible atoms as spheres, inferred bonds as cylinders, and visible vectors/axes as arrows. Hydrogen, electric/magnetic, and axis visibility settings are honored. The file stores a 3D drawing in the original Gaussian coordinate frame: atoms are restored to their original coordinates and dipole arrows start at the original molecular centroid. The camera is not baked into the coordinates, allowing alignment with a structure from the same Gaussian orientation. Display gains and FL/CPL magnetic reversal match the viewer, while comments preserve raw a.u. components and scaling. Use **BILD content → Vectors only** to export only the visible electric/magnetic transition arrows, without atoms, bonds or XYZ axes. Arrow origins remain at the original molecular centroid for alignment with an external structure. This content option changes only the BILD file; the live molecule and PNG are unchanged. Vector-only export is disabled if no visible nonzero transition vector is available. BILD objects are graphical shapes; this file is not an atomic structure or a ChimeraX session.

## Local preview and checks

Requires Node.js 18+ for tests/packaging and Python 3 for a preview server. No installation is needed.

```sh
npm test
npm start
```

Open http://127.0.0.1:8765/. Opening `index.html` directly as a `file:` URL will not work because browser security restricts module workers and fetching the example.

Tests cover realistic Gaussian table variants, open-shell labels, D exponents, repeated excitation sets, missing and malformed properties, termination metadata, broadening FWHM, integrated oscillator/rotatory strengths, axis equivalence, shifts, gauges and cancellation. Browser QA also checked real Gaussian outputs locally; those private calculations are not part of this distribution.

## Editing titles and text

Edit the source files in the project root before packaging. In `index.html`, `<title>` controls the browser tab, `<h1>` controls the main heading, and `.subtitle` controls the introduction. Most static labels, Method & units text and the single-file chart heading (`id="chart-title"`) are also in this file. The app preserves this chart heading when loading files or switching spectrum types. Dynamic labels and Overlap/Sum headings are set in `src/app.js`; search for the visible wording. Fonts, sizes and colors are in `styles.css`. Keep element `id` and `data-*` attributes intact, since the JavaScript uses them.

After editing, refresh the local preview. Re-run the packaging commands when updating the prepared website checkouts; generated copies under `dist` are overwritten by packaging.

## Scientific convention

Broadening uses a unit-area Gaussian or Lorentzian profile `g` in energy (eV⁻¹). Linewidth always means full width at half maximum in eV.

```text
epsilon(E)       = sum_i f_i g(E - E_i) / (4.319e-9 * 8065.543937349211)
delta-epsilon(E) = sum_i E_i R_i g(E - E_i) / 22.96
```

`R_i` is the Gaussian printed value in units of 10⁻⁴⁰ cgs (esu² cm²). Both ordinates have units L mol⁻¹ cm⁻¹. The ECD expression uses the conventional transition-center energy approximation. Energy shifts translate both spectra while retaining original amplitudes. Axis conversion changes the sampled photon coordinate without a density Jacobian because the ordinate is absorptivity, not a probability density. No vibronic structure, conformer weighting or solvent calibration is inferred.

Normalization divides each curve by its maximum absolute sampled value in the current plot window. Sticks represent isolated broadened-band peak heights on the same ordinate. ECD sticks can exceed a normalized summed curve when contributions cancel. Zero curves retain divisor 1; absent data remain null. Warnings identify partial spectra.

### FL / CPL mode

Emission mode uses **Gaussian excited state number 1 only**, independent of array order, selected table row, or brightness. Transition sticks are hidden by default when entering FL/CPL; the checkbox can show them. Entering UV/ECD restores visible sticks. A missing state 1 produces an explicit unavailable result. All extracted states remain accessible in the table and raw exports.

The relative photon-emission envelopes are:

```text
FL(E)  = 1000 E₁² f₁ g(E − E₁)
CPL(E) = 1000 κ E₁³ R₁ g(E − E₁)
κ = (4.319e−9 × 8065.543937349211) / (2 × 22.96)
```

FL is total intensity (I_L + I_R); CPL is the signed difference (I_L − I_R). Both intensities include a common factor of **1000** for readability before optional independent normalization. The factor applies to displayed curves, broadened sticks, curve CSV values, overlap and sums; UV/ECD and raw f/R values are unchanged. The common factor preserves the CPL/FL ratio, and normalized peaks remain 1. Both use an arbitrary scale; they are relative envelopes, not molar absorptivity or absolute quantum yields. The printed R sign is retained. E²f scaling follows the Einstein A relation; the differential E³R convention follows the ORCA ESD formulation. Broadening remains in energy space; wavelength display/CSV resamples that envelope and does not convert it to a per-nm photon density.

Use Gaussian transition properties calculated at the intended **emitting-state geometry**, selecting the desired excitation set from an optimization if necessary. The tool does not optimize a geometry, infer relaxation, calculate quantum yields, or add vibronic structure. Energy shifts retain the original intensity weights while moving band centers.

The supported input is conventional Gaussian printed ground-to-excited TD/CIS text. Binary/FCHK files, excited-to-excited transitions, and SOC/NTO reconstruction are outside scope.

Primary references:

- [Gaussian-specific transition-moment unit conversions](https://doi.org/10.1039/D3CP01343J), supporting information S2.
- [Corrected dissymmetry-factor expressions](https://doi.org/10.1021/acs.jpclett.1c00143), corrected supporting information S8–S9.

- [NIST: transition probabilities and oscillator strengths](https://physics.nist.gov/Pubs/AtSpec/node17.html), equations 19–21: Einstein A and E²f scaling.
- [ORCA ESD: circularly polarized spectroscopies](https://orca-manual.mpi-muelheim.mpg.de/contents/spectroscopyproperties/esd.html#circularly-polarized-spectroscopies), CPL and g_lum equations: emission R convention.

- [Severa et al., New J. Chem. 2010, DOI 10.1039/C0NJ00085J](https://doi.org/10.1039/C0NJ00085J), [supporting information, ESI 17–18, equations S1–S5](https://www.rsc.org/suppdata/nj/c0/c0nj00085j/c0nj00085j.pdf): calibrated UV/ECD equations.
- [Psi4 spectrum implementation](https://psicode.org/psi4manual/master/_modules/psi4/driver/p4util/spectrum.html): line-shape and broadening conventions.
- [Gaussian TD documentation](https://gaussian.com/td/): calculation options.
- [Caltech thesis Appendix C](https://thesis.caltech.edu/7086/36/Sprague_Matthew_Thesis_App_C.pdf), pages 407–408: legacy Gaussian output examples.
- [cclib Gaussian parser](https://github.com/cclib/cclib/blob/master/cclib/parser/gaussianparser.py): independently documented output variants.

## GitHub Pages deployment

Target page: `https://wongzit.github.io/program/online/tddft/`.

The existing website has no build step and already contains `.nojekyll`. Keep that file. Follow its `GUIDE.md`: test the new feature in `wongzit/wongzit-new.github.io`, verify at `https://wongzit.github.io/wongzit-new.github.io/program/online/tddft/`, then port only the finished app directory and the Programs card to `wongzit/wongzit.github.io`.

```sh
# Package into dist/program/online/tddft/
npm run package

# Or copy the explicit public-file allowlist into an existing website checkout:
node scripts/package.mjs /absolute/path/to/website-repository
```

Add this card to `programs.html` alongside the other programs:

```html
<section class="card" id="excitation-studio" style="margin-bottom:18px">
  <span class="tag">web</span>
  <h3 style="margin-top:8px">Excitation Studio</h3>
  <p class="muted">Inspect Gaussian excited states, transition dipole moments, and simulate UV–vis/ECD and FL/CPL spectra in your browser.</p>
  <a class="btn" href="program/online/tddft/">Open Excitation Studio →</a>
</section>
```

This standalone app follows the existing molecular viewer's independent UI pattern. Shared site CSS/JS are unchanged, so the shared asset cache version does not need a bump. All app imports/assets use relative URLs and work under both live and test subpaths. The user-selected `demo/demo.log` is the only calculation bundled in the public app. Other local calculation files are excluded; `demo/gaussian-demo.log` remains a synthetic source test fixture and is not packaged.
