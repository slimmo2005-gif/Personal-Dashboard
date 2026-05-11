import { MetricTrendRow } from "@/components/layout/MetricTrendRow";
import { SpotMetricBlock } from "@/components/layout/SpotMetricBlock";
import { WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { AflData, AflPlayerStat } from "@/types/dashboard";

function LeaderTable({ title, rows }: { title: string; rows: AflPlayerStat[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left font-mono text-xs">
        <caption className="mb-2 text-left text-[10px] uppercase tracking-wider text-terminal-muted">{title}</caption>
        <thead>
          <tr className="border-b border-terminal-border text-terminal-muted">
            <th className="py-2 pr-2">Player</th>
            <th className="py-2 pr-2">Team</th>
            <th className="py-2 pr-2">Stat</th>
            <th className="py-2 text-right">#</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.player}-${r.stat}`} className="border-b border-terminal-border/60">
              <td className="py-2 pr-2 text-slate-100">{r.player}</td>
              <td className="py-2 pr-2 text-terminal-muted">{r.team}</td>
              <td className="py-2 pr-2">{r.stat}</td>
              <td className="py-2 text-right text-terminal-accent">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AflPage() {
  const { data, status, error } = useJsonData<AflData>("afl.json");

  if (status === "loading" || status === "idle") {
    return <WidgetLoading message="Loading AFL…" />;
  }

  if (status === "error" || !data) {
    return <WidgetError message={error ?? "Could not load afl.json"} />;
  }

  const roll = data.rolling[0];
  const s90 = roll?.history90d ?? roll?.points ?? [];
  const s5 = roll?.history5y ?? [];

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">AFL</h2>
        <p className="mt-1 text-sm text-terminal-muted">Rolling team trend plus leader boards.</p>
      </header>

      {roll ? (
        <div className="rounded-lg border border-terminal-border bg-terminal-panel/60 shadow-panel">
          <MetricTrendRow
            series90={s90}
            series5y={s5}
            valueFormatter={(v) => String(Math.round(v))}
            left={
              <SpotMetricBlock
                title={<span className="text-sm font-medium text-slate-100">{roll.label}</span>}
                value={String(roll.points.at(-1)?.value ?? "—")}
                detail="Latest game rolling window (mock)"
                asOfIso={data.updatedAt}
              />
            }
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <WidgetCard title="Hawthorn stat leaders" badge="Club" footer={`Data as of ${data.updatedAt}`}>
          <LeaderTable title="Leaders" rows={data.hawthornLeaders} />
        </WidgetCard>
        <WidgetCard title="League stat leaders" badge="AFL">
          <LeaderTable title="Leaders" rows={data.leagueLeaders} />
        </WidgetCard>
      </div>
    </div>
  );
}
