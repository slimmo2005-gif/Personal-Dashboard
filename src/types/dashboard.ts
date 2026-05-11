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
}

export interface FinanceData {
  updatedAt: IsoDate;
  quotes: Quote[];
  property: {
    address: string;
    estimateAud: number;
    sourceNote: string;
  };
  history: Record<string, TimeSeriesPoint[]>;
}

export interface MacroSpot {
  label: string;
  value: number;
  unit: string;
  change24hPct?: number;
}

export interface MacroSeries {
  label: string;
  unit: string;
  points: TimeSeriesPoint[];
}

export interface MacroData {
  updatedAt: IsoDate;
  spots: MacroSpot[];
  series: MacroSeries[];
  indicators: { name: string; value: number; unit: string; period: string }[];
}

export interface GeopoliticsData {
  updatedAt: IsoDate;
  ukraine: { headline: string; netSqKm30d: number; note: string };
  trumpApproval: { value: number; source: string; asOf: IsoDate };
  usMidterms: { chamber: string; partyProb: { dem: number; gop: number } }[];
  auFederalPoll: { party: string; tpp: number }[];
  vicStatePoll: { party: string; primary: number }[];
}

export interface AflPlayerStat {
  player: string;
  team: string;
  stat: string;
  value: number;
}

export interface AflData {
  updatedAt: IsoDate;
  hawthornLeaders: AflPlayerStat[];
  leagueLeaders: AflPlayerStat[];
  rolling: { label: string; points: TimeSeriesPoint[] }[];
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
