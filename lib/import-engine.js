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

function createMockProducts(job, count = 12) {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${job.supplier}-${index + 1}`,
    brand: index % 2 === 0 ? 'MK Electric' : 'Knightsbridge',
    name: `${job.supplierName} Product ${index + 1}`,
    code: `${job.supplier.toUpperCase().replace(/-/g, '')}-${1000 + index}`,
    category: 'Electrical Products',
    description: `Imported product ${index + 1} from ${job.supplierName}.`,
    price: `£${(Math.random() * 20 + 1).toFixed(2)}`,
    imageUrl: '',
    tags: ['Imported', job.supplierName],
    suppliers: [
      {
        supplier: job.supplierName,
        url: job.url,
        urlType: 'supplier-search',
        price: 'Trade pricing available',
        stock: 'Check supplier site',
        confidence: 'Medium',
        sponsored: false
      }
    ]
  }));
}

export async function runImportPipeline(existingProducts = []) {
  const logs = [];
  const importedProducts = [];

  logs.push('Starting TradeFind AI import pipeline');

  for (const job of IMPORTS) {
    logs.push(`Importing ${job.supplierName}`);

    try {
      const products = createMockProducts(job, 10);
      importedProducts.push(...products);
      logs.push(`Imported ${products.length} products from ${job.supplierName}`);
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
