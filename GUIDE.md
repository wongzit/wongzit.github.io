# Site Maintenance Guide

**Everything you need to edit, extend and publish this website.**
Read this once and you can maintain the whole site without asking anyone.

---

## Table of contents

1. [How the site works (read this first)](#1-how-the-site-works)
2. [The two repositories: test site vs live site](#2-the-two-repositories)
3. [Repository map — what every file is for](#3-repository-map)
4. [Anatomy of a page](#4-anatomy-of-a-page)
5. [The `?v=` cache rule — the one rule you must not forget](#5-the-v-cache-rule)
6. [Editing recipes](#6-editing-recipes)
   - [6.1 Home page (news, contact, hero)](#61-home-page)
   - [6.2 Menu, brand name, footer](#62-menu-brand-name-footer)
   - [6.3 Colors, fonts, theme](#63-colors-fonts-theme)
   - [6.4 Publications (papers / reviews / covers)](#64-publications)
   - [6.5 The metrics strip (h-index, citations…)](#65-the-metrics-strip)
   - [6.6 Blog posts](#66-blog-posts)
   - [6.7 Simple content pages (CV, research, teaching, links)](#67-simple-content-pages)
   - [6.8 The compound gallery (`cas.html`)](#68-the-compound-gallery)
   - [6.9 Program pages](#69-program-pages)
   - [6.10 Social icons and favicon](#610-social-icons-and-favicon)
7. [Previewing on your own computer](#7-previewing-on-your-own-computer)
8. [Publishing workflow (test → live)](#8-publishing-workflow)
9. [Troubleshooting](#9-troubleshooting)
10. [Quick reference card](#10-quick-reference-card)

---

## 1. How the site works

This is a **static website**. There is no database, no CMS, no build step and no
server-side code. Every file in the repository is served to visitors exactly as
it sits on disk.

```
you edit a file  →  git commit  →  git push  →  GitHub Pages serves it
```

Three consequences worth internalising:

- **What you see locally is what visitors see.** No compilation, no "deploy
  step" beyond `git push`.
- **You can break the site with a single typo.** A missing comma in
  `data/publications.js` blanks the publications page. Always preview before
  pushing (§7).
- **The site is not built by Jekyll.** GitHub Pages runs Jekyll by default,
  which would choke on the Markdown blog posts. The empty file **`.nojekyll`**
  at the repository root switches that off. **Never delete `.nojekyll`.** It is
  a hidden dotfile — if you ever copy the folder in Finder, confirm it came
  along, otherwise the deploy fails with a Jekyll build error.

### Where the "logic" lives

Only four files contain machinery. Everything else is content.

| File | Responsibility |
| --- | --- |
| `assets/js/site.js` | Navbar, footer, dark/light theme, cursor glow, base-path detection |
| `assets/js/blog.js` | Blog index, tag filter, Markdown→HTML rendering, math, latest-posts table |
| `assets/js/pubs.js` | Publication list rendering, year grouping, buttons, cover slideshow, lightbox |
| `assets/css/style.css` | All styling for the entire site |

Content lives in:

- `*.html` — one file per static page
- `data/publications.js` — the complete publication list
- `posts/*.md` + `posts/posts.json` — the blog
- `assets/img/`, `assets/pdf/`, `assets/cas/` — images, PDFs, coordinate files

### Base-path detection (why links always work)

`site.js` works out the site's root URL from its own `<script src>` and stores it
in `window.SITE_BASE`. Because of this, the same files work unchanged whether the
site is served from:

- `https://wongzit.github.io/` (live, root), or
- `https://wongzit.github.io/wongzit-new.github.io/` (test, sub-folder), or
- `http://localhost:8000/` (local preview)

**You never have to adjust paths when copying files between the two repos.** But
you must follow two conventions so your own content stays portable:

- In **`.html` pages**, write internal paths **relative, without a leading
  slash**: `assets/img/x.png`, `cv.html`, `program/pyaroma/`.
- In **Markdown blog posts**, write internal paths **with a leading slash**:
  `/assets/blog/figure1.png`, `/cv.html`. `blog.js` rewrites these onto the
  correct base at render time.

---

## 2. The two repositories

There are two GitHub repositories, and the distinction matters:

| | Live site | Test site |
| --- | --- | --- |
| Folder | `wongzit.github.io` | `wongzit-new.github.io` |
| Repo | `github.com/wongzit/wongzit.github.io` | `github.com/wongzit/wongzit-new.github.io` |
| URL | `https://wongzit.github.io/` | `https://wongzit.github.io/wongzit-new.github.io/` |
| Audience | Everyone (tens of thousands of visitors/month) | You |
| Purpose | Published site | Sandbox for new features and layout experiments |

**Working rule:**

> Build and test every new feature in **`wongzit-new.github.io`** first.
> Touch **`wongzit.github.io`** only when you have decided to publish.

The two repos are *not* automatically synchronised. They deliberately drift:

- The test repo may contain half-finished pages (e.g. `scxrd.html`) and
  verification files (e.g. `googleb2b7e2a4a12ce439.html`) that must **not** be
  copied to live.
- The `?v=` numbers differ between the repos and that is fine — each repo has
  its own counter (§5).

Porting a finished feature to live is described in §8.

---

## 3. Repository map

```
wongzit.github.io/
├── .nojekyll                 ← MUST EXIST. Disables Jekyll on GitHub Pages.
├── GUIDE.md                  ← this file
├── preview.command           ← double-click to preview locally (macOS)
│
├── index.html                ← home: hero, news, latest posts, contact + map
├── cv.html                   ← CV
├── research.html             ← research themes (3 cards) + link to cas.html
├── cas.html                  ← compound gallery (structures, XYZ, CCDC)
├── publications.html         ← papers + reviews, with metrics strip
├── papers.html               ← original papers only
├── reviews.html              ← accounts & reviews only
├── covers.html               ← cover pictures (slideshow)
├── programs.html             ← program index (cards link to program/ pages)
├── teaching.html             ← teaching
├── links.html                ← useful links
├── blog.html                 ← blog index (search + tag filter)
├── post.html                 ← legacy post viewer (?p=slug). Keep for old links.
│
├── data/
│   └── publications.js       ← THE publication list. All 3 pub pages read this.
│
├── posts/
│   ├── posts.json            ← blog index: slug, title, date, tags, summary
│   └── <slug>.md             ← one Markdown file per post
│
├── <slug>/                   ← one folder per post, each containing index.html
│   └── index.html               (this is what makes /my-post/ a clean URL)
├── _post-template/           ← copy this folder to create a new post folder
│   ├── index.html
│   └── README.txt
│
├── program/
│   ├── pyaroma/index.html    ← py.Aroma home
│   ├── pyaroma/{download,citation,license,issue,history}/index.html
│   ├── uvplotter/index.html
│   └── online/molview.html
│
└── assets/
    ├── css/style.css         ← all styling
    ├── js/site.js            ← navbar, footer, theme
    ├── js/blog.js            ← blog engine
    ├── js/pubs.js            ← publications engine
    ├── img/
    │   ├── prof_pic.png      ← your photo (home page)
    │   ├── favicon/          ← favicon.svg + favicon.png
    │   ├── social/dark/*.png ← social icons, dark theme
    │   ├── social/light/*.png← social icons, light theme
    │   ├── pubs/             ← TOC graphics for publications
    │   ├── covers/           ← journal cover artwork
    │   ├── research/         ← concept images on research.html
    │   ├── cas/              ← animated .gif previews for cas.html
    │   └── feat/             ← feature icons on program pages
    ├── pdf/                  ← paper PDFs and ESI PDFs
    ├── cas/                  ← .xyz coordinate files for cas.html
    ├── blog/                 ← figures and files used inside blog posts
    ├── program/              ← program icons
    ├── pyAroma/, pyKinetics/ ← program-page screenshots
```

---

## 4. Anatomy of a page

Every static page follows the same skeleton. Understanding these ~12 lines means
you can create a new page in a minute.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon/favicon.svg">
  <link rel="icon" type="image/png"     href="/assets/img/favicon/favicon.png">
  <title>Page name · Zhe WANG</title>
  <link rel="stylesheet" href="assets/css/style.css?v=14">   <!-- ← version! -->
</head>
<body>
  <div id="site-header"></div>          <!-- navbar is INJECTED here by site.js -->

  <main class="container reading">      <!-- "reading" = narrower text column -->
    <div class="page-head">
      <div class="kicker">// section</div>
      <h1>Page name</h1>
      <p class="lead">日本語サブタイトル</p>
    </div>

    <!-- ========== YOUR CONTENT GOES HERE ========== -->

  </main>

  <div id="site-footer"></div>          <!-- footer is INJECTED here by site.js -->

  <script src="assets/js/site.js?v=14"></script>
</body>
</html>
```

Notes:

- `<div id="site-header">` and `<div id="site-footer">` are **empty on purpose**.
  `site.js` fills them at load time, which is why the menu is identical on every
  page and only needs editing in one place.
- `class="container"` = full width (1080px). `class="container reading"` =
  narrower reading column (900px). Publication pages add
  `style="max-width:900px"`.
- Pages one folder deep (e.g. `program/pyaroma/index.html`) use `../../assets/…`;
  post folders use `../assets/…`. Count the folders.

### Useful building blocks (already styled)

| Markup | Result |
| --- | --- |
| `<div class="card">…</div>` | Elevated panel with border |
| `<span class="tag">text</span>` | Small pill label |
| `<a class="btn" href="…">Go →</a>` | Button-style link |
| `<p class="muted">…</p>` | Dimmed body text |
| `<hr class="divider">` | Horizontal rule |
| `<table class="info-table">` | Two-column date/text table (news, latest posts) |
| `<div class="feature-grid"><div class="feature">…` | Icon + title + description grid |
| `<span class="tech-badge">Python</span>` | Small technology badge |
| `<p class="pub-nav"><a href="…">x</a><span class="sep">/</span>…</p>` | Slash-separated sub-navigation |
| `<iframe class="map-embed" …>` | Google map, auto-tinted in dark mode |

### Creating a brand-new page

1. Copy an existing page with a similar shape (`teaching.html` is the simplest).
2. Rename it, change `<title>` and the `page-head` block, write your content.
3. Add it to the menu in `assets/js/site.js` (§6.2) — otherwise nobody will find it.
4. Bump `?v=` if you also changed CSS or JS (§5).

---

## 5. The `?v=` cache rule

Every reference to `style.css`, `site.js`, `blog.js`, `pubs.js` and
`data/publications.js` ends with a query string:

```html
<link rel="stylesheet" href="assets/css/style.css?v=14">
<script src="assets/js/site.js?v=14"></script>
```

Browsers cache these files aggressively. The `?v=14` is a **cache key**: change
the number and every visitor's browser is forced to download the fresh file.
The number itself has no meaning — only "different from last time" matters.

> ### The rule
>
> **If you edited `style.css`, `site.js`, `blog.js`, `pubs.js` or
> `data/publications.js`, increase `?v=` by one across the whole repository
> before you push.**
>
> If you only edited HTML content or added images, no bump is needed — the HTML
> file itself is not cached the same way.

Bump every file in one command (run inside the repository folder):

```bash
# change 14 → 15 everywhere (adjust the numbers to your current version)
grep -rl '?v=14' --include='*.html' . | xargs sed -i '' 's/?v=14/?v=15/g'
```

On Linux, drop the `''` after `-i`. Verify afterwards:

```bash
grep -roh '?v=[0-9]*' --include='*.html' . | sort | uniq -c
```

You should see **one** number, with a count equal to the number of asset
references (currently 153 in the live repo — most of them are the per-post
`index.html` files). If you see two different numbers,
some pages will load a stale stylesheet — that is exactly the bug the count
check catches.

Current state: live repo is at `?v=14`, test repo at `?v=22`. They are
independent counters; do not try to make them match.

---

## 6. Editing recipes

### 6.1 Home page

Everything on the home page is in **`index.html`**, in clearly-commented blocks.

**Add a news item** — add a row at the *top* of the news table:

```html
<table class="info-table">
  <tr><td>Aug 18, 2026</td><td>Our paper is accepted in <i>JACS</i>.</td></tr>
  <tr><td>Jun 6, 2026</td><td>New page has been released.</td></tr>
  ...
</table>
```

Free-form date text; HTML (`<i>`, `<a>`) is allowed in the second cell.

**Other blocks in `index.html`:**

- *Hero* — your name, alias line, role, and the social button row.
- *Latest posts* — automatic. `renderLatestPosts("home-latest-posts", 3)` at the
  bottom pulls the 3 newest posts. Change `3` to show more.
- *Contact* — postal address and the embedded Google map. To move the map,
  open Google Maps → Share → Embed a map → copy the `src` URL into the
  `<iframe class="map-embed">`.
- *Photo* — replace `assets/img/prof_pic.png`, keep the filename.

### 6.2 Menu, brand name, footer

All three live in the `SITE` object at the very top of **`assets/js/site.js`**.
Edit there once, and every page updates.

```js
const SITE = {
  logo: "/assets/img/favicon.png",
  brandText: 'Zhe <strong>WANG</strong><span class="brand-phd">, Ph.D.</span>',

  nav: [
    { label: "home",     href: "/" },
    { label: "cv",       href: "/cv.html" },
    { label: "research", href: "/research.html" },
    {
      label: "publications", href: "/publications.html",
      children: [                                  // ← makes it a dropdown
        { label: "all publications",   href: "/publications.html" },
        { label: "original papers",    href: "/papers.html" },
        { label: "accounts & reviews", href: "/reviews.html" },
        { label: "cover pictures",     href: "/covers.html" },
      ],
    },
    ...
  ],

  footerQuote: "Unless we change directions, we will end up where we are headed.",
  footerLine: 'Zhe <b>WANG</b>, <i>Ph.D.</i>, The University of Osaka.',
};
```

- **Add a menu item:** add `{ label: "talks", href: "/talks.html" },` in the
  position you want. Menu order = array order.
- **Make a dropdown:** add a `children: [...]` array.
- **Paths here start with `/`** (root-relative). `site.js` converts them with
  `siteUrl()`, so they work from inside blog-post folders too. This is the one
  place where a leading slash is correct.
- The current page is highlighted automatically — no `class="active"` to
  maintain.
- After editing `site.js`, **bump `?v=`** (§5).

### 6.3 Colors, fonts, theme

Open **`assets/css/style.css`**. Lines 27–70 hold every color the site uses:

```css
:root {                          /* DARK theme (the default) */
  --accent:      #38e1c4;        /* teal — links, highlights, cursor glow */
  --accent-2:    #6aa9ff;
  --accent-soft: rgba(56, 225, 196, 0.14);
  --bg:          #0d1117;        /* page background */
  --bg-elev:     #161b22;        /* cards */
  --text:        #e6edf3;
  --text-dim:    #9aa7b5;
  ...
}

[data-theme="light"] {           /* LIGHT theme */
  --accent:      #0284c7;        /* ocean blue */
  --accent-soft: rgba(2, 132, 199, 0.13);
  --bg:          #f7f8fa;
  ...
}
```

The two themes are deliberately different accents: **teal in dark mode, ocean
blue in light mode**. If you change `--accent`, change `--accent-soft` to the
same hue (it is the same color at ~13% opacity, used for the cursor halo and
hover backgrounds).

Also in `:root`: `--radius` (corner rounding), `--maxw` / `--maxw-read` (page
widths), `--font-sans` / `--font-mono`.

Dark is the default; the visitor's choice is remembered in `localStorage`, so
after changing the theme in your browser you may need to click the ☀️/🌙 toggle
to see the other one.

The rest of the file is organised in clearly-labelled sections (navbar, cards,
compound gallery, publications, cover slideshow, program pages, blog, footer,
responsive). You rarely need to go there.

**After editing CSS, bump `?v=`** (§5).

### 6.4 Publications

All three publication pages read one file: **`data/publications.js`**. The
`"type"` field decides which page an entry appears on.

| `type` | Appears on |
| --- | --- |
| `"paper"` | `publications.html`, `papers.html` |
| `"review"` | `publications.html`, `reviews.html` |
| `"cover"` | `covers.html` |

The file is plain JavaScript data:

```js
window.PUBLICATIONS = [      // ← keep this first line
  { ...entry... },
  { ...entry... }
];                            // ← keep this last line
```

**Full field reference for a paper or review:**

```js
{
  "type": "paper",
  "year": 2026,
  "title": "Controlling through-space spin coupling in helical diradicaloids",
  "authors": "<span class=\"me\">Zhe Wang</span><sup>*</sup>, Tadashi Mori<sup>*</sup>",
  "venue": "<i>J. Am. Chem. Soc.</i>, <b>2026</b>, <i>148</i>, 20974–20984.",
  "image": "assets/img/pubs/wang2026controlling.png",
  "doi": "10.1021/jacs.6b01234",
  "links": {
    "DOI":      "https://doi.org/10.1021/jacs.6b01234",
    "HTML":     "https://pubs.acs.org/doi/10.1021/...",
    "PREPRINT": "https://doi.org/10.26434/chemrxiv...",
    "PDF":      "https://wongzit.github.io/assets/pdf/wang2026.pdf",
    "ESI":      "https://wongzit.github.io/assets/pdf/wang2026_esi.pdf",
    "CODE":     "https://github.com/...",
    "SI":       "https://..."
  },
  "abstract": "Shown when a reader clicks ABS.",
  "bibtex": "@article{wang2026, title={...}, year={2026} }"
}
```

Field by field:

- **`year`** — a number, not a string. Entries are grouped by year automatically
  (newest first), the large faded year number is drawn once per group, and the
  "List by Year" links are generated for you.
- **`title`** — HTML allowed (`<i>`, `<sub>`, `<sup>`) for italicised locants
  such as `fluoreno[3,4-<i>c</i>]fluorene`.
- **`authors`** — HTML string. Wrap your own name in
  `<span class="me">Zhe Wang</span>` to underline it; use `<sup>*</sup>` for the
  corresponding-author star. Because the file is JavaScript, inner double quotes
  must be escaped: `\"me\"`.
- **`venue`** — HTML string, following the house style:
  `<i>` = journal name and volume, `<b>` = year, plain text = page numbers
  (page numbers stay upright, not italic).
- **`image`** — TOC graphic in `assets/img/pubs/`. Any aspect ratio; it is shown
  at its natural proportions and enlarges in a lightbox when clicked.
- **`doi`** — the bare DOI (no `https://doi.org/`). Supplying it turns on the
  Altmetric doughnut and Dimensions citation badge. Leave it `""` to hide both
  (preprints usually should).
- **`links`** — see below.
- **`abstract`** / **`bibtex`** — optional; each adds a toggle button that
  expands a panel in place.

**Buttons.** One button is generated per entry in `links`, in this fixed order:

```
DOI · ABS · BIB · HTML · PREPRINT · PDF · ESI · CODE · SI · (any custom key)
```

- `ABS` appears only if you supplied `"abstract"`; `BIB` only if `"bibtex"`.
- Every other button appears **only if that key exists in `links`**. Papers
  without supporting information simply get no `ESI` button — nothing to switch
  off.
- Any key you invent (e.g. `"DATA"`, `"VIDEO"`) is rendered after the known ones
  with the key name as its label. No code change needed.
- The order is defined by `BTN_ORDER` in `assets/js/pubs.js`; to reorder or add
  a permanent new button type, edit that array **and** the matching array in
  `pubButtons()` a few lines below.

**Adding a PDF or ESI file:** put the file in `assets/pdf/` and point the link
at it. Both a relative path (`assets/pdf/x.pdf`) and a full URL
(`https://wongzit.github.io/assets/pdf/x.pdf`) work; the existing entries use
full URLs so that the test site links to the live PDFs instead of needing its
own copies.

**Cover entries** need far fewer fields, because the covers page is a slideshow:

```js
{
  "type": "cover",
  "year": 2023,
  "title": "Energetically More Stable Singlet Cyclopentane-1,3-diyl Diradical…",
  "caption": "<i>J. Am. Chem. Soc.</i>, <b>2023</b>, <i>145</i>, 27089–27094.",
  "image": "assets/img/covers/jacs-2023.png"
}
```

Artwork goes in `assets/img/covers/` (portrait images look best). `caption` is
the line under the cover; if omitted, `venue` is used. Visitors navigate with
the arrows, dots or ← → keys, and click a cover to enlarge it.

> ⚠️ **Comma rule.** Every entry needs a comma after its closing `}` **except
> the last one**. A stray or missing comma blanks the whole publications page.
> If the page goes blank, this is the first thing to check — open the browser
> console (⌥⌘I on macOS) and you will see the syntax error and its line number.
> You can also check from the terminal: `node --check data/publications.js`.

**After editing `data/publications.js`, bump `?v=`** (§5).

### 6.5 The metrics strip

`publications.html` shows four cards above the list: publications, h-index,
i10-index, citations.

```html
<div class="pub-metrics">
  <div class="pub-metric"><div class="pub-metric__n" id="m-pubs">—</div><div class="pub-metric__l">publications</div></div>
  <div class="pub-metric"><div class="pub-metric__n">9</div><div class="pub-metric__l">h-index</div></div>
  <div class="pub-metric"><div class="pub-metric__n">9</div><div class="pub-metric__l">i10-index</div></div>
  <div class="pub-metric"><div class="pub-metric__n">197</div><div class="pub-metric__l">citations</div></div>
</div>
<p class="pub-metrics__note">Updated 2026-07-24 · source:
  <a href="https://scholar.google.com/citations?user=gzUh6CMAAAAJ">Google Scholar</a></p>
```

- **publications** fills itself. `pubs.js` writes the number of rendered entries
  into `id="m-pubs"`. Leave the `—` placeholder alone.
- **h-index / i10-index / citations are manual.** Google Scholar has no public
  API, so these numbers have to be typed in by hand. Open your Scholar profile,
  copy the three numbers, and update the `Updated YYYY-MM-DD` date in the note
  below. Doing this two or three times a year is enough.
- To add another card, copy one `<div class="pub-metric">` block and change the
  number and label.

### 6.6 Blog posts

Posts are Markdown files rendered in the browser. Each post has a clean URL of
the form `https://wongzit.github.io/<slug>/`, which preserves the URL style of
the old site so existing links and search results keep working.

The **slug** is the identifier: lowercase, hyphen-separated, no spaces.
Example: `my-new-method`.

#### Publishing a post — three steps

**Step 1 — write the article.**
Create `posts/my-new-method.md` and write Markdown. Copy any existing post as a
starting point.

**Step 2 — create its folder (this is what makes the clean URL).**
Duplicate the `_post-template` folder and rename the copy to the slug:

```
_post-template/  →  my-new-method/
```

You do **not** edit the `index.html` inside it. That file reads the folder name
from the URL and loads the matching Markdown. You may delete the `README.txt`
from your copy.

**Step 3 — list it.**
Add an entry at the **top** of `posts/posts.json`:

```json
[
  {
    "slug": "my-new-method",
    "title": "My New Method",
    "date": "2026-08-18",
    "tags": ["tutorial", "Gaussian"],
    "summary": "One sentence shown on the blog index."
  },
  ... existing entries ...
]
```

- `slug` must match **both** `posts/my-new-method.md` **and** the folder
  `my-new-method/`. A mismatch produces "this post could not be found".
- `date` must be `YYYY-MM-DD`. Sorting is by this string, newest first.
- `tags` become clickable filter chips on the blog page. Reuse existing tag
  names so the filter list stays short.
- `summary` is optional but recommended.
- Same comma rule as publications: comma after every entry except the last.
  `posts.json` is strict JSON — **no trailing commas, no comments, double quotes
  only.**

That is all. The post appears at `/my-new-method/`, on `blog.html`, in the tag
filters, and in "Latest posts" on the home page.

#### What you can write in a post

| Feature | Syntax |
| --- | --- |
| Headings | `## Section`, `### Subsection` |
| Emphasis | `**bold**`, `*italic*` |
| Link | `[text](https://example.com)` |
| Internal link | `[my CV](/cv.html)` — **leading slash** |
| Image | `![caption](/assets/blog/figure1.png)` — **leading slash** |
| Code | ```` ```python … ``` ```` — syntax-highlighted (highlight.js) |
| Table | standard Markdown pipe tables |
| Inline math | `$E = mc^2$` |
| Display math | `$$ \Delta G^\ddagger = \dots $$` |

Math is rendered with KaTeX. `blog.js` pulls math out of the text *before*
Markdown runs and puts it back afterwards, so underscores and asterisks inside
equations are safe. `\[ … \]` and `\( … \)` also work. A `$` inside a code block
is left alone.

Put figures and downloadable files in `assets/blog/`.

An optional YAML front-matter block (`--- … ---`) at the top of the file is
stripped and ignored — metadata comes from `posts.json`.

#### Deleting or renaming a post

Delete/rename all three pieces: the `.md` file, the slug folder, and the
`posts.json` entry. If you rename, the old URL breaks — the legacy
`post.html?p=old-slug` form still works for very old inbound links.

### 6.7 Simple content pages

`cv.html`, `research.html`, `teaching.html`, `links.html`, `programs.html` are
hand-written HTML with no engine behind them. Open the file, find the commented
block, edit the text.

- **`cv.html`** — sections (`<h2>`) with `<table class="info-table">` rows for
  appointments, education, awards.
- **`research.html`** — one `<div class="card">` per theme, each with a
  `<span class="tag">` label, `<h3>` title, `<img class="res-img">` concept
  figure (`assets/img/research/`) and a `<p class="muted">` description. Copy a
  card to add a theme; give it a unique `id`.
- **`teaching.html`**, **`links.html`** — `<div class="card">` blocks; copy one.
- **`programs.html`** — one `<section class="card" id="…">` per program. The
  `id` lets the navbar's "scripts" dropdown item jump straight to
  `programs.html#scripts`.

Every `<img>` on these pages carries an `onerror` attribute that hides it
gracefully if the file is missing — so a broken path fails quietly rather than
showing a broken-image icon. Convenient, but it also means a typo'd path is
invisible: check that your image actually appears.

### 6.8 The compound gallery

`cas.html` shows compounds from the publications as a grid of cards. Each card
is one self-contained block:

```html
<div class="cas-card">
  <span class="cas-badge xrd">SCXRD</span>          <!-- or: calc → QM -->
  <img class="cas-card__img" src="assets/img/cas/compound-1.gif"
       alt="Crystal structure animation" onerror="this.style.opacity=.25">
  <div class="cas-card__body">
    <p class="cas-card__name">Compound name / label</p>
    <p class="cas-card__meta">CAS 000000-00-0</p>
    <div class="cas-card__links">
      <a href="assets/cas/compound-1.xyz" download>XYZ</a>
      <a href="https://www.ccdc.cam.ac.uk/structures/Search?Ccdcid=0000000" target="_blank" rel="noopener">CCDC</a>
      <a href="#" target="_blank" rel="noopener">DOI</a>
    </div>
  </div>
</div>
```

- **Badge:** `class="cas-badge xrd"` (teal) for a single-crystal structure,
  `class="cas-badge calc"` (blue) for a QM-optimised structure. Change the text
  inside to match (`SCXRD` / `QM`).
- **Preview:** an animated `.gif` (e.g. a rotating molecule) in
  `assets/img/cas/`.
- **XYZ button:** put the Cartesian-coordinate file in `assets/cas/<name>.xyz`.
  The `download` attribute makes the browser save it rather than display it.
- **CCDC / DOI:** plain links; delete the line if not applicable.

Add a compound by copying a whole `<div class="cas-card">` block inside
`<div class="cas-grid">`.

### 6.9 Program pages

`program/pyaroma/` is the most elaborate page set and a good template for a new
program:

- `index.html` — hero pill with version/build number, tagline, sub-navigation,
  banner image, feature grid, "Built with" badges, citation card, contributors,
  disclaimer.
- `download/`, `citation/`, `license/`, `issue/`, `history/` — sub-pages, each
  linked from the same sub-navigation row (`<p class="pub-nav">`), with the
  `class="active"` moved to the current page.

To release a new version: update the version/build text in the hero pill of
`program/pyaroma/index.html`, add the download link on the download page, and
add an entry to the history page.

Because these pages sit two folders deep, their asset paths start with `../../`.

Feature icons come from `assets/img/feat/<name>.png`; if a file is missing, the
emoji in the `onerror` attribute is shown instead.

### 6.10 Social icons and favicon

The home-page social buttons swap their icon with the theme. Each needs **two**
files with the *same name*:

```
assets/img/social/dark/<name>.png     ← shown in dark mode
assets/img/social/light/<name>.png    ← shown in light mode
```

`<name>` is the `data-icon` value on the button in `index.html`. Current names:
`email, blsk, x, github, orcid, scholar, researchgate, scopus, uosaka`.

To add a network: add both PNGs, then add a button to the `.socials` block:

```html
<a href="https://..." title="Mastodon">
  <img class="social-icon" data-icon="mastodon" alt="Mastodon" onerror="this.outerHTML='MA'"></a>
```

The `onerror` text is the fallback if the image is missing.

**Favicon:** `assets/img/favicon/favicon.svg` (preferred) and `favicon.png`
(fallback), referenced from the `<head>` of every page. The navbar logo is a
separate file set in `SITE.logo` in `site.js`.

---

## 7. Previewing on your own computer

**Double-click `preview.command`.** It starts a local web server and opens
<http://localhost:8000>. Keep the small Terminal window open while browsing;
close it or press Ctrl-C when done.

The first time, macOS may block it: right-click the file → **Open** → **Open**.

Equivalent from a terminal, inside the repository folder:

```bash
python3 -m http.server 8000
```

**Why a server is necessary.** The blog reads Markdown files with JavaScript
(`fetch`), and browsers block that when a page is opened directly from disk
(a `file://` address). Opening `blog.html` by double-clicking it shows a
friendly explanation instead of posts. Publication and static pages happen to
work either way, but preview everything through `localhost` so what you see
matches the live site.

**Always preview before pushing**, especially after editing
`data/publications.js` or `posts/posts.json`.

Sanity checks worth running before a push:

```bash
node --check data/publications.js      # publication list is valid JS
node --check assets/js/pubs.js         # engine file is valid JS
python3 -m json.tool posts/posts.json > /dev/null   # blog index is valid JSON
ls .nojekyll                           # Jekyll is still disabled
grep -roh '?v=[0-9]*' --include='*.html' . | sort | uniq -c   # one version only
```

---

## 8. Publishing workflow

### Everyday change (content only, low risk)

Adding a news line, a publication or a blog post can go straight to live:

```bash
cd ~/wongzit.github.io
# ...edit files...
python3 -m http.server 8000        # preview, then Ctrl-C
git add -A
git commit -m "Add JACS 2026 paper"
git push
```

GitHub Pages redeploys in roughly 30–60 seconds. If a page looks unchanged
afterwards, it is nearly always browser caching — hard-reload (⇧⌘R) or check
that you bumped `?v=`.

### New feature (layout, CSS, JS — always via the test site)

1. **Build it in the test repo.**

   ```bash
   cd ~/wongzit-new.github.io
   # ...edit, preview at localhost:8000...
   git add -A && git commit -m "Add ESI button" && git push
   ```

2. **Check it on the test URL:**
   `https://wongzit.github.io/wongzit-new.github.io/`

3. **Port only the finished pieces to live.** Do not copy the whole folder —
   the two repos contain deliberately different files. Copy the specific files
   the feature touched, or re-apply the same edit by hand:

   ```bash
   cp ~/wongzit-new.github.io/assets/js/pubs.js  ~/wongzit.github.io/assets/js/
   ```

   Files that must **never** be copied test → live: `googleb2b7e2a4a12ce439.html`
   (site-verification file), any unfinished page (e.g. `scxrd.html`), and the
   test repo's `?v=` numbers.

4. **Bump the live version** (§5) if the port touched CSS or JS.

5. **Preview live locally**, then push:

   ```bash
   cd ~/wongzit.github.io
   python3 -m http.server 8000     # check the affected pages
   git add -A && git commit -m "Port ESI button from test site" && git push
   ```

6. **Verify on the real URL** after a minute, with a hard reload.

### If something goes wrong on live

Static sites are trivially revertible:

```bash
git log --oneline -5          # find the last good commit
git revert <bad-commit>       # undo it as a new commit
git push
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Publications page is blank | Syntax error in `data/publications.js` (usually a comma) | `node --check data/publications.js`; open browser console for the line number |
| Blog page is blank or "No posts" | Invalid `posts/posts.json` | `python3 -m json.tool posts/posts.json` |
| Blog shows "one step to preview locally" | You opened the file with `file://` | Use `preview.command` / `localhost:8000` |
| A single post says "could not be found" | `slug`, `.md` filename and folder name disagree | Make all three identical |
| Changes not visible after push | Browser cached the old CSS/JS | Bump `?v=` (§5), then hard-reload (⇧⌘R) |
| Some pages styled, others not | Mixed `?v=` numbers | `grep -roh '?v=[0-9]*' --include='*.html' .` — should be one value |
| GitHub emails a Jekyll build failure | `.nojekyll` missing | Restore the empty `.nojekyll` at the repo root and push |
| Image missing but no broken icon | `onerror` hid it | Check the path and the actual filename case |
| Math renders as literal `$…$` | KaTeX script failed to load, or `$` mismatched | Check the console; make sure delimiters are paired |
| Menu item not highlighted | `href` in `site.js` doesn't match the filename | Use the exact filename, root-relative (`/talks.html`) |
| Links break in the test site only | Path written with a leading slash in an `.html` page | Use relative paths in HTML; leading slashes only in Markdown and in `site.js` nav |

---

## 10. Quick reference card

**Where do I change…**

| Thing | File |
| --- | --- |
| Name, menu, dropdowns, footer, logo | `assets/js/site.js` (top) |
| Colors, fonts, page width, corners | `assets/css/style.css` (lines 27–70) |
| News, hero, photo, address, map | `index.html` |
| Any publication, review or cover | `data/publications.js` |
| h-index / i10 / citations / update date | `publications.html` (metrics strip) |
| A blog post | `posts/<slug>.md` + `<slug>/` folder + `posts/posts.json` |
| Research themes | `research.html` |
| Compounds, XYZ files, CCDC links | `cas.html` + `assets/cas/` + `assets/img/cas/` |
| Programs | `programs.html`, `program/<name>/index.html` |
| CV, teaching, links | `cv.html`, `teaching.html`, `links.html` |
| Button order on publications | `BTN_ORDER` in `assets/js/pubs.js` |

**Non-negotiable rules**

1. `.nojekyll` must exist at the repo root.
2. Bump `?v=` everywhere after editing CSS/JS/`publications.js`.
3. Comma after every entry except the last, in `publications.js` and `posts.json`.
4. Relative paths in `.html`; leading-slash paths in Markdown posts and in
   `site.js` nav.
5. A blog post is three things: `.md` file, slug folder, `posts.json` entry.
6. Test new features in `wongzit-new.github.io` first; publish to
   `wongzit.github.io` deliberately.
7. Preview at `localhost:8000` before every push.
