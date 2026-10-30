// Cloudflare Worker that sits in front of the GitHub Pages site and adds Markdown content
// negotiation (https://acceptmarkdown.com), which GitHub Pages cannot do on its own:
//   - Accept preferring text/markdown gets the page's index.md (written by tools/build.js) from the same
//     URL, with Content-Type: text/markdown; charset=utf-8.
//   - Unknown paths requested as Markdown get a 404 with /404.md as the body.
//   - Every negotiated response carries Vary: Accept; HTML responses advertise their Markdown version
//     in a Link header.
//   - An Accept header that rules out both HTML and Markdown gets 406 Not Acceptable.
// Static files (CSS, JS, images, txt, xml, json, md) pass straight through. Deploy: see README.md.

const PRODUCES = ['text/html', 'text/markdown'];
const STATIC_EXT = /\.(?:css|js|mjs|map|png|jpe?g|webp|gif|svg|avif|ico|woff2?|ttf|otf|eot|xml|txt|json|md|pdf|zip)$/i;
const MARKDOWN = 'text/markdown; charset=utf-8';

// Accept entries in client order: { type, q, specificity }.
export function parseAccept(header) {
  return header.split(',').map(raw => {
    const parts = raw.trim().split(';').map(s => s.trim());
    const type = parts[0].toLowerCase();
    if (!type) return null;
    let q = 1;
    for (const param of parts.slice(1)) {
      const [name, value] = param.split('=').map(s => s.trim());
      if (name.toLowerCase() === 'q') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }
    return { type, q, specificity: type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2 };
  }).filter(Boolean);
}

const matches = (entry, candidate) => entry.type === '*/*'
  || (entry.type.endsWith('/*') ? candidate.startsWith(entry.type.slice(0, -1)) : entry.type === candidate);

// The representation to serve, or null when the client accepts none of them (RFC 9110 section 12.5.1):
// each candidate takes the q of its most specific matching range, q=0 rejects it, the highest q wins
// and ties go to the client's order. A missing or empty Accept header means the default (HTML).
export function preferredType(header, produces) {
  const entries = header ? parseAccept(header) : [];
  if (!entries.length) return produces[0] ?? null;
  let best = null, bestQ = -1, bestPosition = Infinity;
  for (const candidate of produces) {
    let matched = null, position = Infinity;
    entries.forEach((e, i) => {
      if (matches(e, candidate) && (!matched || e.specificity > matched.specificity || (e.specificity === matched.specificity && i < position))) {
        matched = e;
        position = i;
      }
    });
    if (!matched || matched.q <= 0) continue;
    if (matched.q > bestQ || (matched.q === bestQ && position < bestPosition)) {
      best = candidate;
      bestQ = matched.q;
      bestPosition = position;
    }
  }
  return best;
}

// The Markdown file for a page path: / -> /index.md, /about and /about/ -> /about/index.md,
// /page.html -> /page.md.
export function markdownPath(pathname) {
  if (pathname.endsWith('.html')) return pathname.replace(/\.html$/, '.md');
  return pathname.replace(/\/?$/, '/') + 'index.md';
}

function withVary(res, extra = {}) {
  const out = new Response(res.body, res);
  const vary = out.headers.get('vary');
  if (!vary) out.headers.set('Vary', 'Accept');
  else if (!vary.split(',').map(s => s.trim().toLowerCase()).includes('accept')) out.headers.set('Vary', `${vary}, Accept`);
  for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
  return out;
}

function notAcceptable(accept, method) {
  const body = `Not Acceptable\n\nThis resource is available as:\n- text/html\n- text/markdown\n\nYou requested: ${accept}\n`;
  return new Response(method === 'HEAD' ? null : body, {
    status: 406,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Vary': 'Accept', 'Cache-Control': 'no-store' },
  });
}

async function markdownNotFound(url, method, origin) {
  const res = await origin(new Request(new URL('/404.md', url), { method: 'GET' }));
  const body = res.ok ? await res.text()
    : `# Page not found (404)\n\nThere is no page at ${url.pathname}. See ${url.origin}/llms.txt or ${url.origin}/sitemap.xml.\n`;
  return new Response(method === 'HEAD' ? null : body, {
    status: 404,
    headers: { 'Content-Type': MARKDOWN, 'Vary': 'Accept', 'Cache-Control': 'public, max-age=300' },
  });
}

// origin(request) fetches from GitHub Pages: in production that is the global fetch, because a Worker's
// subrequests to its own hostname go to the origin server.
export async function handle(request, origin) {
  const url = new URL(request.url);
  if ((request.method !== 'GET' && request.method !== 'HEAD') || STATIC_EXT.test(url.pathname)) return origin(request);

  const accept = request.headers.get('accept');
  const chosen = preferredType(accept, PRODUCES);
  if (!chosen) return notAcceptable(accept, request.method);

  const mdUrl = new URL(markdownPath(url.pathname), url);
  if (chosen === 'text/markdown') {
    const md = await origin(new Request(mdUrl, request));
    if (md.status === 200) return withVary(md, { 'Content-Type': MARKDOWN });
    const page = await origin(request);
    if (page.status === 404) return markdownNotFound(url, request.method, origin);
    // The page exists but has no Markdown version (checkout, search): HTML if the client allows it.
    if (!preferredType(accept, ['text/html'])) return notAcceptable(accept, request.method);
    return withVary(page);
  }

  const page = await origin(request);
  if (page.status !== 200 || !(page.headers.get('content-type') || '').includes('text/html')) return withVary(page);
  const probe = await origin(new Request(mdUrl, { method: 'HEAD' }));
  if (probe.status !== 200) return withVary(page);
  const link = `<${mdUrl.pathname}>; rel="alternate"; type="text/markdown"`;
  const existing = page.headers.get('link');
  return withVary(page, { 'Link': existing ? `${existing}, ${link}` : link });
}

export default {
  fetch(request) {
    return handle(request, req => fetch(req));
  },
};
