import { exec } from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const run = util.promisify(exec);

const IMPORTS = [
  {
    supplier: 'tlc-direct',
    url: 'https://www.tlc-direct.co.uk/Main_Index/Wiring_Accessories/index.html'
  },
  {
    supplier: 'toolstation',
    url: 'https://www.toolstation.com/electrical/c370'
  }
];

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'import-history.json');

async function countProducts() {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(raw || '[]');
    return Array.isArray(products) ? products.length : 0;
  } catch {
    return 0;
  }
}

async function appendHistory(entry) {
  let history = [];

  try {
    const raw = await fs.readFile(HISTORY_FILE, 'utf8');
    history = JSON.parse(raw || '[]');
  } catch {
    history = [];
  }

  history.unshift(entry);
  history = history.slice(0, 30);

  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export default async function handler(req, res) {
  try {
    const logs = [];
    const beforeCount = await countProducts();

    for (const job of IMPORTS) {
      const cmd = `node import/importer.mjs --supplier=${job.supplier} --url=${job.url}`;
      logs.push(`Running: ${cmd}`);

      const { stdout, stderr } = await run(cmd);

      if (stdout) logs.push(stdout);
      if (stderr) logs.push(stderr);
    }

    const merge = await run('node import/merge-imports.mjs');

    logs.push(merge.stdout || 'Merge completed');

    const afterCount = await countProducts();
    const imported = Math.max(afterCount - beforeCount, 0);

    const historyEntry = {
      date: new Date().toISOString(),
      beforeCount,
      afterCount,
      imported,
      suppliersRun: IMPORTS.length
    };

    await appendHistory(historyEntry);

    return res.status(200).json({
      ok: true,
      importsRun: IMPORTS.length,
      beforeCount,
      afterCount,
      imported,
      historyEntry,
      logs
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
