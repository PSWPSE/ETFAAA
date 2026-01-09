// 구성종목 (간단 버전)
export interface SimpleHolding {
  ticker: string;
  name: string;
  weight: number;
}

// ETF 기본 정보
export interface ETF {
  id: string;
  name: string;
  ticker: string;
  issuer: string;
  category: string;
  themes: string[];
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  expenseRatio: number;
  dividendYield: number;
  inceptionDate: string;
  nav: number;
  aum: number;
  // 52주 정보
  high52w?: number;
  low52w?: number;
  // 거래 정보
  turnover?: number; // 거래대금 (원)
  prevClose?: number; // 전일종가
  dayHigh?: number; // 당일고가
  dayLow?: number; // 당일저가
  // 추가 정보
  trackingIndex?: string; // 추적지수
  trackingError?: number; // 추적오차
  listingExchange?: string; // 상장거래소
  leverage?: number; // 레버리지 배수 (해당시)
  holdings?: SimpleHolding[]; // 보유 종목
  // 연금 투자 가능 여부
  personalPension?: boolean; // 개인연금 가능
  retirementPension?: boolean; // 퇴직연금 가능
}

// 가격 히스토리
export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 수익률
export interface Returns {
  day1: number;
  week1: number;
  month1: number;
  month3: number;
  month6: number;
  year1: number;
  ytd: number;
}

// 구성종목
export interface Holding {
  name: string;
  ticker: string;
  weight: number;
  sector: string;
}

// 배당 정보
export interface Dividend {
  exDate: string;
  payDate: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
}

// 위험 지표
export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  beta: number;
  maxDrawdown: number;
}

// 국면 분석
export interface PhaseAnalysis {
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  status: 'overbought' | 'neutral' | 'oversold';
  deviation: number;
}

// 테마
// 테마 카테고리 타입
export type ThemeCategory =
  | 'index'      // 투자국가/지역/대표지수
  | 'strategy'   // 투자전략
  | 'sector'     // 산업/업종/섹터
  | 'asset'      // 투자자산
  | 'single'     // 단일종목
  | 'leverage'   // 레버리지/인버스
  | 'bond'       // 채권
  | 'region'     // 지역/국가
  | 'commodity'  // 원자재
  | 'theme';     // 테마/메가트렌드

export interface Theme {
  id: string;
  name: string;
  description: string;
  etfCount: number;
  avgReturn: number;
  category: ThemeCategory;
  representativeETFId?: string; // 대표 ETF ID
}

// 상관관계
export interface Correlation {
  etf1: string;
  etf2: string;
  value: number;
}

// 시뮬레이션 결과
export interface SimulationResult {
  totalInvestment: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  monthlyData: {
    month: number;
    investment: number;
    value: number;
  }[];
}

// 필터 옵션
export interface FilterOptions {
  issuers: string[];
  categories: string[];
  themes: string[];
}

// 정렬 옵션
export type SortField = 'name' | 'price' | 'change' | 'volume' | 'marketCap' | 'dividendYield';
export type SortOrder = 'asc' | 'desc';

// 시장 지수
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
}

// 환율
export interface ForexRate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// 원자재
export interface Commodity {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
}

