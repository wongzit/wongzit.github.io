#!/usr/bin/env python3
"""
make_sitemap.py — rebuilds sitemap.xml for https://wongzit.github.io/

Run it from the repository folder after adding, renaming or deleting a page,
a blog post or a news story:

    python3 tools/make_sitemap.py

It lists every public page automatically:
  • the .html pages in the top folder (index.html becomes the site root)
  • every blog post in posts/posts.json that has its <slug>/ folder
  • the program pages under program/
  • news stories (news items with an "id" and a "body") in data/news.js
"lastmod" is the date of the file's last git commit (today if it has
uncommitted changes). Only the Python standard library and git are needed.
"""
import datetime, json, os, pathlib, re, subprocess, urllib.parse
from xml.sax.saxutils import escape

BASE = "https://wongzit.github.io/"
ROOT = pathlib.Path(__file__).resolve().parent.parent

# Pages that must not be listed: error page, legacy viewer, Google verification file.
EXCLUDE = {"404.html", "post.html", "googleb2b7e2a4a12ce439.html"}
# News stories that are only examples.
EXCLUDE_STORIES = {"example-story"}

TODAY = datetime.date.today().isoformat()


def git(*args):
    try:
        env = dict(os.environ, GIT_OPTIONAL_LOCKS="0")       # read-only: never writes .git/index.lock
        return subprocess.run(["git", *args], cwd=ROOT, env=env, capture_output=True, text=True, check=True).stdout.strip()
    except Exception:
        return ""


DIRTY = {line[3:].strip().strip('"') for line in git("status", "--porcelain").splitlines()}


def lastmod(*paths):
    """Newest last-commit date of the given files; today if any has uncommitted changes."""
    dates = []
    for p in paths:
        rel = str(pathlib.Path(p).relative_to(ROOT))
        if rel in DIRTY or any(rel.startswith(d.rstrip("/") + "/") for d in DIRTY if d.endswith("/")):
            dates.append(TODAY)
        else:
            dates.append(git("log", "-1", "--format=%cs", "--", rel) or TODAY)
    return max(dates)


def url(path):
    return BASE + urllib.parse.quote(path, safe="/()-._~?=&")


entries = []  # (loc, lastmod)

# 1) top-level pages
for f in sorted(ROOT.glob("*.html")):
    if f.name in EXCLUDE:
        continue
    loc = BASE if f.name == "index.html" else url(f.name)
    entries.append((loc, lastmod(f)))
entries.sort(key=lambda e: (e[0] != BASE, e[0]))          # home page first

# 2) blog posts (clean URLs: /<slug>/)
posts = json.loads((ROOT / "posts" / "posts.json").read_text(encoding="utf-8"))
for p in sorted(posts, key=lambda p: p.get("date", ""), reverse=True):
    folder, md = ROOT / p["slug"] / "index.html", ROOT / "posts" / f"{p['slug']}.md"
    if folder.exists() and md.exists():
        entries.append((url(p["slug"] + "/"), lastmod(md, folder)))

# 3) program pages
for f in sorted((ROOT / "program").rglob("*.html")):
    rel = f.relative_to(ROOT).as_posix()
    entries.append((url(rel[: -len("index.html")] if f.name == "index.html" else rel), lastmod(f)))

# 4) news stories (items with an id and a body)
news_file = ROOT / "data" / "news.js"
if news_file.exists():
    text = news_file.read_text(encoding="utf-8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)        # skip the instructions comment
    for m in re.finditer(r'\{\s*date:\s*"(\d{4}-\d{2}-\d{2})",\s*id:\s*"([^"]+)"[^}]*?body:', text, re.S):
        date, sid = m.groups()
        if sid not in EXCLUDE_STORIES:
            entries.append((url(f"news.html?id={sid}"), date))

xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, mod in entries:
    xml.append(f"  <url><loc>{escape(loc)}</loc><lastmod>{mod}</lastmod></url>")
xml.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(xml) + "\n", encoding="utf-8")
print(f"sitemap.xml: {len(entries)} pages")
