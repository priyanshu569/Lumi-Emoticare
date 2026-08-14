import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumi" },
      { name: "description", content: "Sign in to keep your mood check-ins with you." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
        } else {
          navigate({ to: "/" });
        }
      }
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
          <h1 className="mt-4 font-display text-3xl text-balance">
            {mode === "signin"
              ? "Welcome back"
              : mode === "signup"
                ? "Let's get you set up"
                : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            {mode === "signin"
              ? "Sign in to see your mood history."
              : mode === "signup"
                ? "Your check-ins will be saved to your account, privately."
                : "We'll email you a link to set a new password."}
          </p>
        </div>

        {resetSent ? (
          <div className="soft-card p-6 text-center">
            <p className="font-display text-lg">Check your inbox</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode("signin");
              }}
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Back to sign in
            </button>
          </div>
        ) : confirmSent ? (
          <div className="soft-card p-6 text-center">
            <p className="font-display text-lg">Check your inbox</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Confirm your email, then come
              back and sign in.
            </p>
            <button
              onClick={() => {
                setConfirmSent(false);
                setMode("signin");
              }}
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-neu">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {mode !== "reset" && (
              <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-neu">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {error && <p className="text-center text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-70"
            >
              {submitting
                ? "One moment…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </button>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("reset");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === "signup" ? "signin" : "signup");
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("signin");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            )}
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
