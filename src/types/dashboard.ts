/** Shared shapes for JSON under public/data — extend per domain. */

export type IsoDate = string;

export interface TimeSeriesPoint {
  date: IsoDate;
  value: number;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  currency: string;
  /** When this quote snapshot was taken; defaults to bundle `updatedAt` in UI. */
  asOf?: IsoDate;
}

export interface FinanceData {
  updatedAt: IsoDate;
  quotes: Quote[];
  property: {
    address: string;
    estimateAud: number;
    sourceNote: string;
    asOf?: IsoDate;
    history90d?: TimeSeriesPoint[];
    history5y?: TimeSeriesPoint[];
  };
  /** Legacy combined history (often ~90d); prefer `history90d` / `history5y`. */
  history: Record<string, TimeSeriesPoint[]>;
  history90d?: Record<string, TimeSeriesPoint[]>;
  history5y?: Record<string, TimeSeriesPoint[]>;
}

export interface MacroSpot {
  id?: string;
  label: string;
  value: number;
  unit: string;
  change24hPct?: number;
  asOf?: IsoDate;
  history90d?: TimeSeriesPoint[];
  history5y?: TimeSeriesPoint[];
}

export interface MacroSeries {
  label: string;
  unit: string;
  points: TimeSeriesPoint[];
}

export interface MacroIndicator {
  name: string;
  value: number;
  unit: string;
  period: string;
  asOf?: IsoDate;
  history90d?: TimeSeriesPoint[];
  history5y?: TimeSeriesPoint[];
}

export interface MacroData {
  updatedAt: IsoDate;
  spots: MacroSpot[];
  series: MacroSeries[];
  indicators: MacroIndicator[];
}

export interface GeopoliticsData {
  updatedAt: IsoDate;
  ukraine: { headline: string; netSqKm30d: number; note: string };
  trumpApproval: { value: number; source: string; asOf: IsoDate };
  usMidterms: { chamber: string; partyProb: { dem: number; gop: number } }[];
  auFederalPoll: { party: string; tpp: number }[];
  vicStatePoll: { party: string; primary: number }[];
  trumpApprovalSeries?: { history90d: TimeSeriesPoint[]; history5y: TimeSeriesPoint[] };
  ukraineSeries?: { history90d: TimeSeriesPoint[]; history5y: TimeSeriesPoint[] };
}

export interface AflPlayerStat {
  player: string;
  team: string;
  stat: string;
  value: number;
}

export interface AflRollingMetric {
  label: string;
  points: TimeSeriesPoint[];
  history90d?: TimeSeriesPoint[];
  history5y?: TimeSeriesPoint[];
}

export interface AflData {
  updatedAt: IsoDate;
  hawthornLeaders: AflPlayerStat[];
  leagueLeaders: AflPlayerStat[];
  rolling: AflRollingMetric[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: IsoDate;
  topics: string[];
}

export interface NewsData {
  updatedAt: IsoDate;
  reddit: NewsItem[];
  rss: NewsItem[];
  trendingTopics: { topic: string; score: number }[];
  summaries: { topicGroup: string; bullets: string[]; asOf: IsoDate }[];
  savedGroups: { id: string; name: string; topics: string[] }[];
}

export type DataBundle = {
  finance: FinanceData;
  macro: MacroData;
  geopolitics: GeopoliticsData;
  afl: AflData;
  news: NewsData;
};
