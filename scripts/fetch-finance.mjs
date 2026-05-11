/**
 * Example finance pipeline: merges Yahoo-style chart quotes into public/data/finance.json.
 * ASX symbols use .AX suffix for Yahoo chart API.
 *
 * Env:
 *   PROPERTY_VALUE_AUD — optional override for house estimate (number)
 *
 * Note: Yahoo may rate-limit or block datacenter IPs; CI should tolerate failure and keep last JSON.
 */
import { publicDataDir, repoRoot } from "./lib/paths.mjs";
import { readJson, writeJson } from "./lib/io.mjs";
import path from "node:path";

const OUT = path.join(publicDataDir, "finance.json");

const SYMBOLS = [
  { yahoo: "NAB.AX", symbol: "NAB.AX", name: "National Australia Bank" },
  { yahoo: "WES.AX", symbol: "WES.AX", name: "Wesfarmers" },
  { yahoo: "COL.AX", symbol: "COL.AX", name: "Coles Group" },
];

async function fetchYahooChart(symbol, range = "3mo", interval = "1d") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "personal-dashboard-fetch/1.0",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo ${symbol}: empty result`);

  const ts = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  const close = quote?.close ?? [];
  const points = ts
    .map((t, i) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      value: close[i],
    }))
    .filter((p) => typeof p.value === "number" && !Number.isNaN(p.value));

  const meta = result.meta;
  const price = meta?.regularMarketPrice ?? points.at(-1)?.value;
  const prevClose = meta?.chartPreviousClose ?? points.at(-2)?.value;
  const changePct = price != null && prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

  return { price, changePct, history: points };
}

async function run() {
  const previous = await readJson(OUT).catch(() => null);
  const base =
    previous ?? {
      updatedAt: new Date().toISOString(),
      quotes: [],
      property: {
        address: "65 Truman St, South Kingsville VIC",
        estimateAud: 920000,
        sourceNote: "Set PROPERTY_VALUE_AUD or integrate a valuation provider.",
      },
      history: {},
    };

  const propertyValue = process.env.PROPERTY_VALUE_AUD ? Number(process.env.PROPERTY_VALUE_AUD) : base.property.estimateAud;

  const quotes = [];
  const history = { ...base.history };

  for (const s of SYMBOLS) {
    try {
      const y = await fetchYahooChart(s.yahoo);
      quotes.push({
        symbol: s.symbol,
        name: s.name,
        price: Number(y.price?.toFixed?.(2) ?? y.price),
        changePct: Number(y.changePct?.toFixed?.(2) ?? y.changePct),
        currency: "AUD",
      });
      history[s.symbol] = y.history.slice(-90);
    } catch (e) {
      console.warn(`[finance] skip ${s.symbol}:`, e.message);
      const fallback = base.quotes?.find((q) => q.symbol === s.symbol);
      if (fallback) quotes.push(fallback);
      if (base.history?.[s.symbol]) history[s.symbol] = base.history[s.symbol];
    }
  }

  const out = {
    ...base,
    updatedAt: new Date().toISOString(),
    quotes,
    property: { ...base.property, estimateAud: propertyValue },
    history,
  };

  await writeJson(OUT, out);
  console.log(`[finance] wrote ${path.relative(repoRoot, OUT)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
