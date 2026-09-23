# Bravexo EarlyBooster

Universal, multi-tenant SaaS — a zero-cost AI content brain for any website:
headless **Auto-Blog engine**, **Review Responder**, and **Bravexo Connect**,
the universal export layer that deploys content to WordPress, Webflow,
Shopify, custom Lovable sites or any webhook.

> **Isolation guarantee:** the public landing page (`/`) keeps its own styles.
> All SaaS development lives exclusively behind the new routes `/login`,
> `/admin` and `/portal`, and the premium dark theme is scoped to the `.bx-app`
> shell so nothing bleeds into the public site.

## Routes

| Route              | Access         | What lives there                                                        |
| ------------------ | -------------- | ----------------------------------------------------------------------- |
| `/`                | Public         | Landing page (untouched public surface)                                  |
| `/login`           | Public         | Sign in + invite-only registration + Master Admin lock                   |
| `/admin`           | Master Admin   | Command center, Client Workspace management, AI Config Vault            |
| `/admin/clients`   | Master Admin   | Data-dense client table + universal Invite User module                   |
| `/admin/vault`     | Master Admin   | Free-tier API keys (Groq / Gemini) + router audit log                    |
| `/portal`          | Invited client | Workspace overview                                                       |
| `/portal/reviews`  | Invited client | Split-screen Review Responder with 1-click copy                          |
| `/portal/blog`     | Invited client | Headless Auto-Blog engine (SEO title / meta / tags / body)               |
| `/portal/connect`  | Invited client | Bravexo Connect export console + Deploy Content                          |

## Authentication & RBAC

- **Public sign-ups are disabled.** Registration is only possible via a
  single-use invite link generated in the Admin Dashboard.
- **Strict admin lock:** exactly one email may self-register —
  `agencjakryspindadok@gmail.com` — and it automatically receives the
  **Master Admin** role. This is enforced in code (`src/lib/auth.tsx`) **and**
  at database level via trigger in `supabase/schema.sql`.
- Invite links are single-use, revocable, and re-issuable per workspace.

### Demo credentials (Demo Mode)

| Role         | Email                            | Password            |
| ------------ | -------------------------------- | ------------------- |
| Master Admin | `agencjakryspindadok@gmail.com`  | `EarlyBooster!2026` |
| Client       | `demo@luxeautospa.com`           | `ClientDemo!2026`   |

An open invite for *Bloom & Vine Florals* is seeded too — copy its link from
the Client Workspaces table to try the full invite → registration flow.

## Zero-cost AI Router

`src/lib/aiRouter.ts` routes every generation request:

1. **Groq** free tier (`llama-3.3-70b-versatile`)
2. **Google Gemini** free tier (`gemini-2.0-flash`)
3. **Bravexo Local Engine** — built-in deterministic fallback

Providers are tried in admin-configured priority order; failures, rate-limits
and timeouts fall through automatically, and every decision is written to the
routing audit log. The Local Engine guarantees the product always works even
with zero keys configured — monthly AI spend stays at **$0.00**.

## Bravexo Connect — universal export

`POST /api/bravexo/export` (served by `server/index.js`):

```jsonc
{
  "workspace": { "id": "cli_…", "company": "Luxe Auto Spa" },
  "target": { "platform": "WordPress", "webhookUrl": "https://…" },
  "dryRun": false,
  "draft": { "title": "…", "slug": "…", "metaDescription": "…", "tags": [], "body": "…" }
}
```

- With a `webhookUrl` the relay forwards the draft to ANY external platform.
- Without one (or with `dryRun: true`) it validates the payload and echoes it
  back — perfect for demos and disconnected environments.
- CORS is open; the relay is designed as a universal, multi-tenant endpoint.

## Running

```bash
npm install
npm run dev        # Vite dev server (proxies /api to the relay on :8787)
node server/index.js  # universal relay (run alongside dev)

npm run build      # production bundle → dist/
npm start          # relay serves dist/ + /api/bravexo/export on :8080
```

## Going live with Supabase

1. Copy `.env.example` → `.env` and fill `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.
2. Apply `supabase/schema.sql` in the SQL editor (tables, RLS, and the
   signup trigger enforcing the admin lock + invite-only rule).
3. Rebuild. The app auto-switches from Demo Mode to live Supabase.

## Tech stack

React 18 · TypeScript · Tailwind CSS · shadcn/ui-style components ·
Framer Motion · Radix UI · Supabase · Express relay
