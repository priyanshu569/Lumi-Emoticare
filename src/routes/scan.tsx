import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Camera, ScanFace, ShieldCheck, X } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Check in — Lumi" },
      { name: "description", content: "A gentle, private emotion check-in using your camera." },
      { property: "og:title", content: "Check in with Lumi" },
      { property: "og:description", content: "A private, on-device emotion check-in." },
    ],
  }),
  component: ScanPage,
});

const MOODS = ["happy", "sad", "angry", "neutral"] as const;

function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!scanning) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 3200) * 100);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        const detected = MOODS[Math.floor(Math.random() * MOODS.length)];
        navigate({ to: "/result", search: { mood: detected } });
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [scanning, navigate]);

  return (
    <AppShell mood="neutral" hideNav>
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate({ to: "/" })}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full bg-surface/80 text-foreground shadow-soft backdrop-blur"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-xs text-muted-foreground shadow-soft backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5" />
          On-device only
        </div>
      </header>

      <section className="mt-8 text-center">
        <h1 className="font-display text-3xl text-balance">Let's take a soft look</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Settle in. Breathe naturally. I'll only look for a moment.
        </p>
      </section>

      {/* Camera preview placeholder */}
      <div className="relative mx-auto mt-8 aspect-[3/4] w-full overflow-hidden rounded-[2.5rem] bg-foreground/90 shadow-neu">
        {/* faux preview */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.05 30) 0%, oklch(0.32 0.04 270) 60%, oklch(0.22 0.025 270) 100%)",
          }}
        />
        {/* soft face silhouette */}
        <svg
          viewBox="0 0 200 260"
          className="absolute inset-0 m-auto h-2/3 w-2/3 opacity-40"
          aria-hidden
        >
          <ellipse cx="100" cy="120" rx="70" ry="90" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 6" />
        </svg>

        {/* Face detection frame */}
        <div className="absolute inset-x-10 top-16 bottom-24 rounded-[2rem] border-2 border-white/60">
          <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-primary" />
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-primary" />
          <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-l-4 border-b-4 border-primary" />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-r-4 border-b-4 border-primary" />
        </div>

        {/* Scanning shimmer */}
        {scanning && (
          <div
            className="absolute inset-x-10 top-16 h-1 rounded-full bg-primary shadow-glow transition-all"
            style={{ transform: `translateY(${progress * 3}px)` }}
          />
        )}

        {/* Status pill */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium text-foreground shadow-soft backdrop-blur">
          {scanning ? (
            <span className="flex items-center gap-2">
              <ScanFace className="h-3.5 w-3.5 text-primary" />
              Sensing gently… {Math.round(progress)}%
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" /> Ready when you are
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => setScanning(true)}
          disabled={scanning}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-7 py-5 text-base font-semibold text-primary-foreground shadow-glow transition disabled:opacity-70"
        >
          {scanning ? "Reading your expression…" : "Start gentle scan"}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Your image never leaves this device. Nothing is recorded.
        </p>
      </div>
    </AppShell>
  );
}
