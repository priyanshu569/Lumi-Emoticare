# Lumi

An emotion-aware companion app: sign in, do a quick camera-based mood check-in, and see your mood
history on a dashboard. Facial expression detection runs entirely in the browser (via
[face-api.js](https://github.com/vladmandic/face-api)) — no image ever leaves the device, only the
detected mood is saved.

## Stack

- [TanStack Start](https://tanstack.com/start) (React, SSR) + [TanStack Router](https://tanstack.com/router)
- Tailwind CSS v4
- shadcn/ui components
- [Supabase](https://supabase.com) for auth and mood-entry storage
- [face-api.js](https://github.com/vladmandic/face-api) for on-device facial expression detection

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project's URL and keys.

**Database**: run `supabase/migrations/20260813000000_mood_entries.sql` against your Supabase
project (SQL Editor in the dashboard, or `supabase db push` if you use the CLI) before signing up —
the app writes to a `mood_entries` table that this migration creates, with row-level security so
each user only ever sees their own check-ins.

**Auth**: uses Supabase email/password auth. If your Supabase project has "Confirm email" enabled
(the default), new accounts need to click a confirmation link before they can sign in.

**Camera**: `/scan` requests camera access and needs HTTPS (or `localhost`) to work — this is a
browser requirement for `getUserMedia`, not something this app can bypass.

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app builds with [Nitro](https://nitro.build) and deploys to [Vercel](https://vercel.com) with zero extra configuration — import the repo at [vercel.com/new](https://vercel.com/new) and set the environment variables from `.env.example` in the project settings.
