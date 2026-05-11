import { NewsFeedList, WidgetCard, WidgetError, WidgetLoading } from "@/components/widgets";
import { useJsonData } from "@/lib/useJsonData";
import type { NewsData } from "@/types/dashboard";

export function NewsSection() {
  const { data, status, error } = useJsonData<NewsData>("news.json");

  if (status === "loading" || status === "idle") {
    return (
      <section id="news" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">News intelligence</h2>
        <WidgetCard title="News bundle" badge="Loading">
          <WidgetLoading />
        </WidgetCard>
      </section>
    );
  }

  if (status === "error" || !data) {
    return (
      <section id="news" className="scroll-mt-24">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">News intelligence</h2>
        <WidgetCard title="News bundle" badge="Error">
          <WidgetError message={error ?? undefined} />
        </WidgetCard>
      </section>
    );
  }

  return (
    <section id="news" className="scroll-mt-24">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-terminal-muted">News intelligence</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <WidgetCard title="Reddit ingest" subtitle="Curated mock items" badge="Social" footer={`Updated ${data.updatedAt}`}>
          <NewsFeedList items={data.reddit} />
        </WidgetCard>
        <WidgetCard title="RSS ingest" subtitle="Headlines" badge="Feeds">
          <NewsFeedList items={data.rss} />
        </WidgetCard>
        <WidgetCard title="Trending topics" subtitle="Scores are illustrative" badge="NLP">
          <ul className="flex flex-wrap gap-2">
            {data.trendingTopics.map((t) => (
              <li
                key={t.topic}
                className="rounded-full border border-terminal-border bg-terminal-bg/60 px-3 py-1 font-mono text-xs text-slate-100"
              >
                {t.topic}{" "}
                <span className="text-terminal-muted">({t.score})</span>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="Saved topic groups" subtitle="Filter presets for downstream AI" badge="Groups">
          <ul className="space-y-2">
            {data.savedGroups.map((g) => (
              <li key={g.id} className="rounded border border-terminal-border bg-terminal-bg/40 px-3 py-2">
                <div className="font-mono text-sm text-slate-100">{g.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {g.topics.map((t) => (
                    <span key={t} className="rounded bg-terminal-panel px-1.5 py-0.5 font-mono text-[10px] text-terminal-accent">
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </WidgetCard>
        <WidgetCard title="AI summaries" subtitle="Stub — wire to your model in CI" badge="Summaries" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            {data.summaries.map((s) => (
              <div key={s.topicGroup} className="rounded border border-terminal-border bg-terminal-bg/40 p-3">
                <div className="font-mono text-xs uppercase tracking-wider text-terminal-muted">{s.topicGroup}</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-200">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <p className="mt-2 font-mono text-[10px] text-terminal-muted">As of {s.asOf}</p>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </section>
  );
}
