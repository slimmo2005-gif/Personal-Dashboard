import { LineTrendChart, StatGrid, WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { MacroData } from "@/types/dashboard";

export function MacroSection() {
  const { data, status, error } = useJsonData<MacroData>("macro.json");

  if (status === "loading" || status === "idle") {
    return (
      <section id="macro" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Commercial / macro</h2>
        <WidgetCard title="Macro bundle" badge="Loading">
          <WidgetLoading />
        </WidgetCard>
      </section>
    );
  }

  if (status === "error" || !data) {
    return (
      <section id="macro" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Commercial / macro</h2>
        <WidgetCard title="Macro bundle" badge="Error">
          <WidgetError message={error ?? undefined} />
        </WidgetCard>
      </section>
    );
  }

  const spotStats = data.spots.map((s) => ({
    label: s.label,
    value: `${s.value.toLocaleString()} ${s.unit}`,
    delta: s.change24hPct != null ? `${s.change24hPct >= 0 ? "+" : ""}${s.change24hPct.toFixed(2)}%` : undefined,
    deltaPositive: s.change24hPct == null ? undefined : s.change24hPct >= 0,
  }));

  const audSeries = data.series.find((s) => s.label.includes("AUD"))?.points ?? [];

  return (
    <section id="macro" className="scroll-mt-24">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Commercial / macro</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard title="Spot board" subtitle="Gold · Oil · FX" badge="Live desk" footer={`Updated ${data.updatedAt}`}>
          <StatGrid stats={spotStats} />
        </WidgetCard>
        <WidgetCard title="Australia — activity" subtitle="Headline indicators" badge="ABS / RBA">
          <ul className="space-y-2">
            {data.indicators.map((i) => (
              <li
                key={i.name}
                className="flex items-center justify-between rounded border border-terminal-border bg-terminal-bg/50 px-3 py-2 font-mono text-sm"
              >
                <span className="text-terminal-muted">{i.name}</span>
                <span className="text-slate-50">
                  {i.value}
                  {i.unit}
                  <span className="ml-2 text-[10px] text-terminal-muted">{i.period}</span>
                </span>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="AUD/USD" subtitle="Sample trend" badge="FX" className="lg:col-span-2">
          <LineTrendChart data={audSeries} color="#f5a623" valueFormatter={(v) => v.toFixed(4)} />
        </WidgetCard>
      </div>
    </section>
  );
}
