export function findAlternatives(targetProduct, allProducts = [], options = {}) {
  const limit = options.limit || 6;

  if (!targetProduct) return [];

  return allProducts
    .filter(product => product && product !== targetProduct && product.code !== targetProduct.code)
    .map(product => {
      const score = scoreAlternative(targetProduct, product);
      return {
        ...product,
        alternativeScore: score.score,
        alternativeType: score.type,
        alternativeReason: score.reason,
        confidence: score.confidence
      };
    })
    .filter(product => product.alternativeScore > 20)
    .sort((a, b) => b.alternativeScore - a.alternativeScore)
    .slice(0, limit);
}

export function scoreAlternative(target = {}, candidate = {}) {
  const t = target.attributes || {};
  const c = candidate.attributes || {};
  let score = 0;
  const reasons = [];

  if (same(target.category, candidate.category) || same(t.category, c.category)) {
    score += 30;
    reasons.push('same category');
  }

  if (same(t.ipRating, c.ipRating)) {
    score += 14;
    reasons.push('same IP rating');
  }

  if (same(t.voltage, c.voltage)) {
    score += 12;
    reasons.push('same voltage');
  }

  if (same(t.wattage, c.wattage)) {
    score += 12;
    reasons.push('same wattage');
  }

  if (same(t.finish, c.finish) || same(t.colour, c.colour)) {
    score += 10;
    reasons.push('same finish/colour');
  }

  if (same(t.gang, c.gang)) {
    score += 8;
    reasons.push('same gang');
  }

  if (same(t.mounting, c.mounting)) {
    score += 6;
    reasons.push('same mounting');
  }

  if (same(t.led, c.led)) score += 4;
  if (same(t.dimmable, c.dimmable)) score += 4;
  if (same(t.emergency, c.emergency)) score += 4;

  const keywordOverlap = compareKeywords(target, candidate);
  score += keywordOverlap.score;
  if (keywordOverlap.score > 0) reasons.push(keywordOverlap.reason);

  let type = 'Similar product';

  if (score >= 80) type = 'Likely compatible alternative';
  if (score >= 92) type = 'Strong replacement match';
  if (same(target.brand, candidate.brand) && score >= 70) type = 'Same-brand alternative';
  if ((target.attributes?.obsolete || /obsolete|discontinued/i.test(target.name || '')) && score >= 60) type = 'Obsolete replacement candidate';
  if (!same(target.brand, candidate.brand) && score >= 70) type = 'Cross-brand alternative';

  return {
    score,
    confidence: Math.min(99, Math.round(score)),
    type,
    reason: reasons.slice(0, 4).join(', ') || 'similar product information'
  };
}

function same(a, b) {
  if (a === undefined || b === undefined || a === null || b === null) return false;
  if (a === '' || b === '') return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

function compareKeywords(a = {}, b = {}) {
  const stop = new Set(['the', 'and', 'with', 'for', 'white', 'black', 'each', 'product']);
  const textA = `${a.name || ''} ${a.description || ''}`.toLowerCase();
  const textB = `${b.name || ''} ${b.description || ''}`.toLowerCase();
  const wordsA = new Set(textA.split(/[^a-z0-9]+/).filter(word => word.length > 3 && !stop.has(word)));
  const wordsB = new Set(textB.split(/[^a-z0-9]+/).filter(word => word.length > 3 && !stop.has(word)));
  const overlap = [...wordsA].filter(word => wordsB.has(word));
  return {
    score: Math.min(14, overlap.length * 3),
    reason: overlap.length ? `shared terms: ${overlap.slice(0, 3).join(', ')}` : ''
  };
}
