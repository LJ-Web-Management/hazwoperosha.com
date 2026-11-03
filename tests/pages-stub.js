// GitHub Pages stand-in for tests: serves the built site from disk the way Pages does. Directories
// redirect to a trailing slash and serve index.html; anything else missing is a 404 with 404.html.
// pages.calls records the path of every request, so tests can see what reached the origin.
const fs = require('fs');
const path = require('path');

const TYPES = { '.html': 'text/html; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png' };

module.exports = function createPages(root) {
  const calls = [];
  async function pages(request) {
    const url = new URL(request.url);
    calls.push(url.pathname);
    const file = path.join(root, decodeURIComponent(url.pathname));
    let target = null;
    if (file.startsWith(root) && fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        if (!url.pathname.endsWith('/')) return new Response(null, { status: 301, headers: { Location: url.pathname + '/', 'Vary': 'Accept-Encoding' } });
        if (fs.existsSync(path.join(file, 'index.html'))) target = path.join(file, 'index.html');
      } else target = file;
    }
    const status = target ? 200 : 404;
    target = target || path.join(root, '404.html');
    return new Response(request.method === 'HEAD' ? null : fs.readFileSync(target), {
      status, headers: { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream', 'Vary': 'Accept-Encoding' },
    });
  }
  pages.calls = calls;
  return pages;
};
