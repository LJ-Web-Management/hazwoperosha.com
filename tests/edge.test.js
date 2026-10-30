// Runs edge/worker.mjs against the built site, served the way GitHub Pages serves it.
// Run after `node tools/build.js`: node --test tests/*.test.js
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = /<link rel="canonical" href="([^"]+?)\/?">/.exec(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))[1];
const TYPES = { '.html': 'text/html; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png' };

// GitHub Pages stand-in: directories redirect to a trailing slash and serve index.html; anything else
// missing is a 404 with 404.html.
const originCalls = [];
async function pages(request) {
  originCalls.push(new URL(request.url).pathname);
  const url = new URL(request.url);
  const file = path.join(ROOT, decodeURIComponent(url.pathname));
  let target = null;
  if (file.startsWith(ROOT) && fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) return new Response(null, { status: 301, headers: { Location: url.pathname + '/', 'Vary': 'Accept-Encoding' } });
      if (fs.existsSync(path.join(file, 'index.html'))) target = path.join(file, 'index.html');
    } else target = file;
  }
  const status = target ? 200 : 404;
  target = target || path.join(ROOT, '404.html');
  return new Response(request.method === 'HEAD' ? null : fs.readFileSync(target), {
    status, headers: { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream', 'Vary': 'Accept-Encoding' },
  });
}

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
