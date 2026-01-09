// 환율 데이터 (2026-01-09 종가 기준, 네이버 금융)

export interface ForexRate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const forexRates: ForexRate[] = [
  { symbol: 'KRW=X', name: 'USD/KRW', value: 1456.70, change: 3.70, changePercent: 0.25 },
  { symbol: 'EURKRW=X', name: 'EUR/KRW', value: 1697.64, change: 3.37, changePercent: 0.20 },
  { symbol: 'JPYKRW=X', name: 'JPY/KRW', value: 9.26, change: -0.01, changePercent: -0.01 },
  { symbol: 'CNYKRW=X', name: 'CNY/KRW', value: 208.69, change: 0.59, changePercent: 0.28 },
];

// MARKET_DATA 형식으로 export (HomePage.tsx 호환)
export const forex = forexRates.map(rate => ({
  name: rate.name,
  value: rate.value,
  change: rate.changePercent,
}));
