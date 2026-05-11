import { MetricTrendRow } from "@/components/layout/MetricTrendRow";
import { SpotMetricBlock } from "@/components/layout/SpotMetricBlock";
import { WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { MacroData, MacroIndicator, MacroSpot } from "@/types/dashboard";

function spotFormatter(unit: string) {
  if (unit === "rate") return (v: number) => v.toFixed(4);
  if (unit === "USD/bbl") return (v: number) => v.toFixed(2);
  return (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function rowForSpot(s: MacroSpot, bundleUpdated: string) {
  const asOf = s.asOf ?? bundleUpdated;
  const fmt = spotFormatter(s.unit);
  const delta =
    s.change24hPct != null ? (
      <span className={s.change24hPct >= 0 ? "text-terminal-accent" : "text-terminal-danger"}>
        {s.change24hPct >= 0 ? "+" : ""}
        {s.change24hPct.toFixed(2)}% vs prior close
      </span>
    ) : undefined;

  const valueStr = s.unit === "rate" ? fmt(s.value) : `${fmt(s.value)} ${s.unit}`;

  return (
    <MetricTrendRow
      key={s.id ?? s.label}
      series90={s.history90d ?? []}
      series5y={s.history5y ?? []}
      valueFormatter={fmt}
      left={
        <SpotMetricBlock
          title={<span className="text-sm font-medium text-slate-100">{s.label}</span>}
          value={valueStr}
          detail={delta}
          asOfIso={asOf}
        />
      }
    />
  );
}

function rowForIndicator(i: MacroIndicator, bundleUpdated: string) {
  const asOf = i.asOf ?? bundleUpdated;
  return (
    <MetricTrendRow
      key={i.name}
      series90={i.history90d ?? []}
      series5y={i.history5y ?? []}
      valueFormatter={(v) => v.toFixed(2)}
      left={
        <SpotMetricBlock
          title={<span className="text-sm font-medium text-slate-100">{i.name}</span>}
          value={`${i.value}${i.unit}`}
          detail={<span className="text-terminal-muted">{i.period}</span>}
          asOfIso={asOf}
        />
      }
    />
  );
}

export function MacroPage() {
  const { data, status, error } = useJsonData<MacroData>("macro.json");

  if (status === "loading" || status === "idle") {
    return <WidgetLoading message="Loading macro…" />;
  }

  if (status === "error" || !data) {
    return <WidgetError message={error ?? "Could not load macro.json"} />;
  }

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Commercial / macro</h2>
        <p className="mt-1 text-sm text-terminal-muted">Spot board and Australia activity — same layout per metric.</p>
      </header>

      <div className="rounded-lg border border-terminal-border bg-terminal-panel/60 shadow-panel">
        {data.spots.map((s) => rowForSpot(s, data.updatedAt))}
        {data.indicators.map((i) => rowForIndicator(i, data.updatedAt))}
      </div>

      <p className="mt-4 font-mono text-[10px] text-terminal-muted">Bundle timestamp {data.updatedAt}</p>

      <WidgetCard title="Notes" badge="Desk" className="mt-6">
        <p className="text-sm text-terminal-muted">
          Indicator histories are illustrative until you wire ABS / RBA series IDs in the fetch pipeline. Oil leg uses WTI (CL=F) as a liquid companion to Brent (BZ=F).
        </p>
      </WidgetCard>
    </div>
  );
}
