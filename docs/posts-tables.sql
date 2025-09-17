-- CMS Articles: tables de base

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  author_id uuid not null references public.profiles(id) on delete set null,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_idx on public.posts(status);
create index if not exists posts_slug_idx on public.posts(slug);
create index if not exists posts_published_at_idx on public.posts(published_at desc nulls last);

-- Catégories (facultatif)
create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Tags (facultatif)
create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Liaison post <-> tag (facultatif)
create table if not exists public.post_tag_links (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- RLS (optionnel):
-- alter table public.posts enable row level security;
-- create policy "posts_admin_only" on public.posts for all using (
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
-- ) with check (
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
-- );

