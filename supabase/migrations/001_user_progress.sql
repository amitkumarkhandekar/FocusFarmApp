-- FocusFarm User Progress Table
-- Run this in your Supabase SQL Editor

-- Create the user_progress table
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hens integer default 0 not null,
  goats integer default 0 not null,
  cows integer default 0 not null,
  today_minutes integer default 0 not null,
  last_day_reset text not null,
  daily_goal_claimed boolean default false not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Enable Row Level Security
alter table public.user_progress enable row level security;

-- Policy: Users can only read their own progress
create policy "Users can read own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own progress
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own progress
create policy "Users can update own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger on_user_progress_updated
  before update on public.user_progress
  for each row
  execute function public.handle_updated_at();

-- Grant access to authenticated users
grant all on public.user_progress to authenticated;


ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Focus Farmer',
ADD COLUMN IF NOT EXISTS pause_on_leave BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_warning BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS vibrate_on_leave BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS dark_theme BOOLEAN DEFAULT FALSE;