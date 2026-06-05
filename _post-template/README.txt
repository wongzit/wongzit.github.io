HOW TO ADD A NEW BLOG POST
==========================

Your posts use clean URLs like  https://wongzit.github.io/my-post-slug/
To publish a new post you do three small things:

1) WRITE THE ARTICLE
   Create a Markdown file:  posts/my-post-slug.md
   (You can copy posts/welcome.md as a starting point.)
   The slug is the URL — use lowercase words joined by hyphens, no spaces.

2) MAKE ITS PAGE (this gives the clean URL)
   Copy the whole "_post-template" folder, rename the copy to your slug:
       _post-template   ->   my-post-slug
   You do NOT edit the index.html inside it — it figures out which post to
   show from the folder name automatically.

3) LIST IT
   Add one entry to posts/posts.json (title, date, tags, summary) with
   "slug": "my-post-slug" so it appears on the blog page and the home page.

That's it. The post is now live at /my-post-slug/ .

(You can delete this README from your copied folders if you like.)
