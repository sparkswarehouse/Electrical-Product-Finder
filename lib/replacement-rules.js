export const replacementRules = [
  {
    id: 'fluorescent-t8-led-conversion',
    sourceKeywords: ['t8', 'fluorescent', 'tube'],
    replacementKeywords: ['led', 't8', 'tube'],
    category: 'Lighting',
    type: 'LED conversion alternative',
    confidenceBoost: 18,
    notes: 'Check fitting wiring and ballast compatibility before replacing fluorescent T8 lamps with LED T8 alternatives.',
    warnings: ['May require ballast bypass', 'Check starter/driver compatibility', 'Confirm lamp length and cap type']
  },
  {
    id: 'fluorescent-ballast-led-driver',
    sourceKeywords: ['ballast', 'fluorescent', 'hf', 'quicktronic'],
    replacementKeywords: ['led driver', 'electronic ballast', 'led conversion'],
    category: 'Control Gear',
    type: 'Control gear replacement candidate',
    confidenceBoost: 16,
    notes: 'When replacing fluorescent control gear, verify lamp type, wattage, circuit wiring and emergency compatibility.',
    warnings: ['Electrical compatibility must be checked', 'Emergency fittings may need specialist replacement']
  },
  {
    id: 'white-moulded-socket-equivalent',
    sourceKeywords: ['white', 'socket', '13a'],
    replacementKeywords: ['white', 'socket', '13a'],
    category: 'Sockets',
    type: 'Like-for-like socket alternative',
    confidenceBoost: 15,
    mustMatch: ['category', 'voltage'],
    notes: 'Good like-for-like replacement if gang, mounting depth and wiring requirements match.'
  },
  {
    id: 'decorative-socket-upgrade',
    sourceKeywords: ['socket', 'white', 'moulded'],
    replacementKeywords: ['screwless', 'decorative', 'chrome', 'nickel', 'black'],
    category: 'Sockets',
    type: 'Premium decorative upgrade',
    confidenceBoost: 10,
    notes: 'Decorative upgrade. Confirm back box depth, finish, gang and insert colour before purchase.'
  },
  {
    id: 'outdoor-ip66-socket',
    sourceKeywords: ['outdoor', 'ip66', 'socket'],
    replacementKeywords: ['outdoor', 'ip66', 'weatherproof', 'socket'],
    category: 'Sockets',
    type: 'Weatherproof socket alternative',
    confidenceBoost: 20,
    mustMatch: ['ipRating', 'voltage'],
    notes: 'Outdoor replacements should match IP rating, current rating, number of gangs and enclosure requirements.'
  },
  {
    id: 'emergency-lighting-replacement',
    sourceKeywords: ['emergency', 'bulkhead', 'maintained', 'non-maintained'],
    replacementKeywords: ['emergency', 'bulkhead', 'maintained', 'non-maintained'],
    category: 'Lighting',
    type: 'Emergency lighting replacement candidate',
    confidenceBoost: 14,
    mustMatch: ['emergency'],
    notes: 'Emergency lighting replacements must be checked for maintained/non-maintained operation, duration, lumen output and compliance.'
  }
];

export const compatibilityRequirements = {
  Sockets: {
    mustMatch: ['voltage'],
    shouldMatch: ['gang', 'mounting', 'ipRating', 'finish'],
    warnings: ['Check back box depth', 'Confirm current rating', 'Check wiring and earth requirements']
  },
  Switches: {
    mustMatch: ['voltage'],
    shouldMatch: ['gang', 'mounting', 'finish'],
    warnings: ['Check switch type', 'Confirm 1-way/2-way/intermediate requirements']
  },
  Lighting: {
    mustMatch: [],
    shouldMatch: ['wattage', 'voltage', 'colourTemperature', 'capType', 'dimensions'],
    warnings: ['Check lamp cap type', 'Check fitting dimensions', 'Confirm driver/ballast compatibility']
  },
  'Control Gear': {
    mustMatch: ['voltage'],
    shouldMatch: ['wattage', 'lampType', 'emergency'],
    warnings: ['Check wiring diagram', 'Confirm lamp compatibility', 'Use qualified electrician for installation']
  }
};

function textOf(product = {}) {
  return `${product.brand || ''} ${product.name || ''} ${product.code || ''} ${product.description || ''}`.toLowerCase();
}

function containsAll(text, terms = []) {
  return terms.every(term => text.includes(String(term).toLowerCase()));
}

function containsAny(text, terms = []) {
  return terms.some(term => text.includes(String(term).toLowerCase()));
}

function sameAttribute(a = {}, b = {}, key) {
  const av = a.attributes?.[key] || a[key];
  const bv = b.attributes?.[key] || b[key];
  if (!av || !bv) return false;
  return String(av).toLowerCase() === String(bv).toLowerCase();
}

export function applyReplacementRules(sourceProduct, candidateProduct) {
  const sourceText = textOf(sourceProduct);
  const candidateText = textOf(candidateProduct);
  const matches = [];

  for (const rule of replacementRules) {
    const sourceMatches = containsAny(sourceText, rule.sourceKeywords || []);
    const candidateMatches = containsAny(candidateText, rule.replacementKeywords || []);
    const categoryMatches = !rule.category || sourceProduct.category === rule.category || candidateProduct.category === rule.category;

    if (!sourceMatches || !candidateMatches || !categoryMatches) continue;

    const failedMustMatch = (rule.mustMatch || []).filter(key => !sameAttribute(sourceProduct, candidateProduct, key));

    if (failedMustMatch.length) {
      matches.push({
        ...rule,
        compatible: false,
        confidenceBoost: 0,
        failedMustMatch
      });
      continue;
    }

    matches.push({
      ...rule,
      compatible: true,
      failedMustMatch: []
    });
  }

  return matches;
}

export function getCompatibilityWarnings(product = {}) {
  const category = product.category || product.attributes?.category;
  return compatibilityRequirements[category]?.warnings || [];
}

export function getReplacementRecommendation(sourceProduct, alternatives = []) {
  if (!alternatives.length) return null;

  const ranked = alternatives
    .map(alt => {
      const rules = applyReplacementRules(sourceProduct, alt);
      const ruleBoost = rules.filter(rule => rule.compatible).reduce((sum, rule) => sum + (rule.confidenceBoost || 0), 0);
      return {
        ...alt,
        appliedRules: rules,
        replacementScore: (alt.confidence || 0) + ruleBoost
      };
    })
    .sort((a, b) => b.replacementScore - a.replacementScore);

  return ranked[0];
}
