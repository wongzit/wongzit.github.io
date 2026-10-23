/* ==========================================================================
   news.js — shows the items from data/news.js.
     renderNews("home-news", 5)   home page: the 5 newest, as table rows
     renderNewsPage("news-list")  news.html: everything, grouped by year —
                                  or one story, when the address is
                                  news.html?id=<id>
   You never need to edit this file; edit data/news.js instead.
   ========================================================================== */

const NEWS_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Newest first. Items with the same date keep their order in the file.
function newsItems() {
  if (!Array.isArray(window.NEWS)) {
    throw new Error("data/news.js did not load. Check it is included and has no syntax error.");
  }
  return window.NEWS.map((n, i) => ({ ...n, i, id: newsId(n) }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.i - b.i);
}

// A story (an item with a "body") gets its own address: news.html?id=<id>.
// Uses the item's "id" if given, otherwise date + title, e.g. "2026-10-23-example-story".
function newsId(n) {
  if (n.id) return String(n.id);
  const title = String(n.title || n.text || "").replace(/<[^>]+>/g, "");
  let slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (!slug) {                                   // e.g. a Japanese-only title: use a short code instead
    let h = 5381; for (const c of title) h = ((h * 33) ^ c.codePointAt(0)) >>> 0;
    slug = h.toString(36);
  }
  return `${n.date}-${slug}`;
}

const isStory = n => n.body != null && String(n.body).trim() !== "";
const storyUrl = n => `news.html?id=${encodeURIComponent(n.id)}`;

// "2026-10-13" → "Oct 13, 2026"
function newsDate(d) {
  const [y, m, day] = String(d).split("-").map(Number);
  return m ? `${NEWS_MONTHS[m - 1]} ${day ? day + ", " : ""}${y}` : String(d);
}

function newsRow(n) {
  const label = isStory(n)
    ? `<a class="news-story-link" href="${storyUrl(n)}">${n.title || n.text}</a>`
    : (n.text || n.title || "");
  return `<tr><td>${newsDate(n.date)}</td><td>${label}</td></tr>`;
}

function renderNews(targetId, limit) {
  const el = document.getElementById(targetId);
  if (!el) return;
  try {
    el.innerHTML = newsItems().slice(0, limit || Infinity).map(newsRow).join("");
  } catch (e) {
    el.innerHTML = `<tr><td></td><td class="muted">${e.message}</td></tr>`;
  }
}

function renderNewsPage(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  let items;
  try { items = newsItems(); }
  catch (e) { el.innerHTML = `<p class="muted">${e.message}</p>`; return; }

  const wanted = new URLSearchParams(location.search).get("id");
  if (wanted) return renderNewsStory(el, items.find(n => n.id === wanted && isStory(n)));

  if (!items.length) { el.innerHTML = `<p class="muted">No news yet.</p>`; return; }
  const years = [...new Set(items.map(n => String(n.date).slice(0, 4)))];
  el.innerHTML = years.map(y => `
    <div class="pub-group" id="y${y}">
      <span class="pub-year-mark">${y}</span>
      <table class="info-table">${items.filter(n => String(n.date).startsWith(y)).map(newsRow).join("")}</table>
    </div>`).join("");
}

// One story, laid out like a blog post.
function renderNewsStory(el, n) {
  const head = document.querySelector(".page-head");
  const nav = document.querySelector(".news-nav");
  if (head) head.style.display = "none";          // the list page's heading and "← home" link
  if (nav) nav.style.display = "none";

  if (!n) {
    el.innerHTML = `<p class="muted">Sorry, this news item could not be found.</p>
      <div class="post-nav"><a class="btn" href="news.html">← All news</a></div>`;
    return;
  }
  const title = String(n.title || n.text).replace(/<[^>]+>/g, "");
  document.title = `${title} · Zhe WANG`;
  el.innerHTML = `
    <article>
      <div class="post-header">
        <a href="news.html" class="mono faint">&larr; all news</a>
        <h1>${n.title || n.text}</h1>
        <div class="post-meta">${newsDate(n.date)}</div>
      </div>
      <hr class="divider">
      <div class="post-body">${n.body}</div>
    </article>
    <div class="post-nav"><a class="btn" href="news.html">← All news</a></div>`;
}
