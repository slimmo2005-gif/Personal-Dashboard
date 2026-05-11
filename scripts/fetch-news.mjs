/**
 * Example news pipeline: Reddit JSON + naive RSS parse (no extra deps).
 * Merges into public/data/news.json while preserving manual fields when fetch fails.
 */
import path from "node:path";
import { publicDataDir, repoRoot } from "./lib/paths.mjs";
import { readJson, writeJson } from "./lib/io.mjs";

const OUT = path.join(publicDataDir, "news.json");

function extractRssItems(xml, limit = 8) {
  const items = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) && items.length < limit) {
    const block = m[0];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] ?? block.match(/<title>(.*?)<\/title>/i)?.[1];
    const link = block.match(/<link>(.*?)<\/link>/i)?.[1];
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1];
    if (title && link) {
      items.push({
        id: `rss:${link}`.slice(0, 120),
        title: title.trim().replace(/&amp;/g, "&"),
        url: link.trim(),
        source: "RSS",
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        topics: ["rss"],
      });
    }
  }
  return items;
}

async function fetchReddit(sub, limit = 6) {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "personal-dashboard-fetch/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit ${sub}: ${res.status}`);
  const j = await res.json();
  const children = j.data?.children ?? [];
  return children
    .map((c, i) => {
      const d = c.data;
      if (!d?.title) return null;
      return {
        id: d.id ?? `rd-${i}`,
        title: d.title,
        url: `https://reddit.com${d.permalink}`,
        source: `r/${sub}`,
        publishedAt: new Date((d.created_utc ?? 0) * 1000).toISOString(),
        topics: (d.link_flair_text ? [String(d.link_flair_text).toLowerCase()] : ["reddit"]).slice(0, 3),
      };
    })
    .filter(Boolean);
}

export async function run() {
  const base = await readJson(OUT).catch(() => ({
    updatedAt: new Date().toISOString(),
    reddit: [],
    rss: [],
    trendingTopics: [],
    summaries: [],
    savedGroups: [],
  }));

  let reddit = base.reddit;
  try {
    const aus = await fetchReddit("ausfinance", 5);
    const geo = await fetchReddit("geopolitics", 4);
    reddit = [...aus, ...geo].slice(0, 12);
  } catch (e) {
    console.warn("[news] reddit failed:", e.message);
  }

  let rss = base.rss;
  try {
    const feedUrl = "https://feeds.bbci.co.uk/news/world/rss.xml";
    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    rss = extractRssItems(xml, 8).map((x) => ({ ...x, source: "BBC World" }));
  } catch (e) {
    console.warn("[news] rss failed:", e.message);
  }

  const out = {
    ...base,
    updatedAt: new Date().toISOString(),
    reddit,
    rss,
  };

  await writeJson(OUT, out);
  console.log(`[news] wrote ${path.relative(repoRoot, OUT)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
