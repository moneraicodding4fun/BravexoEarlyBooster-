import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Newspaper, PlugZap, ArrowRight, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { loadDB, getClient } from '@/lib/mockDb'
import { ROUTES } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'

export function PortalOverview() {
  const { session } = useAuth()
  const db = loadDB()
  const client = getClient(db, session?.clientId)

  const stats = {
    drafts: db.drafts.filter((d) => d.clientId === client?.id).length,
    reviews: db.reviews.filter((r) => r.clientId === client?.id).length,
    sites: client?.connectedSites.length ?? 0,
    deployed: db.deployments.filter((d) => d.clientId === client?.id).length,
  }

  const recentDrafts = db.drafts.filter((d) => d.clientId === client?.id).slice(0, 3)

  const quickLinks = [
    {
      to: ROUTES.portalReviews,
      icon: MessageSquare,
      title: 'Review Responder',
      body: 'Turn any customer review into a polished, on-brand reply in seconds.',
      cta: 'Respond to reviews',
    },
    {
      to: ROUTES.portalBlog,
      icon: Newspaper,
      title: 'Auto-Blog Engine',
      body: 'Draft full SEO articles for your niche — title, meta tags and structured body.',
      cta: 'Generate an article',
    },
    {
      to: ROUTES.portalConnect,
      icon: PlugZap,
      title: 'Bravexo Connect',
      body: 'Deploy content to WordPress, Webflow, Shopify or any custom site.',
      cta: 'Deploy content',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Welcome back, {session?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {client ? (
              <>
                <span className="font-medium text-emerald-300">{client.company}</span> · {client.industry} ·{' '}
                <a href={client.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-emerald-300">
                  {client.website.replace(/^https?:\/\//, '')} <Globe className="h-3 w-3" />
                </a>
              </>
            ) : (
              'Your isolated workspace'
            )}
          </p>
        </div>
        <Badge variant="success">Workspace active</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Articles drafted', value: stats.drafts },
          { label: 'Review replies', value: stats.reviews },
          { label: 'Connected sites', value: stats.sites },
          { label: 'Content deployed', value: stats.deployed },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bx-glass border-white/10 bg-transparent">
              <CardContent className="p-5">
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((q, i) => (
          <motion.div key={q.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
            <Link to={q.to}>
              <Card className="group h-full border-white/[0.07] bg-white/[0.02] transition-colors hover:border-white/[0.16]">
                <CardContent className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-emerald-400">
                    <q.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-white">{q.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition group-hover:gap-2.5 group-hover:text-white">
                    {q.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {recentDrafts.length > 0 && (
        <Card className="bx-glass border-white/10 bg-transparent">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-white">Recent drafts</h3>
              <Link to={ROUTES.portalBlog} className="text-sm text-emerald-300 hover:text-emerald-200">View all</Link>
            </div>
            <div className="space-y-2">
              {recentDrafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.niche} · {timeAgo(d.createdAt)}</p>
                  </div>
                  <Badge variant={d.status === 'deployed' ? 'success' : 'muted'}>{d.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
