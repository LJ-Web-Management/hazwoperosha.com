#!/usr/bin/env node
// Generates the static HAZWOPER landing site from data/source.json.
// Usage: node tools/build.js   (writes index.html, courses/*, sitemap.xml, llms.txt, robots.txt, 404.html)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = (process.env.SITE_URL || 'https://lj-web-management.github.io/website-staging').replace(/\/$/, '');
const BRAND = 'HAZWOPER OSHA Training';
const MAIN_SITE = 'https://hazwoper-osha.com/';
const PHONE = '+1-866-429-6742';
const PHONE_HREF = 'tel:+18664296742';
const EMAIL = 'sales@hazwoper-osha.com';
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();

const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source.json'), 'utf8'));

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase().replace(/\(2026\)/g, '').replace(/cal\/osha/g, 'cal-osha').replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = n => '$' + Number(n).toFixed(2);
const hoursNum = d => { const m = /(\d+)\s*(Hour|Min)/i.exec(d); if (!m) return null; return /min/i.test(m[2]) ? +m[1] / 60 : +m[1]; };
const isoDuration = d => { const m = /(\d+)\s*(Hour|Min)/i.exec(d); return m ? (/min/i.test(m[2]) ? `PT${m[1]}M` : `PT${m[1]}H`) : undefined; };
const jsonLd = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ---------- grouping ----------
const GROUPS = [
  { id: 'core', title: 'Core OSHA HAZWOPER Certification', blurb: 'The federal OSHA 29 CFR 1910.120 training levels: 40-hour, 24-hour and 4-hour first responder awareness.' },
  { id: 'industry', title: 'Industry-Specific 40 Hour HAZWOPER', blurb: 'The full 40-hour OSHA HAZWOPER course tailored to the hazards and scenarios of your field.' },
  { id: 'refresher', title: 'HAZWOPER Refresher, Supervisor & Incident Command', blurb: 'Annual 8-hour refreshers required to keep certification current, plus supervisor and (q) incident command training.' },
  { id: 'state', title: 'Cal/OSHA & State-Plan HAZWOPER', blurb: 'California 8 CCR 5192 and state-plan versions of HAZWOPER for workers in OSHA state-plan states.' },
  { id: 'rcra', title: 'RCRA Hazardous Waste & TSDF', blurb: 'EPA RCRA generator, universal waste, manifest and TSD facility training that pairs with HAZWOPER.' },
  { id: 'spill', title: 'Spill Response, Air Monitoring & Micro-Modules', blurb: 'Short focused modules on PPE levels, decontamination, air monitoring, site characterization and spill response.' },
  { id: 'trainer', title: 'HAZWOPER Train-the-Trainer', blurb: 'Become a qualified in-house HAZWOPER instructor for your organization.' },
];
function groupOf(c) {
  const n = c.name;
  if (/Train-the-Trainer/i.test(n)) return 'trainer';
  if (/Cal\/OSHA|State-Plan/i.test(n)) return 'state';
  if (/Micro-Module|Spill|Air Monitoring/i.test(n)) return 'spill';
  if (/RCRA|Hazardous Waste|Manifest|Universal Waste/i.test(n) && !/^OSHA 40/.test(n)) return 'rcra';
  if (/Refresher|Supervisor|Incident Command|Emergency Response Team/i.test(n)) return 'refresher';
  if (/40 Hour HAZWOPER for/i.test(n)) return 'industry';
  return 'core';
}
const ORDER = ['OSHA 40 Hour HAZWOPER Training', 'OSHA 24 Hour HAZWOPER Training', 'OSHA 8 Hour HAZWOPER Refresher Training',
  'OSHA 4-Hour HAZWOPER First Responder Awareness Level Training', 'OSHA 40-Hour HAZWOPER Training (Spanish)'];

const courses = src.courses.map(c => {
  const slug = slugify(c.name);
  return { ...c, slug, group: groupOf(c), hours: hoursNum(c.duration), url: `${SITE_URL}/courses/${slug}/` };
}).sort((a, b) => {
  const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return (b.hours || 0) - (a.hours || 0) || a.name.localeCompare(b.name);
});
const slugs = new Set();
courses.forEach(c => { if (slugs.has(c.slug)) throw new Error('duplicate slug ' + c.slug); slugs.add(c.slug); });

// ---------- copy ----------
function describe(c) {
  const who = c.audience ? ` It is designed for workers in ${c.audience.charAt(0).toLowerCase() + c.audience.slice(1)}.` : '';
  const m = /^(\d+)\s*(Hour|Min)/i.exec(c.duration);
  const len = m ? `${m[1]}-${/min/i.test(m[2]) ? 'minute' : 'hour'} online` : 'online';
  return `${c.name} is a self-paced, ${len} course from ${BRAND} that meets ${c.citation}.${who} Start immediately, train on any device, pause and resume at any time, and download your certificate of completion as soon as you pass.`;
}
function metaDesc(c) {
  return `${c.name} online: ${c.duration}, ${money(c.price)}. Meets ${c.citation}. Self-paced, instant certificate, 24/7 access. Enroll today with ${BRAND}.`.slice(0, 300);
}

const FAQ = [
  ['What is HAZWOPER training?', 'HAZWOPER stands for Hazardous Waste Operations and Emergency Response. It is the OSHA standard at 29 CFR 1910.120 (and 29 CFR 1926.65 for construction) that requires training for workers who clean up hazardous waste sites, work at RCRA treatment, storage and disposal (TSD) facilities, or respond to hazardous substance releases.'],
  ['Who needs 40 hour HAZWOPER training?', 'General site workers at uncontrolled hazardous waste sites, such as laborers, equipment operators and remediation technicians, who may be exposed to hazardous substances at or above permissible exposure limits must complete 40 hours of off-site instruction plus 3 days of supervised field experience under 29 CFR 1910.120(e)(3)(i).'],
  ['What is the difference between 40 hour and 24 hour HAZWOPER?', 'The 40-hour course is for general site workers with potential exposure above permissible limits. The 24-hour course is for occasional site workers, or workers in areas already monitored and characterized where exposures are below permissible limits and respirators are not required, per 29 CFR 1910.120(e)(3)(ii) and (iii).'],
  ['How often do I need a HAZWOPER refresher?', 'OSHA requires 8 hours of refresher training every year (29 CFR 1910.120(e)(8)) for workers who completed 40-hour or 24-hour HAZWOPER. Supervisors also take the annual refresher, and many take the 8-hour supervisor refresher.'],
  ['Is online HAZWOPER training accepted by OSHA?', 'Yes. Online instruction can satisfy the classroom portion of HAZWOPER training when it covers the required topics and the trainee has access to a qualified trainer for questions. Employers remain responsible for any site-specific instruction and the supervised field experience OSHA requires.'],
  ['How fast do I get my HAZWOPER certificate?', 'Your certificate of completion is available to download and print immediately after you finish the course and pass the final exam. A wallet card is included.'],
  ['Can I take HAZWOPER training in Spanish?', 'Yes. The OSHA 40-Hour HAZWOPER Training is available in a full Spanish-language version.'],
  ['Do you offer Cal/OSHA HAZWOPER?', 'Yes. Cal/OSHA 40-hour, 24-hour and 8-hour refresher courses aligned to Title 8 CCR 5192 are available, as well as Cal/OSHA TSDF RCRA versions.'],
  ['Do you offer group or company HAZWOPER training?', `Yes. Employers can buy seats in bulk, track employee progress and certificates, and get the HAZWOPER & Hazardous Waste Bundle covering ${src.bundle.totalCourses} courses. Call ${PHONE} or email ${EMAIL} for volume pricing.`],
  ['How long do I have to finish a course?', 'Courses are self-paced. You can log in and out as often as you like and your progress is saved automatically, so you can complete the course around your work schedule.'],
];

// ---------- layout ----------
function head({ title, desc, canonical, extra = '', depth = 0 }) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}/assets/hazwoper-logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="theme-color" content="#ffcd08">
<link rel="icon" type="image/png" href="${rel}assets/favicon.png">
<link rel="stylesheet" href="${rel}assets/style.css">
${extra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="${rel || './'}"><img src="${rel}assets/hazwoper-logo.png" alt="${BRAND}" width="180" height="48"></a>
    <nav aria-label="Main">
      <a href="${rel}#courses">Courses</a>
      <a href="${rel}#bundle">Bundle</a>
      <a href="${rel}#faq">FAQ</a>
      <a class="nav-phone" href="${PHONE_HREF}">${PHONE}</a>
    </nav>
  </div>
</header>
<main id="main">`;
}
function foot(depth = 0) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <img src="${rel}assets/hazwoper-logo.png" alt="${BRAND}" width="160" height="43" loading="lazy">
      <p>Online OSHA HAZWOPER, RCRA and hazardous materials training for workers, supervisors and employers across the United States.</p>
    </div>
    <div>
      <h2>Popular courses</h2>
      <ul>${courses.slice(0, 5).map(c => `<li><a href="${rel}courses/${c.slug}/">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Contact</h2>
      <ul>
        <li><a href="${PHONE_HREF}">${PHONE}</a></li>
        <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><a href="${MAIN_SITE}">hazwoper-osha.com</a></li>
      </ul>
    </div>
  </div>
  <p class="wrap legal">&copy; ${YEAR} ${BRAND} LLC · All rights reserved</p>
</footer>
<script src="${rel}assets/checkout.js" defer></script>
</body>
</html>
`;
}

function enrollBtn(c, cls = 'btn') {
  return `<a class="${cls}" href="${MAIN_SITE}" data-enroll="${c.slug}" data-name="${esc(c.name)}" data-price="${c.price}">Enroll Now · ${money(c.price)}</a>`;
}
function card(c, depth = 0) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `<article class="card" data-search="${esc((c.name + ' ' + c.citation + ' ' + c.category).toLowerCase())}">
  <div class="card-top"><span class="pill">${esc(c.duration)}</span><span class="price">${money(c.price)}</span></div>
  <h3><a href="${rel}courses/${c.slug}/">${esc(c.name)}</a></h3>
  <p class="cite">${esc(c.citation)}</p>
  <div class="card-actions">${enrollBtn(c)}<a class="link" href="${rel}courses/${c.slug}/">Details</a></div>
</article>`;
}

const orgLd = {
  '@type': 'EducationalOrganization', '@id': `${SITE_URL}/#organization`, name: BRAND, url: SITE_URL + '/',
  sameAs: [MAIN_SITE, 'https://hazwoperosha.org/'], logo: `${SITE_URL}/assets/hazwoper-logo.png`,
  email: EMAIL, telephone: PHONE, areaServed: 'US',
  contactPoint: { '@type': 'ContactPoint', telephone: PHONE, email: EMAIL, contactType: 'sales', availableLanguage: ['English', 'Spanish'] },
};
function courseLd(c) {
  return {
    '@type': 'Course', '@id': c.url + '#course', name: c.name, description: describe(c), url: c.url,
    provider: { '@id': `${SITE_URL}/#organization` },
    inLanguage: /Spanish/i.test(c.name) ? 'es' : 'en', educationalCredentialAwarded: 'Certificate of Completion',
    about: c.citation, audience: c.audience ? { '@type': 'Audience', audienceType: c.audience } : undefined,
    timeRequired: isoDuration(c.duration),
    offers: { '@type': 'Offer', price: c.price.toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', category: 'Paid', url: c.url },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: isoDuration(c.duration) },
  };
}

// ---------- index ----------
function buildIndex() {
  const total = courses.length;
  const title = `HAZWOPER Training Online | OSHA 40, 24 & 8 Hour HAZWOPER Certification`;
  const desc = `Online OSHA HAZWOPER training: 40 hour from ${money(249.99)}, 24 hour, 8 hour refresher, supervisor, first responder, Cal/OSHA, Spanish and RCRA. ${total} courses, instant certificates, 29 CFR 1910.120 compliant.`;
  const ld = jsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      orgLd,
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL + '/', name: `${BRAND} - HAZWOPER Courses`, publisher: { '@id': `${SITE_URL}/#organization` } },
      { '@type': 'ItemList', name: 'HAZWOPER Training Courses', numberOfItems: total,
        itemListElement: courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: courseLd(c) })) },
      { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  });
  const f40 = courses.find(c => c.name === 'OSHA 40 Hour HAZWOPER Training');
  const f24 = courses.find(c => c.name === 'OSHA 24 Hour HAZWOPER Training');
  const f8 = courses.find(c => c.name === 'OSHA 8 Hour HAZWOPER Refresher Training');
  const f4 = courses.find(c => /4-Hour HAZWOPER First Responder/.test(c.name));
  const b = src.bundle;

  const groupsHtml = GROUPS.map(g => {
    const items = courses.filter(c => c.group === g.id);
    if (!items.length) return '';
    return `<section class="group" id="${g.id}" aria-labelledby="h-${g.id}">
  <h2 id="h-${g.id}">${esc(g.title)}</h2>
  <p class="group-blurb">${esc(g.blurb)}</p>
  <div class="grid">${items.map(c => card(c)).join('\n')}</div>
</section>`;
  }).join('\n');

  const html = head({ title, desc, canonical: SITE_URL + '/', extra: ld }) + `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">OSHA 29 CFR 1910.120 &amp; 1926.65 Compliant</p>
      <h1>HAZWOPER Training Online: 40 Hour, 24 Hour &amp; 8 Hour Refresher Certification</h1>
      <p class="lead">Every HAZWOPER course in one place. Get OSHA HAZWOPER certified 100% online with self-paced training, instant printable certificates and wallet cards, and support from real safety professionals. English and Spanish.</p>
      <div class="hero-ctas">
        ${enrollBtn(f40, 'btn btn-lg')}
        <a class="btn btn-ghost btn-lg" href="#courses">Browse all ${total} courses</a>
      </div>
      <ul class="trust">
        <li>Instant certificate &amp; wallet card</li>
        <li>24/7 access on any device</li>
        <li>Save progress, finish at your pace</li>
        <li>Group &amp; employer pricing</li>
      </ul>
    </div>
    <div class="quick" aria-label="Most popular HAZWOPER courses">
      <h2>Most popular</h2>
      ${[f40, f24, f8, f4].map(c => `<a class="quick-row" href="courses/${c.slug}/"><span>${esc(c.name.replace(/^OSHA /, ''))}</span><strong>${money(c.price)}</strong></a>`).join('')}
      <p class="quick-note">Not sure which level you need? <a href="#which">Use the guide below</a> or call <a href="${PHONE_HREF}">${PHONE}</a>.</p>
    </div>
  </div>
</section>

<section class="wrap which" id="which" aria-labelledby="h-which">
  <h2 id="h-which">Which HAZWOPER course do I need?</h2>
  <div class="table-wrap">
  <table>
    <thead><tr><th>Your role</th><th>Required training</th><th>OSHA reference</th><th></th></tr></thead>
    <tbody>
      <tr><td>General site worker at a hazardous waste or cleanup site (laborer, equipment operator, remediation tech)</td><td>40 Hour HAZWOPER + 3 days supervised field experience</td><td>1910.120(e)(3)(i)</td><td><a href="courses/${f40.slug}/">View</a></td></tr>
      <tr><td>Occasional site worker, or work in monitored areas below exposure limits</td><td>24 Hour HAZWOPER + 1 day field experience</td><td>1910.120(e)(3)(ii)-(iii)</td><td><a href="courses/${f24.slug}/">View</a></td></tr>
      <tr><td>Anyone who completed 40 or 24 hour HAZWOPER</td><td>8 Hour Annual Refresher</td><td>1910.120(e)(8)</td><td><a href="courses/${f8.slug}/">View</a></td></tr>
      <tr><td>Supervisor or manager of hazardous waste operations</td><td>Initial training + 8 Hour Supervisor</td><td>1910.120(e)(4)</td><td><a href="#refresher">View</a></td></tr>
      <tr><td>Worker likely to witness or discover a hazardous substance release</td><td>First Responder Awareness Level</td><td>1910.120(q)(6)(i)</td><td><a href="courses/${f4.slug}/">View</a></td></tr>
      <tr><td>Incident commander for emergency response</td><td>8 Hour Incident Command</td><td>1910.120(q)(6)(v)</td><td><a href="#refresher">View</a></td></tr>
      <tr><td>Worker at an RCRA treatment, storage &amp; disposal facility</td><td>24 Hour RCRA TSD + annual refresher</td><td>1910.120(p)</td><td><a href="#rcra">View</a></td></tr>
      <tr><td>California workers</td><td>Cal/OSHA HAZWOPER (8 CCR 5192)</td><td>8 CCR 5192</td><td><a href="#state">View</a></td></tr>
    </tbody>
  </table>
  </div>
</section>

<section class="courses" id="courses" aria-labelledby="h-courses">
  <div class="wrap">
    <div class="courses-head">
      <h2 id="h-courses">All HAZWOPER Training Courses</h2>
      <label class="search"><span class="sr">Search courses</span><input id="q" type="search" placeholder="Search: 40 hour, refresher, RCRA, Cal/OSHA, 1910.120..." autocomplete="off"></label>
    </div>
    <nav class="jump" aria-label="Course categories">${GROUPS.map(g => `<a href="#${g.id}">${esc(g.title)}</a>`).join('')}</nav>
    <p id="noresults" class="noresults" hidden>No courses match that search. Call <a href="${PHONE_HREF}">${PHONE}</a> and we will point you to the right training.</p>
    ${groupsHtml}
  </div>
</section>

<section class="bundle" id="bundle" aria-labelledby="h-bundle">
  <div class="wrap bundle-grid">
    <div>
      <p class="eyebrow">For employers &amp; teams</p>
      <h2 id="h-bundle">${esc(b.name)}</h2>
      <p>One subscription covers <strong>${b.totalCourses} HAZWOPER and RCRA hazardous waste courses</strong> per learner, including 40-hour, 24-hour, refreshers, supervisor, TSD, Cal/OSHA and micro-modules. Purchased separately these courses total ${money(b.costSeparate)}.</p>
      <ul class="checks">
        <li>Bulk seats and company dashboard</li>
        <li>Track progress and download certificates for every employee</li>
        <li>Annual refresher reminders</li>
        <li>Invoicing and purchase orders available</li>
      </ul>
    </div>
    <div class="bundle-card">
      <p class="bundle-price">${money(b.price)}<span>/learner/year</span></p>
      <p>Save ${Math.round(b.savings * 100)}% vs. buying individually</p>
      <a class="btn btn-lg" href="${MAIN_SITE}" data-enroll="hazwoper-bundle" data-name="${esc(b.name)}" data-price="${b.price}">Get the Bundle</a>
      <a class="btn btn-ghost" href="mailto:${EMAIL}?subject=HAZWOPER%20group%20training%20quote">Request a group quote</a>
    </div>
  </div>
</section>

<section class="wrap about" aria-labelledby="h-about">
  <h2 id="h-about">About OSHA HAZWOPER (29 CFR 1910.120)</h2>
  <div class="cols">
    <div>
      <h3>What the standard covers</h3>
      <p>The Hazardous Waste Operations and Emergency Response standard protects workers at uncontrolled hazardous waste sites, EPA Superfund and state cleanup sites, RCRA treatment, storage and disposal facilities, and anyone responding to an emergency release of a hazardous substance. Construction work on these sites falls under the identical 29 CFR 1926.65.</p>
      <h3>What you will learn</h3>
      <p>HAZWOPER courses cover hazard recognition, toxicology, site characterization, air monitoring and direct-reading instruments, PPE levels A through D, respiratory protection, decontamination, confined space hazards, site control and work zones, the site safety and health plan, medical surveillance, spill containment and emergency response procedures.</p>
    </div>
    <div>
      <h3>Why train online with ${BRAND}</h3>
      <ul class="checks">
        <li>Complete HAZWOPER catalog: every OSHA training level plus RCRA, DOT-adjacent and Cal/OSHA</li>
        <li>Self-paced modules with knowledge checks and a final exam</li>
        <li>Certificate of completion and wallet card the moment you pass</li>
        <li>Courses in English and Spanish</li>
        <li>Phone and email support from safety professionals</li>
        <li>Employer accounts with bulk pricing and certificate tracking</li>
      </ul>
    </div>
  </div>
</section>

<section class="faq" id="faq" aria-labelledby="h-faq">
  <div class="wrap">
    <h2 id="h-faq">HAZWOPER Training FAQ</h2>
    ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-row">
    <h2>Start your HAZWOPER certification today</h2>
    <div>${enrollBtn(f40, 'btn btn-lg btn-dark')} <a class="btn btn-ghost btn-lg" href="${PHONE_HREF}">Call ${PHONE}</a></div>
  </div>
</section>
` + foot(0);
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

// ---------- course pages ----------
function buildCourse(c) {
  const g = GROUPS.find(x => x.id === c.group);
  const related = courses.filter(x => x.group === c.group && x.slug !== c.slug).slice(0, 6);
  const more = related.length < 3 ? courses.filter(x => x.group !== c.group).slice(0, 6 - related.length) : [];
  const title = `${c.name} Online | ${money(c.price)} | ${BRAND}`;
  const crumbs = { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'HAZWOPER Training', item: SITE_URL + '/' },
    { '@type': 'ListItem', position: 2, name: g.title, item: `${SITE_URL}/#${g.id}` },
    { '@type': 'ListItem', position: 3, name: c.name, item: c.url },
  ] };
  const ld = jsonLd({ '@context': 'https://schema.org', '@graph': [orgLd, courseLd(c), crumbs] });
  const html = head({ title, desc: metaDesc(c), canonical: c.url, extra: ld, depth: 2 }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../../">HAZWOPER Training</a> › <a href="../../#${g.id}">${esc(g.title)}</a> › <span>${esc(c.name)}</span></nav>
<section class="wrap course-hero">
  <div>
    <p class="eyebrow">${esc(c.citation)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="lead">${esc(describe(c))}</p>
    <dl class="facts">
      <div><dt>Length</dt><dd>${esc(c.duration)}</dd></div>
      <div><dt>Format</dt><dd>100% online, self-paced</dd></div>
      <div><dt>Regulation</dt><dd>${esc(c.citation)}</dd></div>
      <div><dt>Certificate</dt><dd>Instant, printable + wallet card</dd></div>
      <div><dt>Language</dt><dd>${/Spanish/i.test(c.name) ? 'Spanish' : 'English'}</dd></div>
    </dl>
  </div>
  <aside class="buy">
    <p class="buy-price">${money(c.price)}</p>
    ${enrollBtn(c, 'btn btn-lg btn-block')}
    <ul class="checks small">
      <li>Start immediately after checkout</li>
      <li>Progress saves automatically</li>
      <li>Certificate the moment you pass</li>
    </ul>
    <p class="buy-note">Buying for a team? <a href="mailto:${EMAIL}?subject=${encodeURIComponent('Group quote: ' + c.name)}">Get group pricing</a></p>
  </aside>
</section>
<section class="wrap course-body">
  <h2>Who should take this course</h2>
  <p>${esc(c.audience || 'Workers and supervisors who need hazardous waste and emergency response training.')}</p>
  <h2>How it works</h2>
  <ol>
    <li>Enroll and pay securely online.</li>
    <li>Log in and work through the lessons at your own pace on desktop, tablet or phone.</li>
    <li>Pass the final exam and instantly download your certificate of completion and wallet card.</li>
  </ol>
  ${c.altTags && c.altTags.length ? `<h2>Also known as</h2><p>${c.altTags.map(esc).join(' · ')}</p>` : ''}
  <h2>Related HAZWOPER courses</h2>
  <div class="grid">${related.concat(more).map(x => card(x, 2)).join('\n')}</div>
</section>
` + foot(2);
  const dir = path.join(ROOT, 'courses', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ---------- extras ----------
function buildExtras() {
  const urls = [{ loc: SITE_URL + '/', pri: '1.0' }].concat(courses.map(c => ({ loc: c.url, pri: c.group === 'core' ? '0.9' : '0.8' })));
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${TODAY}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *
Allow: /

# AI and answer-engine crawlers are welcome
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# ${BRAND} - HAZWOPER Courses

> ${BRAND} offers the complete catalog of OSHA HAZWOPER (29 CFR 1910.120 / 1926.65) training online: 40 hour, 24 hour, 8 hour annual refresher, supervisor, incident command, first responder awareness, industry-specific 40 hour, Cal/OSHA (8 CCR 5192), Spanish, RCRA hazardous waste and TSDF courses. All courses are self-paced and online with instant certificates and wallet cards. Contact: ${EMAIL}, ${PHONE}.

## Key facts

- Provider: ${BRAND} LLC (${MAIN_SITE})
- Format: 100% online, self-paced, any device, progress saved automatically
- Certificate: certificate of completion and wallet card available immediately after passing
- Languages: English; OSHA 40-Hour HAZWOPER also in Spanish
- Employers: bulk seats, certificate tracking, ${src.bundle.name} (${src.bundle.totalCourses} courses, ${money(src.bundle.price)} per learner per year)

## Courses

${GROUPS.map(g => `### ${g.title}\n\n${courses.filter(c => c.group === g.id).map(c => `- [${c.name}](${c.url}): ${c.duration}, ${money(c.price)}. Meets ${c.citation}.`).join('\n')}`).join('\n\n')}

## FAQ

${FAQ.map(([q, a]) => `- **${q}** ${a}`).join('\n')}
`);
  fs.writeFileSync(path.join(ROOT, '404.html'), head({ title: `Page not found | ${BRAND}`, desc: 'Page not found.', canonical: SITE_URL + '/' })
    .replace(/href="assets\//g, `href="${SITE_URL}/assets/`).replace(/src="assets\//g, `src="${SITE_URL}/assets/`).replace('content="index, follow', 'content="noindex, follow') + `
<section class="wrap course-body"><h1>Page not found</h1><p><a href="${SITE_URL}/">Browse all HAZWOPER training courses</a></p></section>
` + foot(0).replace(/(href|src)="(assets|courses)\//g, `$1="${SITE_URL}/$2/`));
  fs.writeFileSync(path.join(ROOT, 'data/courses.json'), JSON.stringify(courses.map(({ slug, name, price, duration, citation, group, url }) => ({ slug, name, price, duration, citation, group, url })), null, 1) + '\n');
}

fs.rmSync(path.join(ROOT, 'courses'), { recursive: true, force: true });
buildIndex();
courses.forEach(buildCourse);
buildExtras();
console.log(`Built index + ${courses.length} course pages for ${SITE_URL}`);
