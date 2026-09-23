/**
 * Bravexo Connect — client-side bindings for the universal export relay.
 *
 * The relay (server/index.js) exposes:
 *   POST /api/bravexo/export   — universal content export endpoint.
 *
 * It accepts a JSON draft payload plus a target descriptor. When the target
 * has a webhook URL, the relay forwards the draft to ANY external platform
 * (WordPress, Webflow, Shopify, custom Lovable sites…). Without a webhook it
 * validates the payload and returns a simulated confirmation, so demos and
 * dry-runs always work.
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

export async function exportDraft(req: ExportRequest): Promise<ExportResponse> {
  const res = await fetch('/api/bravexo/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'bravexo-earlybooster', version: '1.0', ...req }),
  })
  const data = (await res.json().catch(() => null)) as ExportResponse | null
  if (!data) {
    throw new Error(`Relay returned HTTP ${res.status}`)
  }
  return data
}
