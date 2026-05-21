export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (!sheetsUrl) {
    return res.status(503).json({ ok: false, error: 'GOOGLE_SHEETS_WEB_APP_URL is missing in Vercel.' });
  }

  try {
    const separator = sheetsUrl.includes('?') ? '&' : '?';
    const url = `${sheetsUrl}${separator}action=leads`;
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(200).json({
      ok: true,
      requestUrlPrefix: url.slice(0, 48),
      httpStatus: response.status,
      rawPreview: text.slice(0, 500),
      parsed: data,
      leadCount: Array.isArray(data.leads) ? data.leads.length : null,
      firstLead: Array.isArray(data.leads) && data.leads.length ? data.leads[0] : null
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
