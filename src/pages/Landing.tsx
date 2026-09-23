import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Rocket,
  Newspaper,
  MessageSquare,
  PlugZap,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

/**
 * PUBLIC landing page — restrained, product-grade aesthetic.
 * Self-contained styling: never touches the app tokens used by
 * /login, /admin and /portal.
 */

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
        <Rocket className="h-4 w-4 -rotate-45 text-zinc-950" strokeWidth={2.5} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Bravexo <span className="text-zinc-400 font-normal">EarlyBooster</span>
      </span>
    </span>
  )
}

/* Clean product mockup — no halos, precise borders. */
function HeroMockup() {
  const bars = [38, 56, 44, 70, 52, 78, 64, 88, 58, 76, 68, 92]
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease }}
      className="relative mx-auto mt-16 w-full max-w-4xl"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0e] shadow-2xl shadow-black/60">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            app.bravexo.io/portal
          </span>
          <span className="w-14" />
        </div>
        <div className="grid grid-cols-[170px_1fr] max-sm:grid-cols-1">
          {/* sidebar */}
          <div className="hidden border-r border-white/[0.06] p-3 sm:block">
            {['Overview', 'Review Responder', 'Auto-Blog Engine', 'Bravexo Connect'].map((label, i) => (
              <div
                key={label}
                className={`mb-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[11.5px] font-medium ${
                  i === 0 ? 'bg-white/[0.06] text-white' : 'text-zinc-500'
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                {label}
              </div>
            ))}
          </div>
          {/* content */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
              {[
                ['Articles drafted', '128'],
                ['Review replies', '342'],
                ['Deployed', '96'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
                  <p className="text-lg font-semibold tracking-tight text-white">{value}</p>
                  <p className="mt-0.5 text-[10.5px] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium text-zinc-300">Content performance</p>
                <span className="text-[10px] text-emerald-400">+214% organic reach</span>
              </div>
              <div className="flex h-20 items-end gap-1.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.04, ease: 'easeOut' }}
                    className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-emerald-500/80' : 'bg-white/10'}`}
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
      body: 'A decoupled content engine that drafts complete SEO articles — title, meta description, tags and structured body — for any niche. Never tied to one website.',
    },
    {
      icon: MessageSquare,
      title: 'Review Responder',
      body: 'Paste a customer review, receive a ready-to-publish reply matched to your company tone. One click copies it to your clipboard.',
    },
    {
      icon: PlugZap,
      title: 'Bravexo Connect',
      body: 'Deploy drafts as structured JSON to WordPress, Webflow, Shopify or any custom endpoint through universal webhooks and a single REST API.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Cost AI Router',
      body: 'Requests route across free-tier models in priority order with automatic fallback. If every provider is down, a built-in engine still delivers.',
    },
  ]

  const steps = [
    { n: '01', title: 'Get invited', body: 'Access is invite-only. Each company receives a fully isolated workspace with its own tone, websites and content library.' },
    { n: '02', title: 'Generate', body: 'Draft SEO articles and review replies in your brand voice — served by the zero-cost routing layer, tuned to your niche.' },
    { n: '03', title: 'Deploy anywhere', body: 'One action ships the draft to the platforms you already run. No plugins to maintain, no lock-in.' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-white antialiased">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Wordmark />
          <nav className="hidden items-center gap-7 text-[13px] text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Product</a>
            <a href="#router" className="transition hover:text-white">AI Router</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to={ROUTES.login} className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-zinc-300 transition hover:text-white">
              Sign in
            </Link>
            <Link
              to={ROUTES.login}
              className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Open portal
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-12 text-center sm:pt-32">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Invite-only · Multi-tenant · $0 monthly AI spend
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease }}
          className="mx-auto mt-7 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-6xl"
        >
          The content engine for
          <br />
          every website you manage.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400 sm:text-base"
        >
          Bravexo EarlyBooster drafts SEO articles and review replies in your brand voice, then deploys them to
          WordPress, Webflow, Shopify or any custom site — on a routing layer that costs nothing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link
            to={ROUTES.login}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Access your portal
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex h-11 items-center rounded-lg border border-white/10 px-6 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
          >
            Explore the product
          </a>
        </motion.div>

        <HeroMockup />
      </section>

      {/* ---------- Stats ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
          {[
            ['$0.00', 'monthly AI spend, guaranteed'],
            ['4+', 'platform presets and any webhook'],
            ['100%', 'isolated client workspaces'],
            ['1-click', 'copy and deploy workflows'],
          ].map(([v, l]) => (
            <div key={l} className="bg-[#0b0b0d] px-6 py-6 text-center">
              <p className="text-2xl font-semibold tracking-tight text-white">{v}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Product</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            One engine, every channel.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            Bravexo is built as a universal, decoupled layer. It plugs into the sites you already run instead of
            replacing them.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} className="h-full">
              <div className="h-full bg-[#0b0b0d] p-7 transition-colors hover:bg-[#0d0d10]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                  <f.icon className="h-4 w-4 text-emerald-400" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- AI Router ---------- */}
      <section id="router" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-start gap-12 rounded-xl border border-white/[0.06] bg-[#0b0b0d] p-8 sm:p-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">The Zero-Cost AI Router</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
              Production-grade AI, without the invoice.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
              Every request is routed through admin-configured free-tier providers in priority order. Failures and
              rate-limits fall through automatically — and if everything is down, the built-in Local Engine still
              delivers. Clients never wait. You never pay.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Groq free tier — 14,400 requests per day',
                'Google Gemini free tier — instant AI Studio keys',
                'Local Engine — deterministic, offline, always available',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-2.5">
              {[
                { name: 'Groq', model: 'llama-3.3-70b-versatile', note: 'priority 1' },
                { name: 'Google Gemini', model: 'gemini-2.0-flash', note: 'priority 2' },
                { name: 'Bravexo Local Engine', model: 'bravexo-local-v1', note: 'fallback' },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{p.model}</p>
                  </div>
                  <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    {p.note}
                  </span>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3.5">
                <span className="text-sm text-zinc-300">Monthly AI spend</span>
                <span className="text-xl font-semibold tracking-tight text-emerald-300">$0.00</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Process</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Live in three steps.</h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06} className="h-full">
              <div className="h-full bg-[#0b0b0d] p-7">
                <span className="font-mono text-xs text-zinc-500">{s.n}</span>
                <h3 className="mt-3 text-[15px] font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <Reveal>
          <div className="rounded-xl border border-white/[0.06] bg-[#0b0b0d] px-8 py-14 text-center sm:py-16">
            <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-[-0.02em]">
              Ready to boost every site you manage?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              Access is by invitation. Sign in to your workspace, or redeem the invite link from your Bravexo partner.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to={ROUTES.login}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Open the portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={ROUTES.login}
                className="inline-flex h-11 items-center rounded-lg border border-white/10 px-6 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
              >
                I have an invite
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-[13px] text-zinc-500 sm:flex-row">
          <Wordmark />
          <p>© {new Date().getFullYear()} Bravexo EarlyBooster. Invite-only access.</p>
        </div>
      </footer>
    </div>
  )
}
