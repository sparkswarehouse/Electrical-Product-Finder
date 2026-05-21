export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      source: sheetsUrl ? 'google-sheets-configured' : 'google-sheets-not-configured',
      leads: []
    });
  }

  if (req.method === 'POST') {
    const payload = req.body || {};

    if (!sheetsUrl) {
      return res.status(503).json({ ok: false, source: 'google-sheets-not-configured', error: 'GOOGLE_SHEETS_WEB_APP_URL is missing in Vercel.' });
    }

    try {
      const response = await fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'lead', ...payload })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!response.ok || data.ok !== true || data.action !== 'lead_saved') {
        return res.status(502).json({
          ok: false,
          source: 'google-sheets-error',
          error: data.error || data.raw || 'Google Sheets did not confirm lead_saved.',
          sheetsResponse: data
        });
      }

      return res.status(200).json({
        ok: true,
        source: 'google-sheets',
        sheetsResponse: data
      });
    } catch (error) {
      return res.status(502).json({
        ok: false,
        source: 'google-sheets-request-failed',
        error: error.message
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
