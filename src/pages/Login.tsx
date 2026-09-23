import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  Newspaper,
  MessageSquare,
  PlugZap,
  Zap,
  MailCheck,
} from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { toast } from '@/lib/toast'
import { generateOtp, sendOtpEmail } from '@/lib/mailer'
import { ROUTES, MASTER_ADMIN_EMAIL, APP_NAME } from '@/lib/constants'

const PERKS = [
  { icon: Newspaper, text: 'Headless Auto-Blog — full SEO articles on demand' },
  { icon: MessageSquare, text: 'Review Responder — on-brand replies in seconds' },
  { icon: PlugZap, text: 'Bravexo Connect — deploy to any website' },
  { icon: Zap, text: 'Zero-cost AI Router — $0.00 monthly spend' },
]

export function Login() {
  const { login, register, resolveInvite } = useAuth()
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

  /* --- Gmail OTP verification for the Master Admin account --- */
  const [otpSent, setOtpSent] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [activationNeeded, setActivationNeeded] = useState(false)
  const otpRef = useRef<string | null>(null)

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

  // Reset OTP state whenever the email changes.
  useEffect(() => {
    setOtpSent(false)
    setOtpVerified(false)
    setOtpInput('')
    otpRef.current = null
    setActivationNeeded(false)
  }, [email])

  async function sendOtp() {
    setSendingOtp(true)
    setError(null)
    const code = generateOtp()
    otpRef.current = code
    const res = await sendOtpEmail(email.trim(), code)
    setSendingOtp(false)
    if (!res.ok) {
      setError(`Could not send the verification email. ${res.error ?? ''}`)
      toast({ title: 'Verification email failed', description: res.error, variant: 'error' })
      return
    }
    setOtpSent(true)
    setActivationNeeded(Boolean(res.activationRequired))
    toast({
      title: 'Verification code sent',
      description: 'Check your Gmail inbox and enter the 6-digit code.',
      variant: 'success',
    })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && isMasterEmail && !otpVerified) {
      if (!otpRef.current) {
        setError('Request a verification code first.')
        return
      }
      if (otpInput.trim() !== otpRef.current) {
        setError('Incorrect verification code. Check your Gmail and try again.')
        return
      }
      setOtpVerified(true)
      toast({ title: 'Email verified', description: 'Gmail ownership confirmed.', variant: 'success' })
    }

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
        <Link to={ROUTES.home} className="relative inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  Bravexo <span className="font-normal text-zinc-400">EarlyBooster</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Universal content engine</p>
              </div>
            </div>
            <h1 className="mt-12 max-w-md text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-white">
              One content engine for every website you run.
            </h1>
          </motion.div>
          <div className="mt-10 space-y-3">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                  <p.icon className="h-4 w-4 text-emerald-400" />
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
                <h2 className="text-lg font-semibold tracking-tight text-white">{APP_NAME}</h2>
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
                  {m === 'signin' ? 'Sign in' : hasValidInvite ? 'Accept invite' : 'Register'}
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
                    <ShieldCheck className="h-3.5 w-3.5" /> Master Admin email — Gmail OTP verification required.
                  </p>
                )}
              </div>

              {/* OTP step — Master Admin registration only */}
              {mode === 'register' && isMasterEmail && (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {otpVerified ? 'Gmail ownership confirmed.' : 'We will email a 6-digit code to your Gmail.'}
                    </p>
                    {otpVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                        <MailCheck className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <Button type="button" size="sm" variant="secondary" onClick={sendOtp} disabled={sendingOtp || otpSent}>
                        {sendingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                        {otpSent ? 'Code sent' : 'Send code'}
                      </Button>
                    )}
                  </div>
                  {otpSent && !otpVerified && (
                    <>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9 font-mono tracking-[0.3em]"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="••••••"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                        />
                      </div>
                      {activationNeeded && (
                        <p className="text-[11px] leading-relaxed text-amber-300/90">
                          First time? FormSubmit sent a one-time activation email to this Gmail — click the link in it, then press “Send code” again.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

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

              <Button type="submit" disabled={busy} className="h-11 w-full bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === 'signin' ? 'Sign in to your workspace' : hasValidInvite ? 'Activate my workspace' : isMasterEmail ? 'Create Master Admin' : 'Request access'}
              </Button>
            </form>

            {mode === 'register' && !hasValidInvite && !isMasterEmail && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Public sign-ups are disabled. You need a single-use invite link from a Bravexo administrator, or the designated Master Admin email.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
