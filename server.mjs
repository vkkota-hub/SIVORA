import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import contact from './api/contact.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/contact') {
      res.status = code => { res.statusCode = code; return res; };
      res.json = body => res.end(JSON.stringify(body));
      req.query = Object.fromEntries(url.searchParams);
      if (req.method === 'POST') {
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
          res.statusCode = 415; return res.json({ error: 'Please send JSON form data.' });
        }
        let body = '', size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 16_384) { res.statusCode = 413; return res.json({ error: 'Form data is too large.' }); }
          body += chunk;
        }
        try { req.body = JSON.parse(body); }
        catch { res.statusCode = 400; return res.json({ error: 'Invalid form data.' }); }
      }
      return await contact(req, res);
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end();
    }
    const pathname = decodeURIComponent(url.pathname);
    let target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root + path.sep) && target !== root) {
      res.statusCode = 400; return res.end('Invalid path');
    }
    let info;
    try {
      info = await stat(target);
      if (info.isDirectory()) { target = path.join(target, 'index.html'); info = await stat(target); }
    } catch {
      target += '.html';
      try { info = await stat(target); }
      catch { res.statusCode = 404; return res.end('Page not found'); }
    }
    if (!info.isFile()) { res.statusCode = 404; return res.end('Page not found'); }
    res.setHeader('Content-Type', mime[path.extname(target)] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    let start = 0, end = info.size - 1;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (range && (range[1] || range[2])) {
        start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
      } else start = -1;
      if (start < 0 || start > end || start >= info.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }); return res.end();
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Content-Length', info.size ? end - start + 1 : 0);
    if (req.method === 'HEAD' || !info.size) return res.end();
    const stream = createReadStream(target, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch {
    if (!res.headersSent) { res.statusCode = 500; res.end('Request could not be completed'); }
    else res.destroy();
  }
});
server.listen(Number(process.env.PORT || 4174), '0.0.0.0', () => {
  console.log(`SIVORA running on port ${server.address().port}`);
});
