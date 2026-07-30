import http from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.PORT || 3009)
const UPSTREAM = 'https://www.tala.ir/banner'

const UPSTREAM_HEADERS = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  Referer: 'https://www.tala.ir/',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
  Cookie: '_trc=1',
}

function sendJson(res, status, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(payload)
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
  if (url.pathname === '/api/tala') {
    void handleTala(req, res)
    return
  }
  sendJson(res, 404, { error: 'not found' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[tala-proxy] listening on http://127.0.0.1:${PORT}`)
})
