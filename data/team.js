/* ==========================================================================
   data/team.js — everything on team.html lives here.
   Students' names are also marked automatically in the author lists on the
   publication pages, and their papers are collected on team.html.

   ⚠️  All entries below are EXAMPLES (example: true). Replace them with real
       people — and ask each student before putting their name or photo online.

   members:        { name, ja, stage, since, topic, photo, links, aliases }
     stage         "D3" "D2" "D1" "M2" "M1" "B4" … (D = doctoral, M = master's, B = undergraduate;
                   anything else, e.g. "RA", goes under "Researchers & others")
     since         "YYYY-MM"
     photo         optional, e.g. "assets/img/team/hanako.jpg" — without one, initials are shown
     links         optional, e.g. { ORCID: "https://orcid.org/…", GitHub: "https://github.com/…", Email: "mailto:…" }
     aliases       optional other spellings used in papers, e.g. ["H. Example"]
   alumni:         { name, ja, degree, year, thesis, now }
   presentations:  { date: "YYYY-MM-DD", presenter, type: "Oral" | "Poster" | "Invited",
                     title, meeting, place, award }
     presenter     a member's name links to their card; "Zhe Wang" is shown in bold

   • Write text between backticks ` … ` so quotes and apostrophes need no escaping.
   • Comma after every entry except the last one in each list.
   ========================================================================== */
window.TEAM = {
  members: [
    { name: "Hanako Example", ja: "例 花子", stage: "D1", since: "2025-04", example: true,
      topic: `Through-space spin coupling in helical diradicaloids`,
      links: { ORCID: "#", Email: "#" } },
    { name: "Taro Sample", ja: "見本 太郎", stage: "M1", since: "2026-04", example: true,
      topic: `Circularly polarized luminescence of chiral π-systems` },
    { name: "Jiro Demo", stage: "B4", since: "2026-04", example: true,
      topic: `DFT benchmark of diradical character` }
  ],

  alumni: [
    { name: "Ichiro Placeholder", ja: "仮 一郎", degree: "M.Eng.", year: 2026, example: true,
      thesis: `Example thesis title on near-infrared emitters`, now: `Example Chemical Co., Ltd.` }
  ],

  presentations: [
    { date: "2026-09-18", presenter: "Taro Sample", type: "Poster", example: true,
      title: `Example poster title`, meeting: `Example Symposium on Physical Organic Chemistry`, place: "Osaka",
      award: "Best Poster Award" },
    { date: "2026-03-20", presenter: "Zhe Wang", type: "Oral", example: true,
      title: `Example talk title`, meeting: `Example Annual Meeting`, place: "Tokyo" },
    { date: "2025-11-02", presenter: "Hanako Example", type: "Oral", example: true,
      title: `Example oral presentation title`, meeting: `Example Conference on Structural Organic Chemistry`, place: "Kyoto" }
  ]
};
