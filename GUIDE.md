# How to edit your website

This site is plain HTML + Markdown — no build step. To update it you edit a
file and push it to GitHub; GitHub Pages serves it as-is.

---

## Moving from the test repo to your main site

You can develop in `wongzit-new.github.io` (URLs look like
`wongzit.github.io/wongzit-new.github.io/…`) and, when ready, copy **all** the
files into your `wongzit.github.io` repo. **No code changes are needed** — the
site detects whether it's running in a sub-folder or at the root and fixes every
link, blog URL, image and data path automatically. Once at the root, your posts
are back at `wongzit.github.io/<slug>/`, matching your old links.

Two small rules when YOU add content so it stays portable:

- In **blog posts** (Markdown), write internal paths with a leading slash, e.g.
  `/assets/img/figure.png` or `/cv.html`. The engine re-points them correctly.
- In the **static pages** (`.html` files), use relative paths *without* a
  leading slash, e.g. `assets/img/x.png` or `cv.html` (the placeholders already
  do this — just follow the existing style).

---

## The 30-second mental model

| What you want to change            | File to edit                          |
| ---------------------------------- | ------------------------------------- |
| Your name, the menu, social links, footer | `assets/js/site.js` (top of file) |
| Colors and fonts                   | `assets/css/style.css` (top of file)  |
| Home page text / news              | `index.html`                          |
| CV                                 | `cv.html`                             |
| Research                           | `research.html`                       |
| Publications                       | `publications.html`                   |
| **Publications / reviews / covers** | `data/publications.js` (one file)  |
| Programs                           | `programs.html`                       |
| Teaching                           | `teaching.html`                       |
| Links                              | `links.html`                          |
| **Add / edit a blog post**         | `posts/` folder + `posts/posts.json`  |

In every `.html` file, the parts you edit are marked with a comment like:

```html
<!-- ==== EDIT YOUR CONTENT HERE ==== -->
```

You never touch the `<head>` or the `<script>` lines at the bottom.

---

## ✍️ Adding a new blog post (the important one)

Each post gets a clean URL like `https://wongzit.github.io/my-new-method/`
(the same style your old site used, so bookmarks and search results keep
working). Publishing one is three small steps. Say the post is *"My New Method"*
with slug `my-new-method` (lowercase, hyphens, no spaces — this becomes the URL).

**Step 1 — write the post.**
Create `posts/my-new-method.md` and write in Markdown. You can copy
`posts/welcome.md` as a template — it shows every feature (headings, lists,
images, code, tables, math).

**Step 2 — give it its page (this creates the clean URL).**
Duplicate the `_post-template` folder and rename the copy to your slug, so you
have a folder `my-new-method/` containing `index.html`. You do **not** edit that
`index.html` — it automatically shows the post whose slug matches the folder
name. (There's a `README.txt` inside `_post-template` with the same reminder.)

**Step 3 — list it.**
Open `posts/posts.json` and add an entry at the **top** of the list:

```json
[
  {
    "slug": "my-new-method",
    "title": "My New Method",
    "date": "2026-06-02",
    "tags": ["chemistry", "tutorial"],
    "summary": "One sentence shown on the blog index."
  },
  ... existing posts below ...
]
```

- `slug` must match **both** the Markdown filename (`posts/my-new-method.md`)
  **and** the folder name (`my-new-method/`).
- `date` must be `YYYY-MM-DD` (this is how posts are sorted, newest first).
- `tags` become clickable filters on the blog page. Use as many or few as you like.

That's it. The post is live at `/my-new-method/` and appears on the blog page,
in the tag filters, and in "Latest posts" on the home page — all automatically.

> ⚠️ Watch the commas in `posts.json`: every entry needs a comma after it
> **except the last one**. If the blog page goes blank, a missing or extra
> comma is almost always the cause.

### What you can write in a post

- **Headings:** `## Section`, `### Subsection`
- **Bold / italic:** `**bold**`, `*italic*`
- **Links:** `[text](https://...)`
- **Images:** put the file in `assets/img/` then `![caption](/assets/img/file.png)`
  (start the path with `/` so it works from the post's URL folder)
- **Code:** fence it with triple backticks and a language for highlighting:
  <pre>```python
  print("hi")
  ```</pre>
- **Tables:** standard Markdown tables.
- **Math:** `$E = mc^2$` for inline, `$$ ... $$` for a centered equation
  (rendered with KaTeX — great for chemistry/physics).

---

## 📚 Adding a publication

All three publication pages — **original papers** (`publications.html`),
**accounts & reviews** (`reviews.html`) and **cover pictures** (`covers.html`)
— read from one file: `data/publications.js`. You only edit that file.

Open `data/publications.js`. Keep the first line `window.PUBLICATIONS = [` and
the final `];` untouched — just edit the list of `{ ... }` entries between them.
Add a new object to the list. The pages group entries by year automatically
(newest first), draw the big faded year number once per year, and build the
"List by Year" links for you.

```json
{
  "type": "paper",                          // "paper" | "review" | "cover"
  "year": 2026,
  "title": "Your paper title",
  "authors": "A. Author, <span class=\"me\">Zhe Wang</span>, C. Coauthor<sup>*</sup>",
  "venue": "<i>J. Am. Chem. Soc.</i>, <b>2026</b>, <i>148</i>, 20974–20984.",
  // In "venue": <i>…</i> = italic (journal & volume), <b>…</b> = bold year,
  // plain text (e.g. page numbers) stays upright.
  "image": "assets/img/pubs/my-toc.png",   // TOC graphic, shown on the left
  "doi": "10.1021/jacs.xxxxx",             // optional: enables Altmetric + citation badges
  "links": {
    "DOI": "https://doi.org/10.1021/...",
    "HTML": "https://...",
    "PREPRINT": "https://...",
    "PDF": "assets/pdf/mypaper.pdf"
  },
  "abstract": "Shown when a reader clicks the ABS button.",
  "bibtex": "@article{key, ... }"
}
```

Notes:

- **`type`** decides which page it appears on. `paper` → publications,
  `review` → reviews, `cover` → covers.
- **`authors`**: wrap your own name in `<span class="me">Zhe Wang</span>` to
  underline it, and use `<sup>*</sup>` for the corresponding-author star.
- **TOC image**: drop the graphic in `assets/img/pubs/` and point `image` to it.
- **Buttons** appear automatically for every link you list, plus **ABS** if you
  give an `abstract` and **BIB** if you give a `bibtex` (these expand in place).
- **Badges**: the Altmetric "doughnut" and citation count appear only when you
  supply a real `doi`. Leave `doi` empty (`""`) to hide them.
- Same comma rule as the blog: comma after every entry **except the last**.

### Cover pictures (`"type": "cover"`)

The covers page is a slideshow, not a detail list, so a cover entry only needs a
few fields — the image and a one-line caption:

```json
{
  "type": "cover",
  "year": 2026,
  "title": "Journal cover — short description",
  "caption": "<i>J. Am. Chem. Soc.</i>, p. 20974",
  "image": "assets/img/covers/jacs-2026.png"
}
```

- Put the cover artwork in `assets/img/covers/` and point `image` to it
  (portrait images look best).
- **`caption`** is the line shown under the cover — typically the journal name
  (in `<i>…</i>`) and page number. If you omit `caption`, the `venue` line is
  used instead.
- Covers are sorted newest-first; visitors slide between them with the arrows,
  dots, or ← → keys, and click a cover to enlarge it.

---

## Changing the menu or your name

Open `assets/js/site.js`. Near the top is a `SITE` object. To add a page to the
menu, add a line to the `nav` list:

```js
{ label: "talks", href: "talks.html" },
```

Then create `talks.html` (copy any existing page like `links.html` as a starting
point). Your social links and footer text live in the same `SITE` object.

---

## Social media icons (dark / light)

The social buttons on the home page swap their icon with the theme. Each needs
two image files with the **same name** in two folders:

```
assets/img/social/dark/<name>.png    ← used in dark mode
assets/img/social/light/<name>.png   ← used in light mode
```

The `<name>` matches the `data-icon="…"` on each button in `index.html`. The
current names are: `email, blsk, x, github, orcid, scholar, researchgate,
scopus`. Drop both versions in and they switch automatically — no code changes.
If a file is missing, the button falls back to a short text label.

---

## Changing colors

Open `assets/css/style.css`. The very top has a `:root { ... }` block with the
dark-theme colors and a `[data-theme="light"] { ... }` block for light mode.
Change `--accent` to recolor links/highlights across the whole site. You don't
need to read the rest of the file.

---

## Previewing locally

**Double-click `preview.command`** in this folder. It opens the whole site —
including the blog — in your browser at <http://localhost:8000>. Keep that
little Terminal window open while you browse; close it when you're done.

Why this is needed: the blog reads your Markdown posts with JavaScript, and
browsers block that when you open a file directly from disk (a `file://`
address). The publications and other pages work either way, but the blog needs
to be served. `preview.command` does that for you in one click.

> The first time, macOS may ask permission to run it: right-click the file →
> **Open** → **Open**. After that a double-click is enough.

(If you prefer the terminal: `python3 -m http.server 8000` in this folder does
the same thing.)

**On your live site this is a non-issue** — once you push to GitHub Pages,
everything works with no setup.

---

## Files you can ignore

`assets/js/site.js`, `assets/js/blog.js`, `assets/css/style.css`, `post.html`
and `.nojekyll` are the machinery. You'll rarely need to open them beyond the
clearly-marked settings at the top.
