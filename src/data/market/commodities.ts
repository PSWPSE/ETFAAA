// 원자재 데이터 (2026-01-12 기준, 네이버 금융)

export interface Commodity {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
}

export const commodities: Commodity[] = [
  { symbol: 'GC=F', name: '금', value: 2920.80, change: 30.30, changePercent: 1.05, unit: '$/oz' },
  { symbol: 'SI=F', name: '은', value: 33.15, change: 0.70, changePercent: 2.16, unit: '$/oz' },
  { symbol: 'CL=F', name: 'WTI유', value: 59.12, change: 1.36, changePercent: 2.36, unit: '$/배럴' },
  { symbol: 'NG=F', name: '천연가스', value: 3.55, change: 0.13, changePercent: 3.80, unit: '$/MMBtu' },
];

// MARKET_DATA 형식으로 export (HomePage.tsx 호환)
export const commoditiesData = commodities.map(c => ({
  name: c.name,
  value: c.value,
  change: c.changePercent,
  unit: c.unit,
}));
