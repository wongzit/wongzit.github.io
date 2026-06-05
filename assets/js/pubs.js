/* ==========================================================================
   pubs.js — renders the publications / reviews / covers pages.
   --------------------------------------------------------------------------
   You never edit this file. To add or change a publication, edit
   data/publications.json (see GUIDE.md). Each page calls
   renderPublications("paper" | "review" | "cover").
   ========================================================================== */

// Order action buttons are shown in (left → right).
const BTN_ORDER = ["DOI", "ABS", "BIB", "HTML", "PREPRINT", "PDF", "CODE", "SI"];

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
  if (p.abstract)                     out.push(`<button class="pub-btn" onclick="togglePanel('abs-${uid}')">ABS</button>`);
  if (p.bibtex)                       out.push(`<button class="pub-btn" onclick="togglePanel('bib-${uid}')">BIB</button>`);
  ["HTML", "PREPRINT", "PDF", "CODE", "SI"].forEach(k => {
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

function togglePanel(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("open");
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
function renderPublications(type) {
  const listEl = document.getElementById("pub-list");
  const yearNavEl = document.getElementById("pub-year-nav");
  const filterEl = document.getElementById("pub-filter");

  let all;
  try { all = loadPubs(); }
  catch (e) { listEl.innerHTML = `<p class="muted">${e.message}</p>`; return; }

  const want = type === "all" ? null : (Array.isArray(type) ? type : [type]);
  const items = all.filter(p => !want || want.includes(p.type || "paper"))
                   .sort((a, b) => b.year - a.year);

  if (!items.length) { listEl.innerHTML = `<p class="muted">Nothing here yet.</p>`; return; }

  // Year navigation links
  const years = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);
  if (yearNavEl) {
    yearNavEl.innerHTML = `<b>List by Year:</b> ` +
      years.map(y => `<a href="#y${y}">${y}</a>`).join(`<span class="sep">/</span>`);
  }

  function draw(q = "") {
    q = q.trim().toLowerCase();
    let globalIdx = 0;
    const html = years.map(year => {
      const inYear = items.filter(p => p.year === year)
        .filter(p => !q || (p.title + " " + (p.authors||"") + " " + (p.venue||"")).toLowerCase().includes(q));
      if (!inYear.length) return "";
      const body = inYear.map(p => pubHTML(p, globalIdx++)).join("");
      return `<div class="pub-group" id="y${year}">
                <span class="pub-year-mark">${year}</span>${body}
              </div>`;
    }).join("");
    listEl.innerHTML = html || `<p class="muted">No publications match your search.</p>`;
    if (window._dimensions_embed) window.__dimensions_embed.addBadges();
  }

  if (filterEl) filterEl.addEventListener("input", e => draw(e.target.value));

  // Click a TOC thumbnail to zoom it in a lightbox.
  listEl.addEventListener("click", e => {
    const t = e.target.closest(".pub__thumb");
    if (t) openPubLightbox(t.src, t.alt);
  });

  draw();
}
