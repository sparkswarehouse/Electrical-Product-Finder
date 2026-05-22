import fs from 'node:fs/promises';
import path from 'node:path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'import-history.json');

export default async function handler(req, res) {
  try {
    const raw = await fs.readFile(HISTORY_FILE, 'utf8').catch(() => '[]');
    const history = JSON.parse(raw || '[]');

    return res.status(200).json({
      ok: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
