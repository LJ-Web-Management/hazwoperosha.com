#!/usr/bin/env node
// Checks a live deployment the way AI agents and the Is Agentic audit reach it: the bare domain over HTTPS,
// agent User-Agents, content without JavaScript, metadata, JSON-LD, Markdown content negotiation, 404s,
// llms.txt, sitemap, robots.txt and the about/contact/privacy pages.
//   node tools/check-live.js                        checks the bare domain of site.config.js url
//   node tools/check-live.js https://www.example.com
// Behind an HTTPS proxy, add NODE_USE_ENV_PROXY=1. Exits 1 unless every check passes.
const path = require('path');

const AGENTS = {
  GPTBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
  'ChatGPT-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  ClaudeBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  'Claude-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
};
const HTML = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

const visibleText = html => html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const mainText = html => visibleText((/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html) || [, html])[1]);
const jsonLdNodes = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  .flatMap(m => { try { const d = JSON.parse(m[1]); return [].concat(d).flatMap(x => x['@graph'] || [x]); } catch { return [{ invalid: true }]; } });
const ctype = res => (res && res.headers.get('content-type')) || '';
const errorText = e => (e.cause && (e.cause.code || e.cause.message)) || e.message;

// GET with manual redirects (at most 5), so the chain can be reported. Never throws: { res, body, url, chain, error }.
async function get(fetchFn, url, headers = {}) {
  const chain = [];
  try {
    for (let hop = 0; hop <= 5; hop++) {
      const res = await fetchFn(new Request(url, { headers, redirect: 'manual' }));
      chain.push(`${url} ${res.status}`);
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) { url = new URL(loc, url).href; continue; }
      return { res, body: await res.text(), url, chain };
    }
    return { error: 'more than 5 redirects', chain };
  } catch (e) {
    return { error: `${url}: ${errorText(e)}`, chain };
  }
}

async function checkSite(base, fetchFn = fetch) {
  base = base.replace(/\/$/, '');
  const results = [];
  const add = (name, status, detail) => results.push({ name, status, detail });
  const home = await get(fetchFn, base + '/', { accept: HTML });
  const homeOk = home.res && home.res.status === 200 && ctype(home.res).startsWith('text/html');
  add('Homepage over HTTPS', homeOk ? 'pass' : 'fail', home.error || home.chain.join(' -> '));
  const page = homeOk ? home.body : '';

  const levels = [...page.matchAll(/<h([1-6])[\s>]/gi)].map(m => +m[1]);
  const skip = levels.findIndex((l, i) => i && l > levels[i - 1] + 1);
  const textLen = mainText(page).length;
  add('Content without JavaScript', homeOk && textLen >= 500 && levels.filter(l => l === 1).length === 1 && skip === -1 ? 'pass' : 'fail',
    `${textLen} characters of text, ${levels.filter(l => l === 1).length} H1, ${skip === -1 ? 'no skipped heading levels' : `h${levels[skip - 1]} then h${levels[skip]}`}`);

  const blocked = [];
  for (const [name, ua] of Object.entries(AGENTS)) {
    const r = await get(fetchFn, base + '/', { 'user-agent': ua, accept: HTML });
    if (!r.res || r.res.status !== 200) blocked.push(`${name} (${r.error || r.res.status})`);
  }
  add('Agent User-Agents reach the homepage', blocked.length ? 'fail' : 'pass', blocked.length ? `blocked: ${blocked.join(', ')}` : Object.keys(AGENTS).join(', '));

  const md = await get(fetchFn, base + '/', { accept: 'text/markdown' });
  const html = await get(fetchFn, base + '/', { accept: 'text/html' });
  const vary = md.res ? (md.res.headers.get('vary') || '').toLowerCase().split(',').map(s => s.trim()) : [];
  const mdOk = md.res && md.res.status === 200 && ctype(md.res).startsWith('text/markdown') && vary.includes('accept') && md.body.trim().length > 0;
  const htmlOk = html.res && html.res.status === 200 && ctype(html.res).startsWith('text/html');
  add('Markdown content negotiation', mdOk && htmlOk ? 'pass' : 'fail',
    `Accept: text/markdown -> ${md.error || `${md.res.status} ${ctype(md.res)}, Vary: ${vary.join(', ') || 'none'}`}; Accept: text/html -> ${html.error || `${html.res.status} ${ctype(html.res)}`}`);

  const missing = await get(fetchFn, `${base}/agent-check-${Date.now().toString(36)}-does-not-exist`, { accept: 'text/markdown' });
  const realStatus = missing.res && [404, 410].includes(missing.res.status);
  const mdBody = realStatus && ctype(missing.res).startsWith('text/markdown') && missing.body.trim().length >= 20 && /llms\.txt|sitemap/i.test(missing.body);
  add('Agent-friendly 404', mdBody ? 'pass' : realStatus ? 'partial' : 'fail',
    missing.error || `${missing.res.status} ${ctype(missing.res)}${realStatus && !mdBody ? ' (needs a Markdown body)' : ''}`);

  const canonical = (/<link rel="canonical" href="([^"]+)"/i.exec(page) || [])[1];
  const apex = h => h.replace(/^www\./, '');
  const meta = {
    canonical: canonical && apex(new URL(canonical, base).hostname) === apex(new URL(base).hostname),
    lang: /<html[^>]*\blang="[a-z]{2}/i.test(page),
    'og:image': /<meta property="og:image" content="https?:\/\/[^"]+"/i.test(page),
    'og:type': /<meta property="og:type" content="[^"]+"/i.test(page),
  };
  const metaMissing = Object.keys(meta).filter(k => !meta[k]);
  add('Metadata (canonical, lang, og:image, og:type)', metaMissing.length ? 'fail' : 'pass', metaMissing.length ? `missing: ${metaMissing.join(', ')}` : canonical);

  const nodes = jsonLdNodes(page);
  const isOrg = n => [].concat(n['@type'] || []).some(t => /Organization$|LocalBusiness$/.test(t));
  const org = nodes.find(n => isOrg(n) && n.address) || nodes.find(isOrg);
  add('JSON-LD structured data', nodes.length && !nodes.some(n => n.invalid) && org && org.name && org.url && org.description ? 'pass' : 'fail',
    `${nodes.length} nodes${nodes.some(n => n.invalid) ? ', some invalid JSON' : ''}${org ? `, ${[].concat(org['@type']).join('/')} "${org.name}"` : ', no Organization'}`);
  const cp = org && [].concat(org.contactPoint || [])[0];
  const orgOk = org && org.address && org.address['@type'] === 'PostalAddress' && cp && cp.contactType && (cp.email || cp.telephone);
  add('Organization address and contactPoint', orgOk ? 'pass' : 'fail', orgOk ? `${org.address.addressLocality}, ${cp.contactType}` : 'needs address (PostalAddress) and contactPoint with contactType and email/telephone');

  const metaKeywords = (/<meta name="keywords" content="([^"]+)"/i.exec(page) || [])[1];
  const terms = metaKeywords || (org && (org.keywords || org.knowsAbout) && [].concat(org.keywords || org.knowsAbout).join(', '));
  add('Product terms for brand search', terms ? 'pass' : 'fail', terms ? terms.slice(0, 120) : 'no meta keywords or JSON-LD keywords/knowsAbout');

  const llms = await get(fetchFn, base + '/llms.txt');
  const llmsOk = llms.res && llms.res.status === 200 && /^# \S/.test(llms.body) && /^## When to use/im.test(llms.body);
  add('llms.txt with "When to use"', llmsOk ? 'pass' : 'fail', llms.error || `${llms.res.status}, ${llms.body.length} bytes`);

  const sm = await get(fetchFn, base + '/sitemap.xml');
  const locs = sm.res && sm.res.status === 200 ? (sm.body.match(/<loc>/g) || []).length : 0;
  const smOk = locs > 0 && /<urlset[^>]+sitemaps\.org/.test(sm.body) && (sm.body.match(/<lastmod>/g) || []).length === locs;
  add('Sitemap', smOk ? 'pass' : 'fail', sm.error || `${sm.res.status}, ${locs} URLs`);

  const robots = await get(fetchFn, base + '/robots.txt');
  const robotsOk = robots.res && robots.res.status === 200 && !/^Disallow:\s*\/\s*$/im.test(robots.body);
  add('robots.txt allows agents', robotsOk ? 'pass' : 'fail', robots.error || `${robots.res.status}${/^Sitemap:/im.test(robots.body) ? ', names the sitemap' : ''}`);

  const trust = [];
  for (const p of ['about', 'contact', 'privacy']) {
    const r = await get(fetchFn, `${base}/${p}`, { accept: HTML });
    const n = r.res && r.res.status === 200 ? mainText(r.body).length : 0;
    trust.push([p, n, r.error || (r.res && r.res.status)]);
  }
  add('About, contact and privacy pages', trust.every(([, n]) => n >= 500) ? 'pass' : 'fail',
    trust.map(([p, n, s]) => `/${p} ${n >= 500 ? `${n} chars` : s === 200 ? `${n} chars (<500)` : s}`).join(', '));
  return results;
}

module.exports = { checkSite, AGENTS };

if (require.main === module) {
  const site = require(path.join(__dirname, '..', 'site.config.js'));
  const base = process.argv[2] || site.url.replace('://www.', '://');
  checkSite(base).then(results => {
    const mark = { pass: 'PASS', partial: 'PART', fail: 'FAIL' };
    console.log(`Agent readiness checks for ${base}\n`);
    for (const r of results) console.log(`${mark[r.status]}  ${r.name}\n      ${r.detail}`);
    const bad = results.filter(r => r.status !== 'pass').length;
    console.log(`\n${results.length - bad}/${results.length} passed`);
    process.exitCode = bad ? 1 : 0;
  });
}
