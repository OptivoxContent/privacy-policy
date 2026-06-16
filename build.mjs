// Builds the static site into ./public/ — converts privacy-policy.md into a
// dark, on-brand (black + orange gradient) page at /privacy-policy with a
// sticky table-of-contents + scroll-spy. Run: `npm run build`.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { marked } from "marked";

const here = (p) => new URL(p, import.meta.url);
const YEAR = new Date().getFullYear();
mkdirSync(here("./public/privacy-policy/"), { recursive: true });

const mdRaw = readFileSync(here("./privacy-policy.md"), "utf8");
const eff = (mdRaw.match(/\*\*Effective date:\*\*\s*([^\n*]+)/) || [, ""])[1].trim();

let html = marked.parse(mdRaw);
// The hero owns the title + effective date, so strip them from the body.
html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/, "");
html = html.replace(/<p><strong>Effective date:[\s\S]*?<\/p>\s*/, "");
// Give each ## section a slug id and collect the table of contents.
const toc = [];
html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner) => {
  const text = inner.replace(/<[^>]+>/g, "").trim();
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  toc.push({ id, text });
  return `<h2 id="${id}">${inner}</h2>`;
});
const tocHtml = toc.map((t) => `<li><a href="#${t.id}">${t.text}</a></li>`).join("");

const css = `
:root{--bg:#0a0a0b;--card:#141417;--line:#26262c;--ink:#e8e8ec;--mut:#9a9aa6;--white:#fff;--o1:#ffae00;--o2:#ff6a00;--o3:#ff2d00;--grad:linear-gradient(135deg,var(--o1),var(--o2) 45%,var(--o3))}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--o2);text-decoration:none}
a:hover{color:var(--o1);text-decoration:underline}
.hdr{position:sticky;top:0;z-index:20;display:flex;align-items:center;padding:13px 22px;background:rgba(10,10,11,.72);-webkit-backdrop-filter:saturate(160%) blur(10px);backdrop-filter:saturate(160%) blur(10px);border-bottom:1px solid var(--line)}
.hdr a{display:flex;align-items:center;gap:10px}
.hdr img{height:28px;width:auto;display:block}
.hdr .wm{font-weight:800;font-size:1.12rem;letter-spacing:-.02em;color:var(--white)}
.hdr .wm span{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero{position:relative;overflow:hidden;text-align:center;padding:70px 22px 46px;border-bottom:1px solid var(--line)}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 120% at 50% -10%,rgba(255,106,0,.22),transparent 60%);pointer-events:none}
.hero>*{position:relative}
.hero img{height:70px;width:auto;margin-bottom:16px;filter:drop-shadow(0 6px 26px rgba(255,80,0,.4))}
.hero h1{margin:.1em 0;font-size:2.6rem;line-height:1.1;letter-spacing:-.02em;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero .sub{color:var(--mut);font-size:1.02rem;margin:.2em 0}
.hero .eff{display:inline-block;margin-top:14px;font-size:.8rem;color:var(--o1);border:1px solid rgba(255,106,0,.4);border-radius:999px;padding:5px 14px;background:rgba(255,106,0,.08)}
.cue{margin-top:24px;color:var(--mut);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;opacity:.7;animation:bob 2s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
.cta{display:inline-block;margin-top:22px;background:var(--grad);color:#fff;font-weight:700;padding:13px 26px;border-radius:12px;box-shadow:0 10px 32px rgba(255,80,0,.3)}
.cta:hover{text-decoration:none;filter:brightness(1.06)}
.wrap{max-width:1140px;margin:0 auto;padding:0 22px;display:grid;grid-template-columns:240px 1fr;gap:48px;align-items:start}
.toc{position:sticky;top:72px;padding:30px 0;max-height:calc(100vh - 92px);overflow:auto}
.toc .t{font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:var(--mut);margin:0 0 10px}
.toc ul{list-style:none;margin:0;padding:0}
.toc a{display:block;padding:6px 12px;border-left:2px solid transparent;color:var(--mut);font-size:.89rem;line-height:1.35;border-radius:0 6px 6px 0}
.toc a:hover{color:var(--ink);text-decoration:none;background:rgba(255,255,255,.03)}
.toc a.active{color:var(--white);border-left-color:var(--o2);background:linear-gradient(90deg,rgba(255,106,0,.13),transparent)}
.content{padding:42px 0 90px;min-width:0}
.content>p:first-child{font-size:1.06rem;color:var(--ink)}
.content h2{font-size:1.5rem;margin:2.4em 0 .6em;color:var(--white);letter-spacing:-.01em;scroll-margin-top:86px}
.content h2:first-of-type{margin-top:.3em}
.content h3{font-size:1.1rem;margin:1.7em 0 .4em;color:#f3c79c;scroll-margin-top:86px}
.content p,.content li{color:#c9c9d2}
.content strong{color:var(--white)}
.content code{background:#1c1c22;color:#ffb27a;padding:.12em .42em;border-radius:5px;font-size:.86em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.content table{width:100%;border-collapse:collapse;margin:1.3em 0;font-size:.92rem;display:block;overflow-x:auto;border:1px solid var(--line);border-radius:10px}
.content th,.content td{border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:11px 13px;text-align:left;vertical-align:top}
.content tr th:last-child,.content tr td:last-child{border-right:0}
.content tbody tr:last-child td{border-bottom:0}
.content th{background:linear-gradient(180deg,rgba(255,106,0,.15),rgba(255,106,0,.05));color:var(--white);font-weight:600}
.content hr{border:0;border-top:1px solid var(--line);margin:2.6em 0}
.content ul{padding-left:1.2em}
.content li{margin:.34em 0}
.content li::marker{color:var(--o2)}
.ftr{border-top:1px solid var(--line);padding:30px 22px;text-align:center;color:var(--mut);font-size:.85rem}
.ftr a{color:var(--o2)}
@media(max-width:860px){
.wrap{grid-template-columns:1fr;gap:0}
.toc{position:static;max-height:none;padding:16px 0 0;border-bottom:1px solid var(--line)}
.toc ul{display:flex;flex-wrap:wrap;gap:5px}
.toc a{border-left:0;border-radius:999px;padding:5px 11px;font-size:.78rem;background:rgba(255,255,255,.04)}
.toc a.active{border-left:0;background:rgba(255,106,0,.18)}
.hero h1{font-size:2rem}.content{padding:26px 0 60px}
}`;

const spy = `<script>(function(){var L=[].slice.call(document.querySelectorAll('.toc a')),m={};L.forEach(function(a){m[a.getAttribute('href').slice(1)]=a});var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){L.forEach(function(a){a.classList.remove('active')});var a=m[e.target.id];if(a)a.classList.add('active')}})},{rootMargin:'-82px 0px -68% 0px',threshold:0});[].slice.call(document.querySelectorAll('.content h2[id]')).forEach(function(h){io.observe(h)})})();</script>`;

function head(title, desc, canonical) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.ico" sizes="any">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<meta name="theme-color" content="#0a0a0b"><meta name="robots" content="index,follow">
<style>${css}</style></head><body>
<header class="hdr"><a href="/"><img src="/vyreel-emblem.png" alt="VyReel"><span class="wm">Vy<span>Reel</span></span></a></header>`;
}
const HDR_LOGO = `<a href="/"><img src="/vyreel-emblem.png" alt="VyReel"><span class="wm">Vy<span>Reel</span></span></a>`;
const foot = `<footer class="ftr">&copy; ${YEAR} OPTIVOX (PRIVATE) LIMITED &middot; VyReel &middot; <a href="/privacy-policy">Privacy Policy</a></footer></body></html>`;

const policy = head("Privacy Policy — VyReel", "How VyReel (OPTIVOX (PRIVATE) LIMITED) collects, uses, shares, and protects personal data across its Shopify app and website.", "https://vy-reel.com/privacy-policy")
  + `<section class="hero"><img src="/vyreel-emblem.png" alt="VyReel"><h1>Privacy Policy</h1><p class="sub">VyReel &middot; OPTIVOX (PRIVATE) LIMITED</p>${eff ? `<div class="eff">Effective ${eff}</div>` : ""}<div class="cue">Scroll to read &darr;</div></section>`
  + `<div class="wrap"><aside class="toc"><p class="t">Contents</p><ul>${tocHtml}</ul></aside><main class="content">${html}</main></div>`
  + spy + foot;

const landing = head("VyReel — Shoppable video for Shopify", "VyReel adds shoppable short-form video (reels) to your Shopify storefront.", "https://vy-reel.com/")
  + `<section class="hero" style="border-bottom:0;padding-bottom:84px"><img src="/vyreel-emblem.png" alt="VyReel"><h1>VyReel</h1><p class="sub">Shoppable short-form video for Shopify storefronts.</p><a class="cta" href="/privacy-policy">Privacy Policy</a></section>`
  + foot;

writeFileSync(here("./public/privacy-policy/index.html"), policy);
writeFileSync(here("./public/index.html"), landing);
copyFileSync(here("./assets/favicon.ico"), here("./public/favicon.ico"));
copyFileSync(here("./assets/vyreel-emblem.png"), here("./public/vyreel-emblem.png"));
console.log(`built public/ — ${toc.length} TOC sections, emblem + favicon copied`);
