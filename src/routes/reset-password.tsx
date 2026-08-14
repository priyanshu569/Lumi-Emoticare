import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Set a new password — Lumi" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const timeout = setTimeout(() => {
      if (!loading && !user) {
        setError(
          "This reset link is invalid or has expired. Request a new one from the sign-in page.",
        );
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [loading, user, done]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell mood="calm" hideNav>
      <div className="flex min-h-[80vh] flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <h1 className="mt-4 font-display text-3xl text-balance">Set a new password</h1>
        </div>

        {done ? (
          <div className="soft-card p-6 text-center">
            <p className="font-display text-lg">Password updated</p>
            <p className="mt-2 text-sm text-muted-foreground">Taking you home…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-neu">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-center text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !user}
              className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-70"
            >
              {submitting ? "One moment…" : "Update password"}
            </button>
          </form>
        )}

        <Link
          to="/"
          className="mt-8 text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    </AppShell>
  );
}
