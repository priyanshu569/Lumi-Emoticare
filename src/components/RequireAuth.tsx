import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BiometricGate } from "@/components/BiometricGate";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
    );
  }

  return <BiometricGate>{children}</BiometricGate>;
}
