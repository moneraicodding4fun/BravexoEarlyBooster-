import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, PlugZap, Loader2, ChevronDown, ChevronUp, Globe, Check, AlertTriangle, Send, Webhook } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { loadDB, mutate, uid, nowIso, getClient } from '@/lib/mockDb'
import { exportDraft } from '@/lib/api'
import { toast } from '@/lib/toast'
import { PLATFORMS } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'

export function ConnectPage() {
  const { session } = useAuth()
  const location = useLocation()
  const preselected = (location.state as { draftId?: string } | null)?.draftId

  const db = loadDB()
  const client = getClient(db, session?.clientId)
  const drafts = db.drafts.filter((d) => d.clientId === client?.id)
  const deployments = db.deployments.filter((x) => x.clientId === client?.id).sort((a, b) => (a.ts < b.ts ? 1 : -1))

  const [draftId, setDraftId] = useState<string>(preselected ?? drafts[0]?.id ?? '')
  const [siteId, setSiteId] = useState<string>(client?.connectedSites[0]?.id ?? '')
  const [dryRun, setDryRun] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [showPayload, setShowPayload] = useState(false)
  const [, forceRender] = useState(0)
  const refresh = () => forceRender((n) => n + 1)

  // webhook config form
  const [sitePlatform, setSitePlatform] = useState<string>(PLATFORMS[0].id)
  const [siteUrl, setSiteUrl] = useState('')

  useEffect(() => {
    if (preselected) setDraftId(preselected)
  }, [preselected])

  const draft = drafts.find((d) => d.id === draftId)
  const site = client?.connectedSites.find((s) => s.id === siteId)

  const payload = useMemo(() => {
    if (!draft || !client) return null
    return {
      source: 'bravexo-earlybooster',
      version: '1.0',
      workspace: { id: client.id, company: client.company },
      target: { platform: site?.platform ?? 'unconfigured', webhookUrl: site?.url ?? null, dryRun },
      draft: {
        id: draft.id,
        title: draft.title,
        slug: draft.slug,
        metaDescription: draft.metaDescription,
        tags: draft.tags,
        body: draft.body,
        niche: draft.niche,
        topic: draft.topic,
      },
    }
  }, [draft, site, client, dryRun])

  function connectSite() {
    if (!siteUrl.trim() || !client) return
    const platformLabel = PLATFORMS.find((p) => p.id === sitePlatform)?.label ?? 'Custom / Lovable'
    mutate((d) => {
      const c = d.clients.find((x) => x.id === client.id)
      if (c) c.connectedSites.push({ id: uid('site'), platform: platformLabel, url: siteUrl.trim(), status: 'dry-run' })
    })
    setSiteUrl('')
    const updated = loadDB().clients.find((c) => c.id === client.id)
    const last = updated?.connectedSites.at(-1)
    if (last) setSiteId(last.id)
    toast({ title: `${platformLabel} connected`, description: 'Webhook target saved in dry-run mode.', variant: 'success' })
    refresh()
  }

  function hostOf(url: string) {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).host
    } catch {
      return url
    }
  }

  async function deploy() {
    if (!draft || !client) return
    setDeploying(true)
    try {
      const res = await exportDraft({
        workspace: { id: client.id, company: client.company },
        target: { platform: site?.platform ?? 'unconfigured', webhookUrl: site?.url },
        dryRun,
        draft: {
          id: draft.id,
          title: draft.title,
          slug: draft.slug,
          metaDescription: draft.metaDescription,
          tags: draft.tags,
          body: draft.body,
          niche: draft.niche,
          topic: draft.topic,
        },
      })

      const status: 'delivered' | 'dry-run' | 'failed' = !res.ok ? 'failed' : res.mode === 'dry-run' ? 'dry-run' : 'delivered'
      mutate((d) => {
        d.deployments.unshift({
          id: uid('dep'),
          clientId: client.id,
          draftId: draft.id,
          title: draft.title,
          platform: site?.platform ?? '—',
          target: site ? hostOf(site.url) : 'no target',
          status,
          ts: nowIso(),
        })
        const dd = d.drafts.find((x) => x.id === draft.id)
        if (dd && status === 'delivered') {
          dd.status = 'deployed'
          dd.deployedTo = `${site?.platform ?? 'Webhook'} · ${site ? hostOf(site.url) : ''}`
          dd.deployedAt = nowIso()
        }
        const cc = d.clients.find((x) => x.id === client.id)
        if (cc) cc.lastActivity = nowIso()
      })

      if (res.ok) {
        toast({
          title: status === 'delivered' ? 'Content deployed' : 'Dry-run validated',
          description:
            status === 'delivered'
              ? `Delivered to ${site?.platform}${res.status ? ` (HTTP ${res.status})` : ''}.`
              : 'Payload validated locally. Nothing was sent.',
          variant: 'success',
        })
      } else {
        toast({ title: 'Deployment failed', description: res.error ?? 'The target rejected the payload.', variant: 'error' })
      }
      refresh()
    } catch (err) {
      toast({ title: 'Export error', description: err instanceof Error ? err.message : 'Network error.', variant: 'error' })
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Bravexo Connect</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Universal integration layer — export content to WordPress, Webflow, Shopify, custom Lovable sites or any webhook.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        {/* Deploy console */}
        <div className="space-y-5">
          <Card className="bx-glass border-white/10 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Send className="h-4 w-4 text-emerald-300" /> Deploy console
              </CardTitle>
              <CardDescription>
                POST payload to <span className="font-mono text-emerald-300">/api/bravexo/export</span> — forwarded to your target.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Content draft</Label>
                  <Select value={draftId} onValueChange={setDraftId}>
                    <SelectTrigger><SelectValue placeholder="Choose a draft" /></SelectTrigger>
                    <SelectContent>
                      {drafts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.title.slice(0, 48)}{d.title.length > 48 ? '…' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Target website</Label>
                  <Select value={siteId} onValueChange={setSiteId}>
                    <SelectTrigger><SelectValue placeholder="Choose a target" /></SelectTrigger>
                    <SelectContent>
                      {(client?.connectedSites ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.platform} · {s.url.replace(/^https?:\/\//, '').slice(0, 34)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Dry-run mode</p>
                  <p className="text-xs text-muted-foreground">Validate the payload without touching the external site.</p>
                </div>
                <Switch checked={dryRun} onCheckedChange={setDryRun} />
              </div>

              {/* Payload preview */}
              <div className="rounded-xl border border-white/10 bg-black/30">
                <button onClick={() => setShowPayload((s) => !s)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-200">
                  <span className="flex items-center gap-2"><Webhook className="h-4 w-4 text-emerald-300" /> JSON draft payload</span>
                  {showPayload ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showPayload && (
                  <pre className="max-h-64 overflow-auto border-t border-white/10 p-4 text-[11px] leading-relaxed text-emerald-200/90">
{JSON.stringify(payload, null, 2)}
                  </pre>
                )}
              </div>

              {/* THE deploy button */}
              <Button
                onClick={deploy}
                disabled={deploying || !draft || (!dryRun && !site)}
                className="h-12 w-full bg-emerald-500 text-[15px] font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                {deploying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                {deploying ? 'Deploying content…' : dryRun ? 'Validate payload (dry-run)' : 'Deploy Content'}
              </Button>
              {!site && !dryRun && (
                <p className="flex items-center gap-1.5 text-xs text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" /> No target connected — add a webhook below to enable real delivery.
                </p>
              )}
              {drafts.length === 0 && (
                <p className="text-xs text-muted-foreground">Generate an article first in the Auto-Blog Engine.</p>
              )}
            </CardContent>
          </Card>

          {/* Deploy history */}
          <Card className="bx-glass border-white/10 bg-transparent">
            <CardHeader>
              <CardTitle className="text-white">Deploy history</CardTitle>
              <CardDescription>Every export pushed through Bravexo Connect.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {deployments.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{dep.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{dep.platform} → {dep.target} · {formatDateTime(dep.ts)}</p>
                  </div>
                  <Badge variant={dep.status === 'delivered' ? 'success' : dep.status === 'failed' ? 'destructive' : dep.status === 'dry-run' ? 'info' : 'warning'}>
                    {dep.status === 'delivered' && <Check className="h-3 w-3" />} {dep.status}
                  </Badge>
                </div>
              ))}
              {deployments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nothing deployed yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Targets */}
        <div className="space-y-5">
          <Card className="bx-glass border-white/10 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PlugZap className="h-4 w-4 text-emerald-300" /> Connected targets
              </CardTitle>
              <CardDescription>Webhook endpoints this workspace can publish to.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(client?.connectedSites ?? []).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Globe className="h-4 w-4 shrink-0 text-emerald-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{s.platform}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'connected' ? 'success' : 'info'}>{s.status}</Badge>
                </div>
              ))}
              {(client?.connectedSites ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No targets yet — add one below.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bx-glass border-white/10 bg-transparent">
            <CardHeader>
              <CardTitle className="text-white">Add integration</CardTitle>
              <CardDescription>Pick a platform preset and paste its webhook URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSitePlatform(p.id)}
                    className={
                      sitePlatform === p.id
                        ? 'rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-left ring-1 ring-emerald-400/30'
                        : 'rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20'
                    }
                  >
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{p.hint}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-url">Webhook URL</Label>
                <Input id="site-url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://your-site.com/webhook" />
              </div>
              <Button onClick={connectSite} disabled={!siteUrl.trim()} className="w-full">
                <PlugZap className="h-4 w-4" /> Connect target
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
