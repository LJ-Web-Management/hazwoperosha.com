// Checks the built site for what AI agents and crawlers rely on: content without JavaScript, metadata,
// Organization JSON-LD, about/contact/privacy pages, Markdown versions, llms.txt, sitemap and robots.txt.
// Run after `node tools/build.js`: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const INDEX = read('index.html');
const SITE_URL = /<link rel="canonical" href="([^"]+?)\/?">/.exec(INDEX)[1];
const BRAND = /<meta property="og:site_name" content="([^"]+)">/.exec(INDEX)[1];
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'edge', 'tests', 'tools', 'data', 'assets']);

function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(rel, ext, out); } else if (e.name.endsWith(ext)) out.push(rel);
  }
  return out;
}
const HTML_FILES = walk('.', '.html');
// Maps a site URL to the file GitHub Pages serves for it, or null if it is not on this site.
const fileFor = u => {
  if (!u.startsWith(SITE_URL + '/')) return null;
  const p = decodeURIComponent(new URL(u).pathname);
  return p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1);
};
const exists = f => fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).isFile();
const visibleText = html => html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<(script|style|noscript)[\s\S]*?<\/\1>/g, '')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const mainText = html => visibleText(/<main id="main">([\s\S]*?)<\/main>/.exec(html)[1]);
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

test('homepage serves meaningful content, one H1 and sequential headings without JavaScript', () => {
  assert.ok(mainText(INDEX).length >= 500);
  assert.equal((INDEX.match(/<h1[\s>]/g) || []).length, 1);
});

test('no page skips a heading level', () => {
  for (const f of HTML_FILES) {
    const levels = [...read(f).matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
    levels.forEach((l, i) => { if (i) assert.ok(l <= levels[i - 1] + 1, `${f}: h${levels[i - 1]} then h${l}`); });
  }
});

test('homepage metadata: lang, canonical, og:image, og:type and a brand-first title', () => {
  assert.match(INDEX, /<html lang="en">/);
  assert.match(INDEX, new RegExp(`<link rel="canonical" href="${SITE_URL}/">`));
  assert.match(INDEX, /<meta property="og:image" content="https:\/\/[^"]+">/);
  assert.match(INDEX, /<meta property="og:type" content="website">/);
  const title = /<title>([^<]+)<\/title>/.exec(INDEX)[1];
  assert.ok(title.startsWith(BRAND), `title "${title}" starts with the brand "${BRAND}"`);
  assert.ok(new URL(SITE_URL).hostname.replace(/^www\./, '').toLowerCase() === BRAND.toLowerCase(), 'brand matches the domain');
});

test('every page with JSON-LD leads with a complete Organization block', () => {
  for (const f of HTML_FILES.filter(f => read(f).includes('application/ld+json'))) {
    const [org, rest] = jsonLd(read(f));
    assert.equal(org['@context'], 'https://schema.org', f);
    assert.equal(org['@type'], 'Organization', f);
    assert.equal(org['@id'], `${SITE_URL}/#organization`);
    assert.equal(org.name, BRAND);
    assert.equal(org.url, SITE_URL + '/');
    for (const k of ['legalName', 'description', 'logo', 'email', 'telephone']) assert.ok(org[k], `${f}: Organization.${k}`);
    assert.equal(org.address['@type'], 'PostalAddress');
    for (const k of ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry']) assert.ok(org.address[k], `${f}: address.${k}`);
    assert.equal(org.contactPoint['@type'], 'ContactPoint');
    assert.ok(org.contactPoint.contactType && org.contactPoint.email && org.contactPoint.telephone);
    if (rest) assert.equal(rest['@graph'][0]['@id'], org['@id'], `${f}: the @graph refers to the same organization`);
  }
});

test('about, contact and privacy pages are real pages linked from every footer', () => {
  const types = { about: 'AboutPage', contact: 'ContactPage', privacy: 'WebPage' };
  for (const [slug, type] of Object.entries(types)) {
    const html = read(`${slug}/index.html`);
    assert.ok(mainText(html).length >= 500, `${slug} has at least 500 characters of content`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}/${slug}/">`));
    assert.equal(jsonLd(html)[1]['@graph'].find(n => n['@id'] === `${SITE_URL}/${slug}/`)['@type'], type);
    assert.match(INDEX, new RegExp(`<a href="${slug}/">`), `homepage links to /${slug}/`);
    assert.match(read(`guides/index.html`), new RegExp(`<a href="../${slug}/">`));
  }
  const contact = mainText(read('contact/index.html'));
  for (const s of ['+1-866-429-6742', 'sales@hazwoper-osha.com', 'Los Angeles, CA 90025']) assert.ok(contact.includes(s), `contact page shows ${s}`);
  assert.ok(mainText(read('privacy/index.html')).includes('info@hazwoper-osha.com'));
});

test('every content page has a Markdown version linked from its <head>', () => {
  let count = 0;
  for (const f of HTML_FILES) {
    const html = read(f);
    const alt = /<link rel="alternate" type="text\/markdown" href="([^"]+)">/.exec(html);
    if (/<meta name="robots" content="noindex/.test(html)) { assert.equal(alt, null, `${f} is noindex and has no Markdown`); continue; }
    assert.ok(alt, `${f} links a Markdown version`);
    const md = fileFor(alt[1]);
    assert.equal(md, f.replace(/\.html$/, '.md'));
    const body = read(md);
    assert.match(body, /^# \S/, `${md} starts with its H1`);
    assert.doesNotMatch(body, /<\/?(div|span|p|a|section|article|ul|ol|li|h\d|table|tr|td|strong|label|input|button)\b/, `${md} has no HTML left`);
    assert.doesNotMatch(body, /undefined|\[object /, md);
    assert.ok(body.includes(`Page: ${alt[1].replace(/index\.md$/, '')}`), `${md} names its page`);
    count++;
  }
  assert.ok(count > 50);
});

test('404: noindex HTML page plus a Markdown body that points agents to llms.txt and the sitemap', () => {
  assert.match(read('404.html'), /<meta name="robots" content="noindex/);
  const md = read('404.md');
  assert.match(md, /^# Page not found/);
  assert.ok(md.length >= 20);
  assert.ok(md.includes(`(${SITE_URL}/llms.txt)`) && md.includes(`(${SITE_URL}/sitemap.xml)`));
  for (const [, u] of md.matchAll(/\]\((https:[^)]+)\)/g)) assert.ok(exists(fileFor(u.split('#')[0])), `404.md link ${u} exists`);
});

test('llms.txt tells agents when to use the site and how, and every link in it resolves', () => {
  const llms = read('llms.txt');
  assert.match(llms, /^# .+\n\n> .+/);
  const when = /\n## When to use [^\n]+\n\n((?:- .+\n)+)/.exec(llms);
  assert.ok(when, 'has a "When to use" section');
  assert.ok(when[1].trim().split('\n').length >= 3);
  assert.match(llms, /\n## How agents can use this site\n/);
  assert.ok(llms.includes(`${SITE_URL}/checkout.html?item=`));
  for (const [, u] of llms.matchAll(/(https:\/\/[^\s)<>]+)/g)) {
    const f = fileFor(u.split(/[?#]/)[0].replace(/[.,]$/, ''));
    if (f) assert.ok(exists(f), `llms.txt link ${u}`);
  }
});

test('courses.json lists every course with working page, Markdown and checkout links', () => {
  const list = JSON.parse(read('courses.json'));
  const items = JSON.parse(/var HZ_ITEMS = (\{.*\});/.exec(read('assets/config.js'))[1]);
  assert.equal(list.length, Object.keys(items).length);
  for (const c of list) {
    assert.ok(c.name && c.price > 0 && c.currency === 'USD' && c.duration && c.citation, c.slug);
    assert.ok(exists(fileFor(c.url)) && exists(fileFor(c.markdown)), c.slug);
    assert.equal(c.checkout, `${SITE_URL}/checkout.html?item=${c.slug}`);
    assert.ok(items[c.slug], `checkout knows ${c.slug}`);
  }
});

test('sitemap.xml lists every indexable page with a lastmod date, and nothing else', () => {
  const xml = read('sitemap.xml');
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  const urls = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><priority>[01]\.\d<\/priority><\/url>/g)].map(m => m[1]);
  assert.equal(urls.length, (xml.match(/<url>/g) || []).length, 'every <url> has loc, lastmod and priority');
  assert.equal(new Set(urls).size, urls.length);
  for (const u of urls) assert.ok(exists(fileFor(u)), u);
  const indexable = HTML_FILES.filter(f => !/<meta name="robots" content="noindex/.test(read(f))).map(f => `${SITE_URL}/${f.replace(/index\.html$/, '')}`);
  assert.deepEqual([...urls].sort(), indexable.sort());
});

test('robots.txt lets search and AI agents in and points to the sitemap', () => {
  const robots = read('robots.txt');
  assert.doesNotMatch(robots, /Disallow:\s*\/\s*$/m);
  for (const ua of ['*', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot']) {
    assert.match(robots, new RegExp(`User-agent: ${ua.replace('*', '\\*')}\\nAllow: /\\n`), ua);
  }
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
});
