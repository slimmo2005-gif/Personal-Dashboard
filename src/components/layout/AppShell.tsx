import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "finance", label: "Finance" },
  { to: "macro", label: "Macro" },
  { to: "geopolitics", label: "Geopolitics" },
  { to: "afl", label: "AFL" },
  { to: "news", label: "News" },
] as const;

function navClass(active: boolean) {
  return [
    "rounded border px-3 py-1.5 font-mono text-xs transition",
    active
      ? "border-terminal-accent/60 bg-terminal-bg text-terminal-accent"
      : "border-terminal-border bg-terminal-panel text-slate-200 hover:border-terminal-accent/50 hover:text-terminal-accent",
  ].join(" ");
}

export function AppShell() {
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
              Modular routes backed by versioned JSON. Scheduled jobs refresh public data for static hosting.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => navClass(isActive)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
