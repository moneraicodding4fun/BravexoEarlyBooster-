import { useMemo, useState, type ReactNode } from 'react'
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

export function AppShell({ section, children }: { section: 'admin' | 'portal'; children: ReactNode }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const nav = section === 'admin' ? adminNav() : portalNav()
  const active = useMemo(() => nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))), [nav, location.pathname])

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

  return (
    <div className="bx-app flex min-h-screen">
      {/* Floating glass sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 250 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 m-3 flex flex-col rounded-2xl bx-glass-strong overflow-hidden"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
          <LogoMark />
          <AnimatePresence initial={false}>
            {!collapsed && (
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
                    collapsed && 'justify-center px-0',
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
                    {!collapsed && (
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
          <div className={cn('flex items-center gap-2.5 rounded-xl px-2 py-2', collapsed && 'justify-center px-0')}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">
              {initials}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{session?.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{session?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-white',
            )}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </motion.aside>

      {/* Main column */}
      <motion.div animate={{ paddingLeft: collapsed ? 76 + 24 : 250 + 24 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 mx-3 mt-3 flex items-center justify-between rounded-2xl bx-glass px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {section === 'admin' ? 'Master Admin' : 'Client'}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">{active?.label ?? 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Zero-cost AI routing
            </span>
            {collapsed && (
              <button onClick={handleLogout} title="Sign out" className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-rose-300">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {/* Page content with fluid transition */}
        <main className="px-3 pb-12 pt-6 sm:px-6">
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
