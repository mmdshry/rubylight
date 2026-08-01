import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'

const PORT = Number(process.env.PORT || 3009)
const HOST = process.env.HOST || '127.0.0.1'
const UPSTREAM = 'https://www.tala.ir/banner'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '..', 'dist')

const UPSTREAM_HEADERS = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  Referer: 'https://www.tala.ir/',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
  Cookie: '_trc=1',
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
}

function sendJson(res, status, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(payload)
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0])
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '')
  const full = path.resolve(root, normalized)
  if (!full.startsWith(root)) return null
  return full
}

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function sendFile(res, filePath, method) {
  const type = contentType(filePath)
  const stat = fs.statSync(filePath)
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': type.startsWith('text/html')
      ? 'no-cache'
      : 'public, max-age=31536000, immutable',
  })
  if (method === 'HEAD') {
    res.end()
    return
  }
  fs.createReadStream(filePath).pipe(res)
}

function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('method not allowed')
    return
  }

  const candidate =
    pathname === '/' ? path.join(DIST_DIR, 'index.html') : safeJoin(DIST_DIR, pathname)

  if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    sendFile(res, candidate, req.method)
    return
  }

  // SPA fallback for extension-less client routes only
  const indexHtml = path.join(DIST_DIR, 'index.html')
  if (!path.extname(pathname) && fs.existsSync(indexHtml)) {
    sendFile(res, indexHtml, req.method)
    return
  }

  if (!fs.existsSync(indexHtml)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('dist/ missing — run pnpm build first')
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('not found')
}

async function handleTala(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'method not allowed' })
    return
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'GET',
      headers: UPSTREAM_HEADERS,
      cache: 'no-store',
    })
    const text = await upstream.text()
    res.writeHead(upstream.status, {
      'Content-Type':
        upstream.headers.get('content-type') ||
        'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    res.end(text)
  } catch (err) {
    console.error('[tala-proxy]', err)
    sendJson(res, 502, { error: 'upstream unavailable' })
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (url.pathname === '/api/tala' || url.pathname === '/api/tala/') {
    void handleTala(req, res)
    return
  }
  serveStatic(req, res, url.pathname)
})

server.listen(PORT, HOST, () => {
  console.log(`[rubylight] listening on http://${HOST}:${PORT}`)
  console.log(`[rubylight] serving ${DIST_DIR}`)
})
