import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Smile, TrendingDown, TrendingUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your mood journey — Lumi" },
      {
        name: "description",
        content: "A gentle look at how you've been feeling — patterns, streaks, and small wins.",
      },
      { property: "og:title", content: "Your mood journey — Lumi" },
      {
        property: "og:description",
        content: "Mood tracking that feels like a friend, not a chart.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

type Mood = "happy" | "sad" | "angry" | "neutral";
const MOODS: Mood[] = ["happy", "sad", "angry", "neutral"];
const MOOD_LABEL: Record<Mood, string> = {
  happy: "Happy",
  sad: "Low",
  angry: "Tense",
  neutral: "Neutral",
};
const MOOD_INTENSITY: Record<Mood, number> = {
  happy: 0.85,
  neutral: 0.55,
  sad: 0.3,
  angry: 0.35,
};
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type Entry = { mood: Mood; created_at: string };

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayKey(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}

function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const since = new Date();
    since.setDate(since.getDate() - 14);

    supabase
      .from("mood_entries")
      .select("mood, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to load mood entries:", error.message);
          setEntries([]);
          return;
        }
        setEntries((data ?? []) as Entry[]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (entries === null) {
    return (
      <AppShell mood="calm">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Sparkles className="h-6 w-6 animate-pulse text-primary" />
        </div>
      </AppShell>
    );
  }

  // Last 7 calendar days, ending today. For each day, use the most recent
  // check-in that day (last entry wins if someone checks in more than once).
  const today = startOfDay(new Date());
  const entryByDay = new Map<string, Mood>();
  for (const e of entries) {
    entryByDay.set(dayKey(new Date(e.created_at)), e.mood);
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const mood = entryByDay.get(dayKey(d)) ?? null;
    return { day: DAY_LABELS[d.getDay()], mood, value: mood ? MOOD_INTENSITY[mood] : 0 };
  });

  const hasAnyEntries = entries.length > 0;
  const todaysMood = entryByDay.get(dayKey(today)) ?? null;

  // Streak: consecutive days with a check-in, walking back from today
  // (or yesterday, if today's check-in hasn't happened yet).
  let streak = 0;
  {
    const cursor = new Date(today);
    if (!entryByDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (entryByDay.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Distribution over the fetched window.
  const counts: Record<Mood, number> = { happy: 0, sad: 0, angry: 0, neutral: 0 };
  for (const e of entries) counts[e.mood]++;
  const total = entries.length;
  const distribution = MOODS.map((mood) => ({
    mood,
    label: MOOD_LABEL[mood],
    pct: total > 0 ? Math.round((counts[mood] / total) * 100) : 0,
  })).filter((d) => d.pct > 0);

  // This week vs previous week average intensity.
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const thisWeekEntries = entries.filter((e) => new Date(e.created_at) >= sevenDaysAgo);
  const lastWeekEntries = entries.filter(
    (e) => new Date(e.created_at) >= fourteenDaysAgo && new Date(e.created_at) < sevenDaysAgo,
  );
  const avg = (list: Entry[]) =>
    list.length ? list.reduce((sum, e) => sum + MOOD_INTENSITY[e.mood], 0) / list.length : null;
  const thisWeekAvg = avg(thisWeekEntries);
  const lastWeekAvg = avg(lastWeekEntries);
  const trendPct =
    thisWeekAvg !== null && lastWeekAvg !== null && lastWeekAvg > 0
      ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
      : null;

  const avgLabel =
    thisWeekAvg === null
      ? "No check-ins yet"
      : thisWeekAvg >= 0.7
        ? "Mostly bright"
        : thisWeekAvg >= 0.5
          ? "Fairly steady"
          : "A heavier stretch";

  return (
    <AppShell mood="calm">
      <header className="flex items-end justify-between pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">This week</p>
          <h1 className="mt-1 font-display text-3xl leading-tight">Your mood journey</h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Flame className="h-3.5 w-3.5" /> {streak}-day streak
          </div>
        )}
      </header>

      {!hasAnyEntries ? (
        <div className="mt-8 soft-card flex flex-col items-center p-8 text-center">
          <Sparkles className="h-8 w-8 text-primary" />
          <p className="mt-4 font-display text-xl">No check-ins yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your first scan will start filling this in.
          </p>
          <a
            href="/scan"
            className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Check in now
          </a>
        </div>
      ) : (
        <>
          <div className="mt-6 soft-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Average mood</p>
                <p className="mt-1 font-display text-3xl">{avgLabel}</p>
              </div>
              <div
                className="grid h-16 w-16 place-items-center rounded-2xl text-2xl shadow-neu"
                style={{ background: "color-mix(in oklab, var(--mood-happy) 35%, var(--surface))" }}
              >
                🌼
              </div>
            </div>
            {trendPct !== null && (
              <div
                className={`mt-2 flex items-center gap-1.5 text-xs ${
                  trendPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {trendPct >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(trendPct)}% {trendPct >= 0 ? "lighter" : "heavier"} than last week
              </div>
            )}
          </div>

          <div className="mt-5 rounded-3xl bg-surface p-6 shadow-neu">
            <p className="text-xs font-medium text-muted-foreground">Daily check-ins</p>
            <div className="mt-5 flex h-44 items-end justify-between gap-2">
              {week.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-full w-full items-end">
                    {d.mood ? (
                      <div
                        className="w-full rounded-2xl transition-all"
                        style={{
                          height: `${d.value * 100}%`,
                          background: `linear-gradient(180deg, color-mix(in oklab, var(--mood-${d.mood}) 90%, transparent), color-mix(in oklab, var(--mood-${d.mood}) 50%, transparent))`,
                          boxShadow:
                            "inset 0 -2px 0 color-mix(in oklab, var(--foreground) 8%, transparent)",
                        }}
                      />
                    ) : (
                      <div className="h-2 w-full rounded-full bg-muted" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-surface p-6 shadow-neu">
            <p className="text-xs font-medium text-muted-foreground">How feelings showed up</p>
            <ul className="mt-4 space-y-3">
              {distribution.map((d) => (
                <li key={d.mood} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-foreground">{d.label}</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.pct}%`, background: `var(--mood-${d.mood})` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {d.pct}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 mb-4 flex items-center justify-between rounded-3xl bg-foreground p-5 text-background shadow-glow">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-background/15">
                <Smile className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-background/60">Today</p>
                <p className="font-display text-base">
                  {todaysMood
                    ? `Feeling ${MOOD_LABEL[todaysMood].toLowerCase()}`
                    : "Haven't checked in yet"}
                </p>
              </div>
            </div>
            <a
              href="/scan"
              className="rounded-full bg-background px-4 py-2 text-xs font-semibold text-foreground"
            >
              {todaysMood ? "Check in again" : "Check in"}
            </a>
          </div>
        </>
      )}
    </AppShell>
  );
}
