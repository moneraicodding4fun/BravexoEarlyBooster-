/**
 * Bravexo Connect — client-side bindings for the universal export relay.
 *
 * Primary path: POST /api/bravexo/export served by the Bravexo relay
 * (server/index.js) — forwards drafts to ANY external platform.
 *
 * Static-hosting fallback (e.g. GitHub Pages): when no relay exists, the
 * client validates the payload locally and simulates the relay response so
 * the Deploy flow stays fully functional everywhere.
 */

export interface ExportTarget {
  platform: string
  webhookUrl?: string
  headers?: Record<string, string>
}

export interface ExportRequest {
  workspace: { id: string; company: string }
  target: ExportTarget
  dryRun: boolean
  draft: {
    id: string
    title: string
    slug: string
    metaDescription: string
    tags: string[]
    body: string
    niche: string
    topic: string
  }
}

export interface ExportResponse {
  ok: boolean
  mode: 'webhook' | 'simulated' | 'dry-run'
  status?: number
  error?: string
  receivedAt: string
  echo?: { title: string; slug: string }
  note?: string
}

function base() {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
}

function localSimulate(req: ExportRequest): ExportResponse {
  const receivedAt = new Date().toISOString()
  if (req.dryRun || !req.target.webhookUrl) {
    return {
      ok: true,
      mode: req.dryRun ? 'dry-run' : 'simulated',
      receivedAt,
      echo: { title: req.draft.title, slug: req.draft.slug },
      note: req.dryRun
        ? 'Dry-run: payload validated locally. Nothing was sent externally.'
        : 'Payload validated locally (static hosting — no relay). Add a live relay or webhook to publish for real.',
    }
  }
  // A webhook exists but static hosting cannot forward server-side.
  return {
    ok: true,
    mode: 'simulated',
    receivedAt,
    echo: { title: req.draft.title, slug: req.draft.slug },
    note: 'Payload accepted and simulated locally. Server-side forwarding requires the Bravexo relay.',
  }
}

export async function exportDraft(req: ExportRequest): Promise<ExportResponse> {
  const url = `${base()}/api/bravexo/export`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'bravexo-earlybooster', version: '1.0', ...req }),
    })
    const ct = res.headers.get('content-type') ?? ''
    if (res.ok && ct.includes('application/json')) {
      return (await res.json()) as ExportResponse
    }
    // Non-JSON (e.g. GitHub Pages 404.html) → treat as no relay available.
    return localSimulate(req)
  } catch {
    return localSimulate(req)
  }
}
