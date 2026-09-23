import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Mail, KeyRound, User, Loader2, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { toast } from '@/lib/toast'
import { ROUTES, MASTER_ADMIN_EMAIL, APP_NAME } from '@/lib/constants'

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
    <div className="bx-app relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 bx-grid-bg" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <Link to={ROUTES.home} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="rounded-2xl bx-glass-strong p-7 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <LogoMark />
            <div>
              <h1 className="font-display text-lg font-bold text-white">{APP_NAME}</h1>
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

            <Button type="submit" disabled={busy} className="w-full h-11 text-sm font-semibold">
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
              <Separator className="my-5" />
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                <p className="mb-2 font-semibold text-white">Demo mode — use these credentials</p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setEmail(MASTER_ADMIN_EMAIL)
                      setPassword('EarlyBooster!2026')
                    }}
                    className="block w-full truncate rounded-lg bg-white/5 px-2.5 py-1.5 text-left font-mono text-[11px] text-emerald-200 transition hover:bg-white/10"
                  >
                    Master Admin · {MASTER_ADMIN_EMAIL}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setEmail('demo@luxeautospa.com')
                      setPassword('ClientDemo!2026')
                    }}
                    className="block w-full truncate rounded-lg bg-white/5 px-2.5 py-1.5 text-left font-mono text-[11px] text-cyan-200 transition hover:bg-white/10"
                  >
                    Client · demo@luxeautospa.com
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
