export default async function handler(req, res) {
  const suppliers = [
    { id: 'tlc-direct', name: 'TLC Direct', status: 'listed', commercialStatus: 'standard', website: 'https://www.tlc-direct.co.uk/', apiStatus: 'not_connected', sponsored: false },
    { id: 'cef', name: 'CEF', status: 'listed', commercialStatus: 'standard', website: 'https://www.cef.co.uk/', apiStatus: 'not_connected', sponsored: false },
    { id: 'rexel-uk', name: 'Rexel UK', status: 'listed', commercialStatus: 'standard', website: 'https://www.rexel.co.uk/', apiStatus: 'not_connected', sponsored: false },
    { id: 'screwfix', name: 'Screwfix', status: 'listed', commercialStatus: 'standard', website: 'https://www.screwfix.com/', apiStatus: 'not_connected', sponsored: false },
    { id: 'toolstation', name: 'Toolstation', status: 'listed', commercialStatus: 'standard', website: 'https://www.toolstation.com/', apiStatus: 'not_connected', sponsored: false }
  ];

  return res.status(200).json({
    ok: true,
    source: 'safe-fallback-no-supabase',
    suppliers
  });
}
