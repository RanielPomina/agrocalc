-- AgroSafra · Schema inicial Supabase
-- Rode este SQL em: Supabase Dashboard → SQL Editor → New query → Run

-- Extensão necessária
create extension if not exists "pgcrypto";

-- ============================================================================
-- Tabelas usadas pelo SupabaseSyncGateway (src/core/cloud/supabaseSyncGateway.ts)
-- ============================================================================

create table if not exists public.agrosafra_notices (
  id text primary key,
  group_id text not null,
  priority text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);

create index if not exists idx_agrosafra_notices_group on public.agrosafra_notices(group_id, created_at desc);

create table if not exists public.agrosafra_chat_messages (
  id text primary key,
  group_id text not null,
  priority text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);

create index if not exists idx_agrosafra_chat_group on public.agrosafra_chat_messages(group_id, created_at desc);

create table if not exists public.agrosafra_agro_log (
  id text primary key,
  group_id text not null,
  priority text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);

create index if not exists idx_agrosafra_agrolog_group on public.agrosafra_agro_log(group_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- Modelo MVP: chave anon insere (o app sincroniza offline) e lê por grupo.
-- Para produção, migrar para auth.uid() e política por membership.
-- ============================================================================

alter table public.agrosafra_notices enable row level security;
alter table public.agrosafra_chat_messages enable row level security;
alter table public.agrosafra_agro_log enable row level security;

drop policy if exists agrosafra_notices_insert on public.agrosafra_notices;
drop policy if exists agrosafra_notices_select on public.agrosafra_notices;
drop policy if exists agrosafra_chat_insert on public.agrosafra_chat_messages;
drop policy if exists agrosafra_chat_select on public.agrosafra_chat_messages;
drop policy if exists agrosafra_agrolog_insert on public.agrosafra_agro_log;
drop policy if exists agrosafra_agrolog_select on public.agrosafra_agro_log;

create policy agrosafra_notices_insert on public.agrosafra_notices
  for insert to anon, authenticated with check (true);
create policy agrosafra_notices_select on public.agrosafra_notices
  for select to anon, authenticated using (true);

create policy agrosafra_chat_insert on public.agrosafra_chat_messages
  for insert to anon, authenticated with check (true);
create policy agrosafra_chat_select on public.agrosafra_chat_messages
  for select to anon, authenticated using (true);

create policy agrosafra_agrolog_insert on public.agrosafra_agro_log
  for insert to anon, authenticated with check (true);
create policy agrosafra_agrolog_select on public.agrosafra_agro_log
  for select to anon, authenticated using (true);

-- ============================================================================
-- (Opcional) Storage bucket público para áudios do Talk Pro
-- Rodar depois no Storage → New bucket → nome: agrosafra-audio (Public)
-- ============================================================================
