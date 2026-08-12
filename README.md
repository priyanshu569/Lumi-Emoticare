# Lumi

An emotion-aware companion app that helps track mood and offers calm, supportive tools for everyday wellbeing.

## Stack

- [TanStack Start](https://tanstack.com/start) (React, SSR) + [TanStack Router](https://tanstack.com/router)
- Tailwind CSS v4
- shadcn/ui components
- [Supabase](https://supabase.com) for auth and data

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project's URL and keys.

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app builds with [Nitro](https://nitro.build) and deploys to [Vercel](https://vercel.com) with zero extra configuration — import the repo at [vercel.com/new](https://vercel.com/new) and set the environment variables from `.env.example` in the project settings.
