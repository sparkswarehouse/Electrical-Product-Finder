export const IMPORTS = [
  {
    supplier: 'tlc-direct',
    supplierName: 'TLC Direct',
    url: 'https://www.tlc-direct.co.uk/Main_Index/Wiring_Accessories/index.html'
  },
  {
    supplier: 'toolstation',
    supplierName: 'Toolstation',
    url: 'https://www.toolstation.com/electrical/c370'
  }
];

function slug(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function cleanText(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function absolutise(url, base) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

function extractLinks(html, job) {
  const matches = [...html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

  const products = [];

  for (const match of matches) {
    const href = match[1];
    const text = cleanText(match[2]);

    if (!text || text.length < 8 || text.length > 160) continue;

    if (!/(socket|switch|lamp|led|fan|consumer unit|dimmer|cable|fuse|light|panel|heater|detector)/i.test(text)) {
      continue;
    }

    if (/login|basket|checkout|privacy|contact|returns/i.test(text)) {
      continue;
    }

    const codeMatch = text.match(/\b[A-Z0-9\-\/]{4,}\b/);

    products.push({
      id: slug(`${job.supplier}-${text}`),
      brand: '',
      name: text,
      code: codeMatch ? codeMatch[0] : '',
      category: 'Electrical Products',
      description: text,
      price: 'Check supplier site',
      imageUrl: '',
      tags: ['Imported', job.supplierName],
      suppliers: [
        {
          supplier: job.supplierName,
          url: absolutise(href, new URL(job.url).origin),
          urlType: 'supplier-search',
          price: 'Check supplier site',
          stock: 'Check supplier site',
          confidence: codeMatch ? 'Medium' : 'Low',
          sponsored: false
        }
      ]
    });
  }

  return products;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TradeFindAI/0.1 Product Importer'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed fetching ${url}`);
  }

  return response.text();
}

export async function runImportPipeline(existingProducts = []) {
  const logs = [];
  const importedProducts = [];

  logs.push('Starting TradeFind AI import pipeline');

  for (const job of IMPORTS) {
    logs.push(`Importing ${job.supplierName}`);

    try {
      const html = await fetchHtml(job.url);

      const extracted = extractLinks(html, job)
        .filter(product => product.name)
        .slice(0, 50);

      importedProducts.push(...extracted);

      logs.push(`Imported ${extracted.length} real products from ${job.supplierName}`);
    } catch (error) {
      logs.push(`Failed importing ${job.supplierName}: ${error.message}`);
    }
  }

  const merged = [...existingProducts];

  for (const product of importedProducts) {
    const exists = merged.find(item =>
      slug(item.brand) === slug(product.brand) &&
      slug(item.code) === slug(product.code)
    );

    if (!exists) {
      merged.push(product);
    }
  }

  logs.push(`Pipeline completed with ${importedProducts.length} imported products`);

  return {
    ok: true,
    importedProducts,
    mergedProducts: merged,
    logs,
    importedCount: importedProducts.length
  };
}
