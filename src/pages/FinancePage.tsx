import { MetricTrendRow } from "@/components/layout/MetricTrendRow";
import { SpotMetricBlock } from "@/components/layout/SpotMetricBlock";
import { TickerBadge } from "@/components/ui/TickerBadge";
import { WidgetError, WidgetLoading } from "@/components/widgets";
import { formatSpotAge } from "@/lib/formatSpotAge";
import { useJsonData } from "@/lib/useJsonData";
import type { FinanceData } from "@/types/dashboard";

function fmtAud(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FinancePage() {
  const { data, status, error } = useJsonData<FinanceData>("finance.json");

  if (status === "loading" || status === "idle") {
    return <WidgetLoading message="Loading finance…" />;
  }

  if (status === "error" || !data) {
    return <WidgetError message={error ?? "Could not load finance.json"} />;
  }

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Personal finance</h2>
        <p className="mt-1 text-sm text-terminal-muted">ASX watchlist, valuation, and dual horizons per metric.</p>
        {data.sharePricePipeline ? (
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-terminal-muted">
            Share price pipeline: <span className="text-terminal-accent">{data.sharePricePipeline.provider}</span> · last run{" "}
            <span className="text-slate-300">{formatSpotAge(data.sharePricePipeline.fetchedAt)}</span>
            {" · "}
            {Object.entries(data.sharePricePipeline.perSymbol).map(([sym, r]) => (
              <span key={sym} className="mr-2 inline-block">
                {sym.replace(/\.AX$/i, "")}:{" "}
                {r.quoteOk ? "quote ✓" : "quote …"}
                {r.history90dOk ? " 90d ✓" : ""}
                {r.history5yOk ? " 5y ✓" : ""}
                {r.errors.length ? ` (${r.errors.join("; ")})` : ""}
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="rounded-lg border border-terminal-border bg-terminal-panel/60 shadow-panel">
        {data.quotes.map((q) => {
          const s90 = data.history90d?.[q.symbol] ?? data.history[q.symbol] ?? [];
          const s5 = data.history5y?.[q.symbol] ?? [];
          const asOf = q.asOf ?? data.updatedAt;
          const up = q.changePct >= 0;
          return (
            <MetricTrendRow
              key={q.symbol}
              series90={s90}
              series5y={s5}
              valueFormatter={(v) => v.toFixed(2)}
              left={
                <SpotMetricBlock
                  title={
                    <div className="flex items-center gap-3">
                      <TickerBadge symbol={q.symbol} />
                      <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-100">{q.name}</span>
                    </div>
                  }
                  value={fmtAud(q.price)}
                  detail={
                    <span className={up ? "text-terminal-accent" : "text-terminal-danger"}>
                      {up ? "+" : ""}
                      {q.changePct.toFixed(2)}% session
                    </span>
                  }
                  asOfIso={asOf}
                />
              }
            />
          );
        })}

        <MetricTrendRow
          series90={data.property.history90d ?? []}
          series5y={data.property.history5y ?? []}
          valueFormatter={(v) => fmtAud(v)}
          left={
            <SpotMetricBlock
              title={<span className="text-sm font-medium text-slate-100">Property estimate</span>}
              value={fmtAud(data.property.estimateAud)}
              detail={
                <>
                  <div>{data.property.address}</div>
                  <div className="mt-1">{data.property.sourceNote}</div>
                </>
              }
              asOfIso={data.property.asOf ?? data.updatedAt}
            />
          }
        />
      </div>
    </div>
  );
}
