import { useEffect, useState, type ReactNode } from "react";
import { Fingerprint, Sparkles } from "lucide-react";
import { hasBiometricCredential, verifyBiometric } from "@/lib/biometric-lock";

export function BiometricGate({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enabled = localStorage.getItem("lumi_biometric_lock") === "true";
    setLocked(enabled && hasBiometricCredential());
    setChecked(true);
  }, []);

  async function unlock() {
    setError(null);
    try {
      const ok = await verifyBiometric();
      if (ok) {
        setLocked(false);
      } else {
        setError("Verification failed. Try again.");
      }
    } catch {
      setError("Couldn't verify. Try again.");
    }
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Fingerprint className="h-8 w-8" />
        </div>
        <p className="font-display text-xl">Locked for privacy</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Verify it's you to see your check-ins.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          onClick={unlock}
          className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Unlock
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
