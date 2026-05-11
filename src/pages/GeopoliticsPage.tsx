import { MetricTrendRow } from "@/components/layout/MetricTrendRow";
import { SpotMetricBlock } from "@/components/layout/SpotMetricBlock";
import { WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { GeopoliticsData } from "@/types/dashboard";

export function GeopoliticsPage() {
  const { data, status, error } = useJsonData<GeopoliticsData>("geopolitics.json");

  if (status === "loading" || status === "idle") {
    return <WidgetLoading message="Loading geopolitics…" />;
  }

  if (status === "error" || !data) {
    return <WidgetError message={error ?? "Could not load geopolitics.json"} />;
  }

  const deskAsOf = data.updatedAt;
  const ua = data.ukraineSeries?.history90d ?? [];
  const ub = data.ukraineSeries?.history5y ?? [];
  const ta = data.trumpApprovalSeries?.history90d ?? [];
  const tb = data.trumpApprovalSeries?.history5y ?? [];

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Geopolitics</h2>
        <p className="mt-1 text-sm text-terminal-muted">Narrative metrics with optional series when your pipeline supplies them.</p>
      </header>

      <div className="rounded-lg border border-terminal-border bg-terminal-panel/60 shadow-panel">
        <MetricTrendRow
          series90={ua}
          series5y={ub}
          valueFormatter={(v) => `${v >= 0 ? "+" : ""}${v} km²`}
          left={
            <SpotMetricBlock
              title={<span className="text-sm font-medium text-slate-100">Ukraine — net territory (30d)</span>}
              value={`${data.ukraine.netSqKm30d >= 0 ? "+" : ""}${data.ukraine.netSqKm30d} km²`}
              detail={
                <>
                  <p>{data.ukraine.headline}</p>
                  <p className="mt-1">{data.ukraine.note}</p>
                </>
              }
              asOfIso={deskAsOf}
            />
          }
        />

        <MetricTrendRow
          series90={ta}
          series5y={tb}
          valueFormatter={(v) => `${v.toFixed(1)}%`}
          left={
            <SpotMetricBlock
              title={<span className="text-sm font-medium text-slate-100">Trump approval</span>}
              value={`${data.trumpApproval.value}%`}
              detail={<span>{data.trumpApproval.source}</span>}
              asOfIso={data.trumpApproval.asOf}
            />
          }
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <WidgetCard title="US midterms — stylised probabilities" badge="Demo">
          <ul className="space-y-2">
            {data.usMidterms.map((row) => (
              <li key={row.chamber} className="flex justify-between font-mono text-sm">
                <span className="text-terminal-muted">{row.chamber}</span>
                <span>
                  D {Math.round(row.partyProb.dem * 100)}% · R {Math.round(row.partyProb.gop * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="Australia federal — TPP" badge="Polling">
          <ul className="space-y-2">
            {data.auFederalPoll.map((p) => (
              <li key={p.party} className="flex justify-between font-mono text-sm">
                <span>{p.party}</span>
                <span className="text-terminal-accent">{p.tpp}%</span>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="Victoria — primary" badge="State" className="lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            {data.vicStatePoll.map((p) => (
              <div
                key={p.party}
                className="min-w-[120px] flex-1 rounded border border-terminal-border bg-terminal-bg/50 p-3 text-center"
              >
                <div className="font-mono text-xs text-terminal-muted">{p.party}</div>
                <div className="mt-1 font-mono text-xl text-slate-50">{p.primary}%</div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>

      <p className="mt-4 font-mono text-[10px] text-terminal-muted">Desk bundle {deskAsOf}</p>
    </div>
  );
}
