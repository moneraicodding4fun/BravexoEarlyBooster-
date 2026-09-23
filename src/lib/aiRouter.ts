/**
 * Bravexo AI Router — the intelligent routing layer.
 *
 * Guarantees ZERO monthly AI spend:
 *   1. Requests only ever go to free-tier providers (Groq, Google Gemini).
 *   2. Providers are tried in admin-configured priority order; failures,
 *      rate-limits and timeouts automatically fall through to the next one.
 *   3. If every remote provider is unavailable, the built-in Bravexo Local
 *      Engine (deterministic, zero-cost) generates the content instead.
 *
 * Every routing decision is recorded in the router log so the Master Admin
 * can audit exactly which model served which request.
 */

import { loadDB, mutate, uid, nowIso, type AIKeyRow, type RouterLogEntry } from './mockDb'
import {
  localBlogPost,
  localReviewResponse,
  type BlogPayload,
  type ReviewPayload,
  type GeneratedBlog,
} from './local-engine'

export type AIProviderId = 'groq' | 'gemini' | 'local'

export interface RouteResult {
  provider: AIProviderId
  providerLabel: string
  model: string
  latencyMs: number
  attempts: { provider: string; ok: boolean; error?: string }[]
  simulated: boolean
}

export interface BlogGeneration extends RouteResult {
  blog: GeneratedBlog
}

export interface ReviewGeneration extends RouteResult {
  response: string
}

const TIMEOUT_MS = 15_000

async function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Provider timed out')), ms)
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/* ------------------------------------------------------------------ */
/*  Provider adapters (free tiers only)                                */
/* ------------------------------------------------------------------ */

async function callGroq(key: AIKeyRow, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key.apiKey}`,
    },
    body: JSON.stringify({
      model: key.model,
      temperature: 0.75,
      max_tokens: 1600,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`)
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq returned an empty completion')
  return String(text).trim()
}

async function callGemini(key: AIKeyRow, system: string, user: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(key.model)}:generateContent?key=${encodeURIComponent(key.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 1600 },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
  const data = await res.json()
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
  if (!text) throw new Error('Gemini returned an empty completion')
  return String(text).trim()
}

/* ------------------------------------------------------------------ */
/*  Router core                                                        */
/* ------------------------------------------------------------------ */

interface ProviderHop {
  provider: AIProviderId
  label: string
  model: string
  call: (system: string, user: string) => Promise<string>
}

function buildProviderChain(): ProviderHop[] {
  const db = loadDB()
  return db.aiKeys
    .filter((k) => k.enabled && k.apiKey.trim().length > 0)
    .sort((a, b) => a.priority - b.priority)
    .map((k) => ({
      provider: k.provider,
      label: k.label,
      model: k.model,
      call: k.provider === 'groq' ? callGroq.bind(null, k) : callGemini.bind(null, k),
    }))
}

interface Routed<T = string | null> {
  meta: RouteResult
  text: T
}

async function route(system: string, user: string, taskLabel: string): Promise<Routed> {
  const chain = buildProviderChain()
  const attempts: RouteResult['attempts'] = []

  for (const hop of chain) {
    const started = performance.now()
    try {
      const text = await withTimeout(hop.call(system, user))
      const latencyMs = Math.round(performance.now() - started)
      logRoute(taskLabel, hop.label, 'success', latencyMs)
      return {
        text,
        meta: {
          provider: hop.provider,
          providerLabel: hop.label,
          model: hop.model,
          latencyMs,
          attempts: [...attempts, { provider: hop.label, ok: true }],
          simulated: false,
        },
      }
    } catch (err) {
      attempts.push({
        provider: hop.label,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      })
      logRoute(taskLabel, hop.label, 'fallback', Math.round(performance.now() - started))
    }
  }

  // Final fallback — Bravexo Local Engine. Always available, always $0.00.
  const latencyMs = 40 + Math.floor(Math.random() * 60)
  logRoute(taskLabel, 'Bravexo Local Engine', 'simulated', latencyMs)
  return {
    text: null,
    meta: {
      provider: 'local',
      providerLabel: 'Bravexo Local Engine',
      model: 'bravexo-local-v1',
      latencyMs,
      attempts: [...attempts, { provider: 'Bravexo Local Engine', ok: true }],
      simulated: true,
    },
  }
}

function logRoute(task: string, provider: string, status: RouterLogEntry['status'], latencyMs: number) {
  mutate((db) => {
    db.routerLogs.unshift({ id: uid('log'), ts: nowIso(), task, provider, status, latencyMs })
    db.routerLogs = db.routerLogs.slice(0, 40)
  })
}

/** Parse a remote LLM completion into structured blog content. */
function parseRemoteBlog(raw: string, fallbackTopic: string): GeneratedBlog {
  const lines = raw.split('\n').map((l) => l.trim())
  const titleLine = lines.find((l) => l.startsWith('#'))?.replace(/^#+\s*/, '') ?? fallbackTopic
  const metaLine = lines
    .find((l) => /^meta\s*description\s*:?/i.test(l))
    ?.replace(/^meta\s*description\s*:?\s*/i, '')
  const tagsLine = lines
    .find((l) => /^tags?\s*:/i.test(l))
    ?.replace(/^tags?\s*:?\s*/i, '')
  const body = raw
    .replace(/^#[^\n]*\n?/, '')
    .replace(/^meta\s*description[^\n]*\n?/im, '')
    .replace(/^tags?\s*:[^\n]*\n?/im, '')
    .trim()

  return {
    title: titleLine.replace(/\*\*/g, '').slice(0, 110),
    slug:
      titleLine
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 72) || 'bravexo-post',
    metaDescription: (metaLine ?? `${fallbackTopic} — a practical guide generated by Bravexo EarlyBooster.`).slice(0, 158),
    tags: tagsLine
      ? tagsLine.split(/[,;]/).map((t) => t.trim()).filter(Boolean).slice(0, 6)
      : [fallbackTopic.toLowerCase()],
    body: body || raw,
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function generateBlogPost(payload: BlogPayload, taskLabel: string): Promise<BlogGeneration> {
  const system =
    'You are Bravexo, an elite SEO content engine. Write a complete, SEO-optimized blog article in clean Markdown. Structure: first a single "# Title" line, then "Meta description: ...", then "Tags: a, b, c", then the article body using ## section headings, bullet lists where useful, and a compelling call to action mentioning the company.'
  const user = [
    `Company: ${payload.company}`,
    `Website: ${payload.website ?? 'n/a'}`,
    `Niche/industry: ${payload.niche}`,
    `Topic: ${payload.topic}`,
    `Primary keywords: ${(payload.keywords ?? []).join(', ') || 'none supplied'}`,
    `Tone: ${payload.tone ?? 'Professional'}`,
    `Length: ${payload.length ?? 'standard'}`,
  ].join('\n')

  const { text, meta } = await route(system, user, taskLabel)
  const blog =
    meta.simulated || !text ? localBlogPost(payload) : parseRemoteBlog(text, payload.topic)
  return { ...meta, blog }
}

export async function generateReviewResponse(payload: ReviewPayload, taskLabel: string): Promise<ReviewGeneration> {
  const system = `You are Bravexo, an expert reputation manager. Write ONE polished, ready-to-publish reply to a customer review on behalf of "${payload.company}". Tone: ${payload.tone}. Never mention being an AI. Under 140 words, warm, specific, plain text only — no subject lines or signatures.`
  const user = [
    `Rating: ${payload.rating}/5`,
    `Review: ${payload.review}`,
    payload.customerName ? `Customer name: ${payload.customerName}` : '',
    payload.note ? `Additional context from the owner: ${payload.note}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const { text, meta } = await route(system, user, taskLabel)
  const response = meta.simulated || !text ? localReviewResponse(payload) : text
  return { ...meta, response }
}

/** Ping a provider with a tiny prompt — used by the Admin Vault "Test" button. */
export async function pingProvider(providerId: 'groq' | 'gemini'): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const db = loadDB()
  const key = db.aiKeys.find((k) => k.provider === providerId)
  if (!key || !key.apiKey.trim()) return { ok: false, latencyMs: 0, error: 'No API key configured yet' }

  const started = performance.now()
  try {
    if (providerId === 'groq') {
      await withTimeout(callGroq(key, 'Reply with the single word: pong', 'ping'), 10_000)
    } else {
      await withTimeout(callGemini(key, 'Reply with the single word: pong', 'ping'), 10_000)
    }
    return { ok: true, latencyMs: Math.round(performance.now() - started) }
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
