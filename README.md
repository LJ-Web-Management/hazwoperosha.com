# HAZWOPER OSHA Training - HAZWOPER course landing site

Static, SEO-focused landing site listing every HAZWOPER-related course (OSHA 40/24/8 hour,
refresher, supervisor, incident command, first responder, Cal/OSHA, Spanish, RCRA/TSDF and
train-the-trainer) with a page per course.

Checkout sends the LMS course id from `data/lms-ids.json` (the `course_id` on the course's hazwoper-osha.com page),
not the `catalogId` in `data/source.json` (a row in the ICTrainingUS spreadsheet). On 2026-11-10 the ids were
corrected, prices were matched to the LMS (which sets the amount charged) and the 16 courses with no LMS match
were removed.

Live: https://www.hazwoperosha.com/ (custom domain in `CNAME`; `site.config.js` sets the same URL for canonical links, sitemap and structured data)

## Files

```
data/source.json     course data (from the HAZWOPER OSHA master course catalog)
data/guides.js       guide articles (HTML body, FAQ, related courses) -> guides/<slug>/
data/glossary.js     glossary terms -> guides/hazwoper-glossary/
data/quizzes.js      practice quizzes (questions, answers, explanations) -> quizzes/<slug>/
data/copy.js         optional per-site wording (home, FAQ, course copy, tool pages); absent here, so build.js defaults apply
tools/build.js       generator - run `node tools/build.js` after editing data or copy
index.html           generated hub page (course list, which-course guide, FAQ)
courses/<slug>/      generated per-course pages
guides/, quizzes/    generated guide and quiz pages + hub pages
search/              generated sitewide search page (noindex); index in assets/search-index.js
sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html, 404.md, courses.json   generated SEO / AI-crawler files
about/, contact/, privacy/   generated trust pages
**/index.md          generated Markdown version of each page
edge/                Cloudflare Worker for Markdown content negotiation and the bare domain (see AI agents)
tests/               build checks: node --test tests/*.test.js
tools/check-live.js  checks the live site the way AI agents reach it (see AI agents)
checkout.html        generated checkout page (noindex)
assets/config.js     generated checkout config (Stripe key, API base, items + LMS ids)
assets/checkout.js   checkout flow (Stripe + LMS add_new_user/add_order, or email request)
assets/cart.js       cart shared by every page (localStorage, header badge, add-to-cart buttons)
assets/quiz.js       quiz scoring
assets/site-search.js  sitewide search page
assets/search.js     hub-page course search
data/lms-ids.json    hazwoper-osha.com LMS course id per course slug
assets/style.css     styling
```

Generated files are committed so the site also works with "Deploy from branch".
`.github/workflows/pages.yml` rebuilds and deploys on push.

## Checkout

Every course card has "Add to cart"; the cart holds any number of courses with a seat count
each and lives in the browser (`assets/cart.js`). `checkout.html` is the cart page. It uses the
same checkout as datacentertraining.us: Stripe.js creates a card payment method, then the page
calls `https://hazwoper-osha.com/api/add_new_user` and makes **one** `/add_order` call whose
`courses` array carries every LMS `course_id` in the cart with its seat quantity. Every seat is
full list price; there are no volume discounts. `checkout.html?item=<slug>[&seats=n]` (the
"Enroll Now" buttons) adds that course to the cart. The Stripe publishable key and API base are
set at the top of `tools/build.js`, which generates `assets/config.js`.

Card checkout is used only when every course in the cart has an LMS id in
`data/lms-ids.json`. If any is `null`, the whole cart goes by enrollment-request email to
info@hazwoper-osha.com instead. To turn on card checkout for a course, fill in its LMS id and
run `node tools/build.js`.

## SEO

Each page ships server-rendered content, a unique title/description, canonical URL,
Open Graph tags and JSON-LD (`Organization`/`EducationalOrganization`, `Course` with `Offer`,
`ItemList`, `FAQPage`, `BreadcrumbList`, `Article` on guides, `Quiz` on quizzes,
`DefinedTermSet` on the glossary). Guides, quizzes and courses cross-link to each other, and
`llms-full.txt` carries the full text of every guide and quiz answer for answer engines.
Link tokens in guide bodies (`{{course:slug}}`, `{{guide:slug|text}}`, `{{quiz:slug}}`) are
checked at build time, so a typo fails the build instead of shipping a broken link. `robots.txt` explicitly allows AI crawlers and
`llms.txt` gives answer engines a plain-text summary of the catalog. Set `SITE_URL` when
building if the site moves to a custom domain: `SITE_URL=https://example.com node tools/build.js`.

## AI agents

`tools/build.js` also writes what AI agents and the Is Agentic (is-agentic.com) checks look for:

- `about/`, `contact/`, `privacy/`: trust pages linked from every footer. Company address and the
  pages' "last updated" date (`ADDRESS`, `TRUST_UPDATED`) are at the top of `tools/build.js`;
  `about` (opening paragraph) can be set per site in `data/copy.js`. The privacy page lists the
  analytics found in `site.config.js`, so update it if tracking changes.
- An `Organization` JSON-LD block (address, contactPoint) first on every page; the `@graph`
  refers to it by `@id`.
- `index.md` next to every content page, converted from the page's `<main>` and linked with
  `<link rel="alternate" type="text/markdown">`; `404.md`; `courses.json` (catalog with
  page, Markdown and checkout links).
- `llms.txt` sections "When to use" (`whenToUse` in `data/copy.js`) and "How agents can use
  this site".
- The main product terms (`KEYWORDS` near the top of `tools/build.js`, or `keywords` in
  `data/copy.js`) in the homepage `<meta name="keywords">` and the Organization's `keywords` and
  `knowsAbout`. Agents pair them with the brand name to check that a search finds this site, so
  list the most important term first and keep every term worded as it is on the homepage (the
  tests check that each one appears there, and the first in the title and H1).
- The HTML 404 page links to `sitemap.xml` and `llms.txt` (GitHub Pages serves it with a real 404
  status); `404.md` is the Markdown body the edge Worker sends instead.

`node --test tests/*.test.js` checks all of this after a build, and the deploy workflow runs it
before publishing.

To check the live site the way an agent reaches it, run `node tools/check-live.js` (it checks the
bare domain, https://hazwoperosha.com) or `node tools/check-live.js https://www.hazwoperosha.com`.
It reports HTTPS and redirects, agent User-Agents, content, metadata, JSON-LD, Markdown
negotiation, 404s, llms.txt, sitemap, robots.txt and the trust pages, and exits 1 unless all pass.
Behind an HTTPS proxy, prefix it with `NODE_USE_ENV_PROXY=1`.

### Bare domain (https://hazwoperosha.com)

The site lives at `www.hazwoperosha.com`, but agents and audits start from the bare domain. Its DNS
is right (A and AAAA records to GitHub Pages, `www` a CNAME to `lj-web-management.github.io`, no CAA
record in the way), yet GitHub Pages has no certificate for it: `https://hazwoperosha.com/` answers
with GitHub's `*.github.io` certificate, so every HTTPS client fails before it is redirected to
`www`. Plain `http://hazwoperosha.com/` does redirect. To fix it (needs admin access to the repo):

1. Settings → Pages → Custom domain: remove `www.hazwoperosha.com` and save, then enter
   `www.hazwoperosha.com` again and save. GitHub then requests a certificate that covers both
   `www` and the bare domain; it can take up to an hour.
2. When the certificate is issued, tick "Enforce HTTPS" on the same page.
3. Check: `curl -sS -I https://hazwoperosha.com/` returns a 301 to `https://www.hazwoperosha.com/`,
   and `node tools/check-live.js` passes everything except what the Worker below adds.

With the Worker below deployed, Cloudflare's certificate covers the bare domain and the Worker
answers it with that same 301 itself, so it works whatever GitHub's certificate covers.

### Markdown content negotiation (`edge/`)

GitHub Pages can't vary a response on the `Accept` header, so `Accept: text/markdown` requests
for `/` and Markdown 404 bodies need a layer in front of it. `edge/worker.mjs` is a Cloudflare
Worker that does this the way https://acceptmarkdown.com describes: q-value parsing,
`Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`, 406 for unsupported types, a
`404.md` body for unknown paths, a `Link` header from each HTML page to its Markdown version, and a
301 from the bare domain to `CANONICAL_HOST` (`www.hazwoperosha.com`, in `edge/wrangler.toml`).
To switch it on:

1. Put the domain's DNS on Cloudflare (the nameservers are GoDaddy's today), with `www` as a
   proxied CNAME to `lj-web-management.github.io`, the bare domain's four GitHub Pages A records
   (185.199.108.153 to 185.199.111.153) proxied too, and SSL/TLS mode "Full".
2. `cd edge && npx wrangler login && npx wrangler deploy` (routes, zone and `CANONICAL_HOST` are in
   `edge/wrangler.toml`).
3. Check: `curl -sS -L -i -H 'Accept: text/markdown' https://hazwoperosha.com/` returns Markdown with
   `Vary: Accept`, `curl -sS -L -i -H 'Accept: text/html' https://hazwoperosha.com/` returns HTML,
   `curl -sS -L -i -H 'Accept: text/markdown' https://hazwoperosha.com/no-such-page` returns 404 with
   Markdown, and `node tools/check-live.js` passes every check.
