import type { ReactNode } from "react";
import { LineTrendChart } from "@/components/widgets";
import type { TimeSeriesPoint } from "@/types/dashboard";

type Props = {
  left: ReactNode;
  series90: TimeSeriesPoint[];
  series5y: TimeSeriesPoint[];
  color?: string;
  valueFormatter?: (v: number) => string;
};

function ChartColumn({ title, data, color, valueFormatter }: { title: string; data: TimeSeriesPoint[]; color?: string; valueFormatter?: (v: number) => string }) {
  const has = data.length > 1;

  return (
    <div className="flex min-h-[11rem] flex-col rounded-md border border-terminal-border bg-terminal-bg/40 p-2">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-terminal-muted">{title}</div>
      {has ? (
        <LineTrendChart data={data} color={color} valueFormatter={valueFormatter} className="min-h-[9.5rem] flex-1" />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded border border-dashed border-terminal-border/80 px-2 text-center font-mono text-[11px] text-terminal-muted">
          No history for this window
        </div>
      )}
    </div>
  );
}

export function MetricTrendRow({ left, series90, series5y, color, valueFormatter }: Props) {
  return (
    <div className="grid gap-3 border-b border-terminal-border py-5 last:border-b-0 md:grid-cols-[minmax(200px,280px)_minmax(0,1fr)_minmax(0,1fr)] md:items-stretch md:gap-4">
      <div className="flex flex-col justify-center">{left}</div>
      <ChartColumn title="90-day history" data={series90} color={color} valueFormatter={valueFormatter} />
      <ChartColumn title="5-year history" data={series5y} color={color} valueFormatter={valueFormatter} />
    </div>
  );
}
