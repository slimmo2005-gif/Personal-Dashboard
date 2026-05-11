/**
 * One-off / optional: fills history90d & history5y for sample JSON when APIs are cold.
 * Run: node scripts/seed-chart-history.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { publicDataDir } from "./lib/paths.mjs";

function daysFrom(startIso, count, stepDays) {
  const out = [];
  const d0 = new Date(startIso);
  for (let i = 0; i < count; i++) {
    const d = new Date(d0);
    d.setUTCDate(d0.getUTCDate() + i * stepDays);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function seedFinance() {
  const fp = path.join(publicDataDir, "finance.json");
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  const names = {
    "NAB.AX": "National Australia Bank Ltd",
    "WES.AX": "Wesfarmers Limited",
    "COL.AX": "Coles Group Ltd",
  };
  j.quotes = (j.quotes ?? []).map((q) => ({
    ...q,
    name: names[q.symbol] ?? q.name,
    asOf: q.asOf ?? j.updatedAt,
  }));
  j.property = { ...j.property, asOf: j.property?.asOf ?? j.updatedAt };

  const syms = ["NAB.AX", "WES.AX", "COL.AX"];
  j.history90d = j.history90d ?? {};
  j.history5y = j.history5y ?? {};
  for (const sym of syms) {
    const anchor = j.history?.[sym]?.at(-1)?.value ?? 20;
    const dates90 = daysFrom("2026-02-11T00:00:00Z", 90, 1);
    j.history90d[sym] = dates90.map((date, i) => ({
      date,
      value: Number((anchor + Math.sin(i / 9) * 1.2 + (i / 90) * 0.8).toFixed(2)),
    }));
    const dates5y = daysFrom("2021-05-12T00:00:00Z", 260, 7);
    j.history5y[sym] = dates5y.map((date, i) => ({
      date,
      value: Number((anchor * 0.82 + (i / 260) * anchor * 0.25 + Math.sin(i / 11) * 2).toFixed(2)),
    }));
  }
  const est = j.property?.estimateAud ?? 920000;
  const d90 = daysFrom("2026-02-11T00:00:00Z", 90, 1);
  j.property.history90d = d90.map((date, i) => ({
    date,
    value: Math.round(est * (0.97 + (i / 90) * 0.04) + Math.sin(i / 13) * 4000),
  }));
  const d5 = daysFrom("2021-05-12T00:00:00Z", 260, 7);
  j.property.history5y = d5.map((date, i) => ({
    date,
    value: Math.round(est * (0.88 + (i / 260) * 0.12) + Math.sin(i / 9) * 12000),
  }));

  fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  console.log("seeded", path.relative(process.cwd(), fp));
}

function seedMacro() {
  const fp = path.join(publicDataDir, "macro.json");
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  const updatedAt = j.updatedAt;
  const dates90 = daysFrom("2026-02-11T00:00:00Z", 90, 1);
  const dates5y = daysFrom("2021-05-12T00:00:00Z", 260, 7);
  j.spots = (j.spots ?? []).map((s, idx) => {
    const id = `m${idx}`;
    const v = Number(s.value);
    return {
      ...s,
      id,
      asOf: s.asOf ?? updatedAt,
      history90d: dates90.map((date, i) => ({
        date,
        value: Number((v * (0.96 + (i / 90) * 0.06) + Math.sin(i / 7 + idx) * (v * 0.012)).toFixed(s.unit === "rate" ? 4 : 2)),
      })),
      history5y: dates5y.map((date, i) => ({
        date,
        value: Number((v * (0.78 + (i / 260) * 0.28) + Math.sin(i / 9 + idx) * (v * 0.03)).toFixed(s.unit === "rate" ? 4 : 2)),
      })),
    };
  });
  const aud = j.spots?.find((s) => s.label.includes("AUD/USD"));
  const audPts = j.series?.find((x) => x.label.includes("AUD"))?.points ?? [];
  if (aud && audPts.length > 2) {
    aud.history90d = audPts;
    const last = audPts.at(-1)?.value ?? aud.value;
    aud.history5y = daysFrom("2021-06-01T00:00:00Z", 200, 9).map((date, i) => ({
      date,
      value: Number((last * 0.9 + (i / 200) * last * 0.12 + Math.sin(i / 6) * 0.02).toFixed(4)),
    }));
  }
  j.indicators = (j.indicators ?? []).map((ind, idx) => {
    const v = Number(ind.value);
    return {
      ...ind,
      asOf: ind.asOf ?? updatedAt,
      history90d: dates90.map((date, i) => ({
        date,
        value: Number((v + Math.sin(i / 11 + idx) * 0.12 + (i / 90) * 0.05).toFixed(2)),
      })),
      history5y: dates5y.map((date, i) => ({
        date,
        value: Number((v * 0.85 + (i / 260) * v * 0.25 + Math.sin(i / 13 + idx) * 0.35).toFixed(2)),
      })),
    };
  });
  fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  console.log("seeded", path.relative(process.cwd(), fp));
}

function seedAfl() {
  const fp = path.join(publicDataDir, "afl.json");
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  const roll = j.rolling?.[0];
  if (roll) {
    const anchor = roll.points?.at(-1)?.value ?? 80;
    const dates90 = daysFrom("2026-02-15T00:00:00Z", 18, 5);
    roll.history90d = dates90.map((date, i) => ({
      date,
      value: Math.round(anchor + Math.sin(i) * 8 + i * 0.4),
    }));
    const dates5y = daysFrom("2021-04-01T00:00:00Z", 80, 28);
    roll.history5y = dates5y.map((date, i) => ({
      date,
      value: Math.round(72 + (i / 80) * 18 + Math.sin(i / 3) * 6),
    }));
  }
  fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  console.log("seeded", path.relative(process.cwd(), fp));
}

function seedGeo() {
  const fp = path.join(publicDataDir, "geopolitics.json");
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  const dates90 = daysFrom("2026-02-12T00:00:00Z", 24, 4);
  j.trumpApprovalSeries = {
    history90d: dates90.map((date, i) => ({
      date,
      value: Number((44 + Math.sin(i / 4) * 2.5 + (i / 24) * 0.6).toFixed(1)),
    })),
    history5y: daysFrom("2021-06-01T00:00:00Z", 60, 30).map((date, i) => ({
      date,
      value: Number((38 + (i / 60) * 8 + Math.sin(i / 5) * 2).toFixed(1)),
    })),
  };
  j.ukraineSeries = {
    history90d: daysFrom("2026-02-12T00:00:00Z", 18, 5).map((date, i) => ({
      date,
      value: -140 + i * 4 + ((i % 3) - 1) * 6,
    })),
    history5y: daysFrom("2021-07-01T00:00:00Z", 48, 35).map((date, i) => ({
      date,
      value: -80 + Math.sin(i / 4) * 40,
    })),
  };
  fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  console.log("seeded", path.relative(process.cwd(), fp));
}

seedFinance();
seedMacro();
seedAfl();
seedGeo();
