/**
 * Bravexo universal relay + static host.
 *
 * Endpoints:
 *   GET  /api/health          — liveness probe
 *   POST /api/bravexo/export  — THE universal content export endpoint.
 *
 * /api/bravexo/export accepts a JSON draft payload + target descriptor:
 *   { workspace: {id, company}, target: {platform, webhookUrl?, headers?},
 *     dryRun: boolean, draft: {title, slug, metaDescription, tags, body, …} }
 *
 * With a webhookUrl the relay forwards the draft to ANY external platform
 * (WordPress, Webflow, Shopify, custom Lovable sites…). Without one it
 * validates the payload and returns a simulated confirmation — so demos,
 * dry-runs and disconnected environments always succeed.
 */

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const app = express()

app.use(express.json({ limit: '2mb' }))

// Permissive CORS — this is a universal, multi-tenant content relay.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bravexo-Token')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'bravexo-relay', ts: new Date().toISOString() })
})

app.post('/api/bravexo/export', async (req, res) => {
  const receivedAt = new Date().toISOString()
  const body = req.body ?? {}
  const { target, draft, dryRun } = body

  if (!draft || typeof draft !== 'object' || !draft.title) {
    return res.status(400).json({ ok: false, mode: 'simulated', receivedAt, error: 'Missing or invalid draft payload (draft.title is required).' })
  }

  // Dry-run or no webhook configured → validate and echo back.
  if (dryRun || !target?.webhookUrl) {
    return res.json({
      ok: true,
      mode: dryRun ? 'dry-run' : 'simulated',
      receivedAt,
      echo: { title: draft.title, slug: draft.slug ?? null },
      note: dryRun
        ? 'Dry-run: payload validated by the Bravexo relay. Nothing was sent externally.'
        : 'No external webhook configured — payload validated. Add a target webhook to publish for real.',
    })
  }

  // Forward to the client's platform of choice.
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(target.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bravexo-Source': 'earlybooster',
        'X-Bravexo-Workspace': body.workspace?.id ?? 'unknown',
        ...(target.headers ?? {}),
      },
      body: JSON.stringify({ source: 'bravexo-earlybooster', version: '1.0', workspace: body.workspace ?? null, draft }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res.json({ ok: response.ok, mode: 'webhook', status: response.status, receivedAt })
  } catch (err) {
    return res.json({
      ok: false,
      mode: 'webhook',
      receivedAt,
      error: err?.name === 'AbortError' ? 'Target webhook timed out (8s).' : `Target webhook unreachable: ${err?.message ?? err}`,
    })
  }
})

// Static SPA + client-side routing fallback.
app.use(express.static(path.join(root, 'dist')))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(root, 'dist', 'index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
  console.log(`[bravexo] relay + app listening on http://0.0.0.0:${port}`)
})
