/* ==========================================================================
   pubexport.js — the "Export" button on the publications page.
   --------------------------------------------------------------------------
   Opens a panel in which a visitor formats the publication list (citation
   style, author names, bold / italic, brackets, field order, numbering, font)
   with a live preview, then downloads it as a Word file (.docx) or copies it
   as formatted text.

   It reads the same data as the list (window.PUBLICATIONS from
   data/publications.js) and needs no library: the .docx file is assembled in
   the browser. Nothing here needs editing when you add a publication.

   To show the button on a page:
     1. put  <button id="pub-export" class="pub-export-btn" type="button">Export</button>
        inside the page's .pub-toolbar, and
     2. load this file after data/publications.js:
        <script src="assets/js/pubexport.js?v=NN"></script>

   What it expects from each entry (the house style described in GUIDE.md):
     authors  "A B, <span class=\"me\">Zhe Wang</span><sup>*</sup>, C D"
     venue    "<i>Journal</i>, <b>2026</b>, <i>volume</i>, pages."
   An entry that does not follow it still exports; its venue is used as-is.
   ========================================================================== */
(function () {
"use strict";

/* ---- labels and defaults you may edit ----------------------------------- */
const FILE_NAME    = "Zhe_Wang_Publications";       // download name: <this>_YYYY-MM-DD.docx
const DOC_HEADING  = "List of Publications";        // default first line of the document
const GROUP_LABELS = { paper: "Original Papers", review: "Reviews and Accounts", preprint: "Preprints" };
const DEFAULT_PRESET = "acs";
const STORE_KEY    = "pubExport.v1";                // a visitor's last choices (their browser only)

const FIELD_NAMES = { authors: "Authors", title: "Title", journal: "Journal", year: "Year",
                      volume: "Volume", issue: "Issue", pages: "Pages", doi: "DOI" };
const WRAPS = { "": ["", ""], "()": ["(", ")"], "[]": ["[", "]"],
                "\u201c\u201d": ["\u201c", "\u201d"], "\"\"": ["\"", "\""] };
const NUMS  = { none: null, dot: n => n + ".", br: n => "[" + n + "]", par: n => "(" + n + ")", rp: n => n + ")" };
const FONTS = {                                     // Word font → CSS stack for the preview
  "Times New Roman": "'Times New Roman', Times, 'Liberation Serif', serif",
  "Arial":           "Arial, Helvetica, 'Liberation Sans', sans-serif",
  "Calibri":         "Calibri, Carlito, 'Segoe UI', sans-serif",
  "Cambria":         "Cambria, Caladea, Georgia, serif",
  "Century":         "Century, 'Century Schoolbook', 'TeX Gyre Schola', serif",
  "Garamond":        "Garamond, 'EB Garamond', 'Times New Roman', serif",
  "Helvetica":       "Helvetica, Arial, sans-serif",
};
const PAPER = { A4: [11906, 16838], Letter: [12240, 15840] };   // page size in twips

/* ---- citation-style presets ----------------------------------------------
   names.order   "gf" Zhe Wang | "f,g" Wang, Zhe | "fg" Wang Zhe
   names.given   "full" | "init" (Z.) | "initnd" (Z)
   names.last    "none" A, B, C | "and" A, B and C | "oxand" A, B, and C
                 "amp" A, B & C | "oxamp" A, B, & C
   journal       "abbr" | "full" (full = "journalFull" from the data, when filled in)
   fields        in output order; F(key, shown, bold, italic, brackets, text before)
   -------------------------------------------------------------------------- */
const F = (key, on, b, i, wrap, before) => ({ key, on: !!on, b: !!b, i: !!i, wrap, before });
const PRESETS = {
  acs: { label: "ACS \u2014 J. Am. Chem. Soc.", doiFmt: "label", ending: ".",
    names: { order: "f,g", given: "init", middle: true, initSpace: true, caps: false, sep: "; ", last: "none" },
    fields: [F("authors",1,0,0,"",""), F("title",1,0,0,"",". "), F("journal",1,0,1,"",". "), F("year",1,1,0,""," "),
             F("volume",1,0,1,"",", "), F("issue",0,0,0,"()"," "), F("pages",1,0,0,"",", "), F("doi",0,0,0,"",". ")] },
  rsc: { label: "RSC \u2014 Chem. Sci., Chem. Commun.", doiFmt: "label", ending: ".",
    names: { order: "gf", given: "init", middle: true, initSpace: true, caps: false, sep: ", ", last: "and" },
    fields: [F("authors",1,0,0,"",""), F("journal",1,0,1,"",", "), F("year",1,0,0,"",", "), F("volume",1,1,0,"",", "),
             F("issue",0,0,0,"()"," "), F("pages",1,0,0,"",", "), F("title",0,0,0,"",", "), F("doi",0,0,0,"",", ")] },
  wiley: { label: "Wiley \u2014 Angew. Chem., Chem. Eur. J.", journal: "full", doiFmt: "label", ending: ".",
    names: { order: "gf", given: "init", middle: true, initSpace: true, caps: false, sep: ", ", last: "none" },
    fields: [F("authors",1,0,0,"",""), F("journal",1,0,1,"",", "), F("year",1,1,0,""," "), F("volume",1,0,1,"",", "),
             F("issue",0,0,0,"()"," "), F("pages",1,0,0,"",", "), F("title",0,0,0,"",", "), F("doi",0,0,0,"",", ")] },
  nature: { label: "Nature", doiFmt: "url", ending: ".",
    names: { order: "f,g", given: "init", middle: true, initSpace: true, caps: false, sep: ", ", last: "amp" },
    fields: [F("authors",1,0,0,"",""), F("title",1,0,0,"",". "), F("journal",1,0,1,"",". "), F("volume",1,1,0,""," "),
             F("issue",0,0,0,"()"," "), F("pages",1,0,0,"",", "), F("year",1,0,0,"()"," "), F("doi",0,0,0,"",". ")] },
  apa: { label: "APA (7th ed.)", journal: "full", doiFmt: "url", ending: ".",
    names: { order: "f,g", given: "init", middle: true, initSpace: true, caps: false, sep: ", ", last: "oxamp" },
    fields: [F("authors",1,0,0,"",""), F("year",1,0,0,"()"," "), F("title",1,0,0,"",". "), F("journal",1,0,1,"",". "),
             F("volume",1,0,1,"",", "), F("issue",1,0,0,"()",""), F("pages",1,0,0,"",", "), F("doi",1,0,0,"",". ")] },
  site: { label: "This website (full names)", doiFmt: "label", ending: ".",
    names: { order: "gf", given: "full", middle: true, initSpace: true, caps: false, sep: ", ", last: "none" },
    fields: [F("authors",1,0,0,"",""), F("title",1,0,0,"",". "), F("journal",1,0,1,"",". "), F("year",1,1,0,"",", "),
             F("volume",1,0,1,"",", "), F("issue",0,0,0,"()"," "), F("pages",1,0,0,"",", "), F("doi",0,0,0,"",". ")] },
};

/* ======================================================================== */
/* 1. Reading the data                                                       */
/* ======================================================================== */
const ENT = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: "\u00a0", ndash: "\u2013", mdash: "\u2014", thinsp: "\u2009" };
function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return isFinite(n) && n > 0 ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
  });
}
const strip = s => String(s == null ? "" : s).replace(/<[^>]*>/g, "");
const clean = s => decode(strip(s)).replace(/\s+/g, " ").trim();

// HTML with <i>, <b>, <sub>, <sup> → [{t, b, i, sub, sup}]
function htmlRuns(html) {
  const runs = [], st = { b: 0, i: 0, sub: 0, sup: 0 };
  const KEY = { b: "b", strong: "b", i: "i", em: "i", sub: "sub", sup: "sup" };
  String(html == null ? "" : html).split(/(<[^>]+>)/).forEach(tok => {
    const m = tok.match(/^<\s*(\/?)\s*([a-z0-9]+)/i);
    if (m) { const k = KEY[m[2].toLowerCase()]; if (k) st[k] = Math.max(0, st[k] + (m[1] ? -1 : 1)); return; }
    const t = decode(tok).replace(/\s+/g, " ");
    if (t) runs.push({ t, b: st.b > 0, i: st.i > 0, sub: st.sub > 0, sup: st.sup > 0 });
  });
  return runs;
}

// "A B, <span class="me">Zhe Wang</span>,<sup>*</sup> C D*" →
// [{given:["A"], family:"B", isMe, marks:"*"}, …]
const PARTICLES = new Set(["van", "von", "der", "den", "de", "del", "della", "di", "da", "du", "le", "la", "dos", "das", "ter", "ten"]);
const MARK_RE = /[*\u2020\u2021\u00a7]/g;            // * † ‡ §
function parseAuthors(html) {
  const s = String(html == null ? "" : html)
    .replace(/<sup>([^<]*)<\/sup>/gi, (m, c) => "<sup>" + c.replace(/,/g, "\u0001") + "</sup>")  // commas inside marks
    .replace(/,\s*(<sup>[^<]*<\/sup>)/gi, "$1,")     // "Name,<sup>*</sup> Next" → "Name<sup>*</sup>, Next"
    .replace(/,\s*([*\u2020\u2021\u00a7]+)/g, "$1,");
  const out = [];
  s.split(",").forEach(raw => {
    let marks = "";
    raw = raw.replace(/<sup>([^<]*)<\/sup>/gi, (m, c) => { marks += c.replace(/\u0001/g, ",").trim(); return ""; });
    marks += (strip(raw).match(MARK_RE) || []).join("");
    const isMe = /class\s*=\s*["']?[^"'>]*\bme\b/i.test(raw);
    const name = clean(raw).replace(MARK_RE, "").trim();
    if (!name) { if (marks && out.length) out[out.length - 1].marks += marks; return; }
    const w = name.split(" ");
    let k = w.length - 1;
    while (k > 1 && PARTICLES.has(w[k - 1].toLowerCase())) k--;
    out.push({ given: w.slice(0, k), family: w.slice(k).join(" "), isMe, marks });
  });
  return out;
}

// "<i>J. Am. Chem. Soc.</i>, <b>2026</b>, <i>148</i>, 20974–20984." → parts
function parseVenue(html) {
  const v = String(html == null ? "" : html).trim();
  const out = { journal: "", volume: "", issue: "", pages: "" };
  const m = v.match(/^<(i|em)>([\s\S]*?)<\/\1>\s*,?\s*([\s\S]*)$/i);
  if (!m) { out.journal = clean(v).replace(/[.,\s]+$/, ""); return out; }
  out.journal = clean(m[2]).replace(/,$/, "");
  let rest = m[3];
  const y = rest.match(/<(b|strong)>\s*\d{4}\s*<\/\1>/i);
  rest = y ? rest.slice(y.index + y[0].length) : rest.replace(/^\s*\d{4}\s*,?/, "");   // year comes from "year"
  const vol = rest.match(/<(i|em)>([\s\S]*?)<\/\1>/i);
  if (vol) { out.volume = clean(vol[2]); rest = rest.slice(vol.index + vol[0].length); }
  let iss = rest.match(/^\s*\(([^)]*)\)/);                 // <i>148</i>(12)  or  <i>148 (12)</i>
  if (iss) rest = rest.slice(iss[0].length);
  else if ((iss = out.volume.match(/\s*\(([^)]*)\)$/))) out.volume = out.volume.slice(0, iss.index);
  if (iss) out.issue = clean(iss[1]);
  out.pages = clean(rest).replace(/^[,;\s]+/, "").replace(/[.,;\s]+$/, "");
  return out;
}

function parsePub(p, idx) {
  const v = parseVenue(p.venue || p.caption);
  const kind = /rxiv|preprint/i.test(v.journal) ? "preprint" : (p.type === "review" ? "review" : "paper");
  return { idx, kind, year: +p.year || 0, authors: parseAuthors(p.authors), title: htmlRuns(p.title),
           journal: v.journal, journalFull: clean(p.journalFull || ""), volume: v.volume, issue: String(p.issue || "").trim() || v.issue, pages: v.pages, doi: String(p.doi || "").trim() };
}

/* ======================================================================== */
/* 2. Formatting one entry → runs [{t, b, i, u, sup, sub, link}]            */
/* ======================================================================== */
function initial(tok, dot) {
  return tok.split("-").filter(Boolean).map(x => {
    const c = Array.from(x.replace(/^[^\p{L}]+/u, ""))[0] || "";
    return c.toUpperCase() + dot;
  }).join("-");
}
function nameText(a, n) {
  const given = n.middle ? a.given : a.given.slice(0, 1);
  const g = n.given === "full" ? given.join(" ")
          : given.map(t => initial(t, n.given === "init" ? "." : "")).join(n.initSpace ? " " : "");
  const f = n.caps ? a.family.toUpperCase() : a.family;
  if (!g) return f;
  return n.order === "gf" ? g + " " + f : n.order === "fg" ? f + " " + g : f + ", " + g;
}
function authorRuns(list, s) {
  const n = s.names;
  const cut = s.maxAuthors > 0 && list.length > s.maxAuthors;
  const shown = cut ? list.slice(0, s.maxAuthors) : list;
  const conn = { and: " and ", oxand: " and ", amp: " & ", oxamp: " & " }[n.last];
  const ox = n.last === "oxand" || n.last === "oxamp";
  const runs = [];
  shown.forEach((a, k) => {
    if (k > 0) {
      let sep = n.sep;
      if (conn && !cut && k === shown.length - 1)
        sep = ox && (shown.length > 2 || n.order === "f,g") ? n.sep.replace(/\s+$/, "") + conn : conn;
      runs.push({ t: sep });
    }
    const hl = a.isMe ? (s.me || "") : "";
    runs.push({ t: nameText(a, n), b: hl.includes("b"), u: hl.includes("u") });
    if (s.marks && a.marks) runs.push({ t: a.marks, sup: true });
  });
  if (cut) runs.push({ t: n.sep + "et al." });
  return runs;
}
function fieldRuns(key, e, s) {
  switch (key) {
    case "authors": return e.authors.length ? authorRuns(e.authors, s) : [];
    case "title":   return e.title.map(r => Object.assign({}, r));
    case "journal": {                   // full name when chosen and known, else the abbreviation
      const j = s.journal === "full" && e.journalFull ? e.journalFull : e.journal;
      return j ? [{ t: j }] : [];
    }
    case "year":    return e.year ? [{ t: String(e.year) }] : [];
    case "volume":  return e.volume ? [{ t: e.volume }] : [];
    case "issue":   return e.issue ? [{ t: e.issue }] : [];
    case "pages":   return e.pages ? [{ t: s.enDash ? e.pages.replace(/(\w)\s*[-\u2010\u2011\u2012\u2014]\s*(\w)/g, "$1\u2013$2") : e.pages }] : [];
    case "doi": {
      if (!e.doi) return [];
      const url = "https://doi.org/" + e.doi;
      const t = s.doiFmt === "url" ? url : s.doiFmt === "label" ? "DOI: " + e.doi : e.doi;
      return [{ t, link: s.doiLink ? url : "" }];
    }
  }
  return [];
}
// Last character of normal (not super/subscript) text — used to avoid "T.. Title".
function lastChar(runs) {
  for (let k = runs.length - 1; k >= 0; k--) {
    const r = runs[k];
    if (!r.sup && !r.sub && r.t) return r.t.slice(-1);
  }
  return "";
}
function addText(out, txt) {
  if (!txt) return;
  if (txt[0] === "." && /[.?!]/.test(lastChar(out))) txt = txt.slice(1);
  if (txt) out.push({ t: txt });
}
function entryRuns(e, s) {
  const out = [];
  let last = null;
  s.fields.forEach(f => {
    if (!f.on) return;
    const r = fieldRuns(f.key, e, s);
    if (!r.length) return;
    if (last) addText(out, f.before);
    const w = WRAPS[f.wrap] || WRAPS[""];
    if (w[0]) out.push({ t: w[0] });
    // field style; italic inside an italic field turns upright (e.g. "via" in a title)
    r.forEach(x => out.push(Object.assign({}, x, { b: !!(x.b || f.b), i: f.i ? !x.i : !!x.i })));
    if (w[1]) out.push({ t: w[1] });
    last = f.key;
  });
  if (last && last !== "doi") addText(out, s.ending);   // no full stop after a DOI
  return out;
}

/* ======================================================================== */
/* 3. The whole list → blocks                                                */
/* ======================================================================== */
function selectItems(all, s) {
  const yf = +s.yearFrom || -Infinity, yt = +s.yearTo || Infinity;
  const items = all.map((p, i) => [p, i]).filter(([p]) => (p.type || "paper") !== "cover")
    .map(([p, i]) => parsePub(p, i))
    .filter(e => s.types[e.kind] && e.year >= yf && e.year <= yt)
    .sort((a, b) => b.year - a.year || a.idx - b.idx);       // newest first, file order within a year
  if (s.sort === "old") items.reverse();
  return items;
}
function buildDoc(all, s) {
  const items = selectItems(all, s);
  const blocks = [];
  if (String(s.heading || "").trim()) blocks.push({ kind: "title", runs: [{ t: s.heading.trim() }] });
  let groups;
  if (s.group === "type") {
    groups = ["paper", "review", "preprint"].map(k => ({ label: GROUP_LABELS[k], items: items.filter(e => e.kind === k) }))
                                            .filter(g => g.items.length);
  } else if (s.group === "year") {
    groups = [];
    items.forEach(e => {
      let g = groups[groups.length - 1];
      if (!g || g.year !== e.year) groups.push(g = { label: String(e.year), year: e.year, items: [] });
      g.items.push(e);
    });
  } else groups = [{ label: "", items }];
  const fmt = NUMS[s.num], total = items.length;
  let k = 0;
  groups.forEach(g => {
    if (g.label) blocks.push({ kind: "heading", runs: [{ t: g.label }] });
    g.items.forEach(e => {
      k++;
      blocks.push({ kind: "entry", label: fmt ? fmt(s.numDir === "down" ? total - k + 1 : k) : "", runs: entryRuns(e, s) });
    });
  });
  return { blocks, count: total };
}
function indentPt(blocks, s) {
  const max = Math.max(0, ...blocks.filter(b => b.kind === "entry").map(b => b.label.length));
  if (max) return Math.ceil(max * s.size * 0.55 + s.size * 0.9);
  return s.hanging ? 24 : 0;
}

/* ======================================================================== */
/* 4. Output: HTML (preview, clipboard), plain text, .docx                   */
/* ======================================================================== */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function runsHTML(runs) {
  return runs.map(r => {
    let h = esc(r.t);
    if (r.sup) h = "<sup>" + h + "</sup>"; else if (r.sub) h = "<sub>" + h + "</sub>";
    if (r.u) h = "<u>" + h + "</u>";
    if (r.i) h = "<i>" + h + "</i>";
    if (r.b) h = "<b>" + h + "</b>";
    if (r.link) h = `<a href="${esc(r.link)}" target="_blank" rel="noopener">${h}</a>`;
    return h;
  }).join("");
}
function toHTML(doc, s, clip) {
  const ind = indentPt(doc.blocks, s), ff = FONTS[s.font] || s.font;
  const body = doc.blocks.map(b => {
    if (b.kind === "title")
      return `<p style="margin:0 0 ${s.size}pt;font-size:${s.size + 5}pt;font-weight:bold;line-height:1.2">${runsHTML(b.runs)}</p>`;
    if (b.kind === "heading")
      return `<p style="margin:${s.size}pt 0 ${s.size / 2}pt;font-size:${s.size + 1}pt;font-weight:bold">${runsHTML(b.runs)}</p>`;
    const lab = !b.label ? "" : clip ? esc(b.label) + " "
      : `<span style="display:inline-block;min-width:${ind}pt;text-indent:0">${esc(b.label)}</span>`;
    const hang = ind ? `padding-left:${ind}pt;text-indent:-${ind}pt;` : "";
    return `<p style="margin:0 0 ${s.gap}pt;${hang}line-height:${s.line}">${lab}${runsHTML(b.runs)}</p>`;
  }).join("");
  return `<div style="font-family:${ff};font-size:${s.size}pt;line-height:${s.line};color:#000">${body}</div>`;
}
function toText(doc) {
  return doc.blocks.map(b => {
    const t = b.runs.map(r => r.t).join("");
    return b.kind === "entry" ? (b.label ? b.label + " " : "") + t : b.kind === "heading" ? "\n" + t : t;
  }).join("\n");
}

// ---- .docx (Office Open XML in a plain zip) --------------------------------
const xe = s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const XML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n";
const NS_W = "xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"";
const NS_R = "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"";
const REL  = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";

function myName(all) {
  for (const p of all) {
    const me = parseAuthors(p.authors).find(a => a.isMe);
    if (me) return me.given.concat(me.family).join(" ");
  }
  return "";
}
function toDocx(doc, s, all, now) {
  now = now || new Date();
  const ind = Math.round(indentPt(doc.blocks, s) * 20);
  const sz = Math.round(s.size * 2), font = xe(s.font);
  const links = [];
  const run = r => {
    let p = "";
    if (r.b) p += "<w:b/><w:bCs/>";
    if (r.i) p += "<w:i/><w:iCs/>";
    if (r.u) p += "<w:u w:val=\"single\"/>";
    if (r.sup) p += "<w:vertAlign w:val=\"superscript\"/>"; else if (r.sub) p += "<w:vertAlign w:val=\"subscript\"/>";
    return "<w:r>" + (p ? "<w:rPr>" + p + "</w:rPr>" : "") + "<w:t xml:space=\"preserve\">" + xe(r.t) + "</w:t></w:r>";
  };
  const runs = rs => rs.map(r => {
    if (!r.link) return run(r);
    links.push(r.link);
    return `<w:hyperlink r:id="rIdL${links.length}" w:history="1">${run(r)}</w:hyperlink>`;
  }).join("");
  const spacing = `<w:spacing w:after="${Math.round(s.gap * 20)}" w:line="${Math.round(240 * s.line)}" w:lineRule="auto"/>`;
  const body = doc.blocks.map(b => {
    if (b.kind === "title")   return `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr>${runs(b.runs)}</w:p>`;
    if (b.kind === "heading") return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${runs(b.runs)}</w:p>`;
    const tabs = b.label && ind ? `<w:tabs><w:tab w:val="left" w:pos="${ind}"/></w:tabs>` : "";
    const indent = ind ? `<w:ind w:left="${ind}" w:hanging="${ind}"/>` : "";
    const label = b.label ? run({ t: b.label }) + "<w:r><w:tab/></w:r>" : "";
    return `<w:p><w:pPr>${tabs}${spacing}${indent}</w:pPr>${label}${runs(b.runs)}</w:p>`;
  }).join("");
  const pg = PAPER[s.paper] || PAPER.A4;

  const documentXml = XML + `<w:document ${NS_W} ${NS_R}><w:body>${body}` +
    `<w:sectPr><w:pgSz w:w="${pg[0]}" w:h="${pg[1]}"/>` +
    `<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>` +
    `</w:body></w:document>`;
  const stylesXml = XML + `<w:styles ${NS_W}>` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>` +
    `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/><w:lang w:val="en-US"/></w:rPr></w:rPrDefault>` +
    `<w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
    `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>` +
    `<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/>` +
      `<w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style>` +
    `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
      `<w:pPr><w:spacing w:after="${Math.round(s.size * 20)}"/></w:pPr>` +
      `<w:rPr><w:b/><w:bCs/><w:sz w:val="${sz + 10}"/><w:szCs w:val="${sz + 10}"/></w:rPr></w:style>` +
    `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
      `<w:pPr><w:keepNext/><w:spacing w:before="${Math.round(s.size * 20)}" w:after="${Math.round(s.size * 10)}"/><w:outlineLvl w:val="0"/></w:pPr>` +
      `<w:rPr><w:b/><w:bCs/><w:sz w:val="${sz + 2}"/><w:szCs w:val="${sz + 2}"/></w:rPr></w:style>` +
    `</w:styles>`;
  const settingsXml = XML + `<w:settings ${NS_W}><w:defaultTabStop w:val="720"/>` +
    `<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
  const docRels = XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rIdStyles" Type="${REL}styles" Target="styles.xml"/>` +
    `<Relationship Id="rIdSettings" Type="${REL}settings" Target="settings.xml"/>` +
    links.map((u, k) => `<Relationship Id="rIdL${k + 1}" Type="${REL}hyperlink" Target="${xe(u)}" TargetMode="External"/>`).join("") +
    `</Relationships>`;
  const stamp = now.toISOString().replace(/\.\d+Z$/, "Z");
  const coreXml = XML + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ` +
    `xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ` +
    `xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${xe(String(s.heading || "").trim() || "Publications")}</dc:title><dc:creator>${xe(myName(all || []))}</dc:creator>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified></cp:coreProperties>`;
  const types = XML + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
  const rootRels = XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="${REL}officeDocument" Target="word/document.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `</Relationships>`;
  return zipStore([
    ["[Content_Types].xml", types], ["_rels/.rels", rootRels], ["docProps/core.xml", coreXml],
    ["word/document.xml", documentXml], ["word/styles.xml", stylesXml], ["word/settings.xml", settingsXml],
    ["word/_rels/document.xml.rels", docRels],
  ], now);
}

// Minimal zip writer (no compression — Word does not mind).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipStore(files, now) {
  const enc = new TextEncoder();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts = [], central = [];
  let offset = 0;
  files.forEach(([name, text]) => {
    const nm = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const h = new Uint8Array(30 + nm.length), v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
    v.setUint16(10, time, true); v.setUint16(12, date, true); v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, nm.length, true);
    h.set(nm, 30);
    const c = new Uint8Array(46 + nm.length), w = new DataView(c.buffer);
    w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
    w.setUint16(12, time, true); w.setUint16(14, date, true); w.setUint32(16, crc, true);
    w.setUint32(20, data.length, true); w.setUint32(24, data.length, true); w.setUint16(28, nm.length, true);
    w.setUint32(42, offset, true); c.set(nm, 46);
    parts.push(h, data); central.push(c);
    offset += h.length + data.length;
  });
  const cdSize = central.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
  const chunks = parts.concat(central, [end]);
  const out = new Uint8Array(chunks.reduce((n, a) => n + a.length, 0));
  let p = 0;
  chunks.forEach(a => { out.set(a, p); p += a.length; });
  return out;
}

/* ======================================================================== */
/* 5. Settings                                                               */
/* ======================================================================== */
const clone = o => JSON.parse(JSON.stringify(o));
function applyPreset(s, key) {
  const p = PRESETS[key];
  s.names = clone(p.names); s.fields = clone(p.fields); s.ending = p.ending; s.doiFmt = p.doiFmt; s.journal = p.journal || "abbr"; s.preset = key;
}
function defaults() {
  const s = { preset: DEFAULT_PRESET, maxAuthors: 0, me: "b", marks: true, doiLink: true, enDash: true,
    types: { paper: true, review: true, preprint: true }, yearFrom: "", yearTo: "",
    sort: "new", group: "none", num: "dot", numDir: "up", hanging: true,
    heading: DOC_HEADING, font: "Times New Roman", size: 11, line: 1.15, gap: 6, paper: "A4" };
  applyPreset(s, DEFAULT_PRESET);
  return s;
}
function load() {
  const s = defaults();
  try {
    const o = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (o && typeof o === "object") Object.keys(s).forEach(k => {
      if (k === "fields") {
        const known = s.fields.map(f => f.key);
        if (Array.isArray(o.fields) && o.fields.every(g => g && known.includes(g.key)) &&
            new Set(o.fields.map(g => g.key)).size === o.fields.length) {
          const kept = o.fields.map(g => Object.assign(F(g.key, 1, 0, 0, "", ""), g));
          s.fields.forEach((f, i) => {           // a field added later (e.g. "issue"): put it after its neighbour
            if (kept.some(g => g.key === f.key)) return;
            const prev = i ? kept.findIndex(g => g.key === s.fields[i - 1].key) : -1;
            kept.splice(prev + 1, 0, clone(f));
          });
          s.fields = kept;
        }
      } else if (s[k] && typeof s[k] === "object") {
        if (o[k] && typeof o[k] === "object")
          Object.keys(s[k]).forEach(j => { if (typeof o[k][j] === typeof s[k][j]) s[k][j] = o[k][j]; });
      } else if (typeof o[k] === typeof s[k]) s[k] = o[k];
    });
  } catch (e) { /* storage blocked or corrupt: use defaults */ }
  if (!FONTS[s.font]) s.font = "Times New Roman";
  if (!PAPER[s.paper]) s.paper = "A4";
  if (s.journal !== "full") s.journal = "abbr";
  if (!(s.num in NUMS)) s.num = "dot";
  if (!PRESETS[s.preset] && s.preset !== "custom") s.preset = "custom";
  return s;
}

/* ======================================================================== */
/* 6. The panel                                                              */
/* ======================================================================== */
let S, dlg, form, docEl, countEl, statusEl, years = [], kindCounts = {};

const opt = (v, l, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`;
const sel = (p, cur, list, label) =>
  `<label class="pe-row"><span>${label}</span><select data-p="${p}">${list.map(([v, l]) => opt(v, l, cur)).join("")}</select></label>`;
const chk = (p, cur, label) =>
  `<label class="pe-chk"><input type="checkbox" data-p="${p}"${cur ? " checked" : ""}><span>${label}</span></label>`;
const txt = (p, cur, label, cls, ph) =>
  `<label class="pe-row"><span>${label}</span><input type="text" data-p="${p}" class="${cls || ""}" value="${esc(cur)}" placeholder="${esc(ph || "")}" spellcheck="false" autocomplete="off"></label>`;
const num = (p, cur, label, min, max, step) =>
  `<label class="pe-row"><span>${label}</span><input type="number" data-p="${p}" value="${cur}" min="${min}" max="${max}" step="${step}"></label>`;
const tog = (p, cur, face, label) =>
  `<label class="pe-tog"><input type="checkbox" data-p="${p}"${cur ? " checked" : ""} aria-label="${esc(label)}"><span aria-hidden="true">${face}</span></label>`;

function fieldsTable() {
  const firstOn = S.fields.findIndex(f => f.on);
  const wraps = [["", "\u2014"], ["()", "( )"], ["[]", "[ ]"], ["\u201c\u201d", "\u201c \u201d"], ["\"\"", "\" \""]];
  const rows = S.fields.map((f, k) => {
    const nm = FIELD_NAMES[f.key];
    return `<tr${f.on ? "" : " class=\"off\""}>` +
      `<td><input type="checkbox" data-p="fields.${k}.on"${f.on ? " checked" : ""} aria-label="Include ${nm}"></td>` +
      `<td class="pe-fname">${nm}</td>` +
      `<td>${tog(`fields.${k}.b`, f.b, "<b>B</b>", nm + " bold")}</td>` +
      `<td>${tog(`fields.${k}.i`, f.i, "<i>I</i>", nm + " italic")}</td>` +
      `<td><select data-p="fields.${k}.wrap" aria-label="${nm} brackets">${wraps.map(([v, l]) => opt(v, l, f.wrap)).join("")}</select></td>` +
      `<td><input type="text" class="pe-sep" data-p="fields.${k}.before" value="${esc(f.before)}" aria-label="Text before ${nm}" spellcheck="false" autocomplete="off"` +
        (k === firstOn ? " disabled title=\"Not used: this is the first field\"" : "") + `></td>` +
      `<td class="pe-move"><button type="button" data-move="${k}:-1" aria-label="Move ${nm} up"${k === 0 ? " disabled" : ""}>\u25B2</button>` +
        `<button type="button" data-move="${k}:1" aria-label="Move ${nm} down"${k === S.fields.length - 1 ? " disabled" : ""}>\u25BC</button></td></tr>`;
  }).join("");
  return `<table class="pe-fields"><thead><tr><th><span class="sr-only">Show</span></th><th>Field</th><th>B</th><th>I</th>` +
         `<th>Brackets</th><th>Before</th><th><span class="sr-only">Order</span></th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderForm() {
  const first = !form.firstChild;
  const open = new Set(Array.from(form.querySelectorAll("details[open]")).map(d => d.dataset.sec));
  const narrow = !!(window.matchMedia && window.matchMedia("(max-width: 860px)").matches);   // phones: keep the preview close
  const isOpen = k => first ? (narrow ? ["style"] : ["style", "authors", "fields"]).includes(k) : open.has(k);
  const a = document.activeElement;
  const focus = a && form.contains(a) && a.dataset ? (a.dataset.p ? `[data-p="${a.dataset.p}"]` : a.dataset.move ? `[data-move="${a.dataset.move}"]` : "") : "";
  const scroll = form.scrollTop, n = S.names;
  const sec = (k, title, body) => `<details data-sec="${k}"${isOpen(k) ? " open" : ""}><summary>${title}</summary><div class="pe-sec">${body}</div></details>`;

  form.innerHTML =
    sec("style", "Citation style",
      sel("preset", S.preset, Object.keys(PRESETS).map(k => [k, PRESETS[k].label]).concat([["custom", "Custom"]]), "Preset") +
      `<p class="pe-hint">A preset fills in the author and field settings below; change anything to fine-tune it.</p>`) +
    sec("authors", "Authors",
      sel("names.order", n.order, [["gf", "Given Family \u2014 Zhe Wang"], ["f,g", "Family, Given \u2014 Wang, Zhe"], ["fg", "Family Given \u2014 Wang Zhe"]], "Name order") +
      sel("names.given", n.given, [["full", "Full \u2014 Zhe"], ["init", "Initials \u2014 Z."], ["initnd", "Initials, no periods \u2014 Z"]], "Given names") +
      chk("names.middle", n.middle, "Keep middle names") +
      chk("names.initSpace", n.initSpace, "Space between initials") +
      chk("names.caps", n.caps, "Family names in capitals") +
      sel("names.sep", n.sep, [[", ", "Comma \u2014 A, B"], ["; ", "Semicolon \u2014 A; B"]], "Between authors") +
      sel("names.last", n.last, [["none", "A, B, C"], ["and", "A, B and C"], ["oxand", "A, B, and C"], ["amp", "A, B & C"], ["oxamp", "A, B, & C"]], "Before last author") +
      num("maxAuthors", S.maxAuthors, "Max. authors", 0, 99, 1) +
      `<p class="pe-hint pe-hint--in">0 lists every author; otherwise \u201cet al.\u201d follows that many.</p>` +
      sel("me", S.me, [["", "No highlight"], ["b", "Bold"], ["u", "Underline"], ["bu", "Bold + underline"]], "My name") +
      chk("marks", S.marks, "Show corresponding-author marks (<sup>*</sup>)")) +
    sec("fields", "Fields &amp; formatting",
      fieldsTable() +
      `<p class="pe-hint">Tick to include \u00b7 <b>B</b>/<i>I</i> bold, italic \u00b7 \u25B2\u25BC order. ` +
      `<b>Before</b> is the text placed in front of a field \u2014 spaces count.</p>` +
      sel("journal", S.journal, [["abbr", "Abbreviated"], ["full", "Full name"]], "Journal name") +
      txt("ending", S.ending, "End each entry with", "pe-sep") +
      sel("doiFmt", S.doiFmt, [["bare", "10.1021/\u2026"], ["label", "DOI: 10.1021/\u2026"], ["url", "https://doi.org/10.1021/\u2026"]], "DOI format") +
      chk("doiLink", S.doiLink, "DOI as a clickable link") +
      chk("enDash", S.enDash, "Page ranges with an en dash (1\u20135)")) +
    sec("list", "Which publications",
      `<div class="pe-row pe-row--top"><span>Include</span><div>` +
        ["paper", "review", "preprint"].map(k => chk("types." + k, S.types[k], `${GROUP_LABELS[k]} <span class="pe-n">${kindCounts[k] || 0}</span>`)).join("") +
      `</div></div>` +
      sel("yearFrom", S.yearFrom, [["", "Earliest"]].concat(years.slice().reverse().map(y => [y, y])), "From year") +
      sel("yearTo", S.yearTo, [["", "Latest"]].concat(years.map(y => [y, y])), "To year") +
      sel("sort", S.sort, [["new", "Newest first"], ["old", "Oldest first"]], "Order") +
      sel("group", S.group, [["none", "None"], ["year", "By year"], ["type", "By type"]], "Headings") +
      sel("num", S.num, [["none", "None"], ["dot", "1."], ["br", "[1]"], ["par", "(1)"], ["rp", "1)"]], "Numbering") +
      sel("numDir", S.numDir, [["up", "Count up \u2014 1, 2, 3 \u2026"], ["down", "Count down \u2014 \u2026 3, 2, 1"]], "Counting") +
      chk("hanging", S.hanging, "Hanging indent when not numbered")) +
    sec("doc", "Word document",
      txt("heading", S.heading, "Heading", "", "none") +
      sel("font", S.font, Object.keys(FONTS).map(f => [f, f]), "Font") +
      num("size", S.size, "Size (pt)", 8, 16, 0.5) +
      sel("line", S.line, [[1, "Single"], [1.15, "1.15"], [1.5, "1.5"], [2, "Double"]], "Line spacing") +
      num("gap", S.gap, "Space after entry (pt)", 0, 30, 1) +
      sel("paper", S.paper, [["A4", "A4"], ["Letter", "US Letter"]], "Paper"));

  form.scrollTop = scroll;
  if (focus) { const el = form.querySelector(focus); if (el && !el.disabled) el.focus(); }
}

function refresh() {
  const doc = buildDoc(window.PUBLICATIONS, S);
  docEl.innerHTML = toHTML(doc, S, false) +
    (doc.count ? "" : "<p class=\"pe-empty\">No publications match these settings.</p>");
  countEl.textContent = `${doc.count} publication${doc.count === 1 ? "" : "s"} \u00b7 ${S.paper === "Letter" ? "US Letter" : "A4"} \u00b7 ${S.font} ${S.size} pt`;
  dlg.querySelectorAll("[data-act=docx],[data-act=copy]").forEach(b => { b.disabled = !doc.count; });
  return doc;
}
const status = m => { statusEl.textContent = m; };
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
function markCustom() {
  if (S.preset === "custom") return;
  S.preset = "custom";
  const p = form.querySelector("[data-p=preset]");
  if (p) p.value = "custom";
}
function setPath(o, path, v) {
  const ks = path.split("."), last = ks.pop();
  ks.reduce((a, k) => a[k], o)[last] = v;
}

const NUMERIC = new Set(["size", "gap", "line", "maxAuthors"]);
const STYLE_PATH = /^(names\.|fields\.|ending$|doiFmt$|journal$)/;
function onEdit(ev) {
  const el = ev.target, p = el.dataset && el.dataset.p;
  if (!p) return;
  const toggle = el.tagName === "SELECT" || el.type === "checkbox";
  if (toggle !== (ev.type === "change")) return;       // text: "input" event; menus and ticks: "change"
  let v = el.type === "checkbox" ? el.checked : el.value;
  if (NUMERIC.has(p)) {
    v = parseFloat(v);
    if (!isFinite(v)) return;
    if (el.type === "number") v = Math.min(+el.max, Math.max(+el.min, v));
  }
  if (p === "preset") {
    if (PRESETS[v]) { applyPreset(S, v); renderForm(); } else S.preset = "custom";
  } else {
    setPath(S, p, v);
    if (STYLE_PATH.test(p)) markCustom();
    if (/^fields\.\d+\.on$/.test(p)) renderForm();
  }
  save(); refresh(); status("");
}
function onMove(ev) {
  const b = ev.target.closest("[data-move]");
  if (!b || b.disabled) return;
  const [k, d] = b.dataset.move.split(":").map(Number), j = k + d;
  if (j < 0 || j >= S.fields.length) return;
  const f = S.fields;
  [f[k], f[j]] = [f[j], f[k]];
  markCustom(); save(); renderForm(); refresh();
  const nb = form.querySelector(`[data-move="${j}:${d}"]`) || form.querySelector(`[data-move="${j}:${-d}"]`);
  if (nb && !nb.disabled) nb.focus(); else { const o = form.querySelector(`[data-move="${j}:${-d}"]`); if (o) o.focus(); }
}

function fileName() {
  const d = new Date(), z = n => String(n).padStart(2, "0");
  return `${FILE_NAME}_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.docx`;
}
function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; a.hidden = true;
  dlg.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
async function copyRich(html, text) {
  try {
    if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }) })]);
      return true;
    }
  } catch (e) { /* fall through to the older way */ }
  const d = document.createElement("div");                 // must live inside the open dialog
  d.contentEditable = "true"; d.innerHTML = html;
  d.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  dlg.appendChild(d);
  const r = document.createRange(), sl = window.getSelection();
  r.selectNodeContents(d); sl.removeAllRanges(); sl.addRange(r);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  sl.removeAllRanges(); d.remove();
  return ok;
}
async function onAction(ev) {
  const b = ev.target.closest("[data-act]");
  if (!b || b.disabled) return;
  if (b.dataset.act === "reset") {
    S = defaults(); save(); renderForm(); refresh(); status("Settings reset.");
    return;
  }
  const doc = buildDoc(window.PUBLICATIONS, S);
  if (!doc.count) return;
  if (b.dataset.act === "docx") {
    try { const name = fileName(); download(toDocx(doc, S, window.PUBLICATIONS), name); status("Saved " + name); }
    catch (e) { console.error(e); status("Sorry \u2014 the Word file could not be created."); }
  } else if (b.dataset.act === "copy") {
    const ok = await copyRich(toHTML(doc, S, true), toText(doc));
    status(ok ? `Copied ${doc.count} entries \u2014 paste into Word or any editor.` : "Copying is blocked here \u2014 use Download instead.");
  }
}

function buildDialog() {
  S = load();
  const all = window.PUBLICATIONS.filter(p => (p.type || "paper") !== "cover").map(parsePub);
  years = Array.from(new Set(all.map(e => e.year))).sort((a, b) => b - a);
  kindCounts = all.reduce((m, e) => { m[e.kind] = (m[e.kind] || 0) + 1; return m; }, {});

  dlg = document.createElement("dialog");
  dlg.className = "pe";
  dlg.setAttribute("aria-labelledby", "pe-title");
  dlg.innerHTML = `
    <header class="pe__head">
      <div><div class="pe__kicker">// export</div><h2 id="pe-title">Export publications</h2></div>
      <button type="button" class="pe__close" aria-label="Close">&times;</button>
    </header>
    <div class="pe__body">
      <form class="pe__opts" autocomplete="off"></form>
      <section class="pe__preview" aria-label="Preview">
        <p class="pe__count" aria-live="polite"></p>
        <div class="pe__paper"></div>
      </section>
    </div>
    <footer class="pe__foot">
      <button type="button" class="pe-btn pe-btn--ghost" data-act="reset">Reset</button>
      <span class="pe__status" role="status"></span>
      <button type="button" class="pe-btn" data-act="copy">Copy text</button>
      <button type="button" class="pe-btn pe-btn--primary" data-act="docx">Download .docx</button>
    </footer>`;
  document.body.appendChild(dlg);
  form = dlg.querySelector(".pe__opts");
  docEl = dlg.querySelector(".pe__paper");
  countEl = dlg.querySelector(".pe__count");
  statusEl = dlg.querySelector(".pe__status");
  form.addEventListener("submit", e => e.preventDefault());
  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);
  form.addEventListener("click", onMove);
  dlg.querySelector(".pe__foot").addEventListener("click", onAction);
  dlg.querySelector(".pe__close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });   // click on the backdrop
}
function openPanel() {
  if (!dlg) buildDialog();
  renderForm(); refresh(); status("");
  if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
}

// Exposed for testing and for other pages: window.PubExport.open()
const api = { PRESETS, parseAuthors, parseVenue, parsePub, buildDoc, toHTML, toText, toDocx, defaults, applyPreset, open: openPanel };
if (typeof window !== "undefined") window.PubExport = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;

if (typeof document !== "undefined") {
  const start = () => {
    const btn = document.getElementById("pub-export");
    if (!btn) return;
    if (!Array.isArray(window.PUBLICATIONS)) { btn.hidden = true; return; }
    btn.addEventListener("click", openPanel);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
}
})();
