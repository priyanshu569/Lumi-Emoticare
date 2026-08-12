-- Mood check-in history, one row per completed scan/check-in.
create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null check (mood in ('happy', 'sad', 'angry', 'neutral')),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_at timestamptz not null default now()
);

create index mood_entries_user_created_idx
  on public.mood_entries (user_id, created_at desc);

alter table public.mood_entries enable row level security;

create policy "Users can view their own mood entries"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mood entries"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own mood entries"
  on public.mood_entries for delete
  using (auth.uid() = user_id);
