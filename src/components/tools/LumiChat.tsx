import { useState } from "react";
import { Send } from "lucide-react";
import { sendChatMessage } from "@/server/chat";

type Mood = "happy" | "sad" | "angry" | "neutral" | "calm" | "fearful" | "disgusted" | "surprised";
type Message = { role: "user" | "assistant"; content: string };

export function LumiChat({ mood }: { mood: Mood }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm here. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const result = await sendChatMessage({ data: { mood, messages: next.slice(-20) } });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setError("Couldn't reach Lumi right now. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-surface text-foreground shadow-neu"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="max-w-[85%] rounded-2xl bg-surface px-4 py-2.5 text-sm text-muted-foreground shadow-neu">
            …
          </div>
        )}
        {error && <p className="text-center text-xs text-destructive">{error}</p>}
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-border/40 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type how you're feeling…"
          className="flex-1 rounded-full bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
