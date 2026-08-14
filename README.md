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

**Database**: run every file in `supabase/migrations/` against your Supabase project, in order
(SQL Editor in the dashboard, or `supabase db push` if you use the CLI) before signing up — they
create the `mood_entries` and `journal_entries` tables the app writes to, both with row-level
security so each user only ever sees their own data.

**Auth**: uses Supabase email/password auth, including password reset (`/reset-password`). If your
Supabase project has "Confirm email" enabled (the default), new accounts need to click a
confirmation link before they can sign in. In Supabase, under **Authentication → URL
Configuration**, add your deployed URL to both **Site URL** and **Redirect URLs** — otherwise
confirmation and password-reset links point at the wrong place.

**Camera**: `/scan` requests camera access and needs HTTPS (or `localhost`) to work — this is a
browser requirement for `getUserMedia`, not something this app can bypass.

**Chat**: "Talk it out with Lumi" on the Support page calls Claude (Anthropic API) from a server
function — set `ANTHROPIC_API_KEY` (see `.env.example`) for it to work. Without it, the other
Support tools (breathing, journal, soundscape, crisis resources) still work normally.

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app builds with [Nitro](https://nitro.build) and deploys to [Vercel](https://vercel.com) with zero extra configuration — import the repo at [vercel.com/new](https://vercel.com/new) and set the environment variables from `.env.example` in the project settings.
