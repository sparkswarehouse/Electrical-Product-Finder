export default async function handler(req, res) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  return res.status(200).json({
    ok: true,
    api: 'diag',
    googleSheetsConfigured: Boolean(sheetsUrl),
    hasUrlPrefix: sheetsUrl ? sheetsUrl.slice(0, 32) : null,
    time: new Date().toISOString()
  });
}
