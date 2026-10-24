# HAZWOPER OSHA Training - HAZWOPER course landing site

Static, SEO-focused landing site listing every HAZWOPER-related course (OSHA 40/24/8 hour,
refresher, supervisor, incident command, first responder, Cal/OSHA, Spanish, RCRA/TSDF,
micro-modules, train-the-trainer) with a page per course.

Live: https://lj-web-management.github.io/website-staging/

## Files

```
data/source.json     course data (from the HAZWOPER OSHA master course catalog)
data/guides.js       guide articles (HTML body, FAQ, related courses) -> guides/<slug>/
data/glossary.js     glossary terms -> guides/hazwoper-glossary/
data/quizzes.js      practice quizzes (questions, answers, explanations) -> quizzes/<slug>/
tools/build.js       generator - run `node tools/build.js` after editing data or copy
index.html           generated hub page (course list, which-course guide, FAQ)
courses/<slug>/      generated per-course pages
guides/, quizzes/    generated guide and quiz pages + hub pages
search/              generated sitewide search page (noindex); index in assets/search-index.js
sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html   generated SEO / AI-crawler files
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
Open Graph tags and JSON-LD (`EducationalOrganization`, `Course` with `Offer`,
`ItemList`, `FAQPage`, `BreadcrumbList`, `Article` on guides, `Quiz` on quizzes,
`DefinedTermSet` on the glossary). Guides, quizzes and courses cross-link to each other, and
`llms-full.txt` carries the full text of every guide and quiz answer for answer engines.
Link tokens in guide bodies (`{{course:slug}}`, `{{guide:slug|text}}`, `{{quiz:slug}}`) are
checked at build time, so a typo fails the build instead of shipping a broken link. `robots.txt` explicitly allows AI crawlers and
`llms.txt` gives answer engines a plain-text summary of the catalog. Set `SITE_URL` when
building if the site moves to a custom domain: `SITE_URL=https://example.com node tools/build.js`.
