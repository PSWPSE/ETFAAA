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
  | 'leverage';  // 레버리지/인버스

export interface Theme {
  id: string;
  name: string;
  description: string;
  etfCount: number;
  avgReturn: number;
  category: ThemeCategory;
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

