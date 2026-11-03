// Runs edge/worker.mjs against the built site, served the way GitHub Pages serves it.
// Run after `node tools/build.js`: node --test tests/*.test.js
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = /<link rel="canonical" href="([^"]+?)\/?">/.exec(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))[1];
const pages = require('./pages-stub.js')(ROOT);
const originCalls = pages.calls;

let worker;
before(async () => { worker = await import('../edge/worker.mjs'); });
const get = (p, accept, method = 'GET') => worker.handle(new Request(SITE_URL + p, { method, headers: accept === undefined ? {} : { accept } }), pages);
const varyAccept = res => (res.headers.get('vary') || '').split(',').map(s => s.trim().toLowerCase()).includes('accept');

test('Accept parsing follows the acceptmarkdown.com test vectors', () => {
  const both = ['text/html', 'text/markdown'];
  const cases = [
    ['text/markdown', both, 'text/markdown'],
    ['text/markdown, text/html;q=0.8', both, 'text/markdown'],
    ['text/html', both, 'text/html'],
    ['text/markdown;q=0, text/html', both, 'text/html'],
    ['text/markdown;q=0', ['text/markdown'], null],
    [null, both, 'text/html'],
    ['', both, 'text/html'],
    ['*/*', both, 'text/html'],
    ['text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8', both, 'text/html'],
    ['text/markdown, text/html, */*', both, 'text/markdown'],
    ['text/html;q=0, */*', both, 'text/markdown'],
    ['text/markdown;q=0.5, text/html;q=0.9', both, 'text/html'],
    ['TEXT/Markdown; Q=0.9, text/html;q=0.1', both, 'text/markdown'],
    ['text/*', both, 'text/html'],
    ['application/pdf', both, null],
  ];
  for (const [accept, produces, want] of cases) assert.equal(worker.preferredType(accept, produces), want, `Accept: ${accept}`);
});

test('markdownPath maps page URLs to their index.md', () => {
  assert.equal(worker.markdownPath('/'), '/index.md');
  assert.equal(worker.markdownPath('/about'), '/about/index.md');
  assert.equal(worker.markdownPath('/about/'), '/about/index.md');
  assert.equal(worker.markdownPath('/index.html'), '/index.md');
  assert.equal(worker.markdownPath('/checkout.html'), '/checkout.md');
});

test('homepage: Accept text/markdown gets Markdown with Vary: Accept', async () => {
  const res = await get('/', 'text/markdown');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.ok(varyAccept(res));
  assert.match(res.headers.get('vary'), /accept-encoding/i, 'keeps the origin Vary values');
  const body = await res.text();
  assert.match(body, /^# \S/);
  assert.equal(body, fs.readFileSync(path.join(ROOT, 'index.md'), 'utf8'));
});

test('homepage: Accept text/html (and browsers, and no Accept) get HTML with Vary: Accept and a Markdown Link', async () => {
  for (const accept of ['text/html', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', undefined, '*/*']) {
    const res = await get('/', accept);
    assert.equal(res.status, 200, String(accept));
    assert.match(res.headers.get('content-type'), /^text\/html/);
    assert.ok(varyAccept(res));
    assert.equal(res.headers.get('link'), '</index.md>; rel="alternate"; type="text/markdown"');
    assert.match(await res.text(), /^<!doctype html>/);
  }
});

test('q-values decide between Markdown and HTML', async () => {
  assert.match((await get('/', 'text/markdown, text/html;q=0.8')).headers.get('content-type'), /^text\/markdown/);
  assert.match((await get('/', 'text/markdown;q=0.5, text/html')).headers.get('content-type'), /^text\/html/);
});

test('an Accept header that excludes HTML and Markdown gets 406', async () => {
  const res = await get('/', 'application/pdf');
  assert.equal(res.status, 406);
  assert.ok(varyAccept(res));
  assert.match(await res.text(), /text\/markdown/);
});

test('every page with a Markdown version negotiates, with or without the trailing slash', async () => {
  for (const p of ['/about/', '/about', '/contact/', '/privacy/', '/guides/', '/courses/osha-40-hour-hazwoper-training/']) {
    const res = await get(p, 'text/markdown');
    assert.equal(res.status, 200, p);
    assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8', p);
    assert.ok(varyAccept(res), p);
    assert.match(await res.text(), /^# /, p);
  }
});

test('unknown paths: Markdown 404 body for agents, HTML 404 for browsers', async () => {
  const md = await get('/__probe-does-not-exist', 'text/markdown');
  assert.equal(md.status, 404);
  assert.equal(md.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.ok(varyAccept(md));
  const body = await md.text();
  assert.ok(body.length >= 20);
  assert.ok(body.includes(`${SITE_URL}/llms.txt`) && body.includes(`${SITE_URL}/sitemap.xml`));

  const html = await get('/__probe-does-not-exist', 'text/html');
  assert.equal(html.status, 404);
  assert.match(html.headers.get('content-type'), /^text\/html/);
  assert.ok(varyAccept(html));
});

test('a page without a Markdown version falls back to HTML only when HTML is acceptable', async () => {
  const ok = await get('/checkout.html', 'text/markdown, text/html;q=0.5');
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('content-type'), /^text\/html/);
  assert.equal((await get('/checkout.html', 'text/markdown')).status, 406);
});

test('HEAD requests negotiate without a body', async () => {
  const res = await get('/', 'text/markdown', 'HEAD');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await res.text(), '');
});

test('the bare domain gets a 301 to the canonical www host, keeping path and query, without reaching the origin', async () => {
  const host = new URL(SITE_URL).hostname;
  assert.match(host, /^www\./, 'the site lives on www, so the bare domain is the one to redirect');
  const env = { CANONICAL_HOST: host };
  const apex = SITE_URL.replace('://www.', '://');
  originCalls.length = 0;
  for (const [p, accept, method] of [['/', 'text/markdown'], ['/', 'text/html'], ['/courses/osha-40-hour-hazwoper-training/?ref=a&b=1', undefined],
    ['/llms.txt', undefined], ['/no-such-page', 'text/markdown'], ['/', undefined, 'HEAD'], ['/', undefined, 'POST']]) {
    const res = await worker.handle(new Request(apex + p, { method: method || 'GET', headers: accept ? { accept } : {} }), pages, env);
    assert.equal(res.status, 301, `${method || 'GET'} ${p}`);
    assert.equal(res.headers.get('location'), SITE_URL + p, p);
  }
  assert.deepEqual(originCalls, [], 'redirects are answered at the edge');

  const www = await worker.handle(new Request(SITE_URL + '/', { headers: { accept: 'text/markdown' } }), pages, env);
  assert.equal(www.status, 200, 'the canonical host is served, not redirected');
  assert.equal(www.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal((await worker.handle(new Request('https://hazwoperosha-com-edge.example.workers.dev/'), pages, env)).status, 200, 'other hosts are not redirected');
  assert.equal((await worker.handle(new Request(apex + '/'), pages, {})).status, 200, 'no CANONICAL_HOST, no redirect');
  assert.equal(worker.apexRedirect(new URL('https://example.com/'), 'example.com'), null, 'a canonical host without www never redirects');
});

test('wrangler.toml routes www and the bare domain and names the site host as CANONICAL_HOST', () => {
  const toml = fs.readFileSync(path.join(ROOT, 'edge/wrangler.toml'), 'utf8');
  const host = new URL(SITE_URL).hostname, apex = host.replace(/^www\./, '');
  for (const pattern of [`${host}/*`, `${apex}/*`]) assert.ok(toml.includes(`{ pattern = "${pattern}", zone_name = "${apex}" }`), pattern);
  assert.match(toml, new RegExp(`\\n\\[vars\\]\\n(?:#.*\\n)*CANONICAL_HOST = "${host.replace(/\./g, '\\.')}"\\n`));
});

test('static files and non-GET requests pass through untouched', async () => {
  for (const p of ['/llms.txt', '/sitemap.xml', '/robots.txt', '/assets/style.css', '/index.md']) {
    originCalls.length = 0;
    const res = await get(p, 'text/markdown');
    assert.equal(res.status, 200, p);
    assert.deepEqual(originCalls, [p], `${p} is fetched once, as is`);
    assert.equal(res.headers.get('vary'), 'Accept-Encoding', p);
  }
  const post = await worker.handle(new Request(SITE_URL + '/', { method: 'POST', body: 'x', headers: { accept: 'text/markdown' } }), pages);
  assert.match(post.headers.get('content-type'), /^text\/html/);
});
