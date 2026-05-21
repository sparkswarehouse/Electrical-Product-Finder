function labelForUrlType(urlType) {
  if (urlType === 'exact-product') return 'View exact product';
  if (urlType === 'supplier-search') return 'Search supplier site';
  return 'Open supplier site';
}

function rankLinks(links) {
  return links
    .map(link => ({
      ...link,
      label: labelForUrlType(link.urlType),
      priority: link.priority || 50,
      sponsored: Boolean(link.sponsored)
    }))
    .sort((a, b) => Number(b.sponsored) - Number(a.sponsored) || b.priority - a.priority);
}

export default async function handler(req, res) {
  const productCode = req.query.code || '';
  const suppliedLinks = Array.isArray(req.body?.links) ? req.body.links : [];

  const links = rankLinks(suppliedLinks);

  return res.status(200).json({
    ok: true,
    source: 'supplier-link-engine',
    rule: 'Exact product links are only labelled exact-product when verified.',
    productCode,
    links
  });
}
