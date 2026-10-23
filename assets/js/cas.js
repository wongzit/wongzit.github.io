/* ==========================================================================
   cas.js — rotatable 3D structures for the compound gallery (cas.html)

   Every <div class="cas-card__viewer"></div> becomes an interactive 3D viewer
   (3Dmol.js) showing the .xyz file that the SAME card's XYZ button downloads.
   One file therefore serves both the viewer and the download — there is
   nothing else to configure per compound. To show a different file than the
   download, give the viewer its own path: data-xyz="assets/cas/other.xyz".

   Visitors:
     mouse  drag = rotate · shift-drag = zoom · right-drag = move
            pinch / ctrl-scroll / ⌘-scroll = zoom · double-click = reset
            (plain scrolling over a viewer scrolls the page, not the molecule)
     touch  tap a viewer to start rotating it; tap outside it to scroll again

   Needs 3Dmol.js loaded before this file (see the <script> tags in cas.html).
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Settings -------------------------------------------------------- */
  const SPIN_SPEED = 0.5;                       // idle rotation, ~20°/s. 0 = no spinning
  const STICK_RADIUS = 0.13;                    // bond thickness (Å)
  const ATOM_SCALE = 0.22;                      // atom sphere size (fraction of vdW radius)
  const LIGHT_MODE_H = 0xc3cbd6;                // hydrogen colour on light backgrounds
  const MARGIN = 0.8;                           // <1 leaves room so a spinning molecule never touches the edge

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchFirst = window.matchMedia("(hover: none)").matches;
  const items = [];                             // one entry per live viewer

  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";

  /* Jmol element colours; in light mode hydrogens get a grey so they don't vanish on white. */
  function atomStyle() {
    const map = Object.assign({}, $3Dmol.elementColors.Jmol, isLight() ? { H: LIGHT_MODE_H } : {});
    const colorscheme = { prop: "elem", map: map };
    return { stick: { radius: STICK_RADIUS, colorscheme }, sphere: { scale: ATOM_SCALE, colorscheme } };
  }

  /* The viewer paints the panel colour from style.css itself, so depth fog fades into it. */
  function panelColor(el) {
    const m = getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g) || [255, 255, 255];
    return (m[0] << 16) | (m[1] << 8) | (m[2] | 0);
  }

  function fit(viewer) {
    viewer.zoomTo();
    viewer.zoom(MARGIN);
    viewer.render();
  }

  function setSpin(item, on) {
    const run = on && item.autoSpin && item.onScreen && SPIN_SPEED > 0 && !reduceMotion;
    if (run === item.spinning) return;
    item.spinning = run;
    item.viewer.spin(run ? "y" : false, SPIN_SPEED);
  }

  function showMessage(el, text) {
    el.classList.add("is-empty");
    el.setAttribute("data-msg", text);
  }

  function addHint(el) {
    const hint = document.createElement("span");
    hint.className = "cas-card__hint";
    hint.textContent = touchFirst ? "tap to rotate" : "drag to rotate";
    el.append(hint);
    return hint;
  }

  /* ---- Build one viewer ------------------------------------------------ */
  function init(el) {
    if (el._cas) return;
    el._cas = { pending: true };

    const card = el.closest(".cas-card");
    const link = card && card.querySelector('a[href$=".xyz" i]');
    const url = el.dataset.xyz || (link && link.getAttribute("href"));
    if (!url) return showMessage(el, "no .xyz file");
    if (typeof $3Dmol === "undefined") return showMessage(el, "3D viewer failed to load");

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(xyz => {
        const stage = document.createElement("div");
        stage.className = "cas-card__stage";
        el.prepend(stage);

        const viewer = $3Dmol.createViewer(stage, { backgroundColor: panelColor(el), antialias: true });
        viewer.addModel(xyz, "xyz");
        viewer.setStyle({}, atomStyle());
        fit(viewer);

        const item = { el, viewer, autoSpin: true, onScreen: true, spinning: false };
        el._cas = item;
        items.push(item);
        el.classList.add("is-ready");
        const hint = addHint(el);
        setSpin(item, true);
        wire(item, hint);
      })
      .catch(() => showMessage(el, "structure file not found"));
  }

  /* ---- Interaction ----------------------------------------------------- */
  let lastPointer = "mouse";

  function wire(item, hint) {
    const el = item.el;

    // Any grab stops the idle spin, so the molecule stays where the visitor put it.
    el.addEventListener("pointerdown", e => {
      lastPointer = e.pointerType;
      if (e.pointerType === "touch" && !el.classList.contains("is-active")) return;
      item.autoSpin = false; setSpin(item, false);
      hint.classList.add("is-hidden");
    });

    // Plain scroll wheel → let the page scroll. Pinch (ctrl) or ⌘ + scroll → zoom.
    el.addEventListener("wheel", e => {
      if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
    }, { capture: true });

    // Touch: a viewer only takes over one-finger drags after it has been tapped.
    const gate = e => { if (!el.classList.contains("is-active")) e.stopPropagation(); };
    el.addEventListener("touchstart", gate, { capture: true });
    el.addEventListener("touchmove", gate, { capture: true });
    el.addEventListener("click", () => {
      if (lastPointer !== "touch" || el.classList.contains("is-active")) return;
      items.forEach(i => i.el.classList.remove("is-active"));
      el.classList.add("is-active");
      hint.textContent = "drag to rotate · tap outside to scroll";
      hint.classList.remove("is-hidden");
    });

    // Double-click / double-tap: back to the starting view, spinning again.
    el.addEventListener("dblclick", () => {
      fit(item.viewer);
      item.autoSpin = true; setSpin(item, true);
    });
  }

  // Tapping anywhere outside an active viewer hands scrolling back to the page.
  document.addEventListener("touchstart", e => {
    items.forEach(i => {
      if (i.el.classList.contains("is-active") && !i.el.contains(e.target)) {
        i.el.classList.remove("is-active");
        const hint = i.el.querySelector(".cas-card__hint");
        if (hint) { hint.textContent = "tap to rotate"; hint.classList.add("is-hidden"); }
      }
    });
  }, { passive: true });

  /* ---- Re-colour when the ☀️/🌙 toggle is used ---------------------------- */
  new MutationObserver(() => {
    items.forEach(({ el, viewer }) => {
      viewer.setBackgroundColor(panelColor(el));
      viewer.setStyle({}, atomStyle());
      viewer.render();
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---- Build viewers as they scroll into view; pause spinning off-screen -- */
  const viewers = document.querySelectorAll(".cas-card__viewer");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) init(target);
        const item = target._cas;
        if (item && item.viewer) { item.onScreen = isIntersecting; setSpin(item, isIntersecting); }
      });
    }, { rootMargin: "200px 0px" });
    viewers.forEach(v => io.observe(v));
  } else {
    viewers.forEach(init);
  }
})();
