import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type Mood = "happy" | "sad" | "angry" | "calm" | "neutral";

const moodVar: Record<Mood, string> = {
  happy: "var(--mood-happy)",
  sad: "var(--mood-sad)",
  angry: "var(--mood-angry)",
  calm: "var(--mood-calm)",
  neutral: "var(--mood-neutral)",
};

export function AppShell({
  children,
  mood = "neutral",
  hideNav = false,
}: {
  children: ReactNode;
  mood?: Mood;
  hideNav?: boolean;
}) {
  return (
    <div
      className="bg-mood-gradient relative min-h-screen w-full overflow-x-hidden pb-28"
      style={{ ["--mood-current" as string]: moodVar[mood] }}
    >
      {/* Ambient floating blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-50 blur-3xl animate-float-slow"
        style={{ background: `color-mix(in oklab, ${moodVar[mood]} 50%, transparent)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{ background: `color-mix(in oklab, var(--accent) 60%, transparent)`, animationDelay: "2s" }}
      />

      <main className="relative mx-auto w-full max-w-md px-5 pt-8">
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
