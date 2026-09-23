import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  KeyRound,
  MessageSquare,
  Newspaper,
  PlugZap,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { ROUTES, APP_SHORT_NAME } from '@/lib/constants'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

function adminNav(): NavItem[] {
  return [
    { to: ROUTES.admin, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: ROUTES.adminClients, label: 'Client Workspaces', icon: Users },
    { to: ROUTES.adminVault, label: 'AI Config Vault', icon: KeyRound },
  ]
}

function portalNav(): NavItem[] {
  return [
    { to: ROUTES.portal, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: ROUTES.portalReviews, label: 'Review Responder', icon: MessageSquare },
    { to: ROUTES.portalBlog, label: 'Auto-Blog Engine', icon: Newspaper },
    { to: ROUTES.portalConnect, label: 'Bravexo Connect', icon: PlugZap },
  ]
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

const SIDEBAR_W = 252
const SIDEBAR_COLLAPSED = 78

export function AppShell({ section, children }: { section: 'admin' | 'portal'; children: ReactNode }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = section === 'admin' ? adminNav() : portalNav()
  const active = useMemo(
    () => nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))),
    [nav, location.pathname],
  )

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const initials = (session?.name ?? 'B')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await logout()
    toast({ title: 'Signed out', description: 'See you next time.', variant: 'info' })
    navigate(ROUTES.login)
  }

  const sidebarWidth = isMobile ? SIDEBAR_W : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_W
  const hideLabels = !isMobile && collapsed

  const sidebar = (
    <motion.aside
      initial={false}
      animate={
        isMobile
          ? { x: mobileOpen ? 0 : -SIDEBAR_W - 24, width: SIDEBAR_W }
          : { x: 0, width: sidebarWidth }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed inset-y-0 left-0 z-40 m-3 flex flex-col overflow-hidden rounded-2xl bx-glass-strong"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        <LogoMark />
        <AnimatePresence initial={false}>
          {!hideLabels && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <p className="font-display truncate text-[15px] font-bold leading-none text-white">
                {APP_SHORT_NAME}
                <span className="ml-1 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">EarlyBooster</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {section === 'admin' ? 'Master Admin' : 'Client Portal'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-1 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const isActive = active?.to === item.to
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className="block">
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-muted-foreground hover:text-white',
                  hideLabels && 'justify-center px-0',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={`active-pill-${section}`}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/25 to-cyan-500/10 ring-1 ring-inset ring-emerald-400/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={cn('relative z-10 h-[18px] w-[18px] shrink-0', isActive && 'text-emerald-300')} />
                <AnimatePresence initial={false}>
                  {!hideLabels && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="relative z-10 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-white/5 p-3">
        <div className={cn('flex items-center gap-2.5 rounded-xl px-2 py-2', hideLabels && 'justify-center px-0')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">
            {initials}
          </span>
          {!hideLabels && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{session?.email}</p>
            </div>
          )}
          {!hideLabels && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && 'Collapse'}
          </button>
        )}
      </div>
    </motion.aside>
  )

  return (
    <div className="bx-app min-h-screen">
      {sidebar}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main column */}
      <motion.div
        initial={false}
        animate={{ paddingLeft: isMobile ? 12 : sidebarWidth + 24, paddingRight: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="min-w-0"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 mt-3 flex items-center justify-between gap-3 rounded-2xl bx-glass px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-white">
                <Menu className="h-5 w-5" />
              </button>
            )}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {section === 'admin' ? 'Master Admin' : 'Client'}
            </span>
            <span className="hidden truncate text-sm text-muted-foreground sm:block">{active?.label ?? 'Dashboard'}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground md:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Zero-cost AI routing
            </span>
            <button onClick={handleLogout} title="Sign out" className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-rose-300">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content with fluid transition */}
        <main className="px-1 pb-12 pt-6 sm:px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  )
}
