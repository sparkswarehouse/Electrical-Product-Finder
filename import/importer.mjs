#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'import', 'output');

const SUPPLIER_PRESETS = {
  'tlc-direct': {
    supplier: 'TLC Direct',
    baseUrl: 'https://www.tlc-direct.co.uk',
    defaultCategory: 'Electrical Products'
  },
  cef: {
    supplier: 'CEF',
    baseUrl: 'https://www.cef.co.uk',
    defaultCategory: 'Electrical Products'
  },
  toolstation: {
    supplier: 'Toolstation',
    baseUrl: 'https://www.toolstation.com',
    defaultCategory: 'Electrical Products'
  }
};

function arg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find(value => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function cleanText(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&pound;/g, '£')
    .replace(/\s+/g, ' ')
    .trim();
}

function absolutise(url, baseUrl) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function unique(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractJsonLdProducts(html, preset) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const products = [];

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of nodes) {
        const graph = Array.isArray(node['@graph']) ? node['@graph'] : [node];
        for (const entry of graph) {
          const type = entry['@type'];
          const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
          if (!isProduct) continue;

          const offer = Array.isArray(entry.offers) ? entry.offers[0] : entry.offers || {};
          const brand = typeof entry.brand === 'object' ? entry.brand.name : entry.brand;
          const price = offer.price ? `£${offer.price}` : '';
          const url = absolutise(entry.url || offer.url || '', preset.baseUrl);

          products.push(normaliseProduct({
            supplier: preset.supplier,
            brand: brand || '',
            name: entry.name || '',
            code: entry.sku || entry.mpn || '',
            ean: entry.gtin13 || entry.gtin || '',
            category: preset.defaultCategory,
            description: entry.description || '',
            price,
            imageUrl: Array.isArray(entry.image) ? entry.image[0] : entry.image || '',
            supplierUrl: url,
            stock: offer.availability ? String(offer.availability).split('/').pop() : 'Check supplier site'
          }));
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return products;
}

function extractLinksAsProducts(html, preset) {
  const linkMatches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const products = [];

  for (const match of linkMatches) {
    const href = match[1];
    const text = cleanText(match[2]);

    if (!text || text.length < 8 || text.length > 160) continue;
    if (!/(socket|switch|cable|lamp|light|fan|breaker|rcbo|mcb|led|bulkhead|dimmer|fuse|conduit|trunking|panel|heater|extractor)/i.test(text)) continue;
    if (/login|basket|checkout|account|privacy|terms|contact|delivery|returns/i.test(text)) continue;

    const codeMatch = text.match(/\b[A-Z0-9][A-Z0-9\-\/]{3,}\b/);
    products.push(normaliseProduct({
      supplier: preset.supplier,
      brand: guessBrand(text),
      name: text,
      code: codeMatch ? codeMatch[0] : '',
      category: preset.defaultCategory,
      description: text,
      price: '',
      imageUrl: '',
      supplierUrl: absolutise(href, preset.baseUrl),
      stock: 'Check supplier site'
    }));
  }

  return products;
}

function guessBrand(text) {
  const brands = ['MK', 'Knightsbridge', 'BG', 'Hager', 'Wylex', 'Schneider', 'Crabtree', 'Click', 'Deta', 'Eaton', 'Philips', 'Ledvance', 'Ansell', 'Saxby', 'Aurora', 'Vent-Axia', 'Manrose'];
  const found = brands.find(brand => new RegExp(`\\b${brand.replace('-', '\\-')}\\b`, 'i').test(text));
  return found || '';
}

function normaliseProduct(input) {
  const code = String(input.code || '').trim();
  const name = cleanText(input.name || '');
  const brand = cleanText(input.brand || guessBrand(name));
  const idSource = `${brand}-${code || name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    id: idSource,
    brand,
    name,
    code,
    ean: String(input.ean || '').trim(),
    category: cleanText(input.category || 'Electrical Products'),
    description: cleanText(input.description || name),
    price: cleanText(input.price || 'Check site'),
    imageUrl: input.imageUrl ? absolutise(input.imageUrl, input.baseUrl || '') : '',
    tags: [brand, input.category].filter(Boolean),
    suppliers: [
      {
        supplier: input.supplier,
        url: input.supplierUrl,
        urlType: input.supplierUrl ? 'supplier-search' : 'supplier-homepage',
        price: cleanText(input.price || 'Check site'),
        stock: cleanText(input.stock || 'Check supplier site'),
        confidence: code ? 'Medium' : 'Low',
        sponsored: false
      }
    ]
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TradeFindAIImporter/0.1 (+https://tradefind.ai; product indexing prototype)',
      Accept: 'text/html,application/xhtml+xml'
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function run() {
  const supplierKey = arg('supplier', 'tlc-direct');
  const url = arg('url');
  const limit = Number(arg('limit', '100'));
  const preset = SUPPLIER_PRESETS[supplierKey];

  if (!preset) throw new Error(`Unknown supplier preset: ${supplierKey}`);
  if (!url) throw new Error('Missing --url=https://...');

  console.log(`Importing ${preset.supplier} from ${url}`);
  const html = await fetchHtml(url);
  const jsonLd = extractJsonLdProducts(html, preset);
  const linked = extractLinksAsProducts(html, preset);
  const merged = unique([...jsonLd, ...linked], item => item.code || item.name).slice(0, limit);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const outFile = path.join(OUTPUT_DIR, `${supplierKey}-${Date.now()}.json`);
  await fs.writeFile(outFile, JSON.stringify(merged, null, 2));

  console.log(`Imported ${merged.length} product candidates`);
  console.log(`Wrote ${outFile}`);
}

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
