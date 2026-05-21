import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  const supabase = getSupabase();

  if (!supabase) {
    return res.status(200).json({
      ok: true,
      source: 'fallback-json',
      suppliers: []
    });
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('priority', { ascending: false })
    .order('name');

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({
    ok: true,
    source: 'supabase',
    suppliers: data
  });
}
