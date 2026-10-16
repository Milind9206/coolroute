-- Supabase Auth stores credential material (password hashes and login identities).
-- This public profile table stores only the user's display name and account id.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'CoolRoute user'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create table if not exists public.issue_reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('Bug', 'Map or route', 'Weather data', 'Accessibility', 'Other')),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 10 and 4000),
  page_path text not null default '/planner' check (char_length(page_path) <= 300),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists issue_reports_user_created_idx
  on public.issue_reports (user_id, created_at desc);

alter table public.issue_reports enable row level security;

drop policy if exists "Users can submit their own issue reports" on public.issue_reports;
create policy "Users can submit their own issue reports"
  on public.issue_reports for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own issue reports" on public.issue_reports;
create policy "Users can read their own issue reports"
  on public.issue_reports for select to authenticated
  using ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant insert, select on public.issue_reports to authenticated;
grant usage, select on sequence public.issue_reports_id_seq to authenticated;
