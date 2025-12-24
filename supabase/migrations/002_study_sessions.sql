-- FocusFarm Study Sessions Table
-- Run this in your Supabase SQL Editor after 001_user_progress.sql

-- Create the study_sessions table
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  duration_minutes integer not null,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone default now(),
  leave_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.study_sessions enable row level security;

-- Policy: Users can read their own sessions
create policy "Users can read own sessions"
  on public.study_sessions
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
create policy "Users can insert own sessions"
  on public.study_sessions
  for insert
  with check (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists study_sessions_user_id_idx on public.study_sessions(user_id);
create index if not exists study_sessions_started_at_idx on public.study_sessions(started_at);

-- Grant access to authenticated users
grant all on public.study_sessions to authenticated;
