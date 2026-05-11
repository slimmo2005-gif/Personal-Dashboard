const BG: Record<string, string> = {
  NAB: "bg-[#c8102e] text-white",
  "NAB.AX": "bg-[#c8102e] text-white",
  COL: "bg-[#e31837] text-white",
  "COL.AX": "bg-[#e31837] text-white",
  WES: "bg-[#1b7f3a] text-white",
  "WES.AX": "bg-[#1b7f3a] text-white",
};

function shortSymbol(symbol: string): string {
  return symbol.replace(/\.AX$/i, "").toUpperCase();
}

type Props = { symbol: string; className?: string };

export function TickerBadge({ symbol, className = "" }: Props) {
  const short = shortSymbol(symbol);
  const palette = BG[symbol] ?? BG[short] ?? "bg-slate-600 text-white";

  return (
    <span
      className={`inline-flex min-w-[2.75rem] shrink-0 items-center justify-center rounded-md px-2 py-1 text-center font-sans text-xs font-bold tracking-tight ${palette} ${className}`}
    >
      {short}
    </span>
  );
}
