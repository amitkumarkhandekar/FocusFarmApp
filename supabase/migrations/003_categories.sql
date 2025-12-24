-- FocusFarm Categories Table
-- Run this in your Supabase SQL Editor after previous migrations

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#4A7C23',
  icon text default '📚',
  created_at timestamp with time zone default now()
);

-- Add category to study_sessions
alter table public.study_sessions 
add column if not exists category_id uuid references public.categories(id) on delete set null;

alter table public.study_sessions 
add column if not exists task_name text;

-- Enable RLS on categories
alter table public.categories enable row level security;

-- Policies for categories
create policy "Users can read own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Create default categories for existing users (optional trigger)
-- Users can add their own categories through the app

-- Grant access
grant all on public.categories to authenticated;
