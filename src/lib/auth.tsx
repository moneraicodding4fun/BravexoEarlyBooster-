/**
 * Bravexo Auth & RBAC.
 *
 * RULES ENFORCED HERE (and mirrored in supabase/schema.sql at DB level):
 *  - Public sign-ups are DISABLED.
 *  - The ONLY email allowed to register without an invite is the exact
 *    MASTER_ADMIN_EMAIL — that account automatically receives the
 *    "Master Admin" role.
 *  - Every other account must redeem a single-use invite token generated
 *    from the Admin Dashboard. Redeeming binds the user to an isolated
 *    client workspace with the "client" role.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MASTER_ADMIN_EMAIL } from './constants'
import { isSupabaseConfigured, supabase } from './supabase'
import { loadDB, mutate, uid, nowIso, openInviteFor, type Role, type DB } from './mockDb'

export interface Session {
  userId: string
  email: string
  name: string
  role: Role
  clientId?: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
  inviteToken?: string
}

interface AuthApi {
  session: Session | null
  loading: boolean
  demoMode: boolean
  login: (email: string, password: string) => Promise<Session>
  register: (input: RegisterInput) => Promise<Session>
  logout: () => Promise<void>
  refresh: () => void
  resolveInvite: (token: string) => Promise<{ valid: boolean; company?: string }>
}

const AuthContext = createContext<AuthApi | null>(null)

function toSession(db: DB): Session | null {
  if (!db.sessionUserId) return null
  const user = db.users.find((u) => u.id === db.sessionUserId)
  if (!user) return null
  return { userId: user.id, email: user.email, name: user.name, role: user.role, clientId: user.clientId }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = supabase
    if (isSupabaseConfigured && sb) {
      sb.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) {
          const { data: profile } = await sb
            .from('profiles')
            .select('id, email, full_name, role, client_id')
            .eq('id', data.session.user.id)
            .maybeSingle()
          if (profile) {
            setSession({
              userId: profile.id,
              email: profile.email,
              name: profile.full_name ?? profile.email,
              role: (profile.role as Role) ?? 'client',
              clientId: profile.client_id ?? undefined,
            })
          }
        }
        setLoading(false)
      })
      return
    }
    setSession(toSession(loadDB()))
    setLoading(false)
  }, [])

  const api = useMemo<AuthApi>(() => {
    /* ---------------- Supabase live mode ---------------- */
    const sbLive = supabase
    if (isSupabaseConfigured && sbLive) {
      return {
        session,
        loading,
        demoMode: false,
        async resolveInvite(token) {
          const { data } = await sbLive
            .from('invites')
            .select('used, revoked, clients(company)')
            .eq('token', token)
            .maybeSingle()
          if (!data || data.used || data.revoked) return { valid: false }
          const company = (data.clients as { company?: string } | null)?.company
          return { valid: true, company }
        },
        async login(email, password) {
          const { data, error } = await sbLive.auth.signInWithPassword({ email, password })
          if (error) throw new Error(error.message)
          const { data: profile } = await sbLive
            .from('profiles')
            .select('id, email, full_name, role, client_id')
            .eq('id', data.user.id)
            .maybeSingle()
          const s: Session = {
            userId: data.user.id,
            email: data.user.email ?? email,
            name: profile?.full_name ?? email,
            role: (profile?.role as Role) ?? 'client',
            clientId: profile?.client_id ?? undefined,
          }
          setSession(s)
          return s
        },
        async register(input) {
          const isMaster = input.email.trim().toLowerCase() === MASTER_ADMIN_EMAIL
          if (!isMaster && !input.inviteToken) {
            throw new Error('Public sign-ups are disabled. Bravexo EarlyBooster is invite-only.')
          }
          // Invite token + name travel in user metadata; the DB trigger
          // (supabase/schema.sql) validates the invite, marks it used and
          // creates the profile with the correct role.
          const { data, error } = await sbLive.auth.signUp({
            email: input.email,
            password: input.password,
            options: { data: { invite_token: input.inviteToken ?? null, full_name: input.name } },
          })
          if (error) throw new Error(error.message)
          if (!data.user) throw new Error('Registration failed — check your Supabase configuration.')
          const role: Role = isMaster ? 'admin' : 'client'
          const { data: prof } = await sbLive
            .from('profiles')
            .select('client_id')
            .eq('id', data.user.id)
            .maybeSingle()
          const s: Session = {
            userId: data.user.id,
            email: input.email,
            name: input.name,
            role,
            clientId: prof?.client_id ?? undefined,
          }
          setSession(s)
          return s
        },
        async logout() {
          await sbLive.auth.signOut()
          setSession(null)
        },
        refresh: () => undefined,
      }
    }

    /* ---------------- Demo mode (mock data layer) ---------------- */
    return {
      session,
      loading,
      demoMode: true,
      async resolveInvite(token) {
        const db = loadDB()
        const invite = db.invites.find((i) => i.token === token && !i.used && !i.revoked)
        if (!invite) return { valid: false }
        const client = db.clients.find((c) => c.id === invite.clientId)
        return { valid: true, company: client?.company }
      },
      async login(email, password) {
        const db = loadDB()
        const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password.')
        }
        const s: Session = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
        }
        mutate((d) => {
          d.sessionUserId = user.id
        })
        setSession(s)
        return s
      },
      async register(input) {
        const email = input.email.trim().toLowerCase()
        if (input.password.length < 8) throw new Error('Password must be at least 8 characters.')

        /* STRICT ADMIN LOCK — exactly one email may self-register. */
        if (email === MASTER_ADMIN_EMAIL) {
          const created = mutate((db) => {
            const existing = db.users.find((u) => u.email.toLowerCase() === email)
            if (existing) {
              db.sessionUserId = existing.id
              return {
                userId: existing.id,
                email: existing.email,
                name: existing.name,
                role: existing.role,
                clientId: existing.clientId,
              } as Session
            }
            const user = {
              id: uid('usr'),
              email,
              password: input.password,
              name: input.name || 'Master Admin',
              role: 'admin' as Role,
              createdAt: nowIso(),
            }
            db.users.push(user)
            db.sessionUserId = user.id
            return { userId: user.id, email, name: user.name, role: 'admin' as Role } as Session
          })
          setSession(created)
          return created
        }

        /* Everyone else must redeem a single-use invite. */
        if (!input.inviteToken) {
          throw new Error('Public sign-ups are disabled. Bravexo EarlyBooster is invite-only — ask your Bravexo partner for an invite link.')
        }

        const result = mutate((db) => {
          const invite = db.invites.find((i) => i.token === input.inviteToken && !i.used && !i.revoked)
          if (!invite) throw new Error('This invite link is invalid, expired or has already been used.')
          if (invite.email && invite.email.toLowerCase() !== email) {
            throw new Error(`This invite was issued for ${invite.email}. Please use that email address.`)
          }
          if (db.users.some((u) => u.email.toLowerCase() === email)) {
            throw new Error('An account with this email already exists — sign in instead.')
          }
          const user = {
            id: uid('usr'),
            email,
            password: input.password,
            name: input.name || email.split('@')[0],
            role: 'client' as Role,
            clientId: invite.clientId,
            createdAt: nowIso(),
          }
          db.users.push(user)
          invite.used = true
          invite.usedAt = nowIso()
          const client = db.clients.find((c) => c.id === invite.clientId)
          if (client) {
            client.status = 'onboarding'
            client.lastActivity = nowIso()
            if (!client.email) client.email = email
          }
          db.sessionUserId = user.id
          return { userId: user.id, email, name: user.name, role: 'client' as Role, clientId: invite.clientId } as Session
        })
        setSession(result)
        return result
      },
      async logout() {
        mutate((db) => {
          db.sessionUserId = null
        })
        setSession(null)
      },
      refresh() {
        setSession(toSession(loadDB()))
      },
    }
  }, [session, loading])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function findUnusedInviteToken(clientId: string): string | null {
  const db = loadDB()
  return openInviteFor(db, clientId)?.token ?? null
}
