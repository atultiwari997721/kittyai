import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { file } = req.query;
  const fileName = (file || 'KritiAI-Setup.exe').replace(/[^a-zA-Z0-9_\-\.]/g, '');

  const possiblePaths = [
    path.join(process.cwd(), 'public', 'downloads', fileName),
    path.join(process.cwd(), 'dist', 'downloads', fileName),
    path.join(process.cwd(), 'downloads', fileName),
    path.join(process.cwd(), fileName)
  ];

  let targetPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    return res.status(404).json({ error: `File ${fileName} not found.` });
  }

  try {
    const stat = fs.statSync(targetPath);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(targetPath);
    fileStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
