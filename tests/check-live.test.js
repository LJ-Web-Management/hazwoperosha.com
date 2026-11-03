// Runs tools/check-live.js against simulated deployments of the built site, so the live checker is known to
// pass a correct deployment and to catch the failures the Is Agentic audit reports.
// Run after `node tools/build.js`: node --test tests/*.test.js
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { checkSite, AGENTS } = require('../tools/check-live.js');

const ROOT = path.join(__dirname, '..');
const SITE_URL = /<link rel="canonical" href="([^"]+?)\/?">/.exec(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))[1];
const APEX = SITE_URL.replace('://www.', '://');
const pages = require('./pages-stub.js')(ROOT);
const byName = results => Object.fromEntries(results.map(r => [r.name, r]));

let worker;
before(async () => { worker = await import('../edge/worker.mjs'); });

test('with the edge Worker in front, the bare domain passes every check', async () => {
  const env = { CANONICAL_HOST: new URL(SITE_URL).hostname };
  const results = await checkSite(APEX, req => worker.handle(req, pages, env));
  for (const r of results) assert.equal(r.status, 'pass', `${r.name}: ${r.detail}`);
  assert.equal(results.length, 13);
  assert.match(byName(results)['Homepage over HTTPS'].detail, new RegExp(`^${APEX}/ 301 -> ${SITE_URL}/ 200$`));
});

test('GitHub Pages alone: everything passes except Markdown negotiation, and 404s get partial credit', async () => {
  const r = byName(await checkSite(SITE_URL, pages));
  assert.equal(r['Markdown content negotiation'].status, 'fail');
  assert.match(r['Markdown content negotiation'].detail, /Accept: text\/markdown -> 200 text\/html/);
  assert.equal(r['Agent-friendly 404'].status, 'partial');
  assert.match(r['Agent-friendly 404'].detail, /^404 text\/html.*needs a Markdown body/);
  const others = Object.values(r).filter(x => !['Markdown content negotiation', 'Agent-friendly 404'].includes(x.name));
  for (const x of others) assert.equal(x.status, 'pass', `${x.name}: ${x.detail}`);
});

test('a bare domain without a certificate fails, and says why', async () => {
  const noApexCert = req => {
    if (new URL(req.url).hostname === new URL(APEX).hostname) {
      return Promise.reject(new TypeError('fetch failed', { cause: Object.assign(new Error('altname'), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' }) }));
    }
    return pages(req);
  };
  const r = byName(await checkSite(APEX, noApexCert));
  assert.equal(r['Homepage over HTTPS'].status, 'fail');
  assert.match(r['Homepage over HTTPS'].detail, /ERR_TLS_CERT_ALTNAME_INVALID/);
  for (const name of ['Content without JavaScript', 'Agent User-Agents reach the homepage', 'Metadata (canonical, lang, og:image, og:type)',
    'JSON-LD structured data', 'Sitemap', 'llms.txt with "When to use"', 'About, contact and privacy pages']) assert.equal(r[name].status, 'fail', name);
});

test('a firewall rule that blocks one agent is reported by name', async () => {
  const waf = req => (req.headers.get('user-agent') || '').includes('GPTBot') ? Promise.resolve(new Response('Forbidden', { status: 403 })) : pages(req);
  const r = byName(await checkSite(SITE_URL, waf))['Agent User-Agents reach the homepage'];
  assert.equal(r.status, 'fail');
  assert.equal(r.detail, 'blocked: GPTBot (403)');
  assert.ok(Object.keys(AGENTS).includes('ClaudeBot') && Object.keys(AGENTS).length >= 6);
});

test('missing keywords, Organization details and thin trust pages are caught', async () => {
  const strip = async req => {
    const res = await pages(req);
    if (!(res.headers.get('content-type') || '').startsWith('text/html')) return res;
    let html = await res.text();
    html = html.replace(/<meta name="keywords"[^>]*>\n?/, '').replace(/"(keywords|knowsAbout|address|contactPoint)":/g, '"x$1":');
    if (/\/about\/$/.test(new URL(req.url).pathname)) html = html.replace(/<main id="main">[\s\S]*<\/main>/, '<main id="main"><h1>About</h1></main>');
    return new Response(html, { status: res.status, headers: res.headers });
  };
  const r = byName(await checkSite(SITE_URL, strip));
  assert.equal(r['Product terms for brand search'].status, 'fail');
  assert.equal(r['Organization address and contactPoint'].status, 'fail');
  assert.equal(r['About, contact and privacy pages'].status, 'fail');
  assert.match(r['About, contact and privacy pages'].detail, /^\/about 5 chars \(<500\)/);
  assert.equal(r['JSON-LD structured data'].status, 'pass');
});
