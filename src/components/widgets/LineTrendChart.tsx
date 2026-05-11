import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/dashboard";

type Props = {
  data: TimeSeriesPoint[];
  color?: string;
  valueFormatter?: (v: number) => string;
  /** Tailwind height class; default h-48 */
  className?: string;
};

export function LineTrendChart({ data, color = "#00d4aa", valueFormatter, className = "h-48" }: Props) {
  const chartData = data.map((d) => ({ ...d, label: d.date.slice(2, 10) }));

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a222d" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            width={44}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : String(v))}
          />
          <Tooltip
            contentStyle={{
              background: "#12161c",
              border: "1px solid #1e2630",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value, ""]}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
