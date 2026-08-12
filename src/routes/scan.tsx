import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
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
  component: () => (
    <RequireAuth>
      <ScanPage />
    </RequireAuth>
  ),
});

type Mood = "happy" | "sad" | "angry" | "neutral";
const MOODS: Mood[] = ["happy", "sad", "angry", "neutral"];
const SCAN_DURATION_MS = 3200;
const SAMPLE_INTERVAL_MS = 250;

// face-api.js reports 7 expressions; we fold the ones we don't have a
// dedicated mood/response for into "neutral" rather than inventing new moods.
function bucketExpressions(expressions: Record<string, number>): Record<Mood, number> {
  return {
    happy: expressions.happy ?? 0,
    sad: expressions.sad ?? 0,
    angry: expressions.angry ?? 0,
    neutral:
      (expressions.neutral ?? 0) +
      (expressions.fearful ?? 0) +
      (expressions.disgusted ?? 0) +
      (expressions.surprised ?? 0),
  };
}

function ScanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<
    "idle" | "loading-models" | "scanning" | "saving" | "camera-error" | "no-face"
  >("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function saveAndGo(mood: Mood, confidence: number | null) {
    setStatus("saving");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (user) {
      const { error } = await supabase
        .from("mood_entries")
        .insert({ user_id: user.id, mood, confidence });
      if (error) console.error("Failed to save mood entry:", error.message);
    }

    navigate({ to: "/result", search: { mood } });
  }

  async function startScan() {
    setStatus("loading-models");

    try {
      const faceapi = await import("face-api.js");
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }
      if (!faceapi.nets.faceExpressionNet.isLoaded) {
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("scanning");

      const totals: Record<Mood, number> = { happy: 0, sad: 0, angry: 0, neutral: 0 };
      let samples = 0;
      const start = Date.now();

      while (Date.now() - start < SCAN_DURATION_MS) {
        setProgress(Math.min(100, ((Date.now() - start) / SCAN_DURATION_MS) * 100));

        if (videoRef.current) {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detection) {
            const bucketed = bucketExpressions(
              detection.expressions as unknown as Record<string, number>,
            );
            for (const mood of MOODS) totals[mood] += bucketed[mood];
            samples++;
          }
        }

        await new Promise((r) => setTimeout(r, SAMPLE_INTERVAL_MS));
      }

      setProgress(100);

      if (samples === 0) {
        setStatus("no-face");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }

      const winner = MOODS.reduce((best, mood) => (totals[mood] > totals[best] ? mood : best));
      const confidence = totals[winner] / samples;

      await saveAndGo(winner, confidence);
    } catch (err) {
      console.error("Scan failed:", err);
      setStatus("camera-error");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const scanning = status === "scanning" || status === "loading-models" || status === "saving";

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
          Never leaves your device
        </div>
      </header>

      <section className="mt-8 text-center">
        <h1 className="font-display text-3xl text-balance">Let's take a soft look</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Settle in. Breathe naturally. I'll only look for a moment.
        </p>
      </section>

      <div className="relative mx-auto mt-8 aspect-[3/4] w-full overflow-hidden rounded-[2.5rem] bg-foreground/90 shadow-neu">
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {!streamRef.current && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.05 30) 0%, oklch(0.32 0.04 270) 60%, oklch(0.22 0.025 270) 100%)",
            }}
          />
        )}

        <div className="absolute inset-x-10 top-16 bottom-24 rounded-[2rem] border-2 border-white/60">
          <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-primary" />
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-primary" />
          <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-l-4 border-b-4 border-primary" />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-r-4 border-b-4 border-primary" />
        </div>

        {status === "scanning" && (
          <div
            className="absolute inset-x-10 top-16 h-1 rounded-full bg-primary shadow-glow transition-all"
            style={{ transform: `translateY(${progress * 3}px)` }}
          />
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium text-foreground shadow-soft backdrop-blur">
          {status === "loading-models" && (
            <span className="flex items-center gap-2">
              <ScanFace className="h-3.5 w-3.5 text-primary" /> Getting ready…
            </span>
          )}
          {status === "scanning" && (
            <span className="flex items-center gap-2">
              <ScanFace className="h-3.5 w-3.5 text-primary" />
              Sensing gently… {Math.round(progress)}%
            </span>
          )}
          {status === "saving" && (
            <span className="flex items-center gap-2">
              <ScanFace className="h-3.5 w-3.5 text-primary" /> Almost there…
            </span>
          )}
          {(status === "idle" || status === "camera-error" || status === "no-face") && (
            <span className="flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" /> Ready when you are
            </span>
          )}
        </div>
      </div>

      {status === "camera-error" && (
        <p className="mt-4 text-center text-xs text-destructive">
          Couldn't access your camera. Check permissions, or choose how you feel below.
        </p>
      )}
      {status === "no-face" && (
        <p className="mt-4 text-center text-xs text-destructive">
          Couldn't get a clear view — try better lighting, or choose how you feel below.
        </p>
      )}

      <div className="mt-8">
        <button
          onClick={startScan}
          disabled={scanning}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-7 py-5 text-base font-semibold text-primary-foreground shadow-glow transition disabled:opacity-70"
        >
          {scanning ? "Reading your expression…" : "Start gentle scan"}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Your camera image is analyzed on your device and never uploaded — only your mood is saved.
        </p>

        {(status === "camera-error" || status === "no-face") && (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => saveAndGo(mood, null)}
                className="rounded-2xl bg-surface py-3 text-xs font-medium capitalize shadow-neu transition hover:bg-muted"
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
