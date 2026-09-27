// 极简静态服务器（测试/开发用；生产走 nginx）。用法: node dev-server.js <port> <root>
const http = require('http'), fs = require('fs'), path = require('path');
const port = +(process.argv[2] || 3090), root = path.resolve(process.argv[3] || __dirname);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.wasm': 'application/wasm' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(d);
  });
}).listen(port, '0.0.0.0', () => console.log('pp-site on :' + port + ' root=' + root));
