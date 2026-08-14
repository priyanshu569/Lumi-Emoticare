import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

type Entry = { id: string; body: string; created_at: string };

export function FreeWriteJournal() {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("journal_entries")
      .select("id, body, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (active) setEntries((data as Entry[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSave() {
    if (!user || !body.trim()) return;
    setSaving(true);
    setSaved(false);
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, body: body.trim() })
      .select("id, body, created_at")
      .single();
    setSaving(false);
    if (!error && data) {
      setEntries((prev) => [data as Entry, ...(prev ?? [])].slice(0, 5));
      setBody("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (!user) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sign in to save what you write here.
      </p>
    );
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Let it out. No one's grading this."
        rows={6}
        maxLength={5000}
        className="w-full resize-none rounded-2xl bg-surface p-4 text-sm shadow-neu outline-none placeholder:text-muted-foreground"
      />
      <button
        onClick={handleSave}
        disabled={saving || !body.trim()}
        className="mt-3 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save entry"}
      </button>

      {entries && entries.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground">Recent entries</p>
          <ul className="mt-2 space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-2 rounded-2xl bg-surface p-3 shadow-neu"
              >
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs text-foreground">{e.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
