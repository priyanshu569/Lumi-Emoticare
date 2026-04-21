import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookOpen, Music2, Wind, MessageCircleHeart, PhoneCall, Quote } from "lucide-react";
import { z } from "zod";

const moodSchema = z.enum(["happy", "sad", "angry", "neutral", "calm"]).catch("neutral");

export const Route = createFileRoute("/support")({
  validateSearch: (search) => ({ mood: moodSchema.parse((search as { mood?: string }).mood) }),
  head: () => ({
    meta: [
      { title: "Gentle support — Lumi" },
      { name: "description", content: "Breathing, journaling, music and more — small caring tools chosen for how you feel." },
      { property: "og:title", content: "Gentle support — Lumi" },
      { property: "og:description", content: "Caring tools for everyday emotional wellbeing." },
    ],
  }),
  component: SupportPage,
});

const headlines: Record<string, string> = {
  happy: "Let's sustain this lightness",
  sad: "Soft things, just for now",
  angry: "Let's release a little pressure",
  calm: "Use this quiet beautifully",
  neutral: "A few small kindnesses for you",
};

const actions = [
  {
    icon: Wind,
    title: "Box breathing",
    desc: "4 in · 4 hold · 4 out · 4 hold",
    duration: "2 min",
    tone: "calm",
  },
  {
    icon: BookOpen,
    title: "Free-write",
    desc: "Empty your head onto a quiet page.",
    duration: "5 min",
    tone: "neutral",
  },
  {
    icon: Music2,
    title: "Soft soundscape",
    desc: "Lo-fi rain & warm piano",
    duration: "12 min",
    tone: "sad",
  },
  {
    icon: MessageCircleHeart,
    title: "Talk it out with Lumi",
    desc: "A judgment-free, listening chat",
    duration: "Open",
    tone: "happy",
  },
] as const;

function SupportPage() {
  const { mood } = Route.useSearch();

  return (
    <AppShell mood={mood === "happy" ? "happy" : mood === "angry" ? "angry" : mood === "sad" ? "sad" : "calm"}>
      <header className="pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Just for you</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-balance">
          {headlines[mood] ?? headlines.neutral}
        </h1>
      </header>

      {/* Quote card */}
      <div className="mt-6 soft-card relative overflow-hidden p-6">
        <Quote className="absolute -top-2 -left-2 h-20 w-20 text-primary/10" />
        <p className="relative font-display text-lg italic leading-snug text-foreground/90">
          "You don't have to be okay all the time. You just have to be here."
        </p>
        <p className="mt-3 text-xs text-muted-foreground">— a quiet reminder</p>
      </div>

      {/* Action grid */}
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, title, desc, duration, tone }) => (
          <li key={title}>
            <button className="group flex h-full w-full flex-col items-start gap-3 rounded-3xl bg-surface p-5 text-left shadow-neu transition-transform hover:-translate-y-0.5 active:translate-y-0">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{
                  background: `color-mix(in oklab, var(--mood-${tone}) 35%, var(--surface))`,
                  color: `color-mix(in oklab, var(--mood-${tone}) 50%, var(--foreground))`,
                }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold leading-tight">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
              <span className="mt-auto rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                {duration}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Today's tiny ritual */}
      <div className="mt-6 rounded-3xl bg-foreground p-6 text-background shadow-glow">
        <p className="text-xs uppercase tracking-[0.2em] text-background/60">Today's tiny ritual</p>
        <p className="mt-3 font-display text-xl leading-snug">
          Place a hand on your chest. Breathe in for four. Whisper, "I'm doing my best."
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-xs font-medium backdrop-blur">
          Begin together →
        </button>
      </div>

      {/* Crisis */}
      <div className="mt-6 mb-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 p-4 backdrop-blur">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
          <PhoneCall className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Need a real person?</p>
          <p className="text-[11px] text-muted-foreground">Reach a trained listener anytime, free.</p>
        </div>
        <button className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground">
          Connect
        </button>
      </div>
    </AppShell>
  );
}
