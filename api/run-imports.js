import { exec } from 'node:child_process';
import util from 'node:util';

const run = util.promisify(exec);

const IMPORTS = [
  {
    supplier: 'tlc-direct',
    url: 'https://www.tlc-direct.co.uk/Main_Index/Wiring_Accessories/index.html'
  },
  {
    supplier: 'toolstation',
    url: 'https://www.toolstation.com/electrical/c370'
  }
];

export default async function handler(req, res) {
  try {
    const logs = [];

    for (const job of IMPORTS) {
      const cmd = `node import/importer.mjs --supplier=${job.supplier} --url=${job.url}`;
      logs.push(`Running: ${cmd}`);

      const { stdout, stderr } = await run(cmd);

      if (stdout) logs.push(stdout);
      if (stderr) logs.push(stderr);
    }

    const merge = await run('node import/merge-imports.mjs');

    logs.push(merge.stdout || 'Merge completed');

    return res.status(200).json({
      ok: true,
      importsRun: IMPORTS.length,
      logs
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
