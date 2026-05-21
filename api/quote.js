export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const enquiry = req.body || {};
    const submittedAt = new Date().toISOString();

    // MVP endpoint: accepts quote enquiries and returns success.
    // Next step: connect this to email, CRM, Airtable, Google Sheets or a supplier-routing system.
    console.log('TradeFind AI quote enquiry', {
      submittedAt,
      enquiry
    });

    return res.status(200).json({
      ok: true,
      message: 'Quote enquiry received',
      submittedAt
    });
  } catch (error) {
    console.error('Quote enquiry failed', error);
    return res.status(500).json({ ok: false, error: 'Quote enquiry failed' });
  }
}
