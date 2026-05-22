#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'import', 'output');
const LIVE_DATA = path.join(ROOT, 'data', 'products.json');

function clean(value = '') {
  return String(value).trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function makeKey(product) {
  const brand = clean(product.brand).toLowerCase();
  const code = clean(product.code).toLowerCase();
  const name = clean(product.name).toLowerCase();

  if (brand && code) return `${brand}::${code}`;
  if (code) return `code::${code}`;
  return `name::${name}`;
}

function mergeSuppliers(existing = [], incoming = []) {
  const merged = [...existing];

  for (const supplier of incoming) {
    const already = merged.find(x =>
      clean(x.supplier).toLowerCase() === clean(supplier.supplier).toLowerCase()
    );

    if (!already) {
      merged.push(supplier);
    }
  }

  return merged;
}

function mergeTags(existing = [], incoming = []) {
  return [...new Set([...safeArray(existing), ...safeArray(incoming)].filter(Boolean))];
}

function mergeProduct(existing, incoming) {
  return {
    ...existing,
    ...incoming,
    id: existing.id || incoming.id,
    brand: existing.brand || incoming.brand,
    name: existing.name || incoming.name,
    code: existing.code || incoming.code,
    ean: existing.ean || incoming.ean,
    category: existing.category || incoming.category || 'Electrical Products',
    description: existing.description?.length > incoming.description?.length
      ? existing.description
      : incoming.description,
    price: incoming.price || existing.price,
    imageUrl: existing.imageUrl || incoming.imageUrl,
    tags: mergeTags(existing.tags, incoming.tags),
    suppliers: mergeSuppliers(existing.suppliers, incoming.suppliers)
  };
}

async function loadJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return [];
  }
}

async function loadImportFiles() {
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const all = [];

    for (const file of jsonFiles) {
      const fullPath = path.join(OUTPUT_DIR, file);
      const data = await loadJson(fullPath);
      if (Array.isArray(data)) {
        all.push(...data);
      }
    }

    return all;
  } catch {
    return [];
  }
}

async function run() {
  const existingProducts = await loadJson(LIVE_DATA);
  const importedProducts = await loadImportFiles();

  const mergedMap = new Map();

  for (const product of existingProducts) {
    mergedMap.set(makeKey(product), product);
  }

  let created = 0;
  let updated = 0;

  for (const imported of importedProducts) {
    const key = makeKey(imported);

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      mergedMap.set(key, mergeProduct(existing, imported));
      updated++;
    } else {
      mergedMap.set(key, imported);
      created++;
    }
  }

  const mergedProducts = [...mergedMap.values()]
    .filter(product => product.name)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  await fs.writeFile(LIVE_DATA, JSON.stringify(mergedProducts, null, 2));

  console.log(`Merged imports complete`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total live products: ${mergedProducts.length}`);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
