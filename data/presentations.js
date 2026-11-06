/* ==========================================================================
   data/presentations.js — every conference talk and poster, yours and your
   students'. Shown on presentations.html (Publications ▸ presentations).

   One entry per presentation:
     { date: "YYYY-MM-DD", scope: "international" | "domestic", presenter: "Zhe Wang",
       authors: `…`, type: "Oral" | "Poster" | "Invited", title: `…`, meeting: `…`,
       place: "…", award: "…" },

     scope       "international" (国際学会) or "domestic" (国内学会) — shown as a tag
                 after the title
     presenter   the person who gave the talk — the only name that is highlighted
     authors     optional: the full author list, written as in the program
                 (HTML such as <sup>*</sup> is fine). The presenter's name inside
                 it is highlighted. Without "authors", only the presenter is shown.
     award       optional, shown with 🏆

   ⚠️  The entries below are EXAMPLES (example: true) — replace them with real ones.
   • Order does not matter — sorted by date, newest first.
   • Write text between backticks ` … ` so quotes and apostrophes need no escaping.
   • Comma after every entry except the last one.
   ========================================================================== */
window.PRESENTATIONS = [
  { date: "2026-09-18", scope: "domestic", presenter: "Taro Sample", type: "Poster", example: true,
    authors: `Taro Sample, Hanako Example, Zhe Wang`,
    title: `Example poster title`, meeting: `Example Symposium on Physical Organic Chemistry`, place: "Osaka",
    award: "Best Poster Award" },
  { date: "2026-03-20", scope: "international", presenter: "Zhe Wang", type: "Invited", example: true,
    title: `Example invited talk title`, meeting: `Example International Symposium on Physical Organic Chemistry`, place: "Seoul, Korea" },
  { date: "2025-11-02", scope: "domestic", presenter: "Hanako Example", type: "Oral", example: true,
    authors: `Jiro Demo, Hanako Example, Zhe Wang`,
    title: `Example oral presentation title`, meeting: `Example Conference on Structural Organic Chemistry`, place: "Kyoto" }
];
