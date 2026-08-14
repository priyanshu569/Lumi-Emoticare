import type { ReactNode } from "react";
import { X } from "lucide-react";

export function ToolOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2.5rem] bg-background shadow-glow sm:rounded-[2.5rem]">
        <header className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="font-display text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-foreground shadow-neu"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
