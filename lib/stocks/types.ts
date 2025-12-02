// TypeScript type definitions for stocks API

// ==========================================
// Yahoo Finance Types
// ==========================================

export interface QuoteResponse {
  success: boolean;
  symbol: string;
  data: any;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface HistoricalResponse {
  success: boolean;
  symbol: string;
  period: {
    start: string;
    end: string;
  };
  interval: string;
  dataPoints: number;
  data: HistoricalDataPoint[];
  timestamp: string;
}

export interface PERatioDataPoint {
  date: string;
  price: number;
  ttmEPS: number;
  peRatio: number | null;
}

export interface PEStatistics {
  count: number;
  current: number | null;
  average: number;
  median: number;
  min: number;
  max: number;
}

export interface PERatioResponse {
  success: boolean;
  symbol: string;
  period: {
    start: string;
    end: string;
  };
  interval: string;
  statistics: PEStatistics;
  dataPoints: number;
  data: PERatioDataPoint[];
  timestamp: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exch: string;
  type: string;
  exchDisp: string;
  typeDisp: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: SearchResult[];
  timestamp: string;
}

// ==========================================
// SEC Filing Types
// ==========================================

export interface Ticker {
  symbol: string;
  exchange: string;
}

export interface FilingMetadata {
  primaryDocUrl: string;
  accessionNumber: string;
  tickers: Ticker[];
  companyName: string;
  filingDate: string;
  reportDate: string;
  primaryDocDescription: string;
  items: string;
  formType: string;
  cik: string;
}

export interface RequestedFilings {
  tickerOrCik: string;
  formType: string;
  limit: number | null;
}

export interface CompanyAndAccessionNumber {
  tickerOrCik: string;
  accessionNumber: string;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface TickerToCikMapping {
  [ticker: string]: string;
}

// ==========================================
// P/E Calculator Types
// ==========================================

export interface EarningsDataPoint {
  date: Date;
  eps: number;
  period: string;
}

export interface PriceDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface CalculatedPERatio {
  date: Date;
  price: number;
  ttmEPS: number | null;
  peRatio: number | null;
}

export interface PECalculationResult {
  priceData: PriceDataPoint[];
  earningsData: EarningsDataPoint[];
  peRatios: CalculatedPERatio[];
  statistics: PEStatistics | null;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiError {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ==========================================
// Configuration Types
// ==========================================

export interface DownloaderConfig {
  companyName: string;
  emailAddress: string;
}

export interface FilingOptions {
  includeAmends?: boolean;
}

export interface DownloadFilingOptions {
  url: string;
}

export interface GetFilingHtmlOptions {
  query?: string;
  ticker?: string;
  form?: string;
}

// ==========================================
// Statistical Prediction Types
// ==========================================

export interface XGBoostParams {
  verbosity?: number;
  max_depth?: number;
  eta?: number;
  objective?: string;
  nthread?: number;
  subsample?: number;
  colsample_bytree?: number;
  colsample_bylevel?: number;
  min_child_weight?: number;
  gamma?: number;
  alpha?: number;
  lambda?: number;
  early_stopping_rounds?: number;
  seed?: number;
  nrounds?: number;
  tree_method?: string;
  grow_policy?: string;
}

export interface TrainModelsOptions {
  xgbParams?: XGBoostParams;
  testSize?: number;
  featuresToUse?: string[];
}

export interface PredictOptions {
  featuresToUse?: string[];
}

export interface TrainTestSplit {
  trainFeatures: any[][];
  testFeatures: any[][];
  trainTarget: number[];
  testTarget: number[];
}
