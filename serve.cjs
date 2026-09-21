// Local preview. Mirrors the two Cloudflare Pages behaviours the site depends
// on: a directory serves its index.html, and an unmatched path serves 404.html
// with a 404 status — which is the behaviour production is currently missing,
// so this server is deliberately the stricter of the two.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path')

const root = __dirname
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
}

http.createServer((req, res) => {
  let file
  try {
    file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]))
  } catch {
    res.writeHead(400)
    return res.end('Bad request')
  }

  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  // A directory serves its index.html, so /gocommerce/ works here exactly as
  // it does on Pages.
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  } catch { /* fall through to the 404 below */ }

  fs.readFile(file, (err, data) => {
    if (err) {
      return fs.readFile(path.join(root, '404.html'), (e, page) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(e ? 'Not found' : page)
      })
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
    res.end(data)
  })
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'))
