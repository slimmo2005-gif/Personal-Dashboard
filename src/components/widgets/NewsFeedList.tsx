import type { NewsItem } from "@/types/dashboard";

export function NewsFeedList({ items, emptyLabel }: { items: NewsItem[]; emptyLabel?: string }) {
  if (!items.length) {
    return <p className="font-mono text-xs text-terminal-muted">{emptyLabel ?? "No items"}</p>;
  }

  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id} className="rounded border border-terminal-border bg-terminal-bg/40 p-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 text-sm font-medium text-slate-100 hover:text-terminal-accent"
          >
            {item.title}
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-terminal-muted">
            <span>{item.source}</span>
            <span>{item.publishedAt}</span>
            {item.topics.map((t) => (
              <span key={t} className="rounded bg-terminal-panel px-1.5 py-0.5 text-terminal-accent">
                {t}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
