import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Flame, Smile, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your mood journey — Lumi" },
      { name: "description", content: "A gentle look at how you've been feeling — patterns, streaks, and small wins." },
      { property: "og:title", content: "Your mood journey — Lumi" },
      { property: "og:description", content: "Mood tracking that feels like a friend, not a chart." },
    ],
  }),
  component: Dashboard,
});

const week = [
  { day: "M", mood: "happy", value: 0.8 },
  { day: "T", mood: "neutral", value: 0.55 },
  { day: "W", mood: "sad", value: 0.3 },
  { day: "T", mood: "calm", value: 0.65 },
  { day: "F", mood: "happy", value: 0.85 },
  { day: "S", mood: "calm", value: 0.7 },
  { day: "S", mood: "neutral", value: 0.5 },
] as const;

const distribution = [
  { mood: "happy", label: "Happy", pct: 38 },
  { mood: "calm", label: "Calm", pct: 28 },
  { mood: "neutral", label: "Neutral", pct: 20 },
  { mood: "sad", label: "Low", pct: 10 },
  { mood: "angry", label: "Tense", pct: 4 },
] as const;

function Dashboard() {
  return (
    <AppShell mood="calm">
      <header className="flex items-end justify-between pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">This week</p>
          <h1 className="mt-1 font-display text-3xl leading-tight">Your mood journey</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Flame className="h-3.5 w-3.5" /> 6-day streak
        </div>
      </header>

      {/* Summary card */}
      <div className="mt-6 soft-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Average mood</p>
            <p className="mt-1 font-display text-3xl">Mostly bright</p>
          </div>
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-2xl shadow-neu"
            style={{ background: "color-mix(in oklab, var(--mood-happy) 35%, var(--surface))" }}
          >
            🌼
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" /> 14% lighter than last week
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="mt-5 rounded-3xl bg-surface p-6 shadow-neu">
        <p className="text-xs font-medium text-muted-foreground">Daily check-ins</p>
        <div className="mt-5 flex h-44 items-end justify-between gap-2">
          {week.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-full w-full items-end">
                <div
                  className="w-full rounded-2xl transition-all"
                  style={{
                    height: `${d.value * 100}%`,
                    background: `linear-gradient(180deg, color-mix(in oklab, var(--mood-${d.mood}) 90%, transparent), color-mix(in oklab, var(--mood-${d.mood}) 50%, transparent))`,
                    boxShadow: "inset 0 -2px 0 color-mix(in oklab, var(--foreground) 8%, transparent)",
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="mt-5 rounded-3xl bg-surface p-6 shadow-neu">
        <p className="text-xs font-medium text-muted-foreground">How feelings showed up</p>
        <ul className="mt-4 space-y-3">
          {distribution.map((d) => (
            <li key={d.mood} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-foreground">{d.label}</span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.pct}%`,
                    background: `var(--mood-${d.mood})`,
                  }}
                />
              </div>
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{d.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Today's check-in CTA */}
      <div className="mt-5 mb-4 flex items-center justify-between rounded-3xl bg-foreground p-5 text-background shadow-glow">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-background/15">
            <Smile className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-background/60">Today</p>
            <p className="font-display text-base">Haven't checked in yet</p>
          </div>
        </div>
        <a
          href="/scan"
          className="rounded-full bg-background px-4 py-2 text-xs font-semibold text-foreground"
        >
          Check in
        </a>
      </div>
    </AppShell>
  );
}
