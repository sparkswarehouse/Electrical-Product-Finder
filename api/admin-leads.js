export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (!sheetsUrl) {
    return res.status(503).json({ ok: false, error: 'GOOGLE_SHEETS_WEB_APP_URL is missing in Vercel.' });
  }

  try {
    const separator = sheetsUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${sheetsUrl}${separator}action=leads`);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok || data.ok !== true) {
      return res.status(502).json({
        ok: false,
        source: 'google-sheets-error',
        error: data.error || data.raw || 'Google Sheets did not return leads.',
        sheetsResponse: data
      });
    }

    return res.status(200).json({
      ok: true,
      source: 'google-sheets',
      leads: data.leads || []
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message });
  }
}
