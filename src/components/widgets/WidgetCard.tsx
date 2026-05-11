import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function WidgetCard({ title, subtitle, badge, children, footer, className = "" }: Props) {
  return (
    <section
      className={`flex flex-col rounded-lg border border-terminal-border bg-terminal-panel shadow-panel ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-terminal-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-sm font-semibold uppercase tracking-wide text-slate-100">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 truncate font-mono text-xs text-terminal-muted">{subtitle}</p>
          ) : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded border border-terminal-border bg-terminal-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-terminal-accent">
            {badge}
          </span>
        ) : null}
      </header>
      <div className="min-h-[120px] flex-1 px-4 py-3">{children}</div>
      {footer ? (
        <footer className="border-t border-terminal-border px-4 py-2 font-mono text-[10px] text-terminal-muted">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
