import { WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { GeopoliticsData } from "@/types/dashboard";

export function GeopoliticsSection() {
  const { data, status, error } = useJsonData<GeopoliticsData>("geopolitics.json");

  if (status === "loading" || status === "idle") {
    return (
      <section id="geopolitics" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Geopolitics</h2>
        <WidgetCard title="Geopolitics bundle" badge="Loading">
          <WidgetLoading />
        </WidgetCard>
      </section>
    );
  }

  if (status === "error" || !data) {
    return (
      <section id="geopolitics" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Geopolitics</h2>
        <WidgetCard title="Geopolitics bundle" badge="Error">
          <WidgetError message={error ?? undefined} />
        </WidgetCard>
      </section>
    );
  }

  return (
    <section id="geopolitics" className="scroll-mt-24">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">Geopolitics</h2>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <WidgetCard title="Ukraine — territory" subtitle="Illustrative delta" badge="Map desk">
          <p className="text-sm text-slate-200">{data.ukraine.headline}</p>
          <p className="mt-3 font-mono text-2xl text-terminal-accent">
            {data.ukraine.netSqKm30d >= 0 ? "+" : ""}
            {data.ukraine.netSqKm30d} km²
          </p>
          <p className="mt-2 text-xs text-terminal-muted">{data.ukraine.note}</p>
        </WidgetCard>
        <WidgetCard title="Trump approval" subtitle={data.trumpApproval.source} badge="Polling">
          <p className="font-mono text-4xl text-slate-50">{data.trumpApproval.value}%</p>
          <p className="mt-2 text-xs text-terminal-muted">As of {data.trumpApproval.asOf}</p>
        </WidgetCard>
        <WidgetCard title="US midterms — markets-style probs" subtitle="Demo only" badge="Elections">
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
        <WidgetCard title="Australia federal — TPP" badge="Newspoll mock">
          <ul className="space-y-2">
            {data.auFederalPoll.map((p) => (
              <li key={p.party} className="flex justify-between font-mono text-sm">
                <span>{p.party}</span>
                <span className="text-terminal-accent">{p.tpp}%</span>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="Victoria — primary" badge="State" className="xl:col-span-2">
          <div className="flex flex-wrap gap-3">
            {data.vicStatePoll.map((p) => (
              <div key={p.party} className="min-w-[120px] flex-1 rounded border border-terminal-border bg-terminal-bg/50 p-3 text-center">
                <div className="font-mono text-xs text-terminal-muted">{p.party}</div>
                <div className="mt-1 font-mono text-xl text-slate-50">{p.primary}%</div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
      <p className="mt-2 font-mono text-[10px] text-terminal-muted">Bundle updated {data.updatedAt}</p>
    </section>
  );
}
