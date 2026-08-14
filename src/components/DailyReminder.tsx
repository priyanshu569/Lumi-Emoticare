import { useEffect } from "react";

function msUntilNext8pm() {
  const now = new Date();
  const next = new Date();
  next.setHours(20, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

// Best-effort reminder: fires only while a Lumi tab stays open, since a
// true background push needs a service worker + server-side scheduler.
export function DailyReminder() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (localStorage.getItem("lumi_daily_reminder") !== "true") return;
    if (Notification.permission !== "granted") return;

    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(() => {
        new Notification("Lumi", { body: "A gentle moment to check in with yourself." });
        schedule();
      }, msUntilNext8pm());
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return null;
}
