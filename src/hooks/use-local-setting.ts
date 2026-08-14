import { useEffect, useState } from "react";

function readSetting(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return raw === null ? fallback : raw === "true";
}

// Persists a boolean preference to localStorage, keyed per-device (not
// synced to the account — these are device-level toggles like "remind me").
export function useLocalSetting(key: string, fallback: boolean) {
  const [value, setValue] = useState(() => readSetting(key, fallback));

  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}
