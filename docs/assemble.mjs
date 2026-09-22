// Builds docs/index.html: the whole user guide as one self-contained page with CSS, JS and the icon font inlined.
import { readFileSync, writeFileSync } from "node:fs";
const r = (p) => readFileSync(new URL(p, import.meta.url));
const biDir = "../node_modules/bootstrap-icons/font/";
import { readdirSync } from "node:fs";
const srcDir = new URL("./src/", import.meta.url);
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(new URL(e.name + "/", dir)) : [readFileSync(new URL(e.name, dir)).toString()]);
const src = walk(srcDir).join("\n");
const used = new Set(src.match(/bi-[a-z0-9-]+/g) ?? []);
const biCss = r(biDir + "bootstrap-icons.css").toString();
const rules = [...biCss.matchAll(/\.(bi-[a-z0-9-]+)::before \{ content: "[^"]+"; \}/g)]
  .filter((m) => used.has(m[1])).map((m) => m[0]).join("");
const font = r(biDir + "fonts/bootstrap-icons.woff2").toString("base64");
const iconCss = `@font-face{font-display:block;font-family:"bootstrap-icons";src:url(data:font/woff2;base64,${font}) format("woff2")}
.bi::before,[class^="bi-"]::before,[class*=" bi-"]::before{display:inline-block;font-family:bootstrap-icons!important;font-style:normal;font-weight:normal!important;line-height:1;vertical-align:-.125em;-webkit-font-smoothing:antialiased}${rules}`;
const js = r("./build/app.js").toString().replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>@jm/ui</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400..900&display=swap" rel="stylesheet">
<script>(function(){try{var t=document.documentElement.getAttribute('data-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();</script>
<style>${r("./build/app.css")}
${iconCss}
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-padding-top:env(safe-area-inset-top,0px);background:var(--ui-bg)}
body{background:var(--ui-bg);margin:0}
</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;
writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("wrote docs/index.html", Math.round(html.length / 1024) + " KB");
