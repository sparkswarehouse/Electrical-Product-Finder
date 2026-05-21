export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!sheetsUrl) {
    return res.status(503).json({ ok: false, error: 'GOOGLE_SHEETS_WEB_APP_URL is missing in Vercel.' });
  }

  const { rowNumber } = req.body || {};

  if (!rowNumber) {
    return res.status(400).json({ ok: false, error: 'Missing rowNumber.' });
  }

  try {
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteLead', rowNumber })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok || data.ok !== true || data.action !== 'lead_deleted') {
      return res.status(502).json({ ok: false, error: data.error || data.raw || 'Google Sheets did not confirm lead_deleted.', sheetsResponse: data });
    }

    return res.status(200).json({ ok: true, source: 'google-sheets', sheetsResponse: data });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message });
  }
}
