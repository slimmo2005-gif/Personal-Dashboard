/**
 * Example macro pipeline: Frankfurter (FX) + Yahoo commodities where reachable.
 * Writes public/data/macro.json
 */
import path from "node:path";
import { publicDataDir, repoRoot } from "./lib/paths.mjs";
import { readJson, writeJson } from "./lib/io.mjs";

const OUT = path.join(publicDataDir, "macro.json");

async function frankfurterLatest() {
  const res = await fetch("https://api.frankfurter.app/latest?from=AUD&to=USD");
  if (!res.ok) throw new Error(`Frankfurter latest: ${res.status}`);
  const j = await res.json();
  const rate = j.rates?.USD;
  if (typeof rate !== "number") throw new Error("Frankfurter: missing USD rate");
  return rate;
}

async function frankfurterSeries(start, end) {
  const res = await fetch(`https://api.frankfurter.app/${start}..${end}?from=AUD&to=USD`);
  if (!res.ok) throw new Error(`Frankfurter series: ${res.status}`);
  const j = await res.json();
  const rates = j.rates ?? {};
  return Object.entries(rates)
    .map(([date, v]) => ({ date, value: v.USD }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function yahooSpot(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "personal-dashboard-fetch/1.0", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`);
  const json = await res.json();
  const meta = json.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose;
  const change24hPct = price != null && prev ? ((price - prev) / prev) * 100 : undefined;
  return { price, change24hPct };
}

export async function run() {
  const previous = await readJson(OUT).catch(() => null);
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  let audUsd = previous?.spots?.find((s) => s.label.includes("AUD/USD"))?.value ?? 0.65;
  let audSeries = previous?.series?.find((s) => s.label.includes("AUD"))?.points ?? [];

  try {
    audUsd = await frankfurterLatest();
  } catch (e) {
    console.warn("[macro] frankfurter latest failed:", e.message);
  }

  try {
    audSeries = await frankfurterSeries(startStr, endStr);
  } catch (e) {
    console.warn("[macro] frankfurter series failed:", e.message);
  }

  let gold = { price: 2348, change: 0.3 };
  let brentSpot = { price: 78, change: -0.4 };
  let brentFut = { price: 79, change: -0.3 };

  try {
    const g = await yahooSpot("GC=F");
    if (g.price != null) gold = { price: g.price, change: g.change24hPct ?? 0 };
  } catch (e) {
    console.warn("[macro] gold fetch failed:", e.message);
  }
  try {
    const b = await yahooSpot("BZ=F");
    if (b.price != null) brentSpot = { price: b.price, change: b.change24hPct ?? 0 };
  } catch (e) {
    console.warn("[macro] brent spot fetch failed:", e.message);
  }
  try {
    // Companion crude leg (WTI). Swap to your vendor’s true Brent deferred contract if needed.
    const f = await yahooSpot("CL=F");
    if (f.price != null) brentFut = { price: f.price, change: f.change24hPct ?? 0 };
  } catch (e) {
    console.warn("[macro] WTI fetch failed:", e.message);
    const prevOil = previous?.spots?.find((s) => s.label.includes("WTI"));
    if (prevOil?.value != null) {
      brentFut = { price: prevOil.value, change: prevOil.change24hPct ?? 0 };
    }
  }

  const indicators =
    previous?.indicators ?? [
      { name: "CPI YoY (AU)", "value": 3.4, "unit": "%", "period": "manual / ABS" },
      { name: "GDP growth (AU)", "value": 1.8, "unit": "% YoY", "period": "manual / ABS" },
      { name: "Unemployment (AU)", "value": 4.1, "unit": "%", "period": "manual / ABS" },
    ];

  const nowIso = new Date().toISOString();
  const nextSpots = [
    { label: "Gold spot (USD/oz)", value: Number(gold.price.toFixed(2)), unit: "USD", change24hPct: gold.change },
    { label: "Brent spot (BZ=F)", value: Number(brentSpot.price.toFixed(2)), unit: "USD/bbl", change24hPct: brentSpot.change },
    { label: "WTI benchmark (CL=F)", value: Number(brentFut.price.toFixed(2)), unit: "USD/bbl", change24hPct: brentFut.change },
    { label: "AUD/USD", value: Number(audUsd.toFixed(4)), unit: "rate", change24hPct: undefined },
  ];

  const spots = nextSpots.map((s, idx) => {
    const prev = previous?.spots?.find((p) => p.label === s.label) ?? {};
    return {
      ...prev,
      ...s,
      id: prev.id ?? `m${idx}`,
      asOf: nowIso,
      history90d: prev.history90d,
      history5y: prev.history5y,
    };
  });

  const out = {
    ...(previous ?? {}),
    updatedAt: nowIso,
    spots,
    series: [{ label: "AUD/USD (Frankfurter)", unit: "rate", points: audSeries }],
    indicators: indicators.map((ind) => {
      const p = previous?.indicators?.find((x) => x.name === ind.name) ?? {};
      return { ...p, ...ind, asOf: nowIso, history90d: p.history90d, history5y: p.history5y };
    }),
  };

  await writeJson(OUT, out);
  console.log(`[macro] wrote ${path.relative(repoRoot, OUT)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
