import net from 'node:net'

function encode(args) {
  let out = `*${args.length}\r\n`
  for (const a of args) {
    const s = String(a)
    out += `$${Buffer.byteLength(s)}\r\n${s}\r\n`
  }
  return out
}

function parseOne(buf, offset) {
  if (buf.length <= offset) return null
  const type = String.fromCharCode(buf[offset])
  const nl = buf.indexOf('\r\n', offset)
  if (nl === -1) return null
  const line = buf.subarray(offset + 1, nl).toString()

  if (type === '+' || type === ':') {
    return {
      value: type === ':' ? Number(line) : line,
      next: nl + 2,
    }
  }
  if (type === '-') {
    return { err: new Error(line), next: nl + 2 }
  }
  if (type === '$') {
    const len = Number(line)
    if (len === -1) return { value: null, next: nl + 2 }
    const start = nl + 2
    const end = start + len
    if (buf.length < end + 2) return null
    return { value: buf.subarray(start, end).toString(), next: end + 2 }
  }
  if (type === '*') {
    const count = Number(line)
    if (count === -1) return { value: null, next: nl + 2 }
    let pos = nl + 2
    const arr = []
    for (let i = 0; i < count; i++) {
      const part = parseOne(buf, pos)
      if (!part) return null
      if (part.err) return part
      arr.push(part.value)
      pos = part.next
    }
    return { value: arr, next: pos }
  }
  return { err: new Error(`bad redis type ${type}`), next: nl + 2 }
}

export function parseRedisUrl(raw) {
  const u = new URL(raw)
  return {
    host: u.hostname || '127.0.0.1',
    port: Number(u.port || 6379),
    password: decodeURIComponent(u.password || ''),
  }
}

export function createRedisLite(url, timeoutMs = 1500) {
  const opts = parseRedisUrl(url)
  let socket = null
  let buf = Buffer.alloc(0)
  const queue = []

  function failAll(err) {
    while (queue.length) {
      queue.shift()?.reject(err)
    }
    buf = Buffer.alloc(0)
    socket = null
  }

  function onData(chunk) {
    buf = Buffer.concat([buf, chunk])
    while (queue.length) {
      const parsed = parseOne(buf, 0)
      if (!parsed) break
      buf = buf.subarray(parsed.next)
      const job = queue.shift()
      if (!job) break
      if (parsed.err) job.reject(parsed.err)
      else job.resolve(parsed.value)
    }
  }

  function cmd(...args) {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('redis not connected'))
        return
      }
      queue.push({ resolve, reject })
      socket.write(encode(args))
    })
  }

  function connect() {
    return new Promise((resolve, reject) => {
      const sock = net.connect({ host: opts.host, port: opts.port })
      const timer = setTimeout(() => {
        sock.destroy()
        reject(new Error('redis connect timeout'))
      }, timeoutMs)
      sock.once('connect', () => {
        clearTimeout(timer)
        socket = sock
        sock.on('data', onData)
        sock.on('error', (err) => failAll(err))
        sock.on('close', () => failAll(new Error('redis closed')))
        const ready = opts.password
          ? cmd('AUTH', opts.password).then(() => cmd('PING'))
          : cmd('PING')
        ready.then(() => resolve()).catch(reject)
      })
      sock.once('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  async function hGetAll(key) {
    const arr = await cmd('HGETALL', key)
    const out = {}
    if (!Array.isArray(arr)) return out
    for (let i = 0; i + 1 < arr.length; i += 2) {
      out[arr[i]] = arr[i + 1]
    }
    return out
  }

  async function hSet(key, fieldValues) {
    if (!fieldValues.length) return 0
    return cmd('HSET', key, ...fieldValues)
  }

  async function expire(key, sec) {
    return cmd('EXPIRE', key, String(sec))
  }

  return { connect, hGetAll, hSet, expire }
}
