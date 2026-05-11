type Stat = { label: string; value: string; delta?: string; deltaPositive?: boolean };

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded border border-terminal-border bg-terminal-bg/60 p-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">{s.label}</dt>
          <dd className="mt-1 font-mono text-lg text-slate-100">{s.value}</dd>
          {s.delta ? (
            <dd
              className={`mt-0.5 font-mono text-xs ${
                s.deltaPositive === false ? "text-terminal-danger" : "text-terminal-accent"
              }`}
            >
              {s.delta}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
