import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  Rocket,
  Newspaper,
  MessageSquare,
  PlugZap,
  Zap,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Cpu,
  Globe,
  Star,
  ChevronRight,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

/**
 * PUBLIC landing page — the marketing surface of Bravexo EarlyBooster.
 * Fully self-contained styling (no portal tokens) so it stays isolated from
 * the app routes (/login, /admin, /portal).
 */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
        <Rocket className="h-[18px] w-[18px] -rotate-45 text-[#04150d]" strokeWidth={2.5} />
      </span>
      <span className={`font-display text-[17px] font-bold tracking-tight ${dark ? 'text-white' : 'text-white'}`}>
        Bravexo <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">EarlyBooster</span>
      </span>
    </span>
  )
}

/* ---------------- dashboard mockup (pure CSS, no images) ---------------- */
function HeroMockup() {
  const bars = [42, 68, 50, 82, 61, 92, 74, 100, 66, 88, 58, 96]
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, rotateX: 14 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1400 }}
      className="relative mx-auto mt-16 w-full max-w-5xl"
    >
      {/* glow */}
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a120e]/90 shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35)] backdrop-blur-xl">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-4 flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> app.bravexo.io/portal
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
            <Zap className="h-3 w-3" /> $0.00 AI spend
          </span>
        </div>
        <div className="grid grid-cols-[180px_1fr] max-sm:grid-cols-1">
          {/* sidebar */}
          <div className="hidden border-r border-white/5 p-4 sm:block">
            {[
              ['Overview', true],
              ['Review Responder', false],
              ['Auto-Blog Engine', false],
              ['Bravexo Connect', false],
            ].map(([label, active]) => (
              <div
                key={label as string}
                className={`mb-1.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium ${
                  active ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/10 text-white ring-1 ring-inset ring-emerald-400/30' : 'text-zinc-500'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-white/15'}`} />
                {label}
              </div>
            ))}
          </div>
          {/* content */}
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              {[
                ['Articles drafted', '128'],
                ['Review replies', '342'],
                ['Content deployed', '96'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
                  <p className="font-display text-xl font-bold text-white">{value}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-zinc-300">Content performance</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">+214% organic</span>
              </div>
              <div className="flex h-24 items-end gap-1.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.7 + i * 0.05, ease: 'easeOut' }}
                    className={`flex-1 rounded-t-sm ${i % 3 === 0 ? 'bg-gradient-to-t from-emerald-500/80 to-cyan-400/80' : 'bg-emerald-400/25'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Landing() {
  const features = [
    {
      icon: Newspaper,
      title: 'Headless Auto-Blog',
      body: 'A universal, decoupled content engine that drafts complete SEO articles — title, meta tags, structured body — for any niche, never tied to one website.',
    },
    {
      icon: MessageSquare,
      title: 'Review Responder',
      body: 'Paste any customer review and get an on-brand, ready-to-publish reply in seconds, matched to your exact company tone. One click to copy.',
    },
    {
      icon: PlugZap,
      title: 'Bravexo Connect',
      body: 'One glowing Deploy button pushes JSON drafts to WordPress, Webflow, Shopify or any custom site via universal webhooks and REST endpoints.',
    },
    {
      icon: Zap,
      title: 'Zero-Cost AI Router',
      body: 'Intelligent load-balancing across free-tier models with automatic fallback and a built-in local engine — monthly AI spend stays at $0.00.',
    },
  ]

  const steps = [
    { n: '01', title: 'Get invited', body: 'Onboarding is invite-only. Your Bravexo partner provisions a fully isolated workspace for your company, your tone, your websites.' },
    { n: '02', title: 'Generate', body: 'Draft SEO articles and review replies in your brand voice, tuned to your niche and keywords, served by the zero-cost AI router.' },
    { n: '03', title: 'Deploy anywhere', body: 'Hit Deploy Content and Bravexo Connect ships the draft to whatever platform you already run — no plugins, no lock-in.' },
  ]

  return (
    <div className="min-h-screen bg-[#050807] font-sans text-white antialiased overflow-x-hidden">
      {/* ambient background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(1100px 520px at 80% -10%, rgba(16,185,129,0.13), transparent 60%), radial-gradient(900px 480px at -10% 30%, rgba(34,211,238,0.07), transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent 90%)',
        }}
      />

      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050807]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#router" className="transition hover:text-white">AI Router</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.login} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white">
              Sign in
            </Link>
            <Link
              to={ROUTES.login}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-[#04150d] shadow-[0_0_24px_rgba(16,185,129,0.35)] transition hover:brightness-110"
            >
              Open portal
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-10 text-center sm:pt-28">
        <motion.div {...{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Invite-only · Multi-tenant · Zero AI cost
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-display mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
        >
          The universal content brain
          <span className="block bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            for every website you run.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          Bravexo EarlyBooster generates SEO articles and reputation-grade review replies in your brand voice, then
          deploys them to WordPress, Webflow, Shopify or any custom site — powered by a zero-cost AI router.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to={ROUTES.login}
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 text-sm font-bold text-[#04150d] shadow-[0_0_40px_rgba(16,185,129,0.35)] transition hover:brightness-110"
          >
            Access your portal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-zinc-200 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
          >
            See how it works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-zinc-500"
        >
          {['Free-tier AI models only', 'Isolated client workspaces', 'Export to any platform'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t}
            </span>
          ))}
        </motion.div>

        <HeroMockup />
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
          {[
            ['$0.00', 'guaranteed monthly AI spend'],
            ['3+', 'platform presets + any webhook'],
            ['100%', 'isolated client workspaces'],
            ['1-click', 'copy & deploy workflows'],
          ].map(([v, l]) => (
            <div key={l} className="bg-[#070d0a] px-6 py-7 text-center">
              <p className="font-display text-3xl font-bold text-white">{v}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-14">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">Everything included</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            One engine. Every channel. Zero friction.
          </h2>
          <p className="mt-4 text-zinc-400">
            Built as a universal, decoupled layer — Bravexo plugs into the sites you already have instead of replacing them.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 transition duration-300 hover:border-emerald-400/30">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition duration-500 group-hover:bg-emerald-500/20" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display relative mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- AI Router ---------- */}
      <section id="router" className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#08130d] via-[#070d0a] to-[#061015] p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">The Zero-Cost AI Router</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Production-grade AI,
                <span className="block text-emerald-300">without the invoice.</span>
              </h2>
              <p className="mt-4 leading-relaxed text-zinc-400">
                Every request is routed through admin-configured free-tier providers in priority order. Failures and
                rate-limits fall through automatically — and if everything is down, the built-in Local Engine still
                delivers. Clients never wait. You never pay.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                {['Groq free tier — 14,400 requests/day', 'Google Gemini free tier — instant AI Studio keys', 'Local Engine — deterministic, offline, always on'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="space-y-3">
                {[
                  { name: 'Groq · llama-3.3-70b', note: 'priority 1', pct: 'w-[86%]', live: true },
                  { name: 'Google Gemini · 2.0-flash', note: 'priority 2', pct: 'w-[64%]', live: true },
                  { name: 'Bravexo Local Engine', note: 'final fallback', pct: 'w-[100%]', live: false },
                ].map((p, i) => (
                  <div key={p.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-white">
                        <Cpu className="h-4 w-4 text-emerald-300" /> {p.name}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.live ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
                        {p.note}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                        className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 ${p.pct}`}
                        style={{ maxWidth: p.pct.includes('86') ? '86%' : p.pct.includes('64') ? '64%' : '100%' }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                    <Star className="h-4 w-4 text-emerald-300" /> Monthly AI spend
                  </span>
                  <span className="font-display text-2xl font-bold text-emerald-300">$0.00</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="relative mx-auto max-w-6xl px-6 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">How it works</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Live in three steps</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <span className="font-display bg-gradient-to-br from-emerald-300 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
                  {s.n}
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                {i < 2 && <ChevronRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-emerald-400/50 md:block" />}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-[#070d0a] to-cyan-500/10 px-8 py-14 text-center sm:py-16">
            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(600px 260px at 50% 0%, rgba(16,185,129,0.25), transparent 70%)' }} />
            <Globe className="mx-auto h-8 w-8 text-emerald-300" />
            <h2 className="font-display mx-auto mt-5 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to boost every site you manage?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              Access is by invitation — sign in to your workspace or redeem the invite link from your Bravexo partner.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={ROUTES.login}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 text-sm font-bold text-[#04150d] shadow-[0_0_40px_rgba(16,185,129,0.35)] transition hover:brightness-110"
              >
                Open the portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={ROUTES.login}
                className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                I have an invite
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <Wordmark />
          <p>© {new Date().getFullYear()} Bravexo EarlyBooster · Invite-only access</p>
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Zero-cost AI routing
          </div>
        </div>
      </footer>
    </div>
  )
}
