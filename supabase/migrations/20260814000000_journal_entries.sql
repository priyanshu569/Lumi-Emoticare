-- Free-write journal entries from the Support page.
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

create policy "Users can view their own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
