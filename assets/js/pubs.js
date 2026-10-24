/* ==========================================================================
   pubs.js — renders the publications / reviews / covers pages.
   --------------------------------------------------------------------------
   You rarely edit this file. To add or change a publication, edit
   data/publications.js (see GUIDE.md). Each page calls
   renderPublications("paper" | "review" | ["paper","review"]) or renderCovers().
   The labels of the year / sort pull-downs are set just below.
   ========================================================================== */

// Order action buttons are shown in (left → right).
const BTN_ORDER = ["DOI", "ABS", "BIB", "HTML", "PREPRINT", "PDF", "ESI", "CODE", "SI"];

// Pull-downs above the publication list (labels are free to edit).
const ALL_YEARS_LABEL = "All years";
const SORT_OPTIONS = [
  { value: "new",   label: "Newest first" },
  { value: "old",   label: "Oldest first" },
  { value: "cited", label: "Most cited" },   // uses the Dimensions badge counts
];
const CITATION_WAIT_MS = 8000;   // how long "Most cited" waits for the Dimensions badges to load

// Data is loaded via <script src="data/publications.js"> as window.PUBLICATIONS.
// (Using a script tag instead of fetch() means the pages also work when opened
//  directly from disk, not only over http.)
function loadPubs() {
  if (!Array.isArray(window.PUBLICATIONS)) {
    throw new Error("data/publications.js did not load. Check it is included and has no syntax error.");
  }
  return window.PUBLICATIONS;
}

function pubButtons(p, uid) {
  const out = [];
  const links = p.links || {};
  const has = k => links[k] && links[k] !== "";

  if (has("DOI"))                     out.push(`<a class="pub-btn" href="${links.DOI}" target="_blank" rel="noopener">DOI</a>`);
  if (p.abstract)                     out.push(`<button class="pub-btn" data-panel="abs-${uid}" aria-expanded="false" onclick="togglePanel('abs-${uid}')">ABS</button>`);
  if (p.bibtex)                       out.push(`<button class="pub-btn" data-panel="bib-${uid}" aria-expanded="false" onclick="togglePanel('bib-${uid}')">BIB</button>`);
  // ESI (electronic supporting information) shows right after PDF, only when
  // the entry has an "ESI" link in data/publications.js.
  ["HTML", "PREPRINT", "PDF", "ESI", "CODE", "SI"].forEach(k => {
    if (has(k)) out.push(`<a class="pub-btn" href="${links[k]}" target="_blank" rel="noopener">${k}</a>`);
  });
  // any custom link keys not already handled
  Object.keys(links).forEach(k => {
    if (!BTN_ORDER.includes(k) && has(k))
      out.push(`<a class="pub-btn" href="${links[k]}" target="_blank" rel="noopener">${k}</a>`);
  });
  return out.join("");
}

function pubMetrics(p) {
  if (!p.doi) return "";
  return `<div class="pub__metrics">
      <div class="altmetric-embed" data-badge-type="2" data-badge-popover="right" data-doi="${p.doi}"></div>
      <span class="__dimensions_badge_embed__" data-doi="${p.doi}" data-style="small_rectangle"></span>
    </div>`;
}

function pubHTML(p, idx) {
  const uid = (p.type || "p") + idx;
  return `
  <div class="pub" data-search="${(p.title + " " + (p.authors||"") + " " + (p.venue||"") + " " + p.year).replace(/"/g,"").toLowerCase()}">
    <img class="pub__thumb" src="${p.image || ""}" alt=""
         onerror="this.style.opacity=.25;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22></svg>'">
    <div>
      <p class="pub__title">${p.title}</p>
      <p class="pub__authors">${p.authors || ""}</p>
      <p class="pub__venue">${p.venue || ""}</p>
      <div class="pub__btns">${pubButtons(p, uid)}</div>
      ${p.abstract ? `<div class="pub__panel" id="abs-${uid}">${p.abstract}</div>` : ""}
      ${p.bibtex ? `<div class="pub__panel" id="bib-${uid}"><pre>${escapeHTML(p.bibtex)}</pre></div>` : ""}
      ${pubMetrics(p)}
    </div>
  </div>`;
}

function escapeHTML(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ABS / BIB: click to open, click again to close. Only one panel per
// publication is open at a time — opening one closes the other.
function togglePanel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const opening = !el.classList.contains("open");
  const pub = el.closest(".pub") || document;
  pub.querySelectorAll(".pub__panel.open").forEach(x => x.classList.remove("open"));
  if (opening) el.classList.add("open");
  pub.querySelectorAll(".pub-btn[data-panel]").forEach(b =>
    b.setAttribute("aria-expanded", String(opening && b.dataset.panel === id)));
}

/* ---------- TOC image lightbox ------------------------------------------ */
function ensurePubLightbox() {
  let lb = document.getElementById("pub-lightbox");
  if (lb) return lb;
  lb = document.createElement("div");
  lb.id = "pub-lightbox";
  lb.innerHTML = `<button class="pub-lightbox__close" aria-label="Close preview">&times;</button>
                  <img class="pub-lightbox__img" alt="">`;
  document.body.appendChild(lb);
  const close = () => lb.classList.remove("open");
  lb.addEventListener("click", e => { if (e.target === lb) close(); });    // click backdrop
  lb.querySelector(".pub-lightbox__close").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  lb._img = lb.querySelector(".pub-lightbox__img");
  return lb;
}
function openPubLightbox(src, alt) {
  const lb = ensurePubLightbox();
  lb._img.src = src;
  lb._img.alt = alt || "";
  lb.classList.add("open");
}

/* ---------- COVER PICTURES (slideshow gallery) -------------------------- */
function renderCovers() {
  const listEl = document.getElementById("pub-list");
  let all;
  try { all = loadPubs(); }
  catch (e) { listEl.innerHTML = `<p class="muted">${e.message}</p>`; return; }

  const items = all.filter(p => (p.type || "") === "cover").sort((a, b) => b.year - a.year);
  if (!items.length) { listEl.innerHTML = `<p class="muted">No cover pictures yet.</p>`; return; }

  const slides = items.map(p => `
    <figure class="cover-slide">
      <img class="cover-img" src="${p.image || ""}" alt="${(p.title || "").replace(/"/g, "")}"
           onerror="this.style.opacity=.3">
      <figcaption class="cover-cap">${p.caption || p.venue || ""}</figcaption>
    </figure>`).join("");
  const dots = items.map((_, k) => `<button class="cover-dot" data-k="${k}" aria-label="cover ${k + 1}"></button>`).join("");

  listEl.innerHTML = `
    <div class="cover-carousel">
      <button class="cover-arrow cover-prev" aria-label="Previous cover">&lsaquo;</button>
      <div class="cover-viewport"><div class="cover-track">${slides}</div></div>
      <button class="cover-arrow cover-next" aria-label="Next cover">&rsaquo;</button>
    </div>
    <div class="cover-dots">${dots}</div>`;

  const track = listEl.querySelector(".cover-track");
  const dotEls = Array.from(listEl.querySelectorAll(".cover-dot"));
  let i = 0;
  function go(n) {
    i = (n + items.length) % items.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dotEls.forEach((d, k) => d.classList.toggle("active", k === i));
  }
  listEl.querySelector(".cover-prev").addEventListener("click", () => go(i - 1));
  listEl.querySelector(".cover-next").addEventListener("click", () => go(i + 1));
  dotEls.forEach(d => d.addEventListener("click", () => go(+d.dataset.k)));
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(i - 1);
    if (e.key === "ArrowRight") go(i + 1);
  });
  listEl.addEventListener("click", e => {                 // click cover to zoom
    const img = e.target.closest(".cover-img");
    if (img) openPubLightbox(img.src, img.alt);
  });
  go(0);
}

// `type` may be a single type ("paper"), several (["paper","review"]),
// or "all" to show everything.
//
// Every entry is built ONCE. Searching, the year pull-down and the sort
// pull-down only move or hide those elements, so the Altmetric and Dimensions
// badges inside them are never thrown away and re-loaded.
function renderPublications(type) {
  const listEl = document.getElementById("pub-list");
  const filterEl = document.getElementById("pub-filter");
  const yearEl = document.getElementById("pub-year");
  const sortEl = document.getElementById("pub-sort");

  let all;
  try { all = loadPubs(); }
  catch (e) { listEl.innerHTML = `<p class="muted">${e.message}</p>`; return; }

  const want = type === "all" ? null : (Array.isArray(type) ? type : [type]);
  const items = all.filter(p => !want || want.includes(p.type || "paper"))
                   .sort((a, b) => b.year - a.year)              // newest first, file order within a year
                   .map((p, i) => ({ p, i }));

  // Auto-fill the publication count in the metrics strip, if present.
  const countEl = document.getElementById("m-pubs");
  if (countEl) countEl.textContent = items.length;

  if (!items.length) { listEl.innerHTML = `<p class="muted">Nothing here yet.</p>`; return; }

  const tpl = document.createElement("template");
  items.forEach(it => {
    tpl.innerHTML = pubHTML(it.p, it.i).trim();
    it.el = tpl.content.firstElementChild;
    it.text = [it.p.title, it.p.authors, it.p.venue, it.p.year].join(" ")
                .replace(/<[^>]+>/g, "").toLowerCase();
  });

  // ---- pull-downs -------------------------------------------------------
  const years = [...new Set(items.map(it => it.p.year))].sort((a, b) => b - a);
  if (yearEl) yearEl.innerHTML = `<option value="">${ALL_YEARS_LABEL}</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join("");
  if (sortEl) sortEl.innerHTML = SORT_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join("");

  // Small status line under the toolbar (used by "Most cited").
  const noteEl = document.createElement("p");
  noteEl.className = "pub-sort-note";
  const toolbar = (sortEl || yearEl || filterEl);
  if (toolbar) (toolbar.closest(".pub-toolbar") || toolbar).after(noteEl);

  // Start from the address bar: ?year=2024&sort=cited, or an old #y2024 link.
  const params = new URLSearchParams(location.search);
  const legacy = (location.hash.match(/^#y(\d{4})$/) || [])[1];
  if (yearEl) yearEl.value = years.map(String).includes(params.get("year") || legacy) ? (params.get("year") || legacy) : "";
  if (sortEl && SORT_OPTIONS.some(o => o.value === params.get("sort"))) sortEl.value = params.get("sort");

  // ---- citation counts, read from each entry's Dimensions badge ----------
  const badgeOf = it => it.el.querySelector(".__dimensions_badge_embed__");
  const badgeDone = it => !badgeOf(it) || citations(it) !== null;     // no badge, or its number has arrived
  function citations(it) {
    const b = badgeOf(it);
    if (!b || b.dataset.dimensionsBadgeInstalled !== "true") return null;
    const n = b.querySelector(".__dimensions_Badge_stat_total_citations .__dimensions_Badge_stat_count");
    const a = b.querySelector("[aria-label]");                // e.g. "41 total citations on Dimensions."
    const m = ((n && n.textContent) || (a && a.getAttribute("aria-label")) || "").replace(/,/g, "").match(/\d+/);
    return m ? +m[0] : null;
  }

  // ---- draw ---------------------------------------------------------------
  const stash = document.createElement("div");                // hidden home for filtered-out entries
  stash.hidden = true;                                         // (kept in the page so their badges still load)

  function group(year) {
    const g = document.createElement("div");
    g.className = year == null ? "pub-group pub-group--flat" : "pub-group";
    if (year != null) { g.id = "y" + year; g.innerHTML = `<span class="pub-year-mark">${year}</span>`; }
    return g;
  }

  function draw() {
    const q = filterEl ? filterEl.value.trim().toLowerCase() : "";
    const year = yearEl ? yearEl.value : "";
    const sort = sortEl ? sortEl.value : "new";
    const visible = it => (!year || String(it.p.year) === year) && (!q || it.text.includes(q));

    let order = items.slice();
    if (sort === "old") order.reverse();
    if (sort === "cited") {
      order.forEach(it => { it.c = citations(it); });
      order.sort((a, b) => (b.c ?? -1) - (a.c ?? -1) || a.i - b.i);  // unknown last, ties newest first
    }

    const out = [];
    let g = null, gYear = null;
    order.forEach(it => {
      if (!visible(it)) { stash.append(it.el); return; }
      if (sort === "cited") { if (!g) out.push(g = group(null)); }
      else if (it.p.year !== gYear) { gYear = it.p.year; out.push(g = group(gYear)); }
      g.append(it.el);
    });
    if (!out.length) {
      const msg = document.createElement("p");
      msg.className = "muted";
      msg.textContent = "No publications match your search.";
      out.push(msg);
    }
    listEl.replaceChildren(...out, stash);

    if (sort === "cited") {
      const missing = items.filter(visible).filter(it => citations(it) === null).length;
      noteEl.innerHTML = waiting
        ? "Loading citation counts from Dimensions…"
        : `Sorted by total citations on <a href="https://www.dimensions.ai/" target="_blank" rel="noopener">Dimensions</a>` +
          (missing ? ` · ${missing} without a count listed last` : "") + ".";
    } else noteEl.textContent = "";
  }

  // "Most cited" right after the page opens: badges may still be loading.
  // Draw at once, then once more when every badge has its number (or after a timeout).
  let waiting = false, waitTimer = null;
  function waitForBadges() {
    clearInterval(waitTimer);
    waiting = !items.every(badgeDone);
    if (!waiting) return;
    const t0 = Date.now();
    waitTimer = setInterval(() => {
      if (items.every(badgeDone) || Date.now() - t0 > CITATION_WAIT_MS) {
        clearInterval(waitTimer); waiting = false;
        if (sortEl && sortEl.value === "cited") draw();
      }
    }, 250);
  }

  function saveToAddressBar() {
    const u = new URL(location.href);
    const set = (k, v) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k);
    set("year", yearEl && yearEl.value);
    set("sort", sortEl && sortEl.value !== "new" ? sortEl.value : "");
    u.hash = "";
    history.replaceState(null, "", u);
  }

  if (filterEl) filterEl.addEventListener("input", draw);
  [yearEl, sortEl].forEach(el => el && el.addEventListener("change", () => {
    if (el === sortEl && sortEl.value === "cited") waitForBadges();
    saveToAddressBar(); draw();
  }));

  // Click a TOC thumbnail to zoom it in a lightbox.
  listEl.addEventListener("click", e => {
    const t = e.target.closest(".pub__thumb");
    if (t) openPubLightbox(t.src, t.alt);
  });

  if (sortEl && sortEl.value === "cited") waitForBadges();
  draw();

  // Badge scripts load asynchronously. If they arrived before the list existed,
  // ask them to look again; if they arrive later, they find the entries themselves.
  if (window.__dimensions_embed && window.__dimensions_embed.addBadges) window.__dimensions_embed.addBadges();
  if (typeof window._altmetric_embed_init === "function") window._altmetric_embed_init();
}
