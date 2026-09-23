/**
 * Bravexo Connect — universal export bindings.
 *
 * Delivery order (all real, nothing faked):
 *   1. Bravexo relay — POST /api/bravexo/export (server/index.js) when the
 *      app runs with the relay (self-hosted). Forwards server-side to any
 *      platform webhook.
 *   2. Direct delivery — on static hosting (GitHub Pages) the browser posts
 *      the JSON draft straight to the client's webhook. Success or failure
 *      is reported honestly (CORS/network errors included).
 *   3. Dry-run — an explicit, user-selected validation mode only.
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
  mode: 'webhook' | 'validated' | 'dry-run'
  status?: number
  error?: string
  receivedAt: string
  echo?: { title: string; slug: string }
  note?: string
}

function base() {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
}

function payloadBody(req: ExportRequest) {
  return JSON.stringify({
    source: 'bravexo-earlybooster',
    version: '1.0',
    workspace: req.workspace,
    draft: req.draft,
  })
}

export async function exportDraft(req: ExportRequest): Promise<ExportResponse> {
  const receivedAt = new Date().toISOString()

  /* Explicit dry-run: validate locally, send nothing. */
  if (req.dryRun) {
    return {
      ok: true,
      mode: 'dry-run',
      receivedAt,
      echo: { title: req.draft.title, slug: req.draft.slug },
      note: 'Dry-run: payload validated. Nothing was sent.',
    }
  }

  if (!req.target.webhookUrl) {
    return {
      ok: false,
      mode: 'validated',
      receivedAt,
      error: 'No webhook configured for this target. Connect one in the panel on the right.',
    }
  }

  /* 1) Try the Bravexo relay (self-hosted deployments). */
  try {
    const res = await fetch(`${base()}/api/bravexo/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'bravexo-earlybooster', version: '1.0', ...req }),
    })
    const ct = res.headers.get('content-type') ?? ''
    if (res.ok && ct.includes('application/json')) {
      const data = (await res.json()) as ExportResponse
      // The relay without webhook config answers "simulated" — treat it as
      // validated only, never as delivered.
      if ((data.mode as string) === 'simulated') {
        return { ...data, mode: 'validated' }
      }
      return data
    }
  } catch {
    /* relay not present (static hosting) — fall through to direct */
  }

  /* 2) Direct browser → webhook delivery (GitHub Pages et al.). */
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10_000)
    const res = await fetch(req.target.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bravexo-Source': 'earlybooster',
        'X-Bravexo-Workspace': req.workspace.id,
        ...(req.target.headers ?? {}),
      },
      body: payloadBody(req),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    return {
      ok: res.ok,
      mode: 'webhook',
      status: res.status,
      receivedAt,
      error: res.ok ? undefined : `Target responded with HTTP ${res.status}.`,
    }
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout after 10s' : 'network/CORS blocked'
    return {
      ok: false,
      mode: 'webhook',
      receivedAt,
      error: `Webhook unreachable from the browser (${reason}). Self-host the relay (server/index.js) for server-side delivery, or check the target URL/CORS.`,
    }
  }
}
