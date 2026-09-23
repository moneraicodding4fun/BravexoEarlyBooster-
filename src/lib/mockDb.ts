/**
 * Bravexo EarlyBooster — universal data layer.
 *
 * When Supabase credentials are configured (VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY) the same shapes map 1:1 to the tables defined
 * in supabase/schema.sql. On static hosting the layer persists real,
 * user-created data (accounts, workspaces, keys, drafts) locally.
 * No fake tenants, no demo accounts.
 */

export type Role = 'admin' | 'client'
export type ClientStatus = 'invited' | 'onboarding' | 'active' | 'suspended'
export type SiteStatus = 'connected' | 'dry-run' | 'error'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
  clientId?: string
  createdAt: string
}

export interface ConnectedSite {
  id: string
  platform: string
  url: string
  status: SiteStatus
}

export interface ClientWorkspace {
  id: string
  company: string
  contactName: string
  email: string
  website: string
  industry: string
  tone: string
  status: ClientStatus
  connectedSites: ConnectedSite[]
  createdAt: string
  lastActivity: string
}

export interface Invite {
  id: string
  token: string
  clientId: string
  email?: string
  createdBy: string
  used: boolean
  revoked: boolean
  createdAt: string
  usedAt?: string
}

export interface AIKeyRow {
  provider: 'groq' | 'gemini'
  label: string
  model: string
  apiKey: string
  enabled: boolean
  priority: number
  freeTierNote: string
}

export interface RouterLogEntry {
  id: string
  ts: string
  task: string
  provider: string
  status: 'success' | 'fallback' | 'simulated'
  latencyMs: number
}

export interface BlogDraft {
  id: string
  clientId: string
  niche: string
  topic: string
  title: string
  slug: string
  metaDescription: string
  tags: string[]
  body: string
  status: 'draft' | 'deployed'
  generatedBy: string
  createdAt: string
  deployedTo?: string
  deployedAt?: string
}

export interface ReviewItem {
  id: string
  clientId: string
  rating: number
  review: string
  response: string
  tone: string
  createdAt: string
}

export interface Deployment {
  id: string
  clientId: string
  draftId: string
  title: string
  platform: string
  target: string
  status: 'delivered' | 'simulated' | 'dry-run' | 'failed'
  ts: string
}

export interface DB {
  users: User[]
  clients: ClientWorkspace[]
  invites: Invite[]
  aiKeys: AIKeyRow[]
  routerLogs: RouterLogEntry[]
  drafts: BlogDraft[]
  reviews: ReviewItem[]
  deployments: Deployment[]
  sessionUserId: string | null
}

const DB_KEY = 'bravexo.earlybooster.db.v2'
const LEGACY_KEY = 'bravexo.earlybooster.db.v1'

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function nowIso() {
  return new Date().toISOString()
}

/* ------------------------------------------------------------------ */
/*  SEED — clean production state. No fake tenants, no demo accounts.  */
/*  The Master Admin account is created for real through the OTP      */
/*  registration flow; clients join via single-use invite links.      */
/* ------------------------------------------------------------------ */

function seed(): DB {
  return {
    users: [],
    clients: [],
    invites: [],
    aiKeys: [
      {
        provider: 'groq',
        label: 'Groq',
        model: 'llama-3.3-70b-versatile',
        apiKey: '',
        enabled: true,
        priority: 1,
        freeTierNote: '14,400 req/day free · no card required',
      },
      {
        provider: 'gemini',
        label: 'Google Gemini',
        model: 'gemini-2.5-flash',
        apiKey: '',
        enabled: true,
        priority: 2,
        freeTierNote: 'Free tier · AI Studio key',
      },
    ],
    routerLogs: [],
    drafts: [],
    reviews: [],
    deployments: [],
    sessionUserId: null,
  }
}

/** One-time migration: keep configured AI keys from v1, drop all fake data. */
function migrateFromV1(): DB | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const old = JSON.parse(raw) as Partial<DB>
    const db = seed()
    if (Array.isArray(old.aiKeys)) {
      for (const key of old.aiKeys) {
        const target = db.aiKeys.find((k) => k.provider === key.provider)
        if (target && key.apiKey) {
          target.apiKey = key.apiKey
          target.enabled = key.enabled !== false
          // Retired model names from the old build would 404 — upgrade.
          if (target.provider === 'gemini' && (!key.model || key.model === 'gemini-2.0-flash')) {
            target.model = 'gemini-2.5-flash'
          } else if (key.model) {
            target.model = key.model
          }
        }
      }
    }
    localStorage.removeItem(LEGACY_KEY)
    return db
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Persistence helpers                                                */
/* ------------------------------------------------------------------ */

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* corrupted or unavailable storage — reseed */
  }
  const db = migrateFromV1() ?? seed()
  persistDB(db)
  return db
}

export function persistDB(db: DB) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* storage full/unavailable — demo continues in memory */
  }
}

/** Read-modify-write helper. All mutations go through here. */
export function mutate<T>(fn: (db: DB) => T): T {
  const db = loadDB()
  const result = fn(db)
  persistDB(db)
  return result
}

export function resetDemoDB() {
  try {
    localStorage.removeItem(DB_KEY)
  } catch {
    /* noop */
  }
}

/** Client convenience getters */
export function getClient(db: DB, clientId?: string | null): ClientWorkspace | undefined {
  return db.clients.find((c) => c.id === clientId)
}

export function openInviteFor(db: DB, clientId: string): Invite | undefined {
  return db.invites.find((i) => i.clientId === clientId && !i.used && !i.revoked)
}

export function inviteUrl(token: string) {
  // BASE_URL keeps invite links correct when deployed under a sub-path
  // (e.g. a GitHub Pages project site).
  const base = import.meta.env.BASE_URL || '/'
  return `${window.location.origin}${base}login?invite=${token}`
}
