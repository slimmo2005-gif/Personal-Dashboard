import type { ReactNode } from "react";

const NAV = [
  { id: "finance", label: "Finance" },
  { id: "macro", label: "Macro" },
  { id: "geopolitics", label: "Geopolitics" },
  { id: "afl", label: "AFL" },
  { id: "news", label: "News" },
] as const;

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-terminal-bg bg-[radial-gradient(ellipse_at_top,_#122018_0%,_#0b0e11_55%)]">
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-terminal-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terminal-accent">Live desk</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Personal intelligence dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-terminal-muted">
              Modular widgets backed by versioned JSON. Scheduled jobs refresh public data for static hosting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="rounded border border-terminal-border bg-terminal-panel px-3 py-1.5 font-mono text-xs text-slate-200 transition hover:border-terminal-accent/50 hover:text-terminal-accent"
              >
                {n.label}
              </a>
            ))}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
