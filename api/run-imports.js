import fs from 'node:fs/promises';
import path from 'node:path';
import { runImportPipeline, IMPORTS } from '../lib/import-engine.js';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'import-history.json');

async function loadProducts() {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function saveProducts(products) {
  try {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch {
    // Ignore Vercel write limitations for now.
  }
}

async function loadHistory() {
  try {
    const raw = await fs.readFile(HISTORY_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function saveHistory(history) {
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch {
    // Ignore Vercel write limitations for now.
  }
}

export default async function handler(req, res) {
  try {
    const existingProducts = await loadProducts();
    const beforeCount = existingProducts.length;

    const result = await runImportPipeline(existingProducts);

    const mergedProducts = result.mergedProducts || existingProducts;
    const afterCount = mergedProducts.length;

    await saveProducts(mergedProducts);

    const historyEntry = {
      date: new Date().toISOString(),
      beforeCount,
      afterCount,
      imported: result.importedCount || 0,
      suppliersRun: IMPORTS.length
    };

    const history = await loadHistory();
    history.unshift(historyEntry);

    await saveHistory(history.slice(0, 30));

    return res.status(200).json({
      ok: true,
      importsRun: IMPORTS.length,
      beforeCount,
      afterCount,
      imported: result.importedCount || 0,
      historyEntry,
      logs: result.logs || []
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
