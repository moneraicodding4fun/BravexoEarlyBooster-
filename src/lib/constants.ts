/**
 * Bravexo EarlyBooster — global constants.
 *
 * STRICT ADMIN LOCK:
 * Only this exact email address may ever register without an invite.
 * That account is automatically granted the "Master Admin" role.
 * Every other human on earth MUST arrive through a single-use invite
 * link generated from the Admin Dashboard. Public sign-ups are dead.
 */
export const MASTER_ADMIN_EMAIL = 'agencjakryspindadok@gmail.com'

export const APP_NAME = 'Bravexo EarlyBooster'
export const APP_SHORT_NAME = 'Bravexo'

export const ROUTES = {
  home: '/',
  login: '/login',
  admin: '/admin',
  adminClients: '/admin/clients',
  adminVault: '/admin/vault',
  portal: '/portal',
  portalReviews: '/portal/reviews',
  portalBlog: '/portal/blog',
  portalConnect: '/portal/connect',
} as const

/** Industries offered as one-click presets in the Auto-Blog engine. */
export const INDUSTRIES = [
  'Car Detailing',
  'Real Estate',
  'Fitness & Gyms',
  'Restaurants & Cafés',
  'Florists & Events',
  'E-commerce',
  'Health & Dental',
  'Home Services',
  'Tech & SaaS',
] as const

export const TONES = [
  'Professional',
  'Warm & Friendly',
  'Premium & Confident',
  'Apologetic & Reassuring',
  'Grateful & Enthusiastic',
] as const

export const PLATFORMS = [
  { id: 'wordpress', label: 'WordPress', hint: 'REST API / Zapier webhook' },
  { id: 'webflow', label: 'Webflow', hint: 'CMS webhook / Make scenario' },
  { id: 'shopify', label: 'Shopify', hint: 'Blog API / Flow automation' },
  { id: 'custom', label: 'Custom / Lovable', hint: 'Any HTTP endpoint' },
] as const
