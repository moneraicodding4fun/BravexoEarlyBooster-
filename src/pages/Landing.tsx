import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Newspaper, MessageSquare, PlugZap, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

/**
 * PUBLIC landing page. This is the existing marketing surface — it is kept
 * completely separate from the premium dark portal theme (`.bx-app`) so the
 * two never bleed into each other.
 */
export function Landing() {
  const features = [
    {
      icon: Newspaper,
      title: 'Headless Auto-Blog',
      body: 'A universal content engine that drafts full SEO articles for any niche — car detailing, real estate, anything — without being tied to one website.',
    },
    {
      icon: MessageSquare,
      title: 'Review Responder',
      body: 'Paste any customer review and get an on-brand, ready-to-publish reply in seconds, matched to your exact company tone.',
    },
    {
      icon: PlugZap,
      title: 'Bravexo Connect',
      body: 'One-click export to WordPress, Webflow, Shopify or any custom site via universal webhooks and REST endpoints.',
    },
    {
      icon: Zap,
      title: 'Zero-cost AI Router',
      body: 'Intelligent load-balancing across free-tier models with automatic fallback — so monthly AI spend stays at $0.00.',
    },
  ]

  const steps = [
    { title: 'Get invited', body: 'Onboarding is invite-only. Your Bravexo partner provisions an isolated workspace for your company.' },
    { title: 'Generate', body: 'Draft SEO articles and review replies using your tone, your niche and your keywords.' },
    { title: 'Deploy anywhere', body: 'Hit Deploy and Bravexo Connect pushes the content to whatever site you already run.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-zinc-900">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Rocket className="h-4.5 w-4.5 h-5 w-5 -rotate-45" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Bravexo <span className="text-emerald-600">EarlyBooster</span>
          </span>
        </div>
        <Link
          to={ROUTES.login}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Invite-only · Multi-tenant · Zero AI cost
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="font-display mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
        >
          Your universal content brain,
          <span className="block bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">for every website you run.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600"
        >
          Bravexo EarlyBooster generates SEO articles and review replies in your brand voice, then deploys them to
          WordPress, Webflow, Shopify or any custom site — all on a zero-cost AI router.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to={ROUTES.login}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
          >
            Access your portal <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-zinc-500">Access is by invitation only.</span>
        </motion.div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
          {['Free-tier AI models', 'Isolated client workspaces', 'Export to any platform'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-2xl bg-zinc-900 p-6 text-white"
            >
              <span className="text-sm font-bold text-emerald-400">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Bravexo EarlyBooster. Invite-only access.
      </footer>
    </div>
  )
}
