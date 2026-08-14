import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useLocalSetting } from "@/hooks/use-local-setting";
import { supabase } from "@/integrations/supabase/client";
import {
  isBiometricAvailable,
  registerBiometricCredential,
  clearBiometricCredential,
} from "@/lib/biometric-lock";
import { Lock, Eye, BellRing, Trash2, Cloud, Fingerprint, ShieldCheck, LogOut } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Privacy & settings — Lumi" },
      {
        name: "description",
        content: "Lumi keeps your moments private. On-device by default, with full control.",
      },
      { property: "og:title", content: "Privacy & settings — Lumi" },
      { property: "og:description", content: "Privacy-first controls for your wellbeing app." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onDevice, setOnDevice] = useLocalSetting("lumi_on_device_detection", true);
  const [save, setSave] = useLocalSetting("lumi_save_history", true);
  const [reminders, setReminders] = useLocalSetting("lumi_daily_reminder", false);
  const [biometric, setBiometric] = useLocalSetting("lumi_biometric_lock", false);
  const [settingError, setSettingError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function handleReminderToggle(next: boolean) {
    setSettingError(null);
    if (next) {
      if (typeof Notification === "undefined") {
        setSettingError("This browser doesn't support notifications.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSettingError("Notification permission was denied, so reminders can't turn on.");
        return;
      }
    }
    setReminders(next);
  }

  async function handleBiometricToggle(next: boolean) {
    setSettingError(null);
    if (next) {
      if (!user) return;
      const available = await isBiometricAvailable();
      if (!available) {
        setSettingError("Face ID / fingerprint unlock isn't available on this device.");
        return;
      }
      try {
        await registerBiometricCredential(user.id, user.email ?? "");
        setBiometric(true);
      } catch {
        setSettingError("Couldn't set up biometric lock. Try again.");
      }
    } else {
      clearBiometricCredential();
      setBiometric(false);
    }
  }

  async function handleExport() {
    if (!user) return;
    setExporting(true);
    try {
      const [moodEntries, journalEntries] = await Promise.all([
        supabase.from("mood_entries").select("mood, confidence, created_at").eq("user_id", user.id),
        supabase.from("journal_entries").select("body, created_at").eq("user_id", user.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account_email: user.email,
        mood_entries: moodEntries.data ?? [],
        journal_entries: journalEntries.data ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumi-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteEverything() {
    if (!user) return;
    if (!window.confirm("Delete all your check-ins and journal entries? This can't be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      await Promise.all([
        supabase.from("mood_entries").delete().eq("user_id", user.id),
        supabase.from("journal_entries").delete().eq("user_id", user.id),
      ]);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell mood="neutral">
      <header className="pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy first</p>
        <h1 className="mt-1 font-display text-3xl leading-tight text-balance">
          Your feelings belong to you.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          Your camera image is read on your device and never uploaded — only the resulting mood is
          saved to your account, so your dashboard can show your history.
        </p>
      </header>

      {/* Reassurance card */}
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-foreground p-6 text-background shadow-glow">
        <ShieldCheck className="absolute -right-4 -top-4 h-32 w-32 text-background/10" />
        <p className="relative text-xs uppercase tracking-wider text-background/60">Promise</p>
        <p className="relative mt-2 font-display text-xl leading-snug">
          No images. No recordings. No selling your data. Ever.
        </p>
      </div>

      {user && (
        <div className="mt-6 flex items-center justify-between rounded-3xl bg-surface p-5 shadow-neu">
          <div>
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="mt-0.5 text-sm font-semibold">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-medium text-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      )}

      {/* Settings list */}
      <div className="mt-6 space-y-3">
        <SettingRow
          icon={Eye}
          title="On-device emotion detection"
          desc="The camera reads expressions locally. Turn off to always pick your mood by hand."
          checked={onDevice}
          onChange={setOnDevice}
        />
        <SettingRow
          icon={Cloud}
          title="Save mood history"
          desc="Keep a log of check-ins to see patterns on your dashboard."
          checked={save}
          onChange={setSave}
        />
        <SettingRow
          icon={BellRing}
          title="Gentle daily reminder"
          desc="A soft nudge at 8pm while Lumi is open in a tab."
          checked={reminders}
          onChange={handleReminderToggle}
        />
        <SettingRow
          icon={Fingerprint}
          title="Lock with Face ID"
          desc="Verify it's you before your check-ins are shown on this device."
          checked={biometric}
          onChange={handleBiometricToggle}
        />
      </div>

      {settingError && <p className="mt-3 text-center text-xs text-destructive">{settingError}</p>}

      {/* Data controls */}
      <div className="mt-6 rounded-3xl bg-surface p-2 shadow-neu">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-muted disabled:opacity-60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <Lock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{exporting ? "Preparing…" : "Export my data"}</p>
            <p className="text-xs text-muted-foreground">
              Download everything Lumi knows about you.
            </p>
          </div>
        </button>
        <button
          onClick={handleDeleteEverything}
          disabled={deleting}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-muted disabled:opacity-60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {deleting ? "Deleting…" : "Delete everything"}
            </p>
            <p className="text-xs text-muted-foreground">Erase your history. No questions asked.</p>
          </div>
        </button>
      </div>

      <p className="mt-8 mb-4 text-center text-[11px] text-muted-foreground">
        Made with care · v1.0 · You're doing great just by being here.
      </p>
    </AppShell>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-neu">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/40 text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
