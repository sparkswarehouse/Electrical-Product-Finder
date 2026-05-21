const SYNONYMS = {
  black: ["blk", "black"],
  blk: ["black", "blk"],
  white: ["wht", "white"],
  chrome: ["chr", "chrome"],
  socket: ["socket", "outlet", "plug"],
  sockets: ["socket", "outlet", "plug"],
  switch: ["switch", "switched", "switches"],
  switched: ["switch", "switched", "switches"],
  usb: ["usb", "charger", "charging"],
  dimmer: ["dimmer", "dimming", "dim"],
  emergency: ["emergency", "emg", "maintained", "non-maintained"],
  cable: ["cable", "wire", "wiring"],
  lighting: ["lighting", "light", "luminaire", "lamp"],
  light: ["lighting", "light", "luminaire", "lamp"],
  ballast: ["ballast", "control gear", "gear"],
  metal: ["metal", "metalclad", "metal clad", "steel"],
  mk: ["mk", "m.k", "mk electric"]
};

function normaliseText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-_/]/g, " ")
    .replace(/\bblk\b/g, "black")
    .replace(/\bwht\b/g, "white")
    .replace(/\bchr\b/g, "chrome")
    .replace(/[^a-z0-9.+ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseQuery(query) {
  const q = normaliseText(query);
  const rawTerms = q.split(/\s+/).filter(Boolean);
  const expanded = new Set(rawTerms);

  rawTerms.forEach(term => {
    (SYNONYMS[term] || []).forEach(s => normaliseText(s).split(/\s+/).forEach(x => expanded.add(x)));
  });

  const intent =
    /(alternative|equivalent|replacement|replace|obsolete|instead)/.test(q) ? "alternative" :
    /(compare|cheapest|price|supplier|stock)/.test(q) ? "compare" :
    "search";

  const hints = {
    ipRating: (q.match(/\bip\s?[0-9]{2}\b/) || [])[0]?.replace(/\s/g, "") || "",
    amps: (q.match(/\b[0-9]{1,3}\s?a\b/) || [])[0]?.replace(/\s/g, "") || "",
    wattage: (q.match(/\b[0-9]{1,4}\s?w\b/) || [])[0]?.replace(/\s/g, "") || "",
    voltage: (q.match(/\b[0-9]{2,4}\s?v\b/) || [])[0]?.replace(/\s/g, "") || "",
    size: (q.match(/\b[0-9]{1,4}\s?mm\b/) || [])[0]?.replace(/\s/g, "") || "",
    finish: ["white","black","chrome","brass","steel","nickel","grey","red","blue","brown"].find(x => q.includes(x)) || ""
  };
  return { q, terms: [...expanded], intent, hints };
}

function productHaystack(product) {
  return normaliseText([
    product.searchText,
    product.catalogueNumber,
    product.catalogueNumber2,
    product.description,
    product.otherDescription,
    product.brand,
    product.product,
    product.productType,
    product.commodityMajor,
    product.commodityMinor,
    product.rangeMajor,
    product.rangeMinor,
    product.supplierName,
    product.ean,
    product.tsi,
    product.dimensions,
    product.finish
  ].filter(Boolean).join(" "));
}

function scoreProduct(product, parsed) {
  const hay = productHaystack(product);
  let score = 0;

  parsed.terms.forEach(term => {
    if (!term || term.length < 2) return;
    const exactWord = new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(hay);
    if (exactWord) score += 12;
    else if (hay.includes(term)) score += 5;

    if (normaliseText(product.catalogueNumber).includes(term)) score += 22;
    if (normaliseText(product.description).includes(term)) score += 16;
    if (normaliseText(product.brand).includes(term)) score += 10;
    if (normaliseText(product.productType).includes(term)) score += 10;
    if (normaliseText(product.commodityMinor).includes(term)) score += 8;
  });

  Object.values(parsed.hints).filter(Boolean).forEach(h => {
    if (hay.includes(normaliseText(h))) score += 25;
  });

  return score;
}

export function searchProducts(products, query, filters = {}) {
  const parsed = parseQuery(query);
  let scored = products.map(p => ({ ...p, score: scoreProduct(p, parsed) }));

  if (filters.brand) scored = scored.filter(p => p.brand === filters.brand);
  if (filters.category) scored = scored.filter(p => p.commodityMajor === filters.category);
  if (filters.supplier) scored = scored.filter(p => p.supplierName === filters.supplier);

  if (query.trim()) scored = scored.filter(p => p.score > 0);

  // If the user searches something not in the limited sample data, show useful products rather than a dead page.
  if (query.trim() && scored.length === 0) {
    const broadTerms = parseQuery(query).terms.filter(t => t.length >= 4);
    scored = products
      .map(p => ({ ...p, score: broadTerms.some(t => productHaystack(p).includes(t.slice(0, 4))) ? 1 : 0 }))
      .filter(p => p.score > 0);
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 80);
}

export function findAlternatives(products, product) {
  if (!product) return [];
  return products
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0;
      if (p.commodityMinor && p.commodityMinor === product.commodityMinor) score += 40;
      if (p.productType && p.productType === product.productType) score += 30;
      if (p.dimensions && p.dimensions === product.dimensions) score += 20;
      if (p.finish && p.finish === product.finish) score += 10;
      if (p.brand !== product.brand) score += 5;
      return { ...p, matchScore: score };
    })
    .filter(p => p.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);
}

export function mockSupplierOffers(product) {
  const base = Number(product.price || 0) || 4.95;
  const names = ["Direct Trade Feed", "Regional Wholesaler", "National Supplier", product.supplierName || "Current Supplier"];
  return names.map((name, i) => ({
    name,
    price: Math.max(0.5, base * (1 + (i - 1) * 0.07) + i * 0.25).toFixed(2),
    stock: [12, 41, 0, 8][i],
    leadTime: ["Next day", "2 days", "Call branch", "Same day collection"][i],
    confidence: ["Matched by catalogue number", "Matched by TSI/item code", "Matched by EAN", "Native supplier record"][i]
  }));
}
