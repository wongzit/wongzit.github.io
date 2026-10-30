/* ==========================================================================
   team.js — builds team.html from data/team.js, and marks team members'
   names in the author lists on the publication pages.
   You never need to edit this file; edit data/team.js instead.
   ========================================================================== */

const TEAM_GROUPS = [
  { key: "D", label: "Doctoral students",      ja: "博士課程" },
  { key: "M", label: "Master's students",      ja: "修士課程" },
  { key: "B", label: "Undergraduate students", ja: "学部生" },
  { key: "",  label: "Researchers & others",   ja: "研究員・その他" },
];
const TEAM_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TEAM_ME = "Zhe Wang";

const teamStrip = s => String(s || "").replace(/<[^>]+>/g, "");
const teamSlug = name => "m-" + teamStrip(name).toLowerCase().normalize("NFKD")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const teamEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const teamUrl = () => (typeof siteUrl === "function" ? siteUrl("/team.html") : "team.html");
const teamExample = x => x.example ? ` <span class="team-tag example">example</span>` : "";

function teamDate(d) {                         // "2026-09-18" → "Sep 18, 2026", "2026-04" → "Apr 2026"
  const [y, m, day] = String(d).split("-").map(Number);
  return m ? `${TEAM_MONTHS[m - 1]} ${day ? day + ", " : ""}${y}` : String(d);
}

// Everyone whose name should be recognised in author lists (members + alumni).
function teamPeople() {
  const t = window.TEAM || {};
  return [...(t.members || []), ...(t.alumni || [])];
}
function teamNames() {
  return teamPeople()
    .flatMap(p => [p.name, ...(p.aliases || [])].map(n => ({ n: teamStrip(n), id: teamSlug(p.name) })))
    .filter(x => x.n)
    .sort((a, b) => b.n.length - a.n.length);   // longest first
}

// Wrap team members' names inside an author string (HTML) with a link to their card.
window.teamLinkNames = function (html) {
  const names = teamNames();
  if (!names.length || !html) return html;
  const re = new RegExp("(^|[^\\p{L}])(" + names.map(x => teamEsc(x.n)).join("|") + ")(?![\\p{L}])", "giu");
  return String(html).split(/(<[^>]+>)/).map(part => part.startsWith("<") ? part :
    part.replace(re, (m, pre, name) => {
      const hit = names.find(x => x.n.toLowerCase() === name.toLowerCase());
      return `${pre}<a class="team-name" href="${teamUrl()}#${hit.id}" title="Team member">${name}</a>`;
    })).join("");
};
const teamHasMember = html => teamLinkNames(html) !== html;

/* ---- team.html ----------------------------------------------------------- */
function renderTeam() {
  const T = window.TEAM;
  const fail = (id, msg) => { const el = document.getElementById(id); if (el) el.innerHTML = `<p class="muted">${msg}</p>`; };
  if (!T) { ["team-members", "team-alumni", "team-presentations", "team-pubs"]
    .forEach(id => fail(id, "data/team.js did not load. Check it is included and has no syntax error.")); return; }

  // Members, grouped D / M / B / others; most senior first within a group.
  const members = (T.members || []).slice().sort((a, b) =>
    String(b.stage).localeCompare(String(a.stage)) || String(a.since).localeCompare(String(b.since)));
  const card = p => {
    const initials = teamStrip(p.name).split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const avatar = p.photo
      ? `<img class="team-avatar" src="${p.photo}" alt="${teamStrip(p.name)}"
           onerror="this.outerHTML='<div class=&quot;team-avatar team-avatar--initials&quot;>${initials}</div>'">`
      : `<div class="team-avatar team-avatar--initials" aria-hidden="true">${initials}</div>`;
    const links = Object.entries(p.links || {}).filter(([, u]) => u)
      .map(([k, u]) => `<a href="${u}" target="_blank" rel="noopener">${k}</a>`).join("");
    return `
      <div class="team-card" id="${teamSlug(p.name)}">
        ${avatar}
        <div class="team-card__body">
          <p class="team-card__name">${p.name}${teamExample(p)}</p>
          ${p.ja ? `<p class="team-card__ja">${p.ja}</p>` : ""}
          <p class="team-card__meta">${p.stage || ""}${p.since ? ` · since ${teamDate(p.since)}` : ""}</p>
          ${p.topic ? `<p class="team-card__topic">${p.topic}</p>` : ""}
          ${links ? `<div class="team-links">${links}</div>` : ""}
        </div>
      </div>`;
  };
  const memEl = document.getElementById("team-members");
  if (memEl) {
    const groups = TEAM_GROUPS.map(g => ({ g, list: members.filter(p =>
      g.key ? String(p.stage).toUpperCase().startsWith(g.key)
            : !TEAM_GROUPS.some(x => x.key && String(p.stage).toUpperCase().startsWith(x.key))) }))
      .filter(x => x.list.length);
    memEl.innerHTML = groups.length ? groups.map(({ g, list }) => `
      <h3 class="team-group-title">${g.label}<span>${g.ja}</span></h3>
      <div class="team-grid">${list.map(card).join("")}</div>`).join("")
      : `<p class="muted">No members listed yet.</p>`;
  }

  // Alumni, newest first.
  const alEl = document.getElementById("team-alumni");
  if (alEl) {
    const alumni = (T.alumni || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    alEl.innerHTML = alumni.length ? `<table class="info-table">${alumni.map(a => `
      <tr id="${teamSlug(a.name)}"><td>${a.year || ""}</td><td>
        <span class="team-pres-title">${a.name}</span>${a.ja ? ` <span class="muted">${a.ja}</span>` : ""}${a.degree ? ` · ${a.degree}` : ""}${teamExample(a)}
        ${a.thesis ? `<div class="team-pres-meta">${a.thesis}</div>` : ""}
        ${a.now ? `<div class="team-pres-meta faint">now: ${a.now}</div>` : ""}
      </td></tr>`).join("")}</table>` : `<p class="muted">No alumni yet.</p>`;
  }

  // Presentations, grouped by year, newest first.
  const prEl = document.getElementById("team-presentations");
  if (prEl) {
    const pres = (T.presentations || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const who = n => teamStrip(n).toLowerCase() === TEAM_ME.toLowerCase()
      ? `<span class="team-me">${n}</span>` : teamLinkNames(n);
    const row = p => `<tr><td>${teamDate(p.date)}</td><td>
        <span class="team-pres-title">${p.title}</span>${p.type ? ` <span class="team-tag">${p.type}</span>` : ""}${p.award ? ` <span class="team-tag award">🏆 ${p.award}</span>` : ""}${teamExample(p)}
        <div class="team-pres-meta">${who(p.presenter || "")}${p.meeting ? ` · ${p.meeting}` : ""}${p.place ? ` · ${p.place}` : ""}</div>
      </td></tr>`;
    const years = [...new Set(pres.map(p => String(p.date).slice(0, 4)))];
    prEl.innerHTML = pres.length ? years.map(y => `
      <div class="pub-group">
        <span class="pub-year-mark">${y}</span>
        <table class="info-table">${pres.filter(p => String(p.date).startsWith(y)).map(row).join("")}</table>
      </div>`).join("") : `<p class="muted">No presentations yet.</p>`;
  }

  // Papers with team members — taken from data/publications.js, nothing to enter twice.
  const pubEl = document.getElementById("team-pubs");
  if (pubEl) {
    const pubs = (Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [])
      .filter(p => p.type !== "cover" && teamHasMember(p.authors || ""))
      .sort((a, b) => (b.year || 0) - (a.year || 0));
    pubEl.innerHTML = pubs.length ? `<table class="info-table">${pubs.map(p => `
      <tr><td>${p.year || ""}</td><td>
        <span class="team-pres-title">${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</span>
        <div class="pub__authors">${teamLinkNames(p.authors || "")}</div>
        <div class="team-pres-meta faint">${p.venue || ""}</div>
      </td></tr>`).join("")}</table>`
      : `<p class="muted">Papers co-authored by team members appear here automatically, as soon as a
         member's name (as written in <code>data/team.js</code>) matches an author in
         <code>data/publications.js</code>.</p>`;
  }

  // Opened with a link such as team.html#m-hanako-example: scroll to that card after it exists.
  if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
}
