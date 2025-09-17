-- Table: settings (configuration clé-valeur par groupes)

create table if not exists public.settings (
  group text not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint settings_pkey primary key (group, key)
);

-- Index pour recherches rapides par group
create index if not exists settings_group_idx on public.settings (group);

-- Facultatif: activer RLS si vous l'utilisez ailleurs et n'autoriser que les admins via policies
-- alter table public.settings enable row level security;
-- drop policy if exists "Allow admin" on public.settings;
-- create policy "Allow admin" on public.settings
--   for all using (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid()
--         and p.role = 'admin'
--     )
--   ) with check (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid()
--         and p.role = 'admin'
--     )
--   );

-- Données par défaut
insert into public.settings (group, key, value)
values
  ('general','site_name',        to_jsonb('La Boutique B')),
  ('general','contact_email',    to_jsonb('contact@example.com')),
  ('general','currency',         to_jsonb('XOF')),
  ('appearance','primary_color', to_jsonb('#1E40AF')),
  ('appearance','logo_url',      to_jsonb('')),
  ('orders','cancel_window_min', to_jsonb(15)),
  ('orders','email_notifications', to_jsonb(true)),
  ('payments','service_fee_pct', to_jsonb(2)),
  ('shipping','default_carrier', to_jsonb('Local Express')),
  ('security','require_admin_2fa', to_jsonb(false)),
  ('security','max_login_attempts', to_jsonb(5)),
  ('maintenance','enabled',      to_jsonb(false)),
  ('maintenance','message',      to_jsonb('Le site est en maintenance.'))
on conflict (group, key) do nothing;

