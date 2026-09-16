-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

create table if not exists updates (
	id uuid primary key default gen_random_uuid(),
	content text not null default '',
	image_url text,
	likes_count integer not null default 0,
	comments_count integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz
);

create table if not exists update_comments (
	id uuid primary key default gen_random_uuid(),
	update_id uuid not null references updates(id) on delete cascade,
	author_name text not null default 'Anonymous',
	content text not null,
	created_at timestamptz not null default now()
);

create index if not exists update_comments_update_id_idx on update_comments(update_id);

-- Row Level Security: the app talks to Supabase using the SERVICE ROLE key
-- from server-side API routes only (never from the browser), so RLS being
-- enabled with no public policies means these tables cannot be read or
-- written directly by anyone else (e.g. via the anon/public key).
alter table updates enable row level security;
alter table update_comments enable row level security;

-- Storage bucket for uploaded post images (public read).
insert into storage.buckets (id, name, public)
values ('updates', 'updates', true)
on conflict (id) do nothing;
