import { LineTrendChart, WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { AflData } from "@/types/dashboard";

function LeaderTable({ title, rows }: { title: string; rows: { player: string; team: string; stat: string; value: number }[] }) {
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

export function AflSection() {
  const { data, status, error } = useJsonData<AflData>("afl.json");

  if (status === "loading" || status === "idle") {
    return (
      <section id="afl" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">AFL</h2>
        <WidgetCard title="AFL bundle" badge="Loading">
          <WidgetLoading />
        </WidgetCard>
      </section>
    );
  }

  if (status === "error" || !data) {
    return (
      <section id="afl" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">AFL</h2>
        <WidgetCard title="AFL bundle" badge="Error">
          <WidgetError message={error ?? undefined} />
        </WidgetCard>
      </section>
    );
  }

  const roll = data.rolling[0]?.points ?? [];

  return (
    <section id="afl" className="scroll-mt-24">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">AFL</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <WidgetCard title="Hawthorn stat leaders" subtitle="Sample leaders table" badge="Club" footer={`Updated ${data.updatedAt}`}>
          <LeaderTable title="Leaders" rows={data.hawthornLeaders} />
        </WidgetCard>
        <WidgetCard title="League stat leaders" badge="AFL">
          <LeaderTable title="Leaders" rows={data.leagueLeaders} />
        </WidgetCard>
        <WidgetCard title="Rolling metric" subtitle="Example trend — replace with your metric" badge="Trend" className="xl:col-span-2">
          <LineTrendChart data={roll} color="#7dd3fc" />
        </WidgetCard>
      </div>
    </section>
  );
}
