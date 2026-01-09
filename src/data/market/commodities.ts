// 원자재 데이터 (2026-01-09 종가 기준, 네이버 금융)

export interface Commodity {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
}

export const commodities: Commodity[] = [
  { symbol: 'GC=F', name: '금', value: 2890.50, change: -1.80, changePercent: -0.06, unit: '$/oz' },
  { symbol: 'SI=F', name: '은', value: 32.45, change: 0.25, changePercent: 0.78, unit: '$/oz' },
  { symbol: 'CL=F', name: 'WTI유', value: 57.76, change: 1.77, changePercent: 3.16, unit: '$/배럴' },
  { symbol: 'NG=F', name: '천연가스', value: 3.42, change: -0.05, changePercent: -1.44, unit: '$/MMBtu' },
];

// MARKET_DATA 형식으로 export (HomePage.tsx 호환)
export const commoditiesData = commodities.map(c => ({
  name: c.name,
  value: c.value,
  change: c.changePercent,
  unit: c.unit,
}));
