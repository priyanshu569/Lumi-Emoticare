-- face-api.js reports 7 expressions; fearful/disgusted/surprised used to be
-- folded into "neutral" but are now first-class moods with their own colors
-- and responses, so the stored set needs to accept them.
alter table public.mood_entries
  drop constraint if exists mood_entries_mood_check;

alter table public.mood_entries
  add constraint mood_entries_mood_check
  check (mood in ('happy', 'sad', 'angry', 'neutral', 'fearful', 'disgusted', 'surprised'));
