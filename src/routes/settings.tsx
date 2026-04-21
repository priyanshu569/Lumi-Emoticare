import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Lock, Eye, BellRing, Trash2, Cloud, Fingerprint, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Privacy & settings — Lumi" },
      { name: "description", content: "Lumi keeps your moments private. On-device by default, with full control." },
      { property: "og:title", content: "Privacy & settings — Lumi" },
      { property: "og:description", content: "Privacy-first controls for your wellbeing app." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [onDevice, setOnDevice] = useState(true);
  const [save, setSave] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [biometric, setBiometric] = useState(true);

  return (
    <AppShell mood="neutral">
      <header className="pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy first</p>
        <h1 className="mt-1 font-display text-3xl leading-tight text-balance">
          Your feelings belong to you.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          Lumi was built so you never have to wonder where your moments go.
          Everything runs privately on your device unless you choose otherwise.
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

      {/* Settings list */}
      <div className="mt-6 space-y-3">
        <SettingRow
          icon={Eye}
          title="On-device emotion detection"
          desc="The camera reads expressions locally and forgets instantly."
          checked={onDevice}
          onChange={setOnDevice}
        />
        <SettingRow
          icon={Cloud}
          title="Save mood history"
          desc="Keep an encrypted log of check-ins to see patterns."
          checked={save}
          onChange={setSave}
        />
        <SettingRow
          icon={BellRing}
          title="Gentle daily reminder"
          desc="A soft nudge at 8pm — never pushy, easy to mute."
          checked={reminders}
          onChange={setReminders}
        />
        <SettingRow
          icon={Fingerprint}
          title="Lock with Face ID"
          desc="Add a private layer before opening Lumi."
          checked={biometric}
          onChange={setBiometric}
        />
      </div>

      {/* Data controls */}
      <div className="mt-6 rounded-3xl bg-surface p-2 shadow-neu">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-muted">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <Lock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Export my data</p>
            <p className="text-xs text-muted-foreground">Download everything Lumi knows about you.</p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-muted">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Delete everything</p>
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
