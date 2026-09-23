import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Newspaper, Zap, Activity, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { loadDB } from '@/lib/mockDb'
import { ROUTES } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'

function Stat({ icon: Icon, label, value, hint, delay }: { icon: typeof Users; label: string; value: string; hint?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
      <Card className="border-white/[0.07] bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300">
              <Icon className="h-4 w-4" />
            </span>
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AdminOverview() {
  const db = loadDB()

  const stats = useMemo(() => {
    const active = db.clients.filter((c) => c.status === 'active').length
    const invited = db.invites.filter((i) => !i.used && !i.revoked).length
    const posts = db.drafts.length
    const cost = '$0.00'
    return { active, invited, posts, cost, totalClients: db.clients.length }
  }, [db])

  const routerHealth = useMemo(() => {
    const configured = db.aiKeys.filter((k) => k.apiKey.trim()).length
    return { configured, total: db.aiKeys.length, logs: db.routerLogs.slice(0, 6) }
  }, [db])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Command Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything happening across every client workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Client workspaces" value={String(stats.totalClients)} hint={`${stats.active} active`} delay={0} />
        <Stat icon={UserPlus} label="Open invites" value={String(stats.invited)} hint="single-use" delay={0.05} />
        <Stat icon={Newspaper} label="Articles generated" value={String(stats.posts)} hint="all clients" delay={0.1} />
        <Stat icon={Zap} label="AI spend this month" value={stats.cost} hint="free-tier only" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Router activity */}
        <Card className="bx-glass border-white/10 bg-transparent lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-4 w-4 text-emerald-300" /> AI Router activity
              </CardTitle>
              <CardDescription>Live load-balancing across free-tier models.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-emerald-300 hover:text-emerald-200">
              <Link to={ROUTES.adminVault}>
                Open vault <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {routerHealth.logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{log.task}</p>
                  <p className="text-xs text-muted-foreground">{log.provider} · {log.latencyMs}ms · {timeAgo(log.ts)}</p>
                </div>
                <Badge variant={log.status === 'success' ? 'success' : log.status === 'fallback' ? 'warning' : 'info'}>
                  {log.status === 'simulated' ? 'local' : log.status}
                </Badge>
              </div>
            ))}
            {routerHealth.logs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No routing events yet.</p>}
          </CardContent>
        </Card>

        {/* Router health */}
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-white">Router health</CardTitle>
            <CardDescription>Free-tier providers available to the router.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
              <p className="font-display text-3xl font-bold text-emerald-300">{stats.cost}</p>
              <p className="mt-1 text-xs text-emerald-200/80">Guaranteed monthly AI cost. The router only uses free tiers and a local fallback.</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Providers configured</span>
              <Badge variant="success">{routerHealth.configured}/{routerHealth.total}</Badge>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              When no remote key is present the built-in Local Engine still generates content, so clients are never blocked.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
