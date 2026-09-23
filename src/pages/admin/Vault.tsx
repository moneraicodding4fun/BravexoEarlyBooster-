import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Eye, EyeOff, Zap, ShieldCheck, TestTubes, Cpu, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { loadDB, mutate, type AIKeyRow } from '@/lib/mockDb'
import { pingProvider } from '@/lib/aiRouter'
import { toast } from '@/lib/toast'
import { timeAgo } from '@/lib/utils'

function ProviderCard({ row, index, total, onSaved }: { row: AIKeyRow; index: number; total: number; onSaved: () => void }) {
  const [key, setKey] = useState(row.apiKey)
  const [model, setModel] = useState(row.model)
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)

  function save() {
    mutate((db) => {
      const r = db.aiKeys.find((k) => k.provider === row.provider)
      if (r) {
        r.apiKey = key.trim()
        r.model = model.trim() || r.model
      }
    })
    toast({ title: `${row.label} configuration stored`, description: 'The AI Router can now use this free-tier model.', variant: 'success' })
    onSaved()
  }

  function setEnabled(enabled: boolean) {
    mutate((db) => {
      const r = db.aiKeys.find((k) => k.provider === row.provider)
      if (r) r.enabled = enabled
    })
    toast({ title: `${row.label} ${enabled ? 'enabled' : 'disabled'}`, variant: 'info' })
    onSaved()
  }

  function move(dir: -1 | 1) {
    mutate((db) => {
      const sorted = [...db.aiKeys].sort((a, b) => a.priority - b.priority)
      const i = sorted.findIndex((k) => k.provider === row.provider)
      const j = i + dir
      if (j < 0 || j >= sorted.length) return
      const a = sorted[i]
      const b = sorted[j]
      const ra = db.aiKeys.find((k) => k.provider === a.provider)
      const rb = db.aiKeys.find((k) => k.provider === b.provider)
      if (ra && rb) {
        const tmp = ra.priority
        ra.priority = rb.priority
        rb.priority = tmp
      }
    })
    onSaved()
  }

  async function test() {
    setTesting(true)
    const res = await pingProvider(row.provider)
    setTesting(false)
    if (res.ok) {
      toast({ title: `${row.label} is reachable`, description: `Ping succeeded in ${res.latencyMs}ms.`, variant: 'success' })
    } else {
      toast({ title: `${row.label} test failed`, description: res.error, variant: 'error' })
    }
  }

  const configured = row.apiKey.trim().length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className="bx-glass border-white/10 bg-transparent">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-emerald-400">
                <KeyRound className="h-4 w-4" />
              </span>
              {row.label}
            </CardTitle>
            <CardDescription className="mt-2">{row.freeTierNote}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={configured && row.enabled ? 'success' : 'muted'}>{configured && row.enabled ? 'Ready' : 'Idle'}</Badge>
            <div className="flex gap-1">
              <button disabled={index === 0} onClick={() => move(-1)} className="rounded p-1 text-muted-foreground hover:text-white disabled:opacity-30">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button disabled={index === total - 1} onClick={() => move(1)} className="rounded p-1 text-muted-foreground hover:text-white disabled:opacity-30">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`key-${row.provider}`}>API key</Label>
              <div className="relative">
                <Input
                  id={`key-${row.provider}`}
                  type={show ? 'text' : 'password'}
                  className="pr-10 font-mono text-xs"
                  placeholder={`Paste ${row.label} API key`}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`model-${row.provider}`}>Model</Label>
              <Input
                id={`model-${row.provider}`}
                className="font-mono text-xs"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={row.provider === 'gemini' ? 'gemini-2.5-flash' : 'llama-3.3-70b-versatile'}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} variant="secondary">Save</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch id={`sw-${row.provider}`} checked={row.enabled} onCheckedChange={setEnabled} />
              <Label htmlFor={`sw-${row.provider}`} className="cursor-pointer text-sm text-muted-foreground">
                Route traffic here
              </Label>
            </div>
            <Button size="sm" variant="ghost" onClick={test} disabled={testing || !configured} className="text-emerald-300 hover:text-emerald-200">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTubes className="h-4 w-4" />} Test connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function VaultPage() {
  const [, forceRender] = useState(0)
  const refresh = () => forceRender((n) => n + 1)
  const db = loadDB()
  const keys = [...db.aiKeys].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">AI Configuration Vault</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free-tier keys only — the router guarantees $0.00 monthly AI spend.</p>
      </div>

      {/* Guarantee banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">Zero-cost guarantee</p>
            <p className="text-sm text-muted-foreground">Priority routing → automatic fallback → built-in Local Engine.</p>
          </div>
        </div>
        <div className="flex items-center gap-8 text-center">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-emerald-300">$0.00</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Monthly AI spend</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white">{keys.length + 1}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Routes available</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {keys.map((row, i) => (
          <ProviderCard key={row.provider} row={row} index={i} total={keys.length} onSaved={refresh} />
        ))}
      </div>

      {/* Local engine fallback */}
      <Card className="bx-glass border-white/10 bg-transparent">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-white">Bravexo Local Engine <Badge variant="info" className="ml-2">always on</Badge></p>
              <p className="mt-0.5 text-sm text-muted-foreground">Deterministic last-resort generator. No keys, no network, no cost.</p>
            </div>
          </div>
          <Zap className="h-5 w-5 text-emerald-300" />
        </CardContent>
      </Card>

      {/* Router activity */}
      <Card className="bx-glass border-white/10 bg-transparent">
        <CardHeader>
          <CardTitle className="text-white">Routing audit log</CardTitle>
          <CardDescription>Every generation, the provider that served it and why.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {db.routerLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{log.task}</p>
                <p className="text-xs text-muted-foreground">{log.provider} · {log.latencyMs}ms</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{timeAgo(log.ts)}</span>
                <Badge variant={log.status === 'success' ? 'success' : log.status === 'fallback' ? 'warning' : 'info'}>{log.status === 'simulated' ? 'local' : log.status}</Badge>
              </div>
            </div>
          ))}
          {db.routerLogs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No routing events yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
