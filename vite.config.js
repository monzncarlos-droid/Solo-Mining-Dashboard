import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generic dev-only proxy: target read from a per-request header. Lets the
// dashboard talk to any backend (Bitaxe device on LAN, solo pool, etc.)
// without baking the URL into Vite config. Works only via the dev server
// on localhost.
function headerTargetProxy(mountPath, headerName, timeoutMs = 10000) {
  const pluginName = `proxy:${mountPath}`
  return {
    name: pluginName,
    configureServer(server) {
      server.middlewares.use(mountPath, async (req, res) => {
        const raw = req.headers[headerName.toLowerCase()]
        const target = Array.isArray(raw) ? raw[0] : raw
        if (!target || typeof target !== 'string') {
          res.statusCode = 400
          res.setHeader('content-type', 'application/json')
          return res.end(JSON.stringify({ error: `missing ${headerName} header` }))
        }
        try {
          const url = target.replace(/\/+$/, '') + req.url
          const upstream = await fetch(url, {
            method: req.method,
            signal: AbortSignal.timeout(timeoutMs),
          })
          res.statusCode = upstream.status
          upstream.headers.forEach((v, k) => {
            const kl = k.toLowerCase()
            if (kl !== 'content-encoding' && kl !== 'transfer-encoding' && kl !== 'content-length') {
              res.setHeader(k, v)
            }
          })
          const buf = Buffer.from(await upstream.arrayBuffer())
          res.end(buf)
        } catch (e) {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: e.message || 'proxy failed' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    headerTargetProxy('/api/bitaxe', 'X-Bitaxe-Target', 5000),
    headerTargetProxy('/api/pool', 'X-Pool-Target', 10000),
  ],
})
