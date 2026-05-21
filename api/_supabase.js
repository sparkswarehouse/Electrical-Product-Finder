const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseKey);
}

export async function supabaseSelect(table, query = '') {
  if (!hasSupabaseConfig()) return { data: null, error: null, configured: false };

  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return { data: null, error: data?.message || text || 'Supabase request failed', configured: true };
  }

  return { data, error: null, configured: true };
}

export async function supabaseInsert(table, payload) {
  if (!hasSupabaseConfig()) return { data: null, error: null, configured: false };

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return { data: null, error: data?.message || text || 'Supabase insert failed', configured: true };
  }

  return { data, error: null, configured: true };
}
