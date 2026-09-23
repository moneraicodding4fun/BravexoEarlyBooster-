import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Lock,
  Mail,
  KeyRound,
  User,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Newspaper,
  MessageSquare,
  PlugZap,
  Zap,
} from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { toast } from '@/lib/toast'
import { ROUTES, MASTER_ADMIN_EMAIL, APP_NAME } from '@/lib/constants'

const PERKS = [
  { icon: Newspaper, text: 'Headless Auto-Blog — full SEO articles on demand' },
  { icon: MessageSquare, text: 'Review Responder — on-brand replies in seconds' },
  { icon: PlugZap, text: 'Bravexo Connect — deploy to any website' },
  { icon: Zap, text: 'Zero-cost AI Router — $0.00 monthly spend' },
]

export function Login() {
  const { login, register, resolveInvite, demoMode } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const inviteToken = params.get('invite') ?? undefined

  const [inviteInfo, setInviteInfo] = useState<{ valid: boolean; company?: string } | null>(null)
  const hasValidInvite = Boolean(inviteInfo?.valid)

  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirm, setConfirm] = useState('')

  const isMasterEmail = email.trim().toLowerCase() === MASTER_ADMIN_EMAIL

  useEffect(() => {
    if (!inviteToken) return
    let mounted = true
    resolveInvite(inviteToken).then((info) => {
      if (!mounted) return
      setInviteInfo(info)
      if (info.valid) setMode('register')
    })
    return () => {
      mounted = false
    }
  }, [inviteToken, resolveInvite])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const s = await login(email, password)
        toast({ title: `Welcome back, ${s.name.split(' ')[0]}`, description: 'Signed in successfully.', variant: 'success' })
        navigate(s.role === 'admin' ? ROUTES.admin : ROUTES.portal, { replace: true })
      } else {
        if (password !== confirm) throw new Error('Passwords do not match.')
        const s = await register({ name, email, password, inviteToken })
        toast({
          title: s.role === 'admin' ? 'Master Admin account ready' : 'Workspace activated',
          description: s.role === 'admin' ? 'You have full control of Bravexo EarlyBooster.' : 'Your invite has been redeemed.',
          variant: 'success',
        })
        navigate(s.role === 'admin' ? ROUTES.admin : ROUTES.portal, { replace: true })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      toast({ title: mode === 'signin' ? 'Sign-in failed' : 'Registration failed', description: msg, variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bx-app grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- Brand panel ---------- */}
      <div className="relative hidden overflow-hidden border-r border-white/5 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bx-grid-bg" />
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-3xl" />

        <Link to={ROUTES.home} className="relative inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11" />
              <div>
                <p className="font-display text-xl font-bold text-white">
                  Bravexo <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">EarlyBooster</span>
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Universal content engine</p>
              </div>
            </div>
            <h1 className="font-display mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
              One brain for
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">every website you run.</span>
            </h1>
          </motion.div>
          <div className="mt-10 space-y-3.5">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.text}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.text}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Invite-only access · Isolated workspaces · Zero-cost AI routing
        </p>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="relative flex items-center justify-center p-4 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bx-grid-bg lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <Link to={ROUTES.home} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>

          <div className="rounded-2xl bx-glass-strong p-7 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <LogoMark />
              <div>
                <h2 className="font-display text-lg font-bold text-white">{APP_NAME}</h2>
                <p className="text-xs text-muted-foreground">Invite-only access portal</p>
              </div>
            </div>

            {/* Invite banner */}
            {inviteToken && inviteInfo !== null && (
              <div
                className={
                  hasValidInvite
                    ? 'mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm text-emerald-200'
                    : 'mb-5 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-200'
                }
              >
                {hasValidInvite ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                <div>
                  {hasValidInvite ? (
                    <>
                      <p className="font-medium">You've been invited{inviteInfo?.company ? ` to ${inviteInfo.company}` : ''}.</p>
                      <p className="mt-0.5 text-xs text-emerald-300/80">Complete the form to activate your workspace.</p>
                    </>
                  ) : (
                    <p>This invite link is invalid or has already been used.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
              {(['signin', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError(null)
                  }}
                  className={
                    mode === m
                      ? 'rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground shadow'
                      : 'rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white'
                  }
                >
                  {m === 'signin' ? 'Sign in' : hasValidInvite ? 'Accept invite' : 'Request access'}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" required />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                </div>
                {mode === 'register' && isMasterEmail && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> Master Admin email detected — you'll receive full control.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="confirm" type="password" className="pl-9" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required minLength={8} />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-[#04150d] shadow-[0_0_28px_rgba(16,185,129,0.3)] hover:from-emerald-400 hover:to-cyan-400">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {mode === 'signin' ? 'Sign in to your workspace' : hasValidInvite ? 'Activate my workspace' : isMasterEmail ? 'Create Master Admin' : 'Request access'}
              </Button>
            </form>

            {mode === 'register' && !hasValidInvite && !isMasterEmail && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Public sign-ups are disabled. You need a single-use invite link from a Bravexo administrator, or the designated Master Admin email.
              </p>
            )}

            {demoMode && (
              <>
                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-white/10" /> Demo access <span className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setEmail(MASTER_ADMIN_EMAIL)
                      setPassword('EarlyBooster!2026')
                    }}
                    className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-3.5 py-2.5 text-left transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-emerald-300">Master Admin</span>
                      <span className="block truncate font-mono text-[11px] text-zinc-400">{MASTER_ADMIN_EMAIL}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">click to fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setEmail('demo@luxeautospa.com')
                      setPassword('ClientDemo!2026')
                    }}
                    className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-3.5 py-2.5 text-left transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-cyan-300">Client workspace</span>
                      <span className="block truncate font-mono text-[11px] text-zinc-400">demo@luxeautospa.com</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">click to fill</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
