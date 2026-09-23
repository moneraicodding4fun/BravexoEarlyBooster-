/**
 * Bravexo EarlyBooster — universal data layer.
 *
 * When Supabase credentials are configured (VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY) the same shapes map 1:1 to the tables defined
 * in supabase/schema.sql. Until then (and in every live demo) this module
 * persists a rich, fully-populated workspace to localStorage so the entire
 * product is pixel-perfect and data-dense with zero backend wiring.
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

const DB_KEY = 'bravexo.earlybooster.db.v1'

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function nowIso() {
  return new Date().toISOString()
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString()
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 86_400_000).toISOString()
}

/* ------------------------------------------------------------------ */
/*  SEED DATA — comprehensive mock workspaces so the UI is data-dense  */
/* ------------------------------------------------------------------ */

function seed(): DB {
  const cliLuxe = 'cli_luxe'
  const cliSkyline = 'cli_skyline'
  const cliBloom = 'cli_bloomvine'
  const cliIron = 'cli_irontemple'

  const users: User[] = [
    {
      id: 'usr_master',
      email: 'agencjakryspindadok@gmail.com',
      password: 'EarlyBooster!2026',
      name: 'Krys Pindadok',
      role: 'admin',
      createdAt: daysAgo(60),
    },
    {
      id: 'usr_luxe',
      email: 'demo@luxeautospa.com',
      password: 'ClientDemo!2026',
      name: 'Marcus Webb',
      role: 'client',
      clientId: cliLuxe,
      createdAt: daysAgo(34),
    },
  ]

  const clients: ClientWorkspace[] = [
    {
      id: cliLuxe,
      company: 'Luxe Auto Spa',
      contactName: 'Marcus Webb',
      email: 'demo@luxeautospa.com',
      website: 'https://luxeautospa.com',
      industry: 'Car Detailing',
      tone: 'Premium & Confident',
      status: 'active',
      connectedSites: [
        {
          id: 'site_luxe_wp',
          platform: 'WordPress',
          url: 'https://luxeautospa.com/wp-json/bravexo/v1/publish',
          status: 'connected',
        },
        {
          id: 'site_luxe_lovable',
          platform: 'Custom / Lovable',
          url: 'https://hooks.luxeautospa.com/bravexo',
          status: 'dry-run',
        },
      ],
      createdAt: daysAgo(34),
      lastActivity: hoursAgo(2),
    },
    {
      id: cliSkyline,
      company: 'Skyline Realty Group',
      contactName: 'Dana Kovac',
      email: 'dana@skylinerealty.com',
      website: 'https://skyline-realty.com',
      industry: 'Real Estate',
      tone: 'Professional',
      status: 'onboarding',
      connectedSites: [
        {
          id: 'site_sky_wf',
          platform: 'Webflow',
          url: 'https://hooks.make.com/skyline-bravexo',
          status: 'dry-run',
        },
      ],
      createdAt: daysAgo(9),
      lastActivity: hoursAgo(26),
    },
    {
      id: cliBloom,
      company: 'Bloom & Vine Florals',
      contactName: 'Priya Nair',
      email: 'hello@bloomvine.studio',
      website: 'https://bloomvine.studio',
      industry: 'Florists & Events',
      tone: 'Warm & Friendly',
      status: 'invited',
      connectedSites: [],
      createdAt: daysAgo(3),
      lastActivity: daysAgo(3),
    },
    {
      id: cliIron,
      company: 'Iron Temple Fitness',
      contactName: 'Leo Martins',
      email: 'leo@irontemple.fit',
      website: 'https://irontemple.fit',
      industry: 'Fitness & Gyms',
      tone: 'Grateful & Enthusiastic',
      status: 'active',
      connectedSites: [
        {
          id: 'site_iron_shop',
          platform: 'Shopify',
          url: 'https://irontemple.fit/blogs/bravexo-webhook',
          status: 'connected',
        },
      ],
      createdAt: daysAgo(21),
      lastActivity: daysAgo(1),
    },
  ]

  const invites: Invite[] = [
    {
      id: 'inv_luxe_used',
      token: 'bx-inv-9f2e71a4',
      clientId: cliLuxe,
      email: 'demo@luxeautospa.com',
      createdBy: 'usr_master',
      used: true,
      revoked: false,
      createdAt: daysAgo(34),
      usedAt: daysAgo(34),
    },
    {
      id: 'inv_bloom_open',
      token: 'bx-inv-77kd20pl',
      clientId: cliBloom,
      email: 'hello@bloomvine.studio',
      createdBy: 'usr_master',
      used: false,
      revoked: false,
      createdAt: daysAgo(3),
    },
    {
      id: 'inv_sky_used',
      token: 'bx-inv-c31mm8xq',
      clientId: cliSkyline,
      email: 'dana@skylinerealty.com',
      createdBy: 'usr_master',
      used: true,
      revoked: false,
      createdAt: daysAgo(9),
      usedAt: daysAgo(8),
    },
  ]

  const aiKeys: AIKeyRow[] = [
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
      model: 'gemini-2.0-flash',
      apiKey: '',
      enabled: true,
      priority: 2,
      freeTierNote: '500 req/day free · AI Studio key',
    },
  ]

  const routerLogs: RouterLogEntry[] = [
    { id: uid('log'), ts: hoursAgo(2), task: 'Review response · Luxe Auto Spa', provider: 'Bravexo Local Engine', status: 'simulated', latencyMs: 42 },
    { id: uid('log'), ts: hoursAgo(5), task: 'Blog post · "Ceramic coating myths"', provider: 'Bravexo Local Engine', status: 'simulated', latencyMs: 61 },
    { id: uid('log'), ts: daysAgo(1), task: 'Blog post · Skyline Realty', provider: 'Groq', status: 'success', latencyMs: 940 },
    { id: uid('log'), ts: daysAgo(1), task: 'Blog post · Skyline Realty', provider: 'Google Gemini', status: 'fallback', latencyMs: 210 },
    { id: uid('log'), ts: daysAgo(2), task: 'Review response · Iron Temple', provider: 'Google Gemini', status: 'success', latencyMs: 1180 },
  ]

  const drafts: BlogDraft[] = [
    {
      id: 'dft_luxe_1',
      clientId: cliLuxe,
      niche: 'Car Detailing',
      topic: 'Ceramic coating vs traditional wax',
      title: 'Ceramic Coating vs. Traditional Wax: What Actually Protects Your Paint in 2026',
      slug: 'ceramic-coating-vs-traditional-wax-2026',
      metaDescription:
        'Ceramic coating or wax? Luxe Auto Spa breaks down durability, gloss, cost and maintenance so you can choose the right protection for your paint.',
      tags: ['ceramic coating', 'car detailing', 'paint protection', 'car wax'],
      body: `## Why Paint Protection Is the Smartest Money You Can Spend\n\nYour vehicle's paint fights a silent war every single day: UV radiation, bird droppings, road salt, industrial fallout and automatic brushes. **The right protection layer decides who wins.**\n\n## Ceramic Coating: The Long Game\n\nA professional-grade ceramic coating bonds chemically with your clear coat and creates a semi-permanent sacrificial layer.\n\n- Lasts **2–5 years** with proper maintenance\n- Extreme hydrophobic effect — water sheets off instantly\n- Superior gloss depth that wax simply cannot match\n- Resistance to chemical etching from bird lime and bug acids\n\n## Traditional Wax: The Classic Choice\n\nCarnauba and synthetic sealants still have a place, especially for show cars and seasonal refreshes.\n\n- Lower upfront cost\n- Warm, deep glow enthusiasts love\n- Easy DIY application\n- Requires re-application every **6–12 weeks**\n\n## Which One Should You Choose?\n\nIf you drive daily and park outdoors, ceramic coating pays for itself within the first year in saved washes and paint correction. If your weekend cruiser lives in a garage, a quality sealant program keeps it flawless for pennies.\n\n## The Luxe Auto Spa Verdict\n\nMost of our clients choose a **hybrid program**: ceramic coating on horizontal panels, sealant top-ups on verticals, and a maintenance wash every four weeks. Book a free paint assessment and we'll map the right program to your budget.\n\n**Ready to lock in that showroom gloss? Schedule your detail at luxeautospa.com today.**`,
      status: 'deployed',
      generatedBy: 'Bravexo Local Engine',
      createdAt: daysAgo(6),
      deployedTo: 'WordPress · luxeautospa.com',
      deployedAt: daysAgo(5),
    },
    {
      id: 'dft_luxe_2',
      clientId: cliLuxe,
      niche: 'Car Detailing',
      topic: '5 detailing myths that ruin car paint',
      title: '5 Detailing Myths That Are Quietly Ruining Your Car Paint',
      slug: '5-detailing-myths-ruining-your-paint',
      metaDescription:
        'Dish soap washes, automatic brushes and other detailing myths that damage clear coat — and what professionals do instead. Tips from Luxe Auto Spa.',
      tags: ['detailing myths', 'car care', 'paint correction'],
      body: `## Stop Believing These Paint-Killing Myths\n\nEvery week we fix damage caused by well-meaning owners following outdated advice. Here are the five myths we retire for good today.\n\n## Myth 1: Dish Soap Is Fine for Washing\n\nDish detergents strip wax, sealants and natural oils from rubber trim. **Use a pH-neutral car shampoo — always.**\n\n## Myth 2: Automatic Brushes Are Convenient\n\nThose bristles carry grit from the last fifty cars. They etch thousands of micro-scratches per wash, known as swirl marks.\n\n## Myth 3: Waxing Fixes Scratches\n\nWax hides, it does not heal. True correction requires machine polishing to level the clear coat.\n\n## Myth 4: One Bucket Is Enough\n\nThe two-bucket method (wash + rinse) keeps abrasive dirt out of your mitt and out of your paint.\n\n## Myth 5: Gloss Means Protected\n\nShine is not protection. A glossy but unprotected panel still absorbs contaminants and UV damage.\n\n## The Professional Alternative\n\nA proper two-bucket wash, iron decontamination, clay treatment and a protective layer — ceramic or sealant — is the only routine we trust on our clients' vehicles.\n\n**Book a paint assessment with Luxe Auto Spa and see the difference proper technique makes.**`,
      status: 'draft',
      generatedBy: 'Bravexo Local Engine',
      createdAt: daysAgo(1),
    },
    {
      id: 'dft_sky_1',
      clientId: cliSkyline,
      niche: 'Real Estate',
      topic: 'First-time buyer checklist for 2026',
      title: 'The 2026 First-Time Buyer Checklist: 11 Steps Before You Make an Offer',
      slug: 'first-time-buyer-checklist-2026',
      metaDescription:
        'Buying your first home in 2026? Skyline Realty Group walks you through pre-approval, inspections, and negotiation — an 11-step checklist.',
      tags: ['first-time buyer', 'real estate', 'home buying', 'mortgage'],
      body: `## Buying Your First Home Doesn't Have to Feel Overwhelming\n\nThe buyers who win in 2026 aren't the luckiest — they're the most prepared. This checklist condenses what our agents walk every client through.\n\n## Before You Search\n\n- **Get pre-approved, not just pre-qualified.** Sellers take pre-approval letters seriously.\n- Budget for extras: inspections, appraisal, closing costs run 2–5% of price.\n- Lock your must-haves vs nice-to-haves in writing.\n\n## While You Search\n\n- Tour homes at different times of day — traffic and noise change everything.\n- Check permit history for renovations.\n- Compare price per square foot within the same micro-neighborhood.\n\n## Before You Offer\n\n- Ask your agent for a 6-month comparable sales report.\n- Decide your escalation strategy in advance.\n- Never waive inspection without expert guidance.\n\n## After Acceptance\n\n- Order the inspection within 5 days.\n- Re-verify insurance quotes before closing.\n- Do a final walkthrough the morning of closing.\n\n**Thinking about your first purchase? The Skyline Realty Group team offers free buyer consultations — book yours today.**`,
      status: 'draft',
      generatedBy: 'Google Gemini',
      createdAt: daysAgo(1),
    },
  ]

  const reviews: ReviewItem[] = [
    {
      id: uid('rev'),
      clientId: cliLuxe,
      rating: 5,
      review:
        'Absolutely blown away. My black Audi came out looking better than the day I bought it. The interior detail removed stains I thought were permanent.',
      response:
        'Thank you so much for the incredible feedback! Bringing a black Audi back to that deep, mirror finish is exactly why we do what we do. We treat every interior like it is our own, and hearing the stains are history made our day. Enjoy that showroom feel — and we will see you for the maintenance wash in four weeks!',
      tone: 'Premium & Confident',
      createdAt: daysAgo(2),
    },
    {
      id: uid('rev'),
      clientId: cliLuxe,
      rating: 2,
      review:
        'Car looked great but they kept my vehicle two hours longer than promised and nobody called to let me know. Communication needs work.',
      response:
        'Thank you for the honest review, and please accept our sincere apology for the wait and the silence. You deserved a proactive update the moment the schedule slipped — that is not the standard we hold ourselves to. We have adjusted our booking buffers and added automatic status notifications so this does not happen again. We would love the chance to make it right: reach out directly and ask for Marcus.',
      tone: 'Apologetic & Reassuring',
      createdAt: daysAgo(4),
    },
  ]

  const deployments: Deployment[] = [
    {
      id: uid('dep'),
      clientId: cliLuxe,
      draftId: 'dft_luxe_1',
      title: 'Ceramic Coating vs. Traditional Wax: What Actually Protects Your Paint in 2026',
      platform: 'WordPress',
      target: 'luxeautospa.com',
      status: 'delivered',
      ts: daysAgo(5),
    },
    {
      id: uid('dep'),
      clientId: cliIron,
      draftId: 'dft_iron_x',
      title: 'New Year Resolution Guide: Build a Habit That Survives February',
      platform: 'Shopify',
      target: 'irontemple.fit',
      status: 'simulated',
      ts: daysAgo(2),
    },
  ]

  return {
    users,
    clients,
    invites,
    aiKeys,
    routerLogs,
    drafts,
    reviews,
    deployments,
    sessionUserId: null,
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
  const db = seed()
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
