-- ============================================================================
-- Bravexo EarlyBooster — Supabase schema
-- ============================================================================
-- Enforces at the DATABASE level:
--   1. Public sign-ups are disabled.
--   2. ONLY agencjakryspindadok@gmail.com may self-register, and it is
--      automatically granted the 'admin' (Master Admin) role.
--   3. Any other user must redeem a valid, single-use invite.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Client workspaces (tenants)
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text,
  email text,
  website text,
  industry text,
  tone text default 'Professional',
  status text not null default 'invited' check (status in ('invited','onboarding','active','suspended')),
  connected_sites jsonb not null default '[]',
  created_at timestamptz not null default now(),
  last_activity timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Single-use invites
-- ---------------------------------------------------------------------------
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  email text,
  created_by uuid references auth.users(id),
  used boolean not null default false,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Profiles (RBAC)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'client' check (role in ('admin','client')),
  client_id uuid references public.clients(id) on delete set null,
  invite_token text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AI configuration vault (free-tier keys only)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_keys (
  provider text primary key check (provider in ('groq','gemini')),
  label text not null,
  model text not null,
  api_key text not null default '',
  enabled boolean not null default true,
  priority int not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.ai_keys (provider, label, model, priority)
values ('groq','Groq','llama-3.3-70b-versatile',1),
       ('gemini','Google Gemini','gemini-2.0-flash',2)
on conflict (provider) do nothing;

-- ---------------------------------------------------------------------------
-- Content + reputation history
-- ---------------------------------------------------------------------------
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  niche text, topic text, title text not null, slug text,
  meta_description text, tags jsonb default '[]', body text,
  status text not null default 'draft' check (status in ('draft','deployed')),
  generated_by text,
  created_at timestamptz not null default now(),
  deployed_to text, deployed_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text, response text, tone text,
  created_at timestamptz not null default now()
);

create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete set null,
  title text, platform text, target text,
  status text not null check (status in ('delivered','simulated','dry-run','failed')),
  ts timestamptz not null default now()
);

create table if not exists public.router_logs (
  id uuid primary key default gen_random_uuid(),
  task text, provider text,
  status text check (status in ('success','fallback','simulated')),
  latency_ms int,
  ts timestamptz not null default now()
);

-- ============================================================================
-- STRICT ADMIN LOCK — enforced on signup via trigger.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
  v_role text := 'client';
  v_client uuid := null;
begin
  -- 1) The ONE hardcoded Master Admin email.
  if lower(new.email) = 'agencjakryspindadok@gmail.com' then
    v_role := 'admin';
  else
    -- 2) Everyone else must carry a valid single-use invite
    --    (passed via raw_user_meta_data->>'invite_token').
    select * into v_invite
      from public.invites
     where token = new.raw_user_meta_data->>'invite_token'
       and used = false and revoked = false
     limit 1;

    if not found then
      raise exception 'Public sign-ups are disabled. A valid invite is required.';
    end if;

    if v_invite.email is not null and lower(v_invite.email) <> lower(new.email) then
      raise exception 'This invite was issued for a different email address.';
    end if;

    update public.invites set used = true, used_at = now() where id = v_invite.id;
    v_client := v_invite.client_id;
    update public.clients set status = 'onboarding', last_activity = now()
     where id = v_invite.client_id and status = 'invited';
  end if;

  insert into public.profiles (id, email, full_name, role, client_id, invite_token)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), v_role, v_client, new.raw_user_meta_data->>'invite_token')
  on conflict (id) do update set role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.clients    enable row level security;
alter table public.invites    enable row level security;
alter table public.profiles   enable row level security;
alter table public.ai_keys    enable row level security;
alter table public.drafts     enable row level security;
alter table public.reviews    enable row level security;
alter table public.deployments enable row level security;
alter table public.router_logs enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.my_client() returns uuid
language sql stable security definer set search_path = public as
$$ select client_id from public.profiles where id = auth.uid() $$;

-- Admin: full access everywhere. Client: own tenant only.
create policy admin_all_clients on public.clients for all using (public.is_admin()) with check (public.is_admin());
create policy client_own_client on public.clients for select using (id = public.my_client());

create policy admin_all_invites on public.invites for all using (public.is_admin()) with check (public.is_admin());

create policy admin_all_profiles on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy self_profile on public.profiles for select using (id = auth.uid());

create policy admin_all_keys on public.ai_keys for all using (public.is_admin()) with check (public.is_admin());

create policy admin_all_drafts on public.drafts for all using (public.is_admin()) with check (public.is_admin());
create policy client_own_drafts on public.drafts for all using (client_id = public.my_client()) with check (client_id = public.my_client());

create policy admin_all_reviews on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy client_own_reviews on public.reviews for all using (client_id = public.my_client()) with check (client_id = public.my_client());

create policy admin_all_deployments on public.deployments for all using (public.is_admin()) with check (public.is_admin());
create policy client_own_deployments on public.deployments for all using (client_id = public.my_client()) with check (client_id = public.my_client());

create policy admin_all_logs on public.router_logs for all using (public.is_admin()) with check (public.is_admin());
