# HAZWOPER OSHA Training - HAZWOPER course landing site

Static, SEO-focused landing site listing every HAZWOPER-related course (OSHA 40/24/8 hour,
refresher, supervisor, incident command, first responder, Cal/OSHA, Spanish, RCRA/TSDF,
micro-modules, train-the-trainer) with a page per course.

Live: https://lj-web-management.github.io/website-staging/

## Files

```
data/source.json     course data (from the HAZWOPER OSHA master course catalog)
tools/build.js       generator - run `node tools/build.js` after editing data or copy
index.html           generated hub page (course list, which-course guide, bundle, FAQ)
courses/<slug>/      generated per-course pages
sitemap.xml, robots.txt, llms.txt, 404.html   generated SEO / AI-crawler files
checkout.html        generated checkout page (noindex)
assets/config.js     generated checkout config (Stripe key, API base, items + LMS ids)
assets/checkout.js   checkout flow (Stripe + LMS add_new_user/add_order, or email request)
assets/search.js     hub-page course search
data/lms-ids.json    hazwoper-osha.com LMS course id per course slug
assets/style.css     styling
```

Generated files are committed so the site also works with "Deploy from branch".
`.github/workflows/pages.yml` rebuilds and deploys on push.

## Checkout

`checkout.html` uses the same checkout as datacentertraining.us: Stripe.js creates a card
payment method, then the page calls `https://hazwoper-osha.com/api/add_new_user` and
`/add_order` with the LMS `course_id`. The Stripe publishable key, API base and volume-discount
tiers are set at the top of `tools/build.js`, which generates `assets/config.js`.

Card checkout is used for a course only when it has an LMS id in `data/lms-ids.json`.
Courses still set to `null`, and the bundle, go by enrollment-request email to
info@hazwoper-osha.com instead. To turn on card checkout for a course, fill in its LMS id and
run `node tools/build.js`.

## SEO

Each page ships server-rendered content, a unique title/description, canonical URL,
Open Graph tags and JSON-LD (`EducationalOrganization`, `Course` with `Offer`,
`ItemList`, `FAQPage`, `BreadcrumbList`). `robots.txt` explicitly allows AI crawlers and
`llms.txt` gives answer engines a plain-text summary of the catalog. Set `SITE_URL` when
building if the site moves to a custom domain: `SITE_URL=https://example.com node tools/build.js`.
