/**
 * Bravexo Local Engine — the built-in, zero-cost deterministic generator.
 *
 * It is the FINAL fallback of the AI Router: when no free-tier provider is
 * configured (or every configured provider fails / rate-limits), this engine
 * still produces polished, on-brand content so client work never stops and
 * the monthly AI bill stays at exactly $0.00.
 */

export interface BlogPayload {
  company: string
  website?: string
  niche: string
  topic: string
  keywords?: string[]
  tone?: string
  length?: 'short' | 'standard' | 'long'
}

export interface ReviewPayload {
  company: string
  review: string
  rating: number
  tone: string
  customerName?: string
  note?: string
}

export interface GeneratedBlog {
  title: string
  slug: string
  metaDescription: string
  tags: string[]
  body: string
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const NICHE_HOOKS: Record<string, { intro: string; tips: string[]; faq: [string, string] }> = {
  'Car Detailing': {
    intro:
      'Paint is under constant attack — UV rays, road salt, industrial fallout and careless washes all take their toll. The owners who keep showroom finishes share one thing: a deliberate protection routine.',
    tips: [
      '**Wash with two buckets**, never one — grit in the mitt is how swirl marks are born.',
      'Decontaminate with an iron remover and clay bar before any protective layer.',
      'Ceramic coating delivers 2–5 years of hydrophobic protection; sealants need refreshing every few months.',
      'Interior fabrics last longer when spills are extracted within 24 hours, not buffed in.',
    ],
    faq: [
      'How often should I have my car professionally detailed?',
      'A full detail twice a year plus a maintenance wash every 4–6 weeks keeps protection layers healthy and paint defect-free.',
    ],
  },
  'Real Estate': {
    intro:
      'Markets shift, rates move and inventory breathes — but prepared buyers and strategic sellers win in every climate. The difference is almost never luck; it is process.',
    tips: [
      '**Get fully pre-approved** before touring — sellers weigh funded buyers first.',
      'Budget 2–5% on top of price for closing costs, inspections and appraisals.',
      'Compare price per square foot inside the same micro-neighborhood, not across the city.',
      'Never waive an inspection without professional guidance; it is the cheapest insurance you will ever buy.',
    ],
    faq: [
      'Is it better to buy now or wait for prices to drop?',
      'Time in the market beats timing the market for most buyers. Monthly payments matter more than headlines — a good agent models both scenarios for your situation.',
    ],
  },
  'Fitness & Gyms': {
    intro:
      'Progress is rarely about one heroic workout. It is the boring, repeatable systems — sleep, consistency, progressive overload — that separate people who transform from people who restart every January.',
    tips: [
      '**Consistency beats intensity**: four decent sessions outperform one brutal session every week.',
      'Progressive overload means adding reps, weight or control — not just sweat.',
      'Protein at every meal makes recovery and body composition dramatically easier.',
      'Sleep is a training variable. Under 7 hours, strength gains measurably drop.',
    ],
    faq: [
      'How long before I see visible results?',
      'Most members notice strength changes in 3–4 weeks and visible body composition changes in 8–12 weeks of consistent training.',
    ],
  },
}

const GENERIC_HOOK = {
  intro:
    'Customers today reward businesses that show up with expertise, consistency and personality. The right content does all three at once — and compounds quietly while you run the business.',
  tips: [
    '**Answer real customer questions** — they already search for them every day.',
    'Publish consistently; one strong post per week outperforms four rushed ones.',
    'Local specifics (neighborhoods, seasons, case studies) beat generic advice every time.',
    'End every piece with one clear next step — a booking, a call, a visit.',
  ],
  faq: [
    'How does content actually bring in customers?',
    'Helpful content ranks in search, builds trust before the first call, and gives your team links to send prospects — three acquisition channels from one asset.',
  ],
}

function nicheHook(niche: string) {
  return NICHE_HOOKS[niche] ?? GENERIC_HOOK
}

/* ------------------------------------------------------------------ */
/*  BLOG GENERATOR                                                     */
/* ------------------------------------------------------------------ */

export function localBlogPost(p: BlogPayload): GeneratedBlog {
  const h = hash(p.topic + p.niche)
  const year = new Date().getFullYear()
  const topic = cap(p.topic)
  const hook = nicheHook(p.niche)
  const kw = (p.keywords ?? []).filter(Boolean)
  const kwLine =
    kw.length > 0
      ? `Throughout this guide we focus on ${kw.map((k) => `**${k}**`).join(', ')} — the exact terms real customers search for.`
      : ''

  const title = pick(
    [
      `${topic}: The ${year} Guide from ${p.company}`,
      `${topic} — What ${p.niche} Pros Want You to Know`,
      `The Complete Guide to ${topic} (${year} Edition)`,
      `${topic}: ${3 + (h % 4)} Things That Actually Make a Difference`,
    ],
    h,
  )

  const metaDescription = `${p.company} explains ${p.topic.toLowerCase()} with practical, ${year}-ready advice${kw.length ? ` covering ${kw.slice(0, 2).join(' and ')}` : ''}. Read the full guide from our ${p.niche.toLowerCase()} team.`.slice(0, 158)

  const tags = Array.from(
    new Set([p.niche.toLowerCase(), ...p.topic.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 3), ...kw.slice(0, 2)]),
  ).slice(0, 6)

  const body = `## Why ${topic} Matters in ${year}\n\n${hook.intro}\n\n${kwLine}\n\n## The Essentials\n\n${hook.tips.map((t) => `- ${t}`).join('\n')}\n\n## How ${p.company} Approaches ${topic.split(':')[0]}\n\nAt ${p.company}, we treat ${topic.toLowerCase()} as a conversation, not a sales pitch. Our team starts with your specific situation, explains the trade-offs in plain language and gives you a clear recommendation you can act on the same day.\n\nThat is why customers who find us through guides like this one tend to stay — they arrive informed, and we keep delivering the same honesty in person.\n\n## Frequently Asked Questions\n\n**${hook.faq[0]}**\n\n${hook.faq[1]}\n\n**Does ${p.company} offer a consultation?**\n\nYes — consultations are free and pressure-free. Reach out through ${p.website ?? 'our website'} and we will find a time that works for you.\n\n## The Bottom Line\n\n${topic} comes down to fundamentals done consistently: clear information, honest advice and a team that stands behind its work. ${p.company} is proud to be that team for our community.\n\n**Ready to take the next step? Contact ${p.company} today — we would love to help.**`

  return {
    title,
    slug: slugify(topic),
    metaDescription,
    tags,
    body,
  }
}

/* ------------------------------------------------------------------ */
/*  REVIEW RESPONSE GENERATOR                                          */
/* ------------------------------------------------------------------ */

const OPENERS: Record<string, string[]> = {
  positive: [
    'Thank you so much for the wonderful review',
    'We truly appreciate you taking the time to share this',
    'Reviews like this are exactly why we love what we do',
    'Wow — thank you for such kind words',
  ],
  negative: [
    'Thank you for the honest feedback, and please accept our sincere apology',
    'We are genuinely sorry your experience fell short',
    'This is not the standard we hold ourselves to, and we appreciate you telling us',
    'Thank you for bringing this to our attention — we are truly sorry',
  ],
  neutral: [
    'Thank you for the feedback — it genuinely helps us improve',
    'We appreciate you sharing your experience with us',
    'Thanks for the honest review',
  ],
}

const CLOSERS: Record<string, string[]> = {
  Professional: [
    'We look forward to serving you again.',
    'Please do not hesitate to reach out if there is anything else we can do for you.',
    'We appreciate your business and look forward to your next visit.',
  ],
  'Warm & Friendly': [
    'Hope to see you again soon — it would make our day!',
    'Thanks again, and have a wonderful week!',
    'Come by anytime — we love catching up with our regulars.',
  ],
  'Premium & Confident': [
    'Excellence is our standard, and we are glad you experienced it. See you next time.',
    'We take pride in every detail — enjoy the result, and we will be here whenever you need us again.',
    'That is precisely the experience we aim to deliver. Until next time.',
  ],
  'Apologetic & Reassuring': [
    'We would love the chance to make this right — please contact us directly.',
    'Your next visit is on us to prove the experience you deserved.',
    'Please reach out personally so we can restore your confidence in us.',
  ],
  'Grateful & Enthusiastic': [
    'You are the reason we do what we do — thank you, thank you, thank you!',
    'We cannot wait to welcome you back!',
    'Your support means the world to our whole team!',
  ],
}

export function localReviewResponse(p: ReviewPayload): string {
  const h = hash(p.review + p.tone)
  const sentiment = p.rating >= 4 ? 'positive' : p.rating <= 2 ? 'negative' : 'neutral'
  const opener = pick(OPENERS[sentiment], h)
  const closer = pick(CLOSERS[p.tone] ?? CLOSERS.Professional, h >> 3)

  // Pull a short quote from the review so the reply feels specific.
  const words = p.review.replace(/\s+/g, ' ').trim().split(' ')
  const quote = words.slice(0, Math.min(7, words.length)).join(' ')
  const quoteRef =
    sentiment === 'positive'
      ? words.length > 4 ? ` Hearing that you "${quote.toLowerCase()}…" means a lot to the whole team.` : ''
      : sentiment === 'negative'
        ? words.length > 4
          ? ` You mentioned that "${quote.toLowerCase()}…" and that is on us — we are addressing it with the team right now.`
          : ''
        : ''

  const middle =
    sentiment === 'positive'
      ? ` Feedback like yours fuels our passion for ${p.company.includes(' ') ? 'the work we do at' : ''} ${p.company}. Our team puts real care into every single customer experience, and it is incredibly rewarding to see that come through.`
      : sentiment === 'negative'
        ? ` We have reviewed what happened internally and are making immediate changes so no other customer goes through the same experience. ${p.note ? p.note + ' ' : ''}Accountability matters to us, and we would welcome the opportunity to earn back your trust.`
        : ` We clearly got some things right, and we would love the chance to make the rest even better. ${p.note ? p.note + ' ' : ''}Your perspective helps us fine-tune exactly what our customers care about.`

  return `${opener}${p.customerName ? `, ${p.customerName}` : ''}!${quoteRef}${middle} ${closer}`
}
