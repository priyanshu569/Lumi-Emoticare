import { useEffect, useState } from "react";

const PHASES = [
  { label: "Breathe in", seconds: 4, scale: 1.4 },
  { label: "Hold", seconds: 4, scale: 1.4 },
  { label: "Breathe out", seconds: 4, scale: 0.8 },
  { label: "Hold", seconds: 4, scale: 0.8 },
] as const;

export function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIndex((i) => {
          const next = (i + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, phaseIndex]);

  const phase = PHASES[phaseIndex];

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <p className="text-sm text-muted-foreground">
        4 seconds in, 4 hold, 4 out, 4 hold. Follow the circle.
      </p>

      <div className="relative mt-10 grid h-48 w-48 place-items-center">
        <div
          className="absolute inset-0 rounded-full transition-transform ease-in-out"
          style={{
            transform: `scale(${running ? phase.scale : 1})`,
            transitionDuration: `${phase.seconds}s`,
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--mood-calm) 55%, transparent), transparent 70%)",
          }}
        />
        <div className="grid h-24 w-24 place-items-center rounded-full bg-surface shadow-neu">
          <span className="font-display text-2xl">{running ? secondsLeft : "🌬️"}</span>
        </div>
      </div>

      <p className="mt-8 font-display text-xl">{running ? phase.label : "Ready when you are"}</p>
      {running && (
        <p className="mt-1 text-xs text-muted-foreground">
          {cycles} full {cycles === 1 ? "cycle" : "cycles"} so far
        </p>
      )}

      <button
        onClick={() => {
          if (running) {
            setRunning(false);
          } else {
            setPhaseIndex(0);
            setSecondsLeft(PHASES[0].seconds);
            setRunning(true);
          }
        }}
        className="mt-8 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        {running ? "Stop" : "Begin"}
      </button>
    </div>
  );
}
