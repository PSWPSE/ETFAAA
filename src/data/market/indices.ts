// 글로벌 시장 지수 데이터 (2026-01-12 기준)

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
}

// 아시아 지수
export const asiaIndices: MarketIndex[] = [
  { symbol: '^KS11', name: 'KOSPI', value: 4614.94, change: 28.56, changePercent: 0.62, region: '🇰🇷' },
  { symbol: '^KQ11', name: 'KOSDAQ', value: 955.55, change: 7.60, changePercent: 0.80, region: '🇰🇷' },
  { symbol: '^N225', name: '니케이225', value: 51939.89, change: 822.63, changePercent: 1.61, region: '🇯🇵' },
  { symbol: '^HSI', name: '항셍지수', value: 26231.79, change: 82.48, changePercent: 0.32, region: '🇭🇰' },
  { symbol: '000001.SS', name: '상하이종합', value: 4120.43, change: 37.45, changePercent: 0.92, region: '🇨🇳' },
  { symbol: '^BSESN', name: '센섹스', value: 83576.24, change: -604.72, changePercent: -0.72, region: '🇮🇳' },
  { symbol: '^TWII', name: '대만가권', value: 30288.96, change: -71.59, changePercent: -0.24, region: '🇹🇼' },
];

// 북미 지수 (2026-01-09 종가)
export const usIndices: MarketIndex[] = [
  { symbol: '^GSPC', name: 'S&P 500', value: 6966.28, change: 44.82, changePercent: 0.65, region: '🇺🇸' },
  { symbol: '^IXIC', name: 'NASDAQ', value: 23671.35, change: 191.33, changePercent: 0.81, region: '🇺🇸' },
  { symbol: '^DJI', name: '다우존스', value: 49504.07, change: 237.96, changePercent: 0.48, region: '🇺🇸' },
  { symbol: '^SOX', name: '필라델피아반도체', value: 7638.78, change: 202.68, changePercent: 2.73, region: '🇺🇸' },
];

// 유럽 지수
export const europeIndices: MarketIndex[] = [
  { symbol: '^FTSE', name: 'FTSE 100', value: 10124.60, change: 79.91, changePercent: 0.80, region: '🇬🇧' },
  { symbol: '^GDAXI', name: 'DAX', value: 25261.64, change: 134.18, changePercent: 0.53, region: '🇩🇪' },
  { symbol: '^FCHI', name: 'CAC 40', value: 8362.09, change: 118.62, changePercent: 1.44, region: '🇫🇷' },
  { symbol: '^FTSEMIB', name: 'FTSE MIB', value: 45719.26, change: 47.56, changePercent: 0.10, region: '🇮🇹' },
  { symbol: '^STOXX50E', name: '유로스톡스50', value: 5997.47, change: 93.15, changePercent: 1.58, region: '🇪🇺' },
];

// 전체 지수 데이터 (MARKET_DATA.indices 대체용)
export const allIndices: MarketIndex[] = [
  ...asiaIndices,
  ...usIndices,
  ...europeIndices,
];

// MARKET_DATA 형식으로 export (HomePage.tsx 호환)
export const indices = allIndices.map(idx => ({
  name: idx.name,
  value: idx.value,
  change: idx.changePercent,
  region: idx.region,
}));
