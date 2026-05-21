export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (!sheetsUrl) {
    return res.status(500).json({ ok: false, error: 'GOOGLE_SHEETS_WEB_APP_URL is missing in Vercel.' });
  }

  try {
    const payload = {
      action: 'lead',
      name: 'TradeFind Test',
      company: 'Test Company',
      email: 'test@example.com',
      phone: '00000000000',
      postcode: 'TEST',
      requiredBy: 'Test',
      message: 'This is a test lead from /api/test-lead',
      products: [{ code: 'TEST', brand: 'TradeFind', name: 'Test Product', price: '£0.00' }]
    };

    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(200).json({
      ok: response.ok && data.ok === true,
      httpStatus: response.status,
      sheetsResponse: data
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
