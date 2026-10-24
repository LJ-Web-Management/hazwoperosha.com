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
assets/checkout.js   checkout config (Stripe key, checkout URL template, course IDs) + search
assets/style.css     styling
```

Generated files are committed so the site also works with "Deploy from branch".
`.github/workflows/pages.yml` rebuilds and deploys on push.

## Checkout

Edit `window.CHECKOUT` at the top of `assets/checkout.js`: set `stripePublishableKey`,
`checkoutUrl` (a template using `{courseId}`, `{slug}`, `{price}`, `{key}`), and map each
course slug (see `data/courses.json`) to its course ID in `courseIds`. Courses without an
ID fall back to linking to https://hazwoper-osha.com/.

## SEO

Each page ships server-rendered content, a unique title/description, canonical URL,
Open Graph tags and JSON-LD (`EducationalOrganization`, `Course` with `Offer`,
`ItemList`, `FAQPage`, `BreadcrumbList`). `robots.txt` explicitly allows AI crawlers and
`llms.txt` gives answer engines a plain-text summary of the catalog. Set `SITE_URL` when
building if the site moves to a custom domain: `SITE_URL=https://example.com node tools/build.js`.
