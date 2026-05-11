/**
 * Share price pipeline → public/data/finance.json
 *
 * - Watchlist: scripts/config/finance-watchlist.json (edit to add/remove tickers)
 * - Provider: Yahoo Finance chart API v8 (unofficial; may rate-limit datacentre IPs)
 * - Writes: quotes (with asOf), history / history90d / history5y, sharePricePipeline audit
 *
 * Env:
 *   PROPERTY_VALUE_AUD — optional override for house estimate (number)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicDataDir, repoRoot } from "./lib/paths.mjs";
import { readJson, writeJson } from "./lib/io.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(publicDataDir, "finance.json");
const WATCHLIST = path.join(__dirname, "config", "finance-watchlist.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(label, fn, { retries = 3, baseDelayMs = 400 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const wait = baseDelayMs * 2 ** attempt;
      console.warn(`[finance] ${label} attempt ${attempt + 1}/${retries} failed: ${e.message} — retry in ${wait}ms`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function fetchYahooChart(symbol, range = "3mo", interval = "1d") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; personal-dashboard-fetch/1.1)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("empty chart result");

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

function loadWatchlist() {
  const raw = fs.readFileSync(WATCHLIST, "utf8");
  const j = JSON.parse(raw);
  const symbols = j.symbols;
  if (!Array.isArray(symbols) || !symbols.length) throw new Error("finance-watchlist.json: missing symbols[]");
  for (const s of symbols) {
    if (!s.yahoo || !s.symbol || !s.name) throw new Error("finance-watchlist.json: each symbol needs yahoo, symbol, name");
  }
  return symbols;
}

async function run() {
  const symbols = loadWatchlist();
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
  const nowIso = new Date().toISOString();

  const quotes = [];
  const history = { ...base.history };
  const history90d = { ...(base.history90d ?? {}) };
  const history5y = { ...(base.history5y ?? {}) };
  const perSymbol = {};

  for (const s of symbols) {
    await sleep(400);

    const run = {
      yahoo: s.yahoo,
      fetchedAt: nowIso,
      quoteOk: false,
      history90dOk: false,
      history5yOk: false,
      errors: [],
    };

    let y90 = null;
    let y5 = null;

    try {
      y90 = await withRetry(`${s.symbol} 90d`, () => fetchYahooChart(s.yahoo, "3mo", "1d"));
      run.history90dOk = true;
    } catch (e) {
      run.errors.push(`90d: ${e.message}`);
      console.warn(`[finance] ${s.symbol} 90d:`, e.message);
    }

    try {
      await sleep(400);
      y5 = await withRetry(`${s.symbol} 5y`, () => fetchYahooChart(s.yahoo, "5y", "1wk"));
      run.history5yOk = true;
    } catch (e) {
      run.errors.push(`5y: ${e.message}`);
      console.warn(`[finance] ${s.symbol} 5y:`, e.message);
    }

    const livePx = y90?.price ?? y90?.history?.at(-1)?.value;
    if (y90 && livePx != null && !Number.isNaN(Number(livePx))) {
      const px = Number(Number(livePx).toFixed(2));
      quotes.push({
        symbol: s.symbol,
        name: s.name,
        price: px,
        changePct: Number((y90.changePct ?? 0).toFixed(2)),
        currency: "AUD",
        asOf: nowIso,
      });
      run.quoteOk = true;
      const h90 = y90.history.slice(-90);
      history[s.symbol] = h90;
      history90d[s.symbol] = h90;
    } else {
      const fallback = base.quotes?.find((q) => q.symbol === s.symbol);
      if (fallback) {
        quotes.push({ ...fallback, asOf: fallback.asOf ?? base.updatedAt });
        run.errors.push("quote: using previous snapshot");
      } else {
        run.errors.push("quote: no live data and no prior snapshot");
      }
      if (base.history?.[s.symbol]) history[s.symbol] = base.history[s.symbol];
      if (base.history90d?.[s.symbol]) history90d[s.symbol] = base.history90d[s.symbol];
    }

    if (y5?.history?.length) {
      history5y[s.symbol] = y5.history;
    } else if (base.history5y?.[s.symbol]) {
      history5y[s.symbol] = base.history5y[s.symbol];
      if (!run.history5yOk) run.errors.push("5y: using previous series");
    }

    if (y90?.history?.length && !history90d[s.symbol]) {
      const h90 = y90.history.slice(-90);
      history90d[s.symbol] = h90;
      history[s.symbol] = h90;
      run.history90dOk = true;
    }

    perSymbol[s.symbol] = run;
  }

  const out = {
    ...base,
    updatedAt: nowIso,
    quotes,
    property: { ...base.property, estimateAud: propertyValue, asOf: nowIso },
    history,
    history90d,
    history5y,
    sharePricePipeline: {
      provider: "yahoo-finance-chart-v8",
      fetchedAt: nowIso,
      watchlist: "scripts/config/finance-watchlist.json",
      perSymbol,
    },
  };

  await writeJson(OUT, out);
  console.log(`[finance] wrote ${path.relative(repoRoot, OUT)} (${quotes.length} quotes)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
