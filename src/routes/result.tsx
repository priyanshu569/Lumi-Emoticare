import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, RefreshCw } from "lucide-react";
import { z } from "zod";

const moodSchema = z.enum(["happy", "sad", "angry", "neutral"]).catch("neutral");

export const Route = createFileRoute("/result")({
  validateSearch: (search) => ({ mood: moodSchema.parse(search.mood) }),
  head: () => ({
    meta: [
      { title: "Your check-in — Lumi" },
      { name: "description", content: "A warm response to how you might be feeling right now." },
      { property: "og:title", content: "Your check-in with Lumi" },
      { property: "og:description", content: "An empathetic response to your mood check-in." },
    ],
  }),
  component: ResultPage,
});

const responses = {
  happy: {
    title: "There's a warmth about you today.",
    body: "Your expression is glowing. Whatever's going on — soak it in. Maybe share that brightness with someone, or simply notice it.",
    emoji: "🌼",
    accent: "happy" as const,
  },
  sad: {
    title: "It looks like you might be feeling low.",
    body: "That's okay. Heavy days are part of being human. I'm right here with you. Would something gentle help — a breath, a quiet song, a few written words?",
    emoji: "🌧️",
    accent: "sad" as const,
  },
  angry: {
    title: "Something feels intense right now.",
    body: "Whatever it is, your feelings make sense. Let's give it some space together — a slow exhale or a small movement can soften the edges.",
    emoji: "🔥",
    accent: "angry" as const,
  },
  neutral: {
    title: "A quiet, even moment.",
    body: "You seem steady right now. That's its own kind of beautiful. Want to use this calm to set a small intention for the day?",
    emoji: "🌿",
    accent: "calm" as const,
  },
};

function ResultPage() {
  const { mood } = Route.useSearch();
  const r = responses[mood];

  return (
    <AppShell mood={r.accent}>
      <header className="pt-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lumi senses</p>
      </header>

      <section className="mt-10 text-center">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-surface text-5xl shadow-neu animate-breathe">
          {r.emoji}
        </div>
        <h1 className="mt-8 font-display text-3xl leading-tight text-balance">{r.title}</h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {r.body}
        </p>
      </section>

      {/* Confidence bar */}
      <div className="mt-10 soft-card p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Detected mood</span>
          <span className="font-medium capitalize text-foreground">{mood}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: "82%",
              background: `linear-gradient(90deg, color-mix(in oklab, var(--mood-current) 70%, transparent), var(--mood-current))`,
            }}
          />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          This is just a gentle guess — you know yourself best.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          to="/support"
          search={{ mood }}
          className="group flex items-center justify-between rounded-full bg-foreground px-7 py-5 text-background shadow-glow transition-transform hover:scale-[1.01]"
        >
          <span className="text-base font-semibold">Show me something gentle</span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-background/15 transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-5 w-5" />
          </span>
        </Link>
        <Link
          to="/scan"
          className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-surface/70 px-7 py-4 text-sm font-medium text-foreground backdrop-blur"
        >
          <RefreshCw className="h-4 w-4" /> Try another check-in
        </Link>
      </div>
    </AppShell>
  );
}
