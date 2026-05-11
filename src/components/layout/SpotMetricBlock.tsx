import type { ReactNode } from "react";
import { formatSpotAge } from "@/lib/formatSpotAge";

type Props = {
  /** e.g. ticker + company row */
  title: ReactNode;
  value: string;
  detail?: ReactNode;
  asOfIso: string;
};

export function SpotMetricBlock({ title, value, detail, asOfIso }: Props) {
  return (
    <div className="space-y-2">
      <div>{title}</div>
      <div className="font-mono text-2xl tabular-nums tracking-tight text-slate-50">{value}</div>
      {detail ? <div className="text-xs leading-snug text-terminal-muted">{detail}</div> : null}
      <div className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
        Spot data · <span className="text-terminal-accent">{formatSpotAge(asOfIso)}</span>
        <span className="ml-2 normal-case text-terminal-muted/70">({new Date(asOfIso).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })})</span>
      </div>
    </div>
  );
}
