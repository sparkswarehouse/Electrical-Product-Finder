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
      console.log('Lead fallback payload', payload);
      return res.status(200).json({ ok: true, source: 'fallback-console-no-google-sheets-url' });
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

      return res.status(200).json({
        ok: true,
        source: 'google-sheets',
        sheetsResponse: data
      });
    } catch (error) {
      console.error('Google Sheets lead submit failed', error);
      return res.status(200).json({
        ok: true,
        source: 'fallback-after-google-sheets-error',
        warning: error.message
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
