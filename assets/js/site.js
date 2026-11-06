/* ==========================================================================
   site.js — shared header, footer, navigation and theme toggle.
   --------------------------------------------------------------------------
   This is the ONE place to edit your name, the navigation menu, your social
   links and the footer. Whatever you change here updates EVERY page at once.
   ========================================================================== */

const SITE = {
  // Logo image shown at the top-left of every page.
  logo: "/assets/img/favicon.png",

  // Brand text next to the logo. Shown on every page EXCEPT the home page
  // (home shows the logo only). Edit the words / styling here.
  brandText: 'Zhe <strong>WANG</strong><span class="brand-phd">, Ph.D.</span>',

  // ---- Navigation menu --------------------------------------------------
  // To add a page: add { label, href }.  The current page is highlighted
  // automatically. "children" turns an item into a dropdown.
  // Paths start with "/" (root-relative) so links work everywhere, including
  // from inside a blog post's own folder (e.g. /my-post/).
  nav: [
    { label: "home",         href: "/" },
    { label: "cv",           href: "/cv.html" },
    { label: "research",     href: "/research.html" },
    {
      label: "publications", href: "/publications.html",
      // "short" = label in the "List by Type" row on the publication pages;
      // listByType: false keeps an item in the menu but out of that row.
      // { divider: true } draws a line in the menu. hidden: true keeps a page
      // out of the menu, the "List by Type" row and the sitemap — set it to
      // false once the page has entries.
      children: [
        { label: "all publications",   href: "/publications.html", short: "all" },
        { label: "original papers",    href: "/papers.html" },
        { label: "accounts & reviews", href: "/reviews.html" },
        { label: "cover pictures",     href: "/covers.html" },
        { divider: true },
        { label: "books & chapters",   href: "/books.html",   hidden: true },
        { label: "presentations",      href: "/presentations.html", listByType: false },
        { label: "patents",            href: "/patents.html", hidden: true },
      ],
    },
    {
      label: "programs", href: "/programs.html",
      children: [
        { label: "py.Aroma",   href: "/program/pyaroma" },
        { label: "Excitation Studio", href: "/program/online/tddft/" },
        { label: "mol.Viewer", href: "/program/online/molview.html" },
        { label: "scripts",    href: "/programs.html#scripts" },
      ],
    },
    { label: "teaching", href: "/teaching.html" },
    { label: "links",    href: "/links.html" },
    { label: "blog",     href: "/blog.html" },
  ],

  // ---- Footer -----------------------------------------------------------
  footerQuote: "Unless we change directions, we will end up where we are headed.",
  footerLine: 'Zhe <b>WANG</b>, <i>Ph.D.</i>, The University of Osaka.',
};

/* ---- Site base URL -----------------------------------------------------
   Worked out from where this very script lives, so every link and data file
   resolves correctly whether the site is published at the domain root
   (https://wongzit.github.io/) or in a sub-folder
   (https://wongzit.github.io/wongzit-new.github.io/). Nothing to configure. */
window.SITE_BASE = (function () {
  const re = /assets\/js\/site\.js(?:\?.*)?$/;
  const s = Array.from(document.getElementsByTagName("script")).find(x => re.test(x.src));
  return s ? s.src.replace(re, "") : (location.origin + "/");
})();
function siteUrl(p) { return window.SITE_BASE + String(p).replace(/^\//, ""); }

/* ---- Theme (dark default, remembers your choice) ----------------------- */
(function applyThemeEarly() {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  document.querySelectorAll(".theme-toggle").forEach(b => b.textContent = next === "light" ? "🌙" : "☀️");
  refreshSocialIcons();
}

/* Point each social icon at the dark/ or light/ version for the current theme.
   Looks for assets/img/social/<theme>/<data-icon>.png */
function refreshSocialIcons() {
  const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  document.querySelectorAll(".social-icon[data-icon]").forEach(img => {
    img.src = siteUrl(`assets/img/social/${theme}/${img.dataset.icon}.png`);
  });
}

/* ---- Build the navbar -------------------------------------------------- */
// Current page path relative to the site base (handles sub-folder hosting):
// "", "cv.html", "blog.html", "my-post/" …
function currentRel() {
  const basePath = new URL(window.SITE_BASE).pathname;          // "/" or "/repo/"
  let rel = location.pathname;
  if (rel.startsWith(basePath)) rel = rel.slice(basePath.length);
  return rel.replace(/index\.html$/, "");                       // "/index.html" => home
}
const navRelOf = href => href.split("#")[0].replace(/^\//, "").replace(/\/$/, "");
const navShown = c => !c.divider && !c.hidden;

function buildNav() {
  const rel = currentRel();
  const isHome = rel === "";
  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  // Logo always; text only when NOT on the home page.
  const brandInner = `<img class="site-nav__logo" src="${siteUrl(SITE.logo)}" alt="Zhe WANG — home">` +
    (isHome ? "" : `<span class="site-nav__brandtext">${SITE.brandText}</span>`);

  const linkHTML = SITE.nav.map(item => {
    const here = rel.replace(/\/$/, "");
    const active = navRelOf(item.href) === here ||
      (item.children || []).some(c => navShown(c) && navRelOf(c.href) === here) ? "active" : "";
    if (item.children) {
      const sub = item.children.filter(c => !c.hidden).map(c => c.divider
        ? `<span class="nav-drop__sep" role="separator"></span>`
        : `<a href="${siteUrl(c.href)}">${c.label}</a>`).join("");
      return `<div class="nav-drop">
                <a href="${siteUrl(item.href)}" class="${active}">${item.label} ▾</a>
                <div class="nav-drop__menu">${sub}</div>
              </div>`;
    }
    return `<a href="${siteUrl(item.href)}" class="${active}">${item.label}</a>`;
  }).join("");

  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.innerHTML = `
    <div class="site-nav__inner">
      <a class="site-nav__brand" href="${window.SITE_BASE}">${brandInner}</a>
      <button class="nav-burger" aria-label="menu" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button>
      <div class="site-nav__links" id="navLinks">
        ${linkHTML}
        <button class="theme-toggle" aria-label="toggle theme" onclick="toggleTheme()">${isLight ? "🌙" : "☀️"}</button>
      </div>
    </div>`;
  const slot = document.getElementById("site-header");
  (slot || document.body).prepend(nav);
}

/* ---- "List by Type" row on the publication pages ------------------------
   Built from the publications menu above, so a page that is hidden there is
   hidden here too. A page asks for it with <p class="pub-nav" id="pub-type-nav"></p>. */
function buildPubTypeNav() {
  const el = document.getElementById("pub-type-nav");
  const pubs = SITE.nav.find(i => i.href === "/publications.html");
  if (!el || !pubs || !pubs.children) return;
  const rel = currentRel();
  el.innerHTML = "<b>List by Type:</b> " + pubs.children.filter(c => navShown(c) && c.listByType !== false).map(c =>
    `<a href="${siteUrl(c.href)}"${navRelOf(c.href) === rel ? ' class="active"' : ""}>${c.short || c.label}</a>`)
    .join('<span class="sep">/</span>');
}

/* ---- Build the footer -------------------------------------------------- */
function buildFooter() {
  const year = new Date().getFullYear();
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <span class="quote">${SITE.footerQuote}</span>
      <span>© ${year} ${SITE.footerLine}</span>
    </div>`;
  const slot = document.getElementById("site-footer");
  (slot || document.body).append(footer);
}

/* ---- Cursor glow ------------------------------------------------------- */
/* A small accent dot plus a softer halo that trails the mouse. Skipped on
   touch screens and when the visitor prefers reduced motion (see CSS). */
function initCursorGlow() {
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (coarse || reduce) return;

  const dot = document.createElement("div");  dot.id = "cursor-dot";
  const glow = document.createElement("div"); glow.id = "cursor-glow";
  document.body.append(dot, glow);

  let mx = 0, my = 0;          // target (mouse)
  let dx = 0, dy = 0;          // dot position
  let gx = 0, gy = 0;          // glow position
  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.opacity = 1; glow.style.opacity = 1;
  });
  document.addEventListener("mouseleave", () => { dot.style.opacity = 0; glow.style.opacity = 0; });

  (function loop() {
    dx += (mx - dx) * 0.35;   // dot reacts fast
    dy += (my - dy) * 0.35;
    gx += (mx - gx) * 0.12;   // halo lags for a comet-like trail
    gy += (my - gy) * 0.12;
    dot.style.transform  = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

document.addEventListener("DOMContentLoaded", () => {
  buildNav(); buildPubTypeNav(); buildFooter(); refreshSocialIcons(); initCursorGlow();
});
