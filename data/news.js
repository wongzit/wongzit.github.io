/* ==========================================================================
   data/news.js — EVERY news item lives here.
   The home page shows the 5 newest; news.html shows all of them by year.

   Two kinds of item:

   1. One-liner — the whole news is shown in the list:
        { date: "YYYY-MM-DD", text: `What happened. <a href="…">Links</a> are fine.` },

   2. Story — only the TITLE is shown in the lists; clicking it opens the full
      text on its own page (news.html?id=<id>):
        { date: "YYYY-MM-DD", id: "short-name", title: `Headline`, body: `
            <p>First paragraph.</p>
            <p>Second paragraph, <a href="…">links</a>, <b>bold</b> …</p>
            <img src="assets/news/picture.png" alt="">
          ` },
      "id" becomes the address (use lowercase letters, numbers and dashes;
      don't change it later, or old links break). Leave it out and one is made
      from the date and title. Put pictures in assets/news/.

   • Order does not matter — items are sorted by date (newest first).
   • Write text between backticks ` … ` so quotes and apostrophes need no escaping.
   • Comma after every item except the last one.
   ========================================================================== */
window.NEWS = [
  { date: "2026-10-11", id: "261011-story", title: `Abe Laboratory Alumni Reunion`, body: `
      <p>Happy 60th Birthday, Prof. Abe!</p>
      <img src="assets/news/261011.jpg" alt="reunion">
    ` },
  { date: "2026-10-13", text: `py.Aroma has been cited 50 times, most recently in a <a href="https://doi.org/10.1007/s00214-026-03342-5">mini-review</a> by Sílvia Escayola, Miquel Solà, and Albert Poater in <em>Theor. Chem. Acc.</em>.` },
  { date: "2026-09-25", text: `Two papers have recently been accepted for publication.` },
  { date: "2026-08-18", text: `ZW was selected for the <a href="https://www.mext.go.jp/aifors_spread/">SPReAD 1000</a> (2nd round) grant!` },
  { date: "2026-06-06", text: `New page has been released.` },
  { date: "2026-06-05", text: `68.5k visits in May, 2026.` },
  { date: "2026-01-17", text: `Thanks for 455k site visits in 2025!` },
  { date: "2025-11-11", text: `<a href="programs.html#pyaroma">py.Aroma 5 is out now.</a>` },
  { date: "2025-09-22", text: `<a href="programs.html#molviewer">A new version of the Online Molecular Viewer has been released.</a>` }
];
