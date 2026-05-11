import { LineTrendChart, StatGrid, WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { FinanceData } from "@/types/dashboard";

function fmtAud(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
}

export function FinanceSection() {
  const { data, status, error } = useJsonData<FinanceData>("finance.json");

  if (status === "loading" || status === "idle") {
    return (
      <section id="finance" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Personal finance</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <WidgetCard title="Equities" badge="ASX">
            <WidgetLoading />
          </WidgetCard>
        </div>
      </section>
    );
  }

  if (status === "error" || !data) {
    return (
      <section id="finance" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Personal finance</h2>
        <WidgetCard title="Finance bundle" badge="Error">
          <WidgetError message={error ?? undefined} />
        </WidgetCard>
      </section>
    );
  }

  const nab = data.history["NAB.AX"] ?? [];
  const quoteStats = data.quotes.map((q) => ({
    label: q.symbol,
    value: fmtAud(q.price),
    delta: `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%`,
    deltaPositive: q.changePct >= 0,
  }));

  return (
    <section id="finance" className="scroll-mt-24">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Personal finance</h2>
      <div className="grid gap-4 xl:grid-cols-3">
        <WidgetCard title="Watchlist" subtitle="NAB · WES · COL" badge="ASX" footer={`Updated ${data.updatedAt}`}>
          <StatGrid stats={quoteStats} />
        </WidgetCard>
        <WidgetCard title="Property estimate" subtitle={data.property.address} badge="Valuation">
          <div className="space-y-3">
            <p className="font-mono text-3xl text-slate-50">{fmtAud(data.property.estimateAud)}</p>
            <p className="text-xs text-terminal-muted">{data.property.sourceNote}</p>
          </div>
        </WidgetCard>
        <WidgetCard title="NAB — 90d" subtitle="Sample series from pipeline" badge="Chart">
          <LineTrendChart data={nab} valueFormatter={(v) => v.toFixed(2)} />
        </WidgetCard>
      </div>
    </section>
  );
}
