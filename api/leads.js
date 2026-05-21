import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  const supabase = getSupabase();

  if (req.method === 'GET') {
    if (!supabase) {
      return res.status(200).json({ ok: true, source: 'fallback-json', leads: [] });
    }

    const { data, error } = await supabase
      .from('quote_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, source: 'supabase', leads: data });
  }

  if (req.method === 'POST') {
    const payload = req.body || {};

    if (!supabase) {
      console.log('Lead fallback payload', payload);
      return res.status(200).json({ ok: true, source: 'fallback-console' });
    }

    const { error } = await supabase.from('quote_leads').insert({
      name: payload.name,
      company: payload.company,
      email: payload.email,
      phone: payload.phone,
      postcode: payload.postcode,
      required_by: payload.requiredBy,
      message: payload.message,
      products: payload.products || []
    });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, source: 'supabase' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
