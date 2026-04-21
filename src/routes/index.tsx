import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: WelcomePage,
});

function WelcomePage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Still up?" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell mood="calm">
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-semibold">Lumi</span>
        </div>
        <Link to="/settings" className="text-xs text-muted-foreground hover:text-foreground">
          Privacy first ·
        </Link>
      </header>

      <section className="mt-12">
        <p className="text-sm font-medium text-muted-foreground">{greeting}, friend</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.05] text-balance">
          How are you <em className="font-normal italic text-primary">really</em> feeling today?
        </h1>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
          Take a quiet moment. I'll gently sense how you're doing and offer something kind in return —
          a breath, a song, a few words. No pressure.
        </p>
      </section>

      <div className="relative mx-auto mt-12 grid h-56 w-56 place-items-center">
        <div
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ background: "color-mix(in oklab, var(--mood-calm) 40%, transparent)" }}
        />
        <div
          className="absolute inset-4 rounded-full animate-pulse-ring"
          style={{
            background: "color-mix(in oklab, var(--mood-calm) 60%, transparent)",
            animationDelay: "0.8s",
          }}
        />
        <div className="relative grid h-40 w-40 place-items-center rounded-full bg-surface shadow-neu animate-breathe">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="mt-12 space-y-3">
        <Link
          to="/scan"
          className="group flex items-center justify-between rounded-full bg-foreground px-7 py-5 text-background shadow-glow"
        >
          <span className="text-base font-semibold">Begin a check-in</span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-background/15">
            <ArrowRight className="h-5 w-5" />
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center justify-center rounded-full border border-border/60 px-7 py-4 text-sm"
        >
          See your mood journey
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Everything stays on your device. Always.</span>
      </div>
    </AppShell>
  );
}
