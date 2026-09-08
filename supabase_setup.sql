-- Run this SQL in your Supabase project:
-- Dashboard → SQL Editor → New query → paste this → Run

-- 1. Create the docs table
create table if not exists public.docs (
  path        text primary key,
  room        text not null,
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- 2. Index for fast room-based queries
create index if not exists docs_room_idx on public.docs (room);

-- 3. Enable Row Level Security (required for anon access)
alter table public.docs enable row level security;

-- 4. Allow anon read/write (game is not private — all data is ephemeral)
create policy "anon read"  on public.docs for select using (true);
create policy "anon write" on public.docs for insert with check (true);
create policy "anon update" on public.docs for update using (true);
create policy "anon delete" on public.docs for delete using (true);

-- 5. Enable realtime for the docs table
-- (go to Supabase Dashboard → Database → Replication → enable "docs" table)
-- or run:
alter publication supabase_realtime add table public.docs;
