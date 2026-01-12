// 환율 데이터 (2026-01-12 기준, 네이버 금융)

export interface ForexRate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export const forexRates: ForexRate[] = [
  { symbol: 'KRW=X', name: 'USD/KRW', value: 1460.30, change: 3.60, changePercent: 0.25 },
  { symbol: 'EURKRW=X', name: 'EUR/KRW', value: 1700.01, change: 2.37, changePercent: 0.14 },
  { symbol: 'JPYKRW=X', name: 'JPY/KRW', value: 9.25, change: -0.01, changePercent: -0.11 },
  { symbol: 'CNYKRW=X', name: 'CNY/KRW', value: 209.37, change: 0.68, changePercent: 0.33 },
];

// MARKET_DATA 형식으로 export (HomePage.tsx 호환)
export const forex = forexRates.map(rate => ({
  name: rate.name,
  value: rate.value,
  change: rate.changePercent,
}));
