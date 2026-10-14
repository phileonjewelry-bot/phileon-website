#!/usr/bin/env node
/* PHILEON Growth OS — READ-ONLY storefront catalogue snapshot.
   Evaluates frontend/src/data/products.js (+ App.js routes) and writes backend/data/storefront_catalogue.json.
   Never writes to the frontend, MongoDB or the pricing engine. Prices are deliberately NOT exported. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(here, '..', '..', 'frontend', 'src');
const OUT = join(here, '..', 'data', 'storefront_catalogue.json');

const productsSrc = readFileSync(join(FRONTEND, 'data', 'products.js'), 'utf8');
const appSrc = readFileSync(join(FRONTEND, 'App.js'), 'utf8');
const livePricingSrc = readFileSync(join(FRONTEND, 'lib', 'livePricing.js'), 'utf8');

const tmp = join(tmpdir(), `phileon-catalogue-${process.pid}`);
mkdirSync(tmp, { recursive: true });
writeFileSync(join(tmp, 'livePricing.mjs'), livePricingSrc);
writeFileSync(join(tmp, 'products.mjs'), productsSrc.replace("'@/lib/livePricing'", "'./livePricing.mjs'"));
const mod = await import(pathToFileURL(join(tmp, 'products.mjs')).href);

const routes = new Set([...appSrc.matchAll(/path="(\/[^"]*)"/g)].map((m) => m[1]));
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : typeof v === 'string' && v.trim() ? [v.trim()] : []);
const imageList = (p) => {
  const out = [];
  for (const k of ['imageUrl', 'heroImage', 'hoverImage', 'cardImage', 'shopCardImage', 'thumbnail']) if (str(p[k]) && !p[k].startsWith('data:')) out.push(p[k]);
  for (const k of ['gallery', 'images']) for (const g of list(p[k])) if (!g.startsWith('data:')) out.push(g);
  if (Array.isArray(p.gallery)) for (const g of p.gallery) if (g && typeof g === 'object' && str(g.src)) out.push(g.src);
  return [...new Set(out)];
};
const variantList = (p) => {
  const src = Array.isArray(p.tiers) ? p.tiers : Array.isArray(p.variants) ? p.variants : Array.isArray(p.editions) ? p.editions : [];
  return src.filter((t) => t && typeof t === 'object').map((t) => ({
    name: str(t.name) || str(t.label), key: str(t.pricingKey) || str(t.id) || str(t.key), material: str(t.material) || str(t.metal),
    specs: list(t.specs), carat_weight: str(t.caratWeight), diamond_quality: str(t.diamondQuality), note: str(t.note),
    consultation: typeof t.consultation === 'boolean' ? t.consultation : null,
  }));
};
const metalList = (p) => {
  const out = [...list(p.metals), ...list(p.materials)];
  for (const k of ['metalOptions', 'options', 'finishes']) if (Array.isArray(p[k])) for (const o of p[k]) out.push(typeof o === 'string' ? o : str(o?.label) || str(o?.name));
  if (p.metals && !Array.isArray(p.metals) && typeof p.metals === 'object') for (const v of Object.values(p.metals)) out.push(str(v?.label) || str(v?.name));
  return [...new Set(out.filter(Boolean))];
};
const stoneList = (p) => {
  const out = list(p.stones);
  if (p.stones && !Array.isArray(p.stones) && typeof p.stones === 'object') for (const v of Object.values(p.stones)) out.push(typeof v === 'string' ? v : str(v?.label) || str(v?.name));
  return [...new Set(out.filter(Boolean))];
};

const normalize = (key, p, origin) => {
  const slug = str(p.slug) || str(p.id);
  if (!slug) return null;
  return {
    slug, storefront_key: key, origin, name: str(p.name), subtitle: str(p.subtitle) || str(p.tagline),
    category: list(p.category).length ? list(p.category) : list(p.collection), audience: list(p.audience),
    collections: list(p.collections), description: str(p.description) || str(p.shortDescription) || str(p.seoDescription),
    story: str(p.story) || str(p.editorialHook) || str(p.craft), tribute: str(p.tribute),
    material_line: str(p.materialLine) || str(p.shopMaterialLine), metals: metalList(p), stones: stoneList(p),
    variants: variantList(p), images: imageList(p), href: str(p.href),
    purchasable: typeof p.purchasable === 'boolean' ? p.purchasable : null, status: str(p.status),
    pricing_pending: typeof p.pricingPending === 'boolean' ? p.pricingPending : null,
    dynamic_pricing: typeof p.dynamicPricing === 'boolean' ? p.dynamicPricing : null,
    is_core: typeof p.is_core === 'boolean' ? p.is_core : null, size_profile: str(p.sizeProfile),
    tags: list(p.tags),
  };
};

const records = [];
for (const [key, p] of Object.entries(mod.products || {})) { const r = normalize(key, p, 'products'); if (r) records.push(r); }
for (const p of mod.catalogProducts || []) { const r = normalize(str(p.id) || str(p.slug), p, 'catalogProducts'); if (r) records.push(r); }

const snapshot = {
  generated_at: new Date().toISOString(),
  source: { products_js_sha256: createHash('sha256').update(productsSrc).digest('hex'), app_js_sha256: createHash('sha256').update(appSrc).digest('hex') },
  routes: [...routes].filter((r) => !r.includes(':') && !r.startsWith('/admin')).sort(),
  records,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(snapshot, null, 1) + '\n');
console.log(`storefront snapshot: ${records.length} records, ${snapshot.routes.length} product routes → ${OUT}`);
