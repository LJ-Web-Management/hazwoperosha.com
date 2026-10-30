#!/usr/bin/env node
// Generates the static HAZWOPER landing site from data/source.json.
// Usage: node tools/build.js   (writes index.html, courses/*, sitemap.xml, llms.txt, robots.txt, 404.html)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// Optional per-site settings (brand, URL, look). Without site.config.js the defaults below build the staging site.
const MAIN_SITE = 'https://hazwoper-osha.com/';
const SITE = fs.existsSync(path.join(ROOT, 'site.config.js')) ? require('../site.config.js') : {};
const SITE_URL = (process.env.SITE_URL || SITE.url || 'https://lj-web-management.github.io/website-staging').replace(/\/$/, '');
const BRAND = SITE.brand || 'HAZWOPER OSHA Training';
const LEGAL_NAME = SITE.legalName || 'HAZWOPER OSHA Training LLC';
const THEME_COLOR = SITE.themeColor || '#ffcd08';
const SHARE_IMAGE = SITE.shareImage || 'assets/hazwoper-logo.png';
const HEAD_EXTRA = SITE.headExtra || '';
const GA_ID = SITE.gaId || '';
const SAME_AS = SITE.sameAs || [MAIN_SITE, 'https://hazwoperosha.org/'];
const logoHtml = (rel, where) => SITE.logo ? SITE.logo(rel, where) : where === 'footer'
  ? `<img src="${rel}assets/hazwoper-logo.png" alt="${BRAND}" width="160" height="43" loading="lazy">`
  : `<img src="${rel}assets/hazwoper-logo.png" alt="${BRAND}" width="180" height="48">`;
const PHONE = '+1-866-429-6742';
const PHONE_HREF = 'tel:+18664296742';
const EMAIL = 'sales@hazwoper-osha.com';
// Company address and privacy policy, as published by HAZWOPER OSHA Training, LLC at hazwoper-osha.com/privacy-policy.
const ADDRESS = { streetAddress: '11901 Santa Monica Blvd. Suite #414', addressLocality: 'Los Angeles', addressRegion: 'CA', postalCode: '90025', addressCountry: 'US' };
const ADDRESS_TEXT = `${ADDRESS.streetAddress}, ${ADDRESS.addressLocality}, ${ADDRESS.addressRegion} ${ADDRESS.postalCode}, USA`;
const MAIN_PRIVACY = 'https://hazwoper-osha.com/privacy-policy';
// "Last updated" date on the about, contact and privacy pages. Change it when their wording changes.
const TRUST_UPDATED = '2026-10-30';
const TODAY = new Date().toISOString().slice(0, 10);
// Changes whenever the favicon file changes, so browsers drop their cached tab icon.
const FAVICON_VERSION = require('crypto').createHash('md5').update(fs.readFileSync(path.join(ROOT, 'assets/favicon.png'))).digest('hex').slice(0, 8);
const YEAR = new Date().getFullYear();

const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source.json'), 'utf8'));
const LMS_IDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lms-ids.json'), 'utf8'));
const GUIDES = require('../data/guides.js');
const GLOSSARY = require('../data/glossary.js');
const QUIZZES = require('../data/quizzes.js');

// Checkout settings - same Stripe account and LMS API as datacentertraining.us (js/config.js there).
const STRIPE_PUBLISHABLE_KEY = 'pk_live_doCHB0jglD5eISjEmB1vB6mb00xIg51noK';
const API_BASE_URL = 'https://hazwoper-osha.com/api';
const ENROLL_EMAIL = 'info@hazwoper-osha.com';
const ORDER_FROM = SITE.orderFrom || 'hazwoper-training-landing';

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase().replace(/\(2026\)/g, '').replace(/cal\/osha/g, 'cal-osha').replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = n => '$' + Number(n).toFixed(2);
const hoursNum = d => { const m = /(\d+)\s*(Hour|Min)/i.exec(d); if (!m) return null; return /min/i.test(m[2]) ? +m[1] / 60 : +m[1]; };
const isoDuration = d => { const m = /(\d+)\s*(Hour|Min)/i.exec(d); return m ? (/min/i.test(m[2]) ? `PT${m[1]}M` : `PT${m[1]}H`) : undefined; };
const jsonLd = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// Optional per-site wording (data/copy.js exports ctx => ({...})). Anything it leaves out uses the defaults below.
const COPY = fs.existsSync(path.join(ROOT, 'data/copy.js'))
  ? require('../data/copy.js')({ BRAND, PHONE, PHONE_HREF, EMAIL, money }) : {};
const HOME = COPY.home || {};
const COURSE_COPY = COPY.course || {};
const GUIDE_COPY = COPY.guides || {};
const QUIZ_COPY = COPY.quizzes || {};

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
GROUPS.forEach(g => Object.assign(g, (COPY.groups || {})[g.id]));
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
  return { ...c, slug, lmsId: LMS_IDS[slug] || null, group: groupOf(c), hours: hoursNum(c.duration), url: `${SITE_URL}/courses/${slug}/` };
}).sort((a, b) => {
  const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return (b.hours || 0) - (a.hours || 0) || a.name.localeCompare(b.name);
});
const slugs = new Set();
courses.forEach(c => { if (slugs.has(c.slug)) throw new Error('duplicate slug ' + c.slug); slugs.add(c.slug); });

// ---------- copy ----------
function describe(c) {
  if (COPY.describe) return COPY.describe(c);
  const who = c.audience ? ` It is designed for workers in ${c.audience.charAt(0).toLowerCase() + c.audience.slice(1)}.` : '';
  const m = /^(\d+)\s*(Hour|Min)/i.exec(c.duration);
  const len = m ? `${m[1]}-${/min/i.test(m[2]) ? 'minute' : 'hour'} online` : 'online';
  return `${c.name} is a self-paced, ${len} course from ${BRAND} that meets ${c.citation}.${who} Start immediately, train on any device, pause and resume at any time, and download your certificate of completion as soon as you pass.`;
}
function metaDesc(c) {
  if (COPY.metaDesc) return COPY.metaDesc(c).slice(0, 300);
  return `${c.name} online: ${c.duration}, ${money(c.price)}. Meets ${c.citation}. Self-paced, instant certificate, 24/7 access. Enroll today with ${BRAND}.`.slice(0, 300);
}

const FAQ = COPY.faq || [
  ['What is HAZWOPER training?', 'HAZWOPER stands for Hazardous Waste Operations and Emergency Response. It is the OSHA standard at 29 CFR 1910.120 (and 29 CFR 1926.65 for construction) that requires training for workers who clean up hazardous waste sites, work at RCRA treatment, storage and disposal (TSD) facilities, or respond to hazardous substance releases.'],
  ['Who needs 40 hour HAZWOPER training?', 'General site workers at uncontrolled hazardous waste sites, such as laborers, equipment operators and remediation technicians, who may be exposed to hazardous substances at or above permissible exposure limits must complete 40 hours of off-site instruction plus 3 days of supervised field experience under 29 CFR 1910.120(e)(3)(i).'],
  ['What is the difference between 40 hour and 24 hour HAZWOPER?', 'The 40-hour course is for general site workers with potential exposure above permissible limits. The 24-hour course is for occasional site workers, or workers in areas already monitored and characterized where exposures are below permissible limits and respirators are not required, per 29 CFR 1910.120(e)(3)(ii) and (iii).'],
  ['How often do I need a HAZWOPER refresher?', 'OSHA requires 8 hours of refresher training every year (29 CFR 1910.120(e)(8)) for workers who completed 40-hour or 24-hour HAZWOPER. Supervisors also take the annual refresher, and many take the 8-hour supervisor refresher.'],
  ['Is online HAZWOPER training accepted by OSHA?', 'Yes. Online instruction can satisfy the classroom portion of HAZWOPER training when it covers the required topics and the trainee has access to a qualified trainer for questions. Employers remain responsible for any site-specific instruction and the supervised field experience OSHA requires.'],
  ['How fast do I get my HAZWOPER certificate?', 'Your certificate of completion is available to download and print immediately after you finish the course and pass the final exam. A wallet card is included.'],
  ['Can I take HAZWOPER training in Spanish?', 'Yes. The OSHA 40-Hour HAZWOPER Training is available in a full Spanish-language version.'],
  ['Do you offer Cal/OSHA HAZWOPER?', 'Yes. Cal/OSHA 40-hour, 24-hour and 8-hour refresher courses aligned to Title 8 CCR 5192 are available, as well as Cal/OSHA TSDF RCRA versions.'],
  ['Do you offer group or company HAZWOPER training?', `Yes. Add every course your team needs to the cart, set the number of seats for each, and check out once. For purchase orders or large groups, call ${PHONE} or email ${EMAIL}.`],
  ['Do you have free HAZWOPER practice tests?', 'Yes. Free practice quizzes with answers and explanations cover the 40 hour and 8 hour refresher, PPE levels, air monitoring, decontamination and site control, first responder awareness and RCRA hazardous waste.'],
  ['How long do I have to finish a course?', 'Courses are self-paced. You can log in and out as often as you like and your progress is saved automatically, so you can complete the course around your work schedule.'],
];

// ---------- layout ----------
function head({ title, desc, canonical, extra = '', depth = 0 }) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `<!doctype html>
<html lang="en">
<head>
${GA_ID ? `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
</script>
` : ''}<meta charset="utf-8">
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
<meta property="og:image" content="${SITE_URL}/${SHARE_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="theme-color" content="${THEME_COLOR}">
<link rel="icon" type="image/png" href="${rel}assets/favicon.png?v=${FAVICON_VERSION}">
${HEAD_EXTRA}<link rel="stylesheet" href="${rel}assets/style.css">
${extra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="${rel || './'}">${logoHtml(rel, 'header')}</a>
    <nav aria-label="Main">
      ${NAV.map(([label, href]) => `<a href="${rel}${href}">${esc(label)}</a>`).join('\n      ')}
      <a class="nav-phone" href="${PHONE_HREF}">${PHONE}</a>
      <a class="nav-cart" href="${rel}checkout.html" aria-label="Cart"><span aria-hidden="true">Cart</span> <span class="cart-count" data-cart-count>0</span></a>
    </nav>
    <form class="site-search" action="${rel}search/" method="get" role="search">
      <label class="sr" for="site-q">Search the site</label>
      <input id="site-q" name="q" type="search" placeholder="${esc(COPY.searchPlaceholder || 'Search courses, guides, quizzes...')}" autocomplete="off">
    </form>
  </div>
</header>
<main id="main">`;
}
function foot(depth = 0, scripts = ['cart.js', 'search.js']) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="logo" href="${rel || './'}">${logoHtml(rel, 'footer')}</a>
      <p>${esc(COPY.footerBlurb || 'Online OSHA HAZWOPER, RCRA and hazardous materials training for workers, supervisors and employers across the United States.')}</p>
    </div>
    <div>
      <h2>Popular courses</h2>
      <ul>${courses.slice(0, 5).map(c => `<li><a href="${rel}courses/${c.slug}/">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>${COPY.footerResourcesTitle || 'Guides &amp; quizzes'}</h2>
      <ul>${ALL_GUIDES.slice(0, 5).map(g => `<li><a href="${rel}guides/${g.slug}/">${esc(g.short)}</a></li>`).join('')}<li><a href="${rel}guides/">${esc(GUIDE_COPY.allLink || 'All HAZWOPER guides')}</a></li>${PAGES.map(pg => `<li><a href="${rel}${pg.slug}/">${esc(pg.short)}</a></li>`).join('')}${QUIZZES.length ? `<li><a href="${rel}quizzes/">${esc(QUIZ_COPY.allLink || 'Free practice quizzes')}</a></li>` : ''}</ul>
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
  <p class="wrap legal">&copy; ${YEAR} ${LEGAL_NAME} · All rights reserved${TRUST_PAGES.map(pg => ` · <a href="${rel}${pg.slug}/">${esc(pg.short)}</a>`).join('')}</p>
</footer>
${scripts.map(f => `<script src="${rel}assets/${f}" defer></script>`).join('\n')}
</body>
</html>
`;
}

function enrollBtn(c, cls = 'btn', depth = 0) {
  return `<a class="${cls}" href="${'../'.repeat(depth)}checkout.html?item=${c.slug}">Enroll Now · ${money(c.price)}</a>`;
}
// Works without JS as a link to checkout; cart.js turns it into an in-place add.
function cartBtn(c, cls = 'btn', depth = 0) {
  return `<a class="${cls}" href="${'../'.repeat(depth)}checkout.html?item=${c.slug}" data-add-to-cart="${c.slug}">Add to cart</a>`;
}
function card(c, depth = 0) {
  const rel = depth ? '../'.repeat(depth) : '';
  return `<article class="card" data-search="${esc((c.name + ' ' + c.citation + ' ' + c.category).toLowerCase())}">
  <div class="card-top"><span class="pill">${esc(c.duration)}</span><span class="price">${money(c.price)}</span></div>
  <h3><a href="${rel}courses/${c.slug}/">${esc(c.name)}</a></h3>
  <p class="cite">${esc(c.citation)}</p>
  <div class="card-actions">${cartBtn(c, 'btn', depth)}<a class="link" href="${rel}courses/${c.slug}/">Details</a></div>
</article>`;
}

// ---------- guides, glossary, quizzes ----------
const COURSE_BY_SLUG = Object.fromEntries(courses.map(c => [c.slug, c]));
const GLOSSARY_GUIDE = {
  slug: 'hazwoper-glossary',
  title: `HAZWOPER Glossary: ${GLOSSARY.length} Terms and Acronyms Explained`,
  short: 'HAZWOPER glossary',
  desc: `Definitions of ${GLOSSARY.length} HAZWOPER, OSHA, EPA and RCRA terms and acronyms: IDLH, LEL, PEL, SCBA, PPE levels, work zones, decon, generator categories and more.`,
  related: ['osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training', 'rcra-hazardous-waste-generator-training'],
  quiz: 'hazwoper-40-hour-practice-test',
  body: `<p>Plain-English definitions of the terms and acronyms used in HAZWOPER training, OSHA 29 CFR 1910.120, EPA RCRA and hazardous materials work. Use the site search to jump to a term, or follow the links to the full guides.</p>
<h2>Terms A to Z</h2>
<dl class="glossary">${GLOSSARY.map(([t, d, g]) => `<div id="${slugify(t)}"><dt>${esc(t)}</dt><dd>${esc(d)}${g ? ` {{guide:${g}|Learn more}}` : ''}</dd></div>`).join('\n')}</dl>`,
  faq: [],
};
const ALL_GUIDES = GLOSSARY.length ? GUIDES.concat(GLOSSARY_GUIDE) : GUIDES;
// Standalone pages (tools, calculators) from data/copy.js, built at /<slug>/.
const PAGES = COPY.pages || [];
const NAV = COPY.nav || [['Courses', '#courses'], ['Guides', 'guides/']].concat(QUIZZES.length ? [['Quizzes', 'quizzes/']] : [], [['FAQ', '#faq']]);
const GUIDE_BY_SLUG = Object.fromEntries(ALL_GUIDES.map(g => [g.slug, g]));
const QUIZ_BY_SLUG = Object.fromEntries(QUIZZES.map(q => [q.slug, q]));
const guideUrl = g => `${SITE_URL}/guides/${g.slug}/`;
const quizUrl = q => `${SITE_URL}/quizzes/${q.slug}/`;

// ---------- about, contact & privacy pages ----------
// Built at /about/, /contact/ and /privacy/ and linked from every footer. data/copy.js can set `about`
// (the opening paragraph that says what this site is for) and `whenToUse` (llms.txt).
const ANALYTICS = [(GA_ID || /googletagmanager\.com\/gtag/.test(HEAD_EXTRA)) && 'Google Analytics', /clarity\.ms/.test(HEAD_EXTRA) && 'Microsoft Clarity'].filter(Boolean);
const GUIDES_NAME = (GUIDE_COPY.label || 'Guides').toLowerCase();
const TRUST_PAGES = [
  { slug: 'about', type: 'AboutPage', short: 'About', title: 'About Us', h1: `About ${BRAND}`,
    desc: `Who runs ${BRAND}, what it offers and how its online OSHA HAZWOPER courses work. Operated by ${LEGAL_NAME}, Los Angeles, California.`,
    body: `<p class="lead">${COPY.about || `${BRAND} lists every HAZWOPER-related course we offer online, with a page for each one, so workers, supervisors and employers can compare training levels, prices and the regulation each course meets, then enroll in one checkout.`}</p>
  <h2>Who runs ${BRAND}</h2>
  <p>${BRAND} is operated by ${LEGAL_NAME}, a limited liability company registered in California with its office in Los Angeles. The same company runs <a href="${MAIN_SITE}">hazwoper-osha.com</a>, the learning platform where the courses on this site are delivered, so a learner's login, progress, certificate and wallet card are all in one account.</p>
  <h2>What we offer</h2>
  <ul>
    <li>${courses.length} online courses: OSHA HAZWOPER 40 hour, 24 hour and 8 hour refresher, supervisor, incident command, first responder awareness, industry-specific 40 hour, Cal/OSHA, Spanish, RCRA hazardous waste and TSDF training.</li>
    ${ALL_GUIDES.length ? `<li>${ALL_GUIDES.length} free ${GUIDES_NAME}${QUIZZES.length ? ` and ${QUIZZES.length} practice quizzes with answers` : ''}, free to read with no sign-up.</li>` : ''}
    <li>One cart and one checkout for a single learner or a whole team, with phone and email help for group orders and purchase orders.</li>
  </ul>
  <h2>How the training works</h2>
  <p>Courses are 100% online and self-paced. Learners study on any device, progress saves automatically, and a certificate of completion and wallet card are available as soon as the final exam is passed. Each course page lists the regulation it is written to, such as OSHA 29 CFR 1910.120, 29 CFR 1926.65, Cal/OSHA 8 CCR 5192 or EPA RCRA. Online training covers the classroom portion of HAZWOPER; employers remain responsible for site-specific training and any supervised field experience OSHA requires.</p>
  ${ALL_GUIDES.length ? `<h2>How we write our ${GUIDES_NAME}</h2>
  <p>Our ${GUIDES_NAME} summarize federal OSHA, Cal/OSHA, EPA and DOT rules in plain English for training and review. They are not legal advice, so always check the current regulation text and your site safety and health plan.</p>` : ''}
  <h2>Company details</h2>
  <ul>
    <li>Legal name: ${LEGAL_NAME}</li>
    <li>Address: ${ADDRESS_TEXT}</li>
    <li>Phone: <a href="${PHONE_HREF}">${PHONE}</a></li>
    <li>Email: <a href="mailto:${EMAIL}">${EMAIL}</a></li>
    <li>Learning platform: <a href="${MAIN_SITE}">hazwoper-osha.com</a></li>
  </ul>
  <p>Questions? See the <a href="../contact/">contact page</a>. How we handle your information is set out in our <a href="../privacy/">privacy policy</a>.</p>` },
  { slug: 'contact', type: 'ContactPage', short: 'Contact', title: 'Contact Us', h1: `Contact ${BRAND}`,
    desc: `Contact ${BRAND}: call ${PHONE} or email ${EMAIL} for HAZWOPER course advice, group orders and purchase orders. ${LEGAL_NAME}, Los Angeles, CA.`,
    body: `<p class="lead">Reach the ${BRAND} team by phone or email. We help learners choose the right HAZWOPER level, set up group and purchase-order orders for employers, and answer questions about course access and certificates.</p>
  <h2>Phone</h2>
  <p><a href="${PHONE_HREF}">${PHONE}</a> for course advice, group orders and purchase-order billing.</p>
  <h2>Email</h2>
  <ul>
    <li>Sales, group quotes and purchase orders: <a href="mailto:${EMAIL}">${EMAIL}</a></li>
    <li>Enrollment requests, course access, certificates and privacy requests: <a href="mailto:${ENROLL_EMAIL}">${ENROLL_EMAIL}</a></li>
  </ul>
  <h2>Mailing address</h2>
  <p>${LEGAL_NAME}<br>${ADDRESS.streetAddress}<br>${ADDRESS.addressLocality}, ${ADDRESS.addressRegion} ${ADDRESS.postalCode}<br>USA</p>
  <h2>Before you get in touch</h2>
  <ul>
    <li>Not sure which course you need? Start with the <a href="../#faq">frequently asked questions</a> or the <a href="../guides/">${GUIDES_NAME}</a>.</li>
    <li>Buying for a team? Add every course to the <a href="../checkout.html">cart</a>, set the number of seats for each and check out once, or email us for a quote.</li>
    <li>Already enrolled? Learner logins are emailed once your order is confirmed. Sign in at <a href="${MAIN_SITE}">hazwoper-osha.com</a> to continue your course.</li>
  </ul>
  <p>Include your name, your company if you are ordering for one, the courses and the number of learners, so we can answer in one reply.</p>` },
  { slug: 'privacy', type: 'WebPage', short: 'Privacy', title: `Privacy Policy`, h1: `${BRAND} Privacy Policy`,
    desc: `What information ${BRAND} collects, why, and who it is shared with: checkout, Stripe card payments, cart storage${ANALYTICS.length ? ' and analytics' : ''}. Published by ${LEGAL_NAME}.`,
    body: `<p class="lead">This policy explains what information ${BRAND} (${SITE_URL.replace(/^https?:\/\//, '')}) collects when you use this website, why, and who it is shared with. Last updated ${TRUST_UPDATED}.</p>
  <h2>Who we are</h2>
  <p>${BRAND} is operated by ${LEGAL_NAME}, ${ADDRESS_TEXT}. Courses bought here are delivered on the company's learning platform at hazwoper-osha.com. Learner accounts, orders and course records are covered by the <a href="${MAIN_PRIVACY}">HAZWOPER OSHA Training, LLC privacy policy</a>, which also explains how long information is kept, your rights (including California privacy rights) and how to make a request.</p>
  <h2>Information you give us</h2>
  <ul>
    <li><strong>Checkout.</strong> When you place an order, the name, company, phone, email and billing address you enter, and the courses and seats in your cart, are sent to the hazwoper-osha.com learning platform to create your learner account and order.</li>
    <li><strong>Card payments.</strong> Card details are entered into a form provided by Stripe and go directly to Stripe. They never touch our servers.</li>
    <li><strong>Enrollment requests, email and phone.</strong> An enrollment request opens in your own email app, and we receive only what you send. The same applies when you email or call us.</li>
  </ul>
  <h2>Information stored on your device</h2>
  <p>Your cart (the courses and seat counts you add) is saved in your browser's local storage so it is still there when you move between pages. It stays on your device until you check out or clear your browser data.${QUIZZES.length ? ' Practice quizzes are scored in your browser and your answers are not sent to us.' : ''}${PAGES.length ? ` The ${PAGES.map(pg => pg.short.toLowerCase()).join(' and ')} also runs in your browser.` : ''}</p>
  <h2>Analytics</h2>
  ${ANALYTICS.length ? `<p>We use ${ANALYTICS.join(' and ')} to understand how the site is used and to improve it. ${ANALYTICS.length > 1 ? 'These services set' : 'This service sets'} cookies or similar identifiers and collect information such as the pages you view, links you click, your device and browser type, approximate location derived from your IP address, and the site that referred you.${ANALYTICS.includes('Microsoft Clarity') ? ' Microsoft Clarity also records how you scroll and click on pages, as heatmaps and session replays.' : ''}${ANALYTICS.includes('Google Analytics') ? ` We also send Google Analytics events such as adding courses to the cart, enrollment requests and purchases (the order total and the courses ordered, not your contact or card details)${QUIZZES.length ? ', and practice quiz scores' : ''}.` : ''}</p>
  <p>${ANALYTICS.map(a => a === 'Google Analytics' ? '<a href="https://policies.google.com/privacy">Google\'s privacy policy</a>' : '<a href="https://privacy.microsoft.com/privacystatement">Microsoft\'s privacy statement</a>').join(' and ')} ${ANALYTICS.length > 1 ? 'explain' : 'explains'} how that data is processed. You can block these cookies in your browser settings${ANALYTICS.includes('Google Analytics') ? ', or install the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</a>' : ''}.</p>` : '<p>This site does not use analytics or advertising cookies.</p>'}
  <h2>How we use information</h2>
  <ul>
    <li>To create your learner account, process your order and deliver your courses, certificates and wallet cards.</li>
    <li>To answer your questions, quotes and enrollment requests.</li>
    <li>To understand which pages and courses are useful and to improve the site.</li>
  </ul>
  <h2>Who we share it with</h2>
  <ul>
    <li>Stripe, to process card payments.</li>
    ${ANALYTICS.length ? `<li>${ANALYTICS.map(a => a === 'Google Analytics' ? 'Google' : 'Microsoft').join(' and ')}, for the analytics described above.</li>` : ''}
    <li>GitHub, which hosts this website and keeps standard server logs, including IP addresses, for security.</li>
  </ul>
  <p>Any other sharing of order and learner information is described in the <a href="${MAIN_PRIVACY}">full privacy policy</a>.</p>
  <h2>Your choices and rights</h2>
  <p>To access, correct or delete your personal information, or to ask a privacy question, email <a href="mailto:${ENROLL_EMAIL}">${ENROLL_EMAIL}</a> or write to ${LEGAL_NAME}, ${ADDRESS_TEXT}. California residents and others with privacy rights under local law can use the same contact details.</p>
  <h2>Changes to this policy</h2>
  <p>When our practices change we will update this page and the date at the top.</p>` },
];

// Replaces {{course:slug|text}}, {{guide:slug|text}} and {{quiz:slug|text}} with links; unknown slugs fail the build.
function links(html, rel) {
  const depth = (rel.match(/\.\.\//g) || []).length;
  html = html.replace(/\{\{cards:(guides|quizzes)\}\}/g, (_, kind) => `<div class="grid">${(kind === 'guides'
    ? ALL_GUIDES.map(g => guideCard(g, depth)) : QUIZZES.map(q => quizCard(q, depth))).join('\n')}</div>`);
  html = html.replace(/\{\{(price|enroll|cart):([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (_, kind, slug, cls) => {
    const c = COURSE_BY_SLUG[slug];
    if (!c) throw new Error(`unknown course in ${kind} token: ${slug}`);
    if (kind === 'price') return money(c.price);
    return kind === 'enroll' ? enrollBtn(c, cls || 'btn btn-lg', depth) : cartBtn(c, cls || 'btn', depth);
  });
  return html.replace(/\{\{(course|guide|quiz|page):([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (_, kind, slug, text) => {
    if (kind === 'page') {
      const pg = PAGES.find(x => x.slug === slug);
      if (!pg) throw new Error(`unknown page link: ${slug}`);
      return `<a href="${rel}${slug}/">${esc(text || pg.short)}</a>`;
    }
    const target = { course: COURSE_BY_SLUG, guide: GUIDE_BY_SLUG, quiz: QUIZ_BY_SLUG }[kind][slug];
    if (!target) throw new Error(`unknown ${kind} link: ${slug}`);
    const dir = { course: 'courses', guide: 'guides', quiz: 'quizzes' }[kind];
    return `<a href="${rel}${dir}/${slug}/">${esc(text || target.name || target.short)}</a>`;
  });
}
const stripTags = html => html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '<=').replace(/&ge;/g, '>=')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
// Adds ids to <h2>s and returns the table of contents.
function withToc(html) {
  const toc = [];
  const out = html.replace(/<h2>(.*?)<\/h2>/g, (_, inner) => {
    const id = slugify(stripTags(inner));
    toc.push([id, stripTags(inner)]);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}
const faqLd = faq => ({ '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbLd = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) });
const guidesFor = slug => ALL_GUIDES.filter(g => g.related.includes(slug));
const quizzesFor = slug => QUIZZES.filter(q => q.course === slug);

// The organization is its own top-level Organization block on every page (agents look for it there);
// @graph blocks refer to it by @id, which also types it as an EducationalOrganization.
const orgLd = {
  '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: BRAND, legalName: LEGAL_NAME, url: SITE_URL + '/',
  description: COPY.footerBlurb || 'Online OSHA HAZWOPER, RCRA and hazardous materials training for workers, supervisors and employers across the United States.',
  sameAs: SAME_AS, logo: `${SITE_URL}/${SHARE_IMAGE}`,
  email: EMAIL, telephone: PHONE, areaServed: 'US',
  address: { '@type': 'PostalAddress', ...ADDRESS },
  contactPoint: { '@type': 'ContactPoint', telephone: PHONE, email: EMAIL, contactType: 'sales', areaServed: 'US', availableLanguage: ['English', 'Spanish'] },
};
const orgRef = { '@type': 'EducationalOrganization', '@id': orgLd['@id'], name: BRAND, url: orgLd.url };
const ldBlocks = graph => jsonLd({ '@context': 'https://schema.org', ...orgLd }) + '\n' + jsonLd({ '@context': 'https://schema.org', '@graph': [orgRef, ...graph] });
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
  // The brand leads the title so searches for the brand plus its product find this site.
  const title = HOME.title || `${BRAND} | HAZWOPER Training Online: OSHA 40, 24 & 8 Hour Certification`;
  const desc = HOME.desc || `Online OSHA HAZWOPER training: 40 hour from ${money(249.99)}, 24 hour, 8 hour refresher, supervisor, first responder, Cal/OSHA, Spanish and RCRA. ${total} courses, instant certificates, 29 CFR 1910.120 compliant.`;
  const ld = ldBlocks([
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL + '/', name: `${BRAND} - HAZWOPER Courses`, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'ItemList', name: 'HAZWOPER Training Courses', numberOfItems: total,
      itemListElement: courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: courseLd(c) })) },
    faqLd(FAQ),
  ]);
  const f40 = courses.find(c => c.name === 'OSHA 40 Hour HAZWOPER Training');
  const f24 = courses.find(c => c.name === 'OSHA 24 Hour HAZWOPER Training');
  const f8 = courses.find(c => c.name === 'OSHA 8 Hour HAZWOPER Refresher Training');
  const f4 = courses.find(c => /4-Hour HAZWOPER First Responder/.test(c.name));
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
      <p class="eyebrow">${HOME.eyebrow || 'OSHA 29 CFR 1910.120 &amp; 1926.65 Compliant'}</p>
      <h1>${HOME.h1 || 'HAZWOPER Training Online: 40 Hour, 24 Hour &amp; 8 Hour Refresher Certification'}</h1>
      <p class="lead">${HOME.lead || 'Every HAZWOPER course in one place. Get OSHA HAZWOPER certified 100% online with self-paced training, instant printable certificates and wallet cards, and support from real safety professionals. English and Spanish.'}</p>
      <div class="hero-ctas">
        ${HOME.ctas ? links(HOME.ctas, '') : `${enrollBtn(f40, 'btn btn-lg')}
        <a class="btn btn-ghost btn-lg" href="#courses">Browse all ${total} courses</a>
        <a class="btn btn-ghost btn-lg" href="quizzes/">Free practice tests</a>`}
      </div>
      <ul class="trust">
        ${(HOME.trust || ['Instant certificate &amp; wallet card', '24/7 access on any device', 'Save progress, finish at your pace', 'One cart for your whole team']).map(t => `<li>${t}</li>`).join('\n        ')}
      </ul>
    </div>
    <div class="quick" aria-label="${esc(HOME.quickTitle || 'Most popular')} HAZWOPER courses">
      <h2>${HOME.quickTitle || 'Most popular'}</h2>
      ${(HOME.quick ? HOME.quick.map(x => COURSE_BY_SLUG[x]) : [f40, f24, f8, f4]).map(c => `<a class="quick-row" href="courses/${c.slug}/"><span>${esc(c.name.replace(/^OSHA /, ''))}</span><strong>${money(c.price)}</strong></a>`).join('')}
      <p class="quick-note">${HOME.quickNote ? links(HOME.quickNote, '') : `Not sure which level you need? <a href="#which">Use the guide below</a> or call <a href="${PHONE_HREF}">${PHONE}</a>.`}</p>
    </div>
  </div>
</section>

${HOME.middle ? links(HOME.middle, '') : `<section class="wrap which" id="which" aria-labelledby="h-which">
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
</section>`}

<section class="courses" id="courses" aria-labelledby="h-courses">
  <div class="wrap">
    <div class="courses-head">
      <h2 id="h-courses">${HOME.coursesTitle || 'All HAZWOPER Training Courses'}</h2>
      <label class="search"><span class="sr">Search courses</span><input id="q" type="search" placeholder="Search: 40 hour, refresher, RCRA, Cal/OSHA, 1910.120..." autocomplete="off"></label>
    </div>
    <nav class="jump" aria-label="Course categories">${GROUPS.map(g => `<a href="#${g.id}">${esc(g.title)}</a>`).join('')}</nav>
    <p id="noresults" class="noresults" hidden>No courses match that search. Call <a href="${PHONE_HREF}">${PHONE}</a> and we will point you to the right training.</p>
    ${groupsHtml}
  </div>
</section>

${HOME.after ? links(HOME.after, '') : `<section class="wrap about" aria-labelledby="h-about">
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
        <li>One cart and one checkout for every course your team needs</li>
      </ul>
    </div>
  </div>
</section>

<section class="wrap resources" id="resources" aria-labelledby="h-resources">
  <h2 id="h-resources">Free HAZWOPER guides &amp; resources</h2>
  <p class="group-blurb">Plain-English answers to HAZWOPER questions, written from the OSHA, Cal/OSHA and EPA rules.</p>
  <div class="grid">${ALL_GUIDES.map(g => guideCard(g)).join('\n')}</div>
  <h2 class="mt">Free HAZWOPER practice quizzes</h2>
  <p class="group-blurb">Test yourself before the final exam. Every question has an answer and explanation.</p>
  <div class="grid">${QUIZZES.map(q => quizCard(q)).join('\n')}</div>
</section>`}

<section class="faq" id="faq" aria-labelledby="h-faq">
  <div class="wrap">
    <h2 id="h-faq">${HOME.faqTitle || 'HAZWOPER Training FAQ'}</h2>
    ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-row">
    <h2>${HOME.ctaTitle || 'Start your HAZWOPER certification today'}</h2>
    <div>${HOME.ctaButtons ? links(HOME.ctaButtons, '') : `${enrollBtn(f40, 'btn btn-lg btn-dark')} <a class="btn btn-ghost btn-lg" href="${PHONE_HREF}">Call ${PHONE}</a>`}</div>
  </div>
</section>
` + foot(0);
  writePage('index.html', html);
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
  const ld = ldBlocks([courseLd(c), crumbs]);
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
    ${enrollBtn(c, 'btn btn-lg btn-block', 2)}
    ${cartBtn(c, 'btn btn-ghost btn-lg btn-block mt-sm', 2)}
    <ul class="checks small">
      ${(COURSE_COPY.buyChecks || ['Start immediately after checkout', 'Progress saves automatically', 'Certificate the moment you pass']).map(x => `<li>${x}</li>`).join('\n      ')}
    </ul>
    <p class="buy-note">Buying for a team? <a href="mailto:${EMAIL}?subject=${encodeURIComponent('Group quote: ' + c.name)}">Get group pricing</a></p>
  </aside>
</section>
<section class="wrap course-body">
  <h2>${COURSE_COPY.whoTitle || 'Who should take this course'}</h2>
  <p>${esc(c.audience || 'Workers and supervisors who need hazardous waste and emergency response training.')}</p>${COURSE_COPY.extra ? '\n  ' + links(COURSE_COPY.extra(c), '../../') : ''}
  <h2>${COURSE_COPY.howTitle || 'How it works'}</h2>
  <ol>
    ${(COURSE_COPY.howSteps || ['Enroll and pay securely online.', 'Log in and work through the lessons at your own pace on desktop, tablet or phone.', 'Pass the final exam and instantly download your certificate of completion and wallet card.']).map(x => `<li>${x}</li>`).join('\n    ')}
  </ol>
  ${c.altTags && c.altTags.length ? `<h2>Also known as</h2><p>${c.altTags.map(esc).join(' · ')}</p>` : ''}
  ${(() => {
    const gs = guidesFor(c.slug), qs = quizzesFor(c.slug);
    if (!gs.length && !qs.length) return '';
    return `<h2>${COURSE_COPY.resourcesTitle || 'Study guides &amp; practice quizzes'}</h2>
  <ul class="res-list">${gs.map(g => `<li><a href="../../guides/${g.slug}/">${esc(g.title)}</a></li>`).join('')}${qs.map(q => `<li><a href="../../quizzes/${q.slug}/">Free quiz: ${esc(q.title)}</a></li>`).join('')}</ul>`;
  })()}
  <h2>${COURSE_COPY.relatedTitle || 'Related HAZWOPER courses'}</h2>
  <div class="grid">${related.concat(more).map(x => card(x, 2)).join('\n')}</div>
</section>
` + foot(2);
  writePage(`courses/${c.slug}/index.html`, html);
}

// ---------- guide & quiz pages ----------
const PUBLISHED = '2026-10-24';
const readMins = html => Math.max(2, Math.round(stripTags(html).split(' ').length / 220));
function guideCard(g, depth = 0) {
  const rel = '../'.repeat(depth);
  return `<article class="card card-res">
  <div class="card-top"><span class="pill pill-soft">${esc(GUIDE_COPY.cardLabel || 'Guide')}</span><span class="muted small">${readMins(g.body)} min read</span></div>
  <h3><a href="${rel}guides/${g.slug}/">${esc(g.title)}</a></h3>
  <p class="cite">${GUIDE_COPY.fullCardDesc ? esc(g.desc) : `${esc(g.desc.slice(0, 140).replace(/\s\S*$/, ''))}...`}</p>
  <div class="card-actions"><a class="link" href="${rel}guides/${g.slug}/">${esc(GUIDE_COPY.readLink || 'Read the guide')}</a></div>
</article>`;
}
function quizCard(q, depth = 0) {
  const rel = '../'.repeat(depth);
  return `<article class="card card-res">
  <div class="card-top"><span class="pill pill-soft">Free quiz</span><span class="muted small">${q.questions.length} questions</span></div>
  <h3><a href="${rel}quizzes/${q.slug}/">${esc(q.title)}</a></h3>
  <p class="cite">${QUIZ_COPY.fullCardDesc ? esc(q.desc) : `${esc(q.desc.slice(0, 120).replace(/\s\S*$/, ''))}...`}</p>
  <div class="card-actions"><a class="btn" href="${rel}quizzes/${q.slug}/">Start quiz</a></div>
</article>`;
}

function buildGuide(g) {
  const url = guideUrl(g);
  const { html: body, toc } = withToc(links(g.body, '../../'));
  const courseList = g.related.map(s => COURSE_BY_SLUG[s]).filter(Boolean);
  if (courseList.length !== g.related.length) throw new Error(`guide ${g.slug} lists an unknown course`);
  const quiz = g.quiz && QUIZ_BY_SLUG[g.quiz];
  if (g.quiz && !quiz) throw new Error(`guide ${g.slug} lists an unknown quiz`);
  const others = ALL_GUIDES.filter(x => x.slug !== g.slug);
  const graph = [
    { '@type': 'Article', '@id': url + '#article', headline: g.title, description: g.desc, url, mainEntityOfPage: url,
      datePublished: PUBLISHED, dateModified: TODAY, inLanguage: 'en', image: `${SITE_URL}/${SHARE_IMAGE}`,
      author: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` },
      about: ['HAZWOPER', 'OSHA 29 CFR 1910.120'], isPartOf: { '@id': `${SITE_URL}/#website` } },
    crumbLd([['HAZWOPER Training', SITE_URL + '/'], [GUIDE_COPY.label || 'Guides', `${SITE_URL}/guides/`], [g.title, url]])];
  if (g.faq.length) graph.push(faqLd(g.faq));
  if (g.slug === GLOSSARY_GUIDE.slug) graph.push({ '@type': 'DefinedTermSet', '@id': url + '#terms', name: 'HAZWOPER Glossary', url,
    hasDefinedTerm: GLOSSARY.map(([t, d]) => ({ '@type': 'DefinedTerm', name: t, description: d, url: `${url}#${slugify(t)}` })) });
  const html = head({ title: `${g.title} | ${BRAND}`, desc: g.desc, canonical: url, depth: 2, extra: ldBlocks(graph) }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../../">HAZWOPER Training</a> › <a href="../">${esc(GUIDE_COPY.label || 'Guides')}</a> › <span>${esc(g.short)}</span></nav>
<div class="wrap guide-layout">
  <article class="guide">
    <p class="eyebrow">${esc(GUIDE_COPY.eyebrow || 'HAZWOPER guide')} · ${readMins(g.body)} min read · Updated ${TODAY}</p>
    <h1>${esc(g.title)}</h1>
    ${toc.length > 2 ? `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>` : ''}
    ${body}
    ${g.faq.length ? `<h2 id="faq">Frequently asked questions</h2>\n    ${g.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}` : ''}
    <p class="disclaimer">This guide summarizes federal OSHA, Cal/OSHA and EPA rules for training purposes. It is not legal advice. Always check the current regulation text and your site safety and health plan.</p>
  </article>
  <aside class="guide-side">
    <div class="side-box">
      <h2>${GUIDE_COPY.sideCourses || 'Get trained'}</h2>
      ${courseList.map(c => `<div class="side-course"><a href="../../courses/${c.slug}/">${esc(c.name)}</a><div class="side-row"><span>${esc(c.duration)} · <strong>${money(c.price)}</strong></span>${cartBtn(c, 'btn btn-sm', 2)}</div></div>`).join('')}
    </div>
    ${quiz ? `<div class="side-box side-quiz"><h2>Test yourself</h2><p>${quiz.questions.length} free questions with answers.</p><a class="btn btn-block" href="../../quizzes/${quiz.slug}/">${esc(quiz.short)}</a></div>` : ''}
  </aside>
</div>
<section class="wrap course-body">
  <h2>${GUIDE_COPY.moreTitle || 'More HAZWOPER guides'}</h2>
  <div class="grid">${others.slice(0, 6).map(x => guideCard(x, 2)).join('\n')}</div>
</section>
` + foot(2);
  writePage(`guides/${g.slug}/index.html`, html);
}

function buildGuidesHub() {
  const url = `${SITE_URL}/guides/`;
  const ld = ldBlocks([
    { '@type': 'CollectionPage', '@id': url, url, name: GUIDE_COPY.hubName || 'HAZWOPER Guides', description: GUIDE_COPY.hubName ? GUIDE_COPY.hubDesc : 'Free HAZWOPER guides', isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@type': 'ItemList', itemListElement: ALL_GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: guideUrl(g), name: g.title })) } },
    crumbLd([['HAZWOPER Training', SITE_URL + '/'], [GUIDE_COPY.label || 'Guides', url]])]);
  const html = head({ title: GUIDE_COPY.hubTitle || `HAZWOPER Guides: Free OSHA 1910.120 Training Resources | ${BRAND}`,
    desc: GUIDE_COPY.hubDesc || `Free HAZWOPER guides: what HAZWOPER is, 40 vs 24 vs 8 hour training, refresher rules, PPE levels, decon, air monitoring, medical surveillance, Cal/OSHA, RCRA and a ${GLOSSARY.length}-term glossary.`,
    canonical: url, depth: 1, extra: ld }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../">HAZWOPER Training</a> › <span>${esc(GUIDE_COPY.label || 'Guides')}</span></nav>
<section class="wrap course-body">
  <h1>${GUIDE_COPY.hubH1 || 'HAZWOPER Guides &amp; Resources'}</h1>
  <p class="lead">${GUIDE_COPY.hubLead || 'Everything about OSHA HAZWOPER in one place: who needs training, how much, what the rules say about PPE, decontamination, air monitoring, medical surveillance and emergency response, plus RCRA hazardous waste and Cal/OSHA.'}</p>
  <h2 class="sr">${esc(GUIDE_COPY.allLink || 'All HAZWOPER guides')}</h2>
  <div class="grid">${ALL_GUIDES.map(g => guideCard(g, 1)).join('\n')}</div>
  ${QUIZZES.length ? `<h2>${QUIZ_COPY.hubSection || 'Practice quizzes'}</h2>
  <div class="grid">${QUIZZES.map(q => quizCard(q, 1)).join('\n')}</div>` : ''}
</section>
` + foot(1);
  writePage('guides/index.html', html);
}

function buildQuiz(q) {
  const url = quizUrl(q);
  const c = COURSE_BY_SLUG[q.course];
  const g = GUIDE_BY_SLUG[q.guide];
  if (!c || !g) throw new Error(`quiz ${q.slug} has an unknown course or guide`);
  q.questions.forEach((x, i) => { if (!(x.a >= 0 && x.a < x.o.length)) throw new Error(`quiz ${q.slug} question ${i + 1} has a bad answer index`); });
  const graph = [
    { '@type': 'Quiz', '@id': url + '#quiz', name: q.title, description: q.desc, url, inLanguage: 'en', educationalLevel: 'beginner',
      learningResourceType: 'Practice problem', isAccessibleForFree: true, provider: { '@id': `${SITE_URL}/#organization` },
      about: { '@type': 'Thing', name: g.short },
      hasPart: q.questions.map(x => ({ '@type': 'Question', eduQuestionType: 'Multiple choice', text: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.o[x.a], answerExplanation: { '@type': 'Comment', text: x.e } },
        suggestedAnswer: x.o.filter((_, i) => i !== x.a).map(o => ({ '@type': 'Answer', text: o })) })) },
    crumbLd([['HAZWOPER Training', SITE_URL + '/'], ['Quizzes', `${SITE_URL}/quizzes/`], [q.title, url]])];
  const html = head({ title: `${q.title} (Free, With Answers) | ${BRAND}`, desc: q.desc, canonical: url, depth: 2,
    extra: ldBlocks(graph) + '\n<noscript><style>.explain{display:block}</style></noscript>' }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../../">HAZWOPER Training</a> › <a href="../">Quizzes</a> › <span>${esc(q.short)}</span></nav>
<section class="wrap quiz-wrap">
  <p class="eyebrow">Free practice quiz · ${q.questions.length} questions</p>
  <h1>${esc(q.title)}</h1>
  <p class="lead">Answer every question, then press <strong>Check my answers</strong> to see your score and an explanation for each one. Study first with the guide: <a href="../../guides/${g.slug}/">${esc(g.title)}</a>.</p>
  <form class="quiz" id="quiz" data-total="${q.questions.length}">
    ${q.questions.map((x, i) => `<fieldset class="q" data-answer="${x.a}">
      <legend><span class="qn">${i + 1}.</span> ${esc(x.q)}</legend>
      ${x.o.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}"> <span>${esc(o)}</span></label>`).join('\n      ')}
      <p class="explain"><strong>Answer: ${esc(x.o[x.a])}.</strong> ${esc(x.e)}</p>
    </fieldset>`).join('\n    ')}
    <div class="quiz-actions"><button type="submit" class="btn btn-lg">Check my answers</button> <button type="button" class="btn btn-ghost btn-lg" id="quizReset" hidden>Try again</button></div>
  </form>
  <div class="quiz-result" id="quizResult" hidden aria-live="polite">
    <p class="score" id="quizScore"></p>
    <p id="quizMsg"></p>
    <p>Ready for the real thing? <a href="../../courses/${c.slug}/">${esc(c.name)}</a>: ${esc(c.duration)}, ${money(c.price)}.</p>
    <p>${enrollBtn(c, 'btn btn-lg', 2)} ${cartBtn(c, 'btn btn-ghost btn-lg', 2)}</p>
  </div>
</section>
<section class="wrap course-body">
  <h2>More free HAZWOPER quizzes</h2>
  <div class="grid">${QUIZZES.filter(x => x.slug !== q.slug).map(x => quizCard(x, 2)).join('\n')}</div>
</section>
` + foot(2, ['cart.js', 'quiz.js']);
  writePage(`quizzes/${q.slug}/index.html`, html);
}

function buildQuizHub() {
  const url = `${SITE_URL}/quizzes/`;
  const ld = ldBlocks([
    { '@type': 'CollectionPage', '@id': url, url, name: QUIZ_COPY.hubName || 'Free HAZWOPER Practice Quizzes', isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@type': 'ItemList', itemListElement: QUIZZES.map((q, i) => ({ '@type': 'ListItem', position: i + 1, url: quizUrl(q), name: q.title })) } },
    crumbLd([['HAZWOPER Training', SITE_URL + '/'], ['Quizzes', url]])]);
  const total = QUIZZES.reduce((n, q) => n + q.questions.length, 0);
  const html = head({ title: QUIZ_COPY.hubTitle || `Free HAZWOPER Practice Tests & Quizzes With Answers | ${BRAND}`,
    desc: (QUIZ_COPY.hubDesc || `${total} free HAZWOPER practice test questions with answers and explanations: 40 hour, 8 hour refresher, PPE levels, air monitoring, decon, first responder awareness and RCRA.`).replace('{total}', total),
    canonical: url, depth: 1, extra: ld }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../">HAZWOPER Training</a> › <span>Quizzes</span></nav>
<section class="wrap course-body">
  <h1>${QUIZ_COPY.hubH1 || 'Free HAZWOPER Practice Tests &amp; Quizzes'}</h1>
  <p class="lead">${(QUIZ_COPY.hubLead || '{total} practice questions with instant scoring and an explanation for every answer. No sign-up needed.').replace('{total}', total)}</p>
  <h2 class="sr">All practice quizzes</h2>
  <div class="grid">${QUIZZES.map(q => quizCard(q, 1)).join('\n')}</div>
  <h2>Study guides</h2>
  <div class="grid">${ALL_GUIDES.slice(0, 6).map(g => guideCard(g, 1)).join('\n')}</div>
</section>
` + foot(1);
  writePage('quizzes/index.html', html);
}

// ---------- standalone pages (data/copy.js pages) ----------
// Each page: { slug, title, short, desc, h1, body (HTML with link tokens), scripts: [...], faq: [[q, a]] }
function buildPage(pg) {
  const url = `${SITE_URL}/${pg.slug}/`;
  const graph = [{ '@type': pg.type || 'WebPage', '@id': url, url, name: pg.title, description: pg.desc, isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(pg.type ? { about: { '@id': orgLd['@id'] }, dateModified: TRUST_UPDATED } : {}) },
    crumbLd([['HAZWOPER Training', SITE_URL + '/'], [pg.short, url]])];
  if (pg.faq && pg.faq.length) graph.push(faqLd(pg.faq));
  const html = head({ title: `${pg.title} | ${BRAND}`, desc: pg.desc, canonical: url, depth: 1, extra: ldBlocks(graph) }) + `
<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="../">HAZWOPER Training</a> › <span>${esc(pg.short)}</span></nav>
<section class="wrap course-body ${pg.type ? 'trust-page' : 'tool-page'}">
  <h1>${pg.h1 || esc(pg.title)}</h1>
  ${links(pg.body, '../')}
  ${pg.faq && pg.faq.length ? `<h2 id="faq">Frequently asked questions</h2>\n  ${pg.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}` : ''}
</section>
` + foot(1, ['config.js', 'cart.js'].concat(pg.scripts || []));
  writePage(`${pg.slug}/index.html`, html);
}

// ---------- Markdown versions ----------
// Every content page also gets an index.md next to its index.html, converted from the page's <main>.
// The HTML links to it with rel="alternate", and edge/worker.mjs serves it for Accept: text/markdown.
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const BLOCK_TAGS = new Set(['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'legend', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'ul']);
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', le: '<=', ge: '>=', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', copy: '©', reg: '®', trade: '™', deg: '°', times: '×', rarr: '→', larr: '←', sect: '§' };
const decodeEntities = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] !== '#' ? (ENTITIES[e.toLowerCase()] ?? m)
  : String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)));

// Minimal parser for the well-formed HTML this script generates.
function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) { top.children.push({ text: m[4] }); continue; }
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.map(n => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    const attrs = {};
    m[3].replace(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g, (_, k, a, b, c) => { attrs[k.toLowerCase()] = decodeEntities(a ?? b ?? c ?? ''); });
    const node = { tag, attrs, children: [] };
    top.children.push(node);
    if (!VOID_TAGS.has(tag) && !/\/\s*$/.test(m[3])) stack.push(node);
  }
  return root;
}

const hasClass = (n, c) => ` ${n.attrs.class || ''} `.includes(` ${c} `);
// Interface-only markup: scripts, form controls, screen-reader labels, in-page navigation and hidden or JS-only elements.
const mdSkip = n => n.tag && (['script', 'style', 'noscript', 'svg', 'button', 'input', 'select', 'textarea', 'template'].includes(n.tag)
  || 'hidden' in n.attrs || 'data-add-to-cart' in n.attrs || ['sr', 'toc', 'jump', 'crumbs', 'step-n', 'skip'].some(c => hasClass(n, c)));
const isMdBlock = n => n.tag && (BLOCK_TAGS.has(n.tag) || (n.tag === 'label' && hasClass(n, 'opt')) || (n.tag === 'a' && hasClass(n, 'quick-row')));

function mdInline(n, base) {
  if (!n.tag) return decodeEntities(n.text).replace(/\s+/g, ' ');
  if (mdSkip(n)) return '';
  const inner = () => n.children.map(x => mdInline(x, base)).join('');
  const wrap = (mark, t = inner().trim()) => t ? `${mark}${t}${mark}` : '';
  switch (n.tag) {
    case 'br': return '\n';
    case 'strong': case 'b': return wrap('**');
    case 'em': case 'i': return wrap('*');
    case 'code': return wrap('`');
    case 'img': return n.attrs.alt ? `![${n.attrs.alt}](${new URL(n.attrs.src, base).href})` : '';
    case 'a': {
      const t = inner().replace(/\s+/g, ' ').trim();
      return t && n.attrs.href ? `[${t}](${new URL(n.attrs.href, base).href})` : t;
    }
    default: return inner();
  }
}
const mdText = (n, base) => n.children.map(x => mdInline(x, base)).join('').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();

// Renders a container's children as Markdown blocks; runs of inline content become paragraphs.
function mdBlocks(n, base, ctx = {}) {
  const out = [];
  let run = [];
  const flush = () => { const t = mdText({ children: run }, base); if (t) out.push(t); run = []; };
  for (const c of n.children) {
    if (mdSkip(c)) continue;
    if (!isMdBlock(c)) { run.push(c); continue; }
    flush();
    out.push(...mdBlock(c, base, ctx));
  }
  flush();
  // Join neighbouring one-line list items (cards, options) into one tight list.
  return out.reduce((acc, b) => {
    const prev = acc[acc.length - 1];
    if (prev !== undefined && /^- /.test(b) && /^- /.test(prev.split('\n').pop()) && !b.includes('\n') && !/\n\s/.test(prev)) acc[acc.length - 1] = prev + '\n' + b;
    else acc.push(b);
    return acc;
  }, []);
}

function mdBlock(n, base, ctx) {
  const find = (node, test) => { for (const c of node.children || []) { if (c.tag && test(c)) return c; const f = c.tag && find(c, test); if (f) return f; } return null; };
  const text = node => node ? mdText(node, base) : '';
  const h = /^h([1-6])$/.exec(n.tag);
  if (h) return ctx.inList ? [`**${text(n)}**`] : [`${'#'.repeat(+h[1])} ${text(n)}`];
  switch (n.tag) {
    case 'p': case 'summary': { const t = text(n); return t ? [t] : []; }
    case 'legend': return [`**${text(n)}**`];
    case 'hr': return ['---'];
    case 'pre': return ['```\n' + decodeEntities(n.children.map(c => c.text || '').join('')) + '\n```'];
    case 'blockquote': return [mdBlocks(n, base, ctx).join('\n\n').replace(/^/gm, '> ')];
    case 'label': return [`- ${text(n)}`];
    case 'a': { // quick-row: <a><span>course</span><strong>price</strong></a>
      const name = find(n, c => c.tag === 'span'), price = find(n, c => c.tag === 'strong');
      return [`- [${text(name || n)}](${new URL(n.attrs.href, base).href})${price ? ' · ' + text(price) : ''}`];
    }
    case 'ul': case 'ol': {
      const items = n.children.filter(c => c.tag === 'li' && !mdSkip(c));
      return [items.map((li, i) => {
        const marker = n.tag === 'ol' ? `${i + 1}. ` : '- ';
        return marker + mdBlocks(li, base, { ...ctx, inList: true }).join('\n\n').replace(/\n/g, '\n' + ' '.repeat(marker.length));
      }).join('\n')];
    }
    case 'dl': {
      const lines = [];
      const walk = node => node.children.forEach(c => {
        if (!c.tag || mdSkip(c)) return;
        if (c.tag === 'div') return walk(c);
        if (c.tag === 'dt') lines.push(`- **${text(c)}:**`);
        if (c.tag === 'dd') lines[lines.length - 1] += ' ' + text(c);
      });
      walk(n);
      return lines.length ? [lines.join('\n')] : [];
    }
    case 'table': {
      const rows = [];
      const walk = node => node.children.forEach(c => { if (c.tag === 'tr') rows.push(c.children.filter(x => x.tag === 'th' || x.tag === 'td')); else if (c.tag) walk(c); });
      walk(n);
      if (!rows.length) return [];
      const width = Math.max(...rows.map(r => r.length));
      const line = cells => `| ${Array.from({ length: width }, (_, i) => (cells[i] ? mdBlocks(cells[i], base, ctx).join(' ') : '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`;
      return [[line(rows[0]), `|${' --- |'.repeat(width)}`, ...rows.slice(1).map(line)].join('\n')];
    }
    case 'details': {
      const q = n.children.find(c => c.tag === 'summary');
      return [ctx.inList ? `**${text(q)}**` : `### ${text(q)}`, ...mdBlocks({ children: n.children.filter(c => c !== q) }, base, ctx)];
    }
    case 'div':
      if (hasClass(n, 'grid')) return [n.children.filter(c => c.tag === 'article').map(c => mdBlock(c, base, ctx)[0]).filter(Boolean).join('\n')];
      return mdBlocks(n, base, ctx);
    case 'article':
      // Course, guide and quiz cards become one list line: link · label · price or length - summary.
      if (hasClass(n, 'card')) {
        const link = find(n, c => /^h[2-4]$/.test(c.tag));
        const top = find(n, c => hasClass(c, 'card-top'));
        const meta = top ? top.children.filter(c => c.tag).map(text).filter(Boolean) : [];
        const cite = find(n, c => hasClass(c, 'cite'));
        return [`- ${text(link)}${meta.length ? ' · ' + meta.join(' · ') : ''}${cite ? ' - ' + text(cite) : ''}`];
      }
      return mdBlocks(n, base, ctx);
    default: return mdBlocks(n, base, ctx);
  }
}

function pageMarkdown(html, url) {
  const main = /<main id="main">([\s\S]*?)<\/main>/.exec(html);
  if (!main) throw new Error(`no <main> in ${url}`);
  const lines = mdBlocks(parseHtml(main[1]), url).join('\n\n').split('\n');
  // The H1 leads the document even when an eyebrow line comes before it on the page.
  const h1 = lines.findIndex(l => l.startsWith('# '));
  if (h1 > 0) lines.unshift(...lines.splice(h1, 1), '');
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}

---

Page: ${url}
${BRAND}: [Home](${SITE_URL}/) · [Courses](${SITE_URL}/#courses) · ${TRUST_PAGES.map(pg => `[${pg.short}](${SITE_URL}/${pg.slug}/)`).join(' · ')} · [llms.txt](${SITE_URL}/llms.txt) · [Sitemap](${SITE_URL}/sitemap.xml)
Questions: ${PHONE} · ${EMAIL}
`;
}

// Writes an HTML page and, unless md is false, its Markdown version (index.html -> index.md) linked from <head>.
function writePage(file, html, md = true) {
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (md) {
    const url = /<link rel="canonical" href="([^"]+)">/.exec(html)[1];
    html = html.replace('</head>', `<link rel="alternate" type="text/markdown" href="${url}index.md">\n</head>`);
    fs.writeFileSync(out.replace(/\.html$/, '.md'), pageMarkdown(html, url));
  }
  fs.writeFileSync(out, html);
}

// ---------- sitewide search ----------
// Paths are relative to the site root; search.html resolves them.
function buildSearch() {
  const idx = [];
  courses.forEach(c => idx.push({ k: 'Course', t: c.name, u: `courses/${c.slug}/`, d: `${c.duration} · ${money(c.price)} · ${c.citation}`,
    x: [c.category, c.audience, (c.altTags || []).join(' ')].join(' '), s: c.slug }));
  ALL_GUIDES.forEach(g => idx.push({ k: 'Guide', t: g.title, u: `guides/${g.slug}/`, d: g.desc,
    x: withToc(g.body).toc.map(t => t[1]).join(' ') + ' ' + g.faq.map(f => f[0]).join(' ') }));
  GLOSSARY.forEach(([t, d]) => idx.push({ k: 'Glossary', t, u: `guides/${GLOSSARY_GUIDE.slug}/#${slugify(t)}`, d }));
  QUIZZES.forEach(q => idx.push({ k: 'Quiz', t: q.title, u: `quizzes/${q.slug}/`, d: q.desc, x: q.questions.map(x => x.q).join(' ') }));
  PAGES.forEach(pg => idx.push({ k: 'Tool', t: pg.title, u: `${pg.slug}/`, d: pg.desc }));
  TRUST_PAGES.forEach(pg => idx.push({ k: 'Page', t: pg.h1, u: `${pg.slug}/`, d: pg.desc }));
  ALL_GUIDES.forEach(g => g.faq.forEach(([q, a]) => idx.push({ k: 'FAQ', t: q, u: `guides/${g.slug}/#faq`, d: a })));
  FAQ.forEach(([q, a]) => idx.push({ k: 'FAQ', t: q, u: '#faq', d: a }));
  fs.writeFileSync(path.join(ROOT, 'assets/search-index.js'), `// Generated by tools/build.js - sitewide search index.\nvar HZ_SEARCH = ${JSON.stringify(idx)};\n`);

  const html = head({ title: `Search | ${BRAND}`, desc: `Search HAZWOPER courses, guides, quizzes and glossary terms.`, canonical: `${SITE_URL}/search/`, depth: 1 })
    .replace('content="index, follow', 'content="noindex, follow') + `
<section class="wrap course-body search-page">
  <h1>Search HAZWOPER courses, guides &amp; quizzes</h1>
  <form class="search-big" action="./" method="get" role="search">
    <label class="sr" for="sq">Search</label>
    <input id="sq" name="q" type="search" placeholder="${esc(COPY.searchExamples || 'Try: 40 hour, refresher, PPE level B, IDLH, Cal/OSHA, RCRA...')}" autocomplete="off">
    <button type="submit" class="btn btn-lg">Search</button>
  </form>
  <p id="searchStatus" class="muted" aria-live="polite"></p>
  <ol id="searchResults" class="results"></ol>
  <div id="searchEmpty" hidden>
    <p>Nothing matched. Try fewer words, or browse:</p>
    <ul class="res-list"><li><a href="../#courses">All courses</a></li><li><a href="../guides/">${esc(GUIDE_COPY.allLink || 'All guides')}</a></li>${QUIZZES.length ? '<li><a href="../quizzes/">All quizzes</a></li>' : ''}${GLOSSARY.length ? `<li><a href="../guides/${GLOSSARY_GUIDE.slug}/">Glossary</a></li>` : ''}${PAGES.map(pg => `<li><a href="../${pg.slug}/">${esc(pg.short)}</a></li>`).join('')}</ul>
    <p>Or call <a href="${PHONE_HREF}">${PHONE}</a> and we'll point you to the right training.</p>
  </div>
</section>
` + foot(1, ['cart.js', 'search-index.js', 'site-search.js']);
  fs.mkdirSync(path.join(ROOT, 'search'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'search/index.html'), html);
}

// ---------- extras ----------
function buildExtras() {
  const urls = [{ loc: SITE_URL + '/', pri: '1.0' }].concat(courses.map(c => ({ loc: c.url, pri: c.group === 'core' ? '0.9' : '0.8' })),
    [{ loc: `${SITE_URL}/guides/`, pri: '0.9' }], ALL_GUIDES.map(g => ({ loc: guideUrl(g), pri: '0.8' })),
    QUIZZES.length ? [{ loc: `${SITE_URL}/quizzes/`, pri: '0.8' }] : [], QUIZZES.map(q => ({ loc: quizUrl(q), pri: '0.7' })),
    PAGES.map(pg => ({ loc: `${SITE_URL}/${pg.slug}/`, pri: '0.8' })), TRUST_PAGES.map(pg => ({ loc: `${SITE_URL}/${pg.slug}/`, pri: '0.5' })));
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

> ${COPY.llmsSummary || `${BRAND} offers the complete catalog of OSHA HAZWOPER (29 CFR 1910.120 / 1926.65) training online: 40 hour, 24 hour, 8 hour annual refresher, supervisor, incident command, first responder awareness, industry-specific 40 hour, Cal/OSHA (8 CCR 5192), Spanish, RCRA hazardous waste and TSDF courses. All courses are self-paced and online with instant certificates and wallet cards.`} Contact: ${EMAIL}, ${PHONE}.

## Key facts

- Provider: ${LEGAL_NAME} (${MAIN_SITE})
- Format: 100% online, self-paced, any device, progress saved automatically
- Certificate: certificate of completion and wallet card available immediately after passing
- Languages: English; OSHA 40-Hour HAZWOPER also in Spanish
- Employers: one cart and one checkout for every course and seat a team needs

## When to use ${BRAND}

${(COPY.whenToUse || [
    'Find and compare online OSHA HAZWOPER courses side by side with prices: 40 hour, 24 hour, 8 hour annual refresher, supervisor, incident command and first responder awareness.',
    'Work out which HAZWOPER level a job requires under 29 CFR 1910.120 / 1926.65, or the California version under 8 CCR 5192.',
    'Find a specialised course: industry-specific 40 hour, the Spanish-language 40 hour, RCRA hazardous waste and TSDF training, or short modules on PPE, decontamination, air monitoring and spill response.',
    'Buy HAZWOPER training for one worker or several in one checkout, with a certificate of completion and wallet card for each learner.',
  ]).map(x => `- ${x}`).join('\n')}

Not a fit for: legal advice or official OSHA interpretations (use osha.gov and the regulation text); the supervised field experience and site-specific training that employers provide on site; courses outside the HAZWOPER, RCRA and hazardous waste catalog below.

## How agents can use this site

- Course facts: each course below links to a page with its length, price in US dollars, the regulation it meets and who it is for. The same catalog is JSON at ${SITE_URL}/courses.json (slug, name, price, currency, duration, citation, group, url, markdown, checkout).
- Markdown: every content page has a Markdown version at its URL plus \`index.md\`, for example ${SITE_URL}/index.md and ${courses[0].url}index.md.
- Enrollment: send the user to ${SITE_URL}/checkout.html?item=<course-slug>, for example ${SITE_URL}/checkout.html?item=${courses[0].slug}. The buyer enters their details and pays by card through Stripe on that page. There is no public ordering API.
- Teams and purchase orders: add several courses and seats to one cart, or call ${PHONE} or email ${EMAIL} for a quote or purchase-order billing.
- After purchase, course access, certificates and wallet cards are on the learning platform at ${MAIN_SITE}.

## Company

- ${LEGAL_NAME}, ${ADDRESS_TEXT}
- Phone ${PHONE}, email ${EMAIL}
${TRUST_PAGES.map(pg => `- [${pg.h1}](${SITE_URL}/${pg.slug}/)`).join('\n')}

## Courses

${GROUPS.map(g => `### ${g.title}\n\n${courses.filter(c => c.group === g.id).map(c => `- [${c.name}](${c.url}): ${c.duration}, ${money(c.price)}. Meets ${c.citation}.`).join('\n')}`).join('\n\n')}

## ${GUIDE_COPY.label || 'Guides'}

${ALL_GUIDES.map(g => `- [${g.title}](${guideUrl(g)}): ${g.desc}`).join('\n')}
${PAGES.length ? `\n## Tools\n\n${PAGES.map(pg => `- [${pg.title}](${SITE_URL}/${pg.slug}/): ${pg.desc}`).join('\n')}\n` : ''}${QUIZZES.length ? `
## Free practice quizzes

${QUIZZES.map(q => `- [${q.title}](${quizUrl(q)}): ${q.questions.length} questions with answers.`).join('\n')}
` : ''}
## FAQ

${FAQ.map(([q, a]) => `- **${q}** ${a}`).join('\n')}

## Full text

The full text of every guide, the glossary and all quiz questions with answers is at ${SITE_URL}/llms-full.txt
`);
  // Full-text version for answer engines: every guide, glossary term and quiz answer as plain text.
  const mdLinks = html => html.replace(/\{\{(course|guide|quiz):([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, (_, kind, slug, text) => {
    const t = { course: COURSE_BY_SLUG, guide: GUIDE_BY_SLUG, quiz: QUIZ_BY_SLUG }[kind][slug];
    return text || t.name || t.short;
  });
  const toText = html => mdLinks(html).replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n### $1\n\n').replace(/<li>/g, '\n- ').replace(/<tr>/g, '\n').replace(/<\/t[dh]>/g, ' | ')
    .replace(/<\/p>/g, '\n\n').replace(/<dt>(.*?)<\/dt>/g, '\n- **$1**: ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '<=').replace(/&ge;/g, '>=')
    .replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n /g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), `# ${BRAND} - HAZWOPER guides, glossary and practice questions (full text)

> Source: ${SITE_URL}/ . Courses: ${SITE_URL}/#courses . Contact: ${EMAIL}, ${PHONE}.

${ALL_GUIDES.map(g => `## ${g.title}\n\nURL: ${guideUrl(g)}\n\n${toText(g.body)}${g.faq.length ? '\n\n### FAQ\n\n' + g.faq.map(([q, a]) => `- **${q}** ${a}`).join('\n') : ''}\n\nRelated courses: ${g.related.map(s => `${COURSE_BY_SLUG[s].name} (${COURSE_BY_SLUG[s].url})`).join('; ')}`).join('\n\n---\n\n')}

${QUIZZES.length ? `---

## Practice quiz questions and answers

${QUIZZES.map(q => `### ${q.title}\n\nURL: ${quizUrl(q)}\n\n${q.questions.map((x, i) => `${i + 1}. ${x.q}\n   Answer: ${x.o[x.a]}. ${x.e}`).join('\n')}`).join('\n\n')}
` : ''}`);
  // 404 is served at any path, so every relative link becomes absolute.
  const absolute = html => html.replace(/(href|src|action)="(?!https?:|mailto:|tel:)(?:\.\/)?([^"]*)"/g, `$1="${SITE_URL}/$2"`);
  fs.writeFileSync(path.join(ROOT, '404.html'), absolute(head({ title: `Page not found | ${BRAND}`, desc: 'Page not found.', canonical: SITE_URL + '/' })
    .replace('content="index, follow', 'content="noindex, follow') + `
<section class="wrap course-body"><h1>Page not found</h1><p>Try the search box above, or <a href="./">browse all HAZWOPER training courses</a>, <a href="guides/">${GUIDES_NAME}</a>${QUIZZES.length ? ' and <a href="quizzes/">quizzes</a>' : ''}.</p></section>
` + foot(0)));
  // Markdown body for 404s requested with Accept: text/markdown (served by edge/worker.mjs).
  fs.writeFileSync(path.join(ROOT, '404.md'), `# Page not found (404)

There is no page at this address on ${BRAND}. The link may be mistyped, or the page may have moved.

## Where to go next

- [${BRAND} home: all ${courses.length} HAZWOPER courses](${SITE_URL}/)
- [llms.txt: a guide to this site for AI agents](${SITE_URL}/llms.txt)
- [Sitemap of every page](${SITE_URL}/sitemap.xml)
- [Course catalog as JSON](${SITE_URL}/courses.json)
- [${GUIDE_COPY.label || 'Guides'}](${SITE_URL}/guides/)
- [Contact](${SITE_URL}/contact/)

Need help finding a course? Call ${PHONE} or email ${EMAIL}.
`);
  fs.writeFileSync(path.join(ROOT, 'courses.json'), JSON.stringify(courses.map(c => ({ slug: c.slug, name: c.name, price: c.price, currency: 'USD', duration: c.duration,
    citation: c.citation, group: c.group, url: c.url, markdown: c.url + 'index.md', checkout: `${SITE_URL}/checkout.html?item=${c.slug}` })), null, 1) + '\n');
  fs.writeFileSync(path.join(ROOT, 'data/courses.json'), JSON.stringify(courses.map(({ slug, name, price, duration, citation, group, url }) => ({ slug, name, price, duration, citation, group, url })), null, 1) + '\n');
}

// ---------- checkout ----------
function buildCheckout() {
  const items = {};
  courses.forEach(c => { items[c.slug] = { type: 'course', name: c.name, price: c.price, courseId: c.lmsId }; });
  fs.writeFileSync(path.join(ROOT, 'assets/config.js'), `// Generated by tools/build.js from data/lms-ids.json - edit those, not this file.
var STRIPE_PUBLISHABLE_KEY = ${JSON.stringify(STRIPE_PUBLISHABLE_KEY)};
var API_BASE_URL = ${JSON.stringify(API_BASE_URL)};
var ENROLL_EMAIL = ${JSON.stringify(ENROLL_EMAIL)};
var ORDER_FROM = ${JSON.stringify(ORDER_FROM)};
var PHONE = ${JSON.stringify(PHONE)};
var PHONE_HREF = ${JSON.stringify(PHONE_HREF.replace('tel:', ''))};
// true sends every order as an enrollment-request email instead of card checkout.
var CHECKOUT_DISABLED = false;
// Every seat is charged at full list price; there are no volume discounts.
var HZ_ITEMS = ${JSON.stringify(items)};

function activeStripeKey() { return STRIPE_PUBLISHABLE_KEY; }
function findHzItem(slug) { return Object.prototype.hasOwnProperty.call(HZ_ITEMS, slug) ? HZ_ITEMS[slug] : null; }
function formatMoney(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
`);

  const states = 'AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming'
    .split('|').map(x => `<option value="${x.slice(0, 2)}">${x.slice(3)}</option>`).join('');
  const field = (id, label, attrs = '', req = true) => `<div class="form-group"><label for="${id}">${label}${req ? ' <span class="req">*</span>' : ''}</label><input id="${id}" class="form-control" ${req ? 'required ' : ''}${attrs}></div>`;

  const html = head({ title: `Checkout | ${BRAND}`, desc: `Secure checkout for ${BRAND} HAZWOPER courses.`, canonical: SITE_URL + '/checkout.html' })
    .replace('content="index, follow', 'content="noindex, follow') + `
<section class="wrap checkout-wrap">
  <div class="checkout-header">
    <h1>Your cart &amp; checkout</h1>
    <p id="enrollModeNote">Send this enrollment request and our team replies by email with your order confirmation and payment options (credit card, or purchase order for companies). Learner logins are emailed once the order is confirmed. Prefer to talk? Call <a href="${PHONE_HREF}">${PHONE}</a> or email <a href="mailto:${ENROLL_EMAIL}">${ENROLL_EMAIL}</a>.</p>
  </div>

  <div id="checkoutSuccessView" class="done-card" hidden>
    <h2>Order confirmed</h2>
    <p>Thank you for your purchase. Your payment has been processed.</p>
    <p>Order reference: <strong id="successOrderId">#---</strong><br>Confirmation sent to: <strong id="successUserEmail">---</strong></p>
    <p>Check your inbox for your receipt and course login details to start training.</p>
    <a class="btn btn-lg" href="./">Back to courses</a>
  </div>

  <div id="requestSentView" class="done-card" hidden>
    <h2>Your enrollment request is ready</h2>
    <p>Your email app should have opened with the request below, addressed to ${ENROLL_EMAIL}. Press send and our team will reply with your order confirmation and payment options.</p>
    <p>If your email app didn't open, copy the request and email it to <a href="mailto:${ENROLL_EMAIL}">${ENROLL_EMAIL}</a>, or call <a href="${PHONE_HREF}">${PHONE}</a>.</p>
    <pre id="requestSummaryText" tabindex="0"></pre>
    <p><button type="button" id="copyRequestBtn" class="btn btn-ghost">Copy request</button> <a id="reopenEmailLink" class="btn" href="mailto:${ENROLL_EMAIL}">Open email again</a></p>
  </div>

  <div id="cartEmpty" class="done-card" hidden>
    <h2>Your cart is empty</h2>
    <p>Add the courses you need, then come back here to check out once for all of them.</p>
    <p><a class="btn btn-lg" href="./#courses">Browse courses</a> <a class="btn btn-ghost btn-lg" href="guides/">Not sure? Read the guides</a></p>
  </div>

  <form id="stripeCheckoutForm" class="checkout-grid">
    <div class="checkout-main">
      <div class="checkout-section">
        <h2>Courses in your cart</h2>
        <ul id="cartLines" class="cart-lines"></ul>
        <p class="hint">Seats = number of learners for each course. Every seat is full list price. Learner names and emails can be added after the order is confirmed. <a href="./#courses">Add more courses</a></p>
      </div>
      <div class="checkout-section">
        <h2>Contact information</h2>
        <div class="form-row">${field('billingFirstName', 'First name', 'autocomplete="given-name"')}${field('billingLastName', 'Last name', 'autocomplete="family-name"')}</div>
        ${field('billingCompany', 'Company / organization', 'autocomplete="organization"', false)}
        <div class="form-row">${field('billingPhone', 'Phone', 'type="tel" autocomplete="tel"')}${field('billingEmail', 'Email address', 'type="email" autocomplete="email"')}</div>
        <div id="billingAddressFields">
          <div class="form-row">${field('billingAddress', 'Street address', 'autocomplete="address-line1"')}${field('billingAddress2', 'Suite, apt, building', 'autocomplete="address-line2"', false)}</div>
          <div class="form-row">${field('billingCity', 'City', 'autocomplete="address-level2"')}
            <div class="form-group"><label for="billingState">State <span class="req">*</span></label><select id="billingState" class="form-control" required><option value="">Select a state</option>${states}</select></div></div>
          <div class="form-row">${field('billingZip', 'Zip code', 'autocomplete="postal-code"')}
            <div class="form-group"><label for="billingCountry">Country <span class="req">*</span></label><select id="billingCountry" class="form-control" required><option value="US" selected>United States</option><option value="CA">Canada</option></select></div></div>
        </div>
      </div>

      <div class="checkout-section" id="requestSection">
        <h2>Notes for our team</h2>
        <div class="form-group">
          <label for="requestNotes">Anything we should know? (optional)</label>
          <textarea id="requestNotes" class="form-control" rows="3" placeholder="Purchase order number, invoicing contact, deadline, more courses to add"></textarea>
        </div>
        <p class="hint">No payment is taken on this page, and sending a request doesn't commit you to buy.</p>
        <div id="request-error" class="pay-error" hidden></div>
        <button type="submit" class="btn btn-lg btn-block">Send enrollment request</button>
      </div>

      <div class="checkout-section" id="paymentSection" hidden>
        <h2>Payment</h2>
        <div class="card-field"><div id="payment-element"></div></div>
        <div id="payment-error" class="pay-error" role="alert" hidden></div>
        <button type="submit" id="submitPaymentBtn" class="btn btn-lg btn-block"><span class="btn-text">Place order</span><span class="btn-spinner" hidden>Processing...</span></button>
        <p class="hint">Payments are processed securely by Stripe. Card details never touch our servers.</p>
      </div>
    </div>

    <aside class="checkout-sidebar">
      <div class="summary">
        <h2>Order summary</h2>
        <div id="summaryLines"></div>
        <div class="sum-row sum-total"><span>Total</span><span id="summaryTotal"></span></div>
        <ul class="checks small"><li>Instant certificate &amp; wallet card</li><li>Self-paced, 24/7 access</li><li>Support by phone and email</li></ul>
      </div>
    </aside>
  </form>
</section>
` + foot(0, ['config.js', 'cart.js', 'checkout.js']);
  fs.writeFileSync(path.join(ROOT, 'checkout.html'), html);
}

['courses', 'guides', 'quizzes', 'search'].concat(PAGES.map(pg => pg.slug), TRUST_PAGES.map(pg => pg.slug)).forEach(d => fs.rmSync(path.join(ROOT, d), { recursive: true, force: true }));
buildIndex();
courses.forEach(buildCourse);
ALL_GUIDES.forEach(buildGuide);
buildGuidesHub();
QUIZZES.forEach(buildQuiz);
if (QUIZZES.length) buildQuizHub();
PAGES.forEach(buildPage);
TRUST_PAGES.forEach(buildPage);
buildSearch();
buildExtras();
buildCheckout();
console.log(`Built index + ${courses.length} course, ${ALL_GUIDES.length} guide, ${QUIZZES.length} quiz and ${PAGES.length} tool pages for ${SITE_URL}`);
