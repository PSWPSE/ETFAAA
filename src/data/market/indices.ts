// 글로벌 시장 지수 데이터 (2026-01-09 종가 기준)

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
  { symbol: '^KS11', name: 'KOSPI', value: 4552.37, change: 1.31, changePercent: 0.03, region: '🇰🇷' },
  { symbol: '^KQ11', name: 'KOSDAQ', value: 938.87, change: -8.52, changePercent: -0.90, region: '🇰🇷' },
  { symbol: '^N225', name: '니케이225', value: 51660.50, change: -293.50, changePercent: -0.57, region: '🇯🇵' },
  { symbol: '^HSI', name: '항셍지수', value: 26149.31, change: -309.64, changePercent: -1.17, region: '🇭🇰' },
  { symbol: '000001.SS', name: '상하이종합', value: 4083.00, change: -2.85, changePercent: -0.07, region: '🇨🇳' },
  { symbol: '^BSESN', name: '센섹스', value: 84180.96, change: -780.18, changePercent: -0.92, region: '🇮🇳' },
  { symbol: '^SET', name: 'SET지수', value: 1253.60, change: -27.22, changePercent: -2.13, region: '🇹🇭' },
];

// 북미 지수 (1월 7일 종가 - 미국 시장은 1월 8일 아직 마감 전)
export const usIndices: MarketIndex[] = [
  { symbol: '^GSPC', name: 'S&P 500', value: 6920.93, change: -23.89, changePercent: -0.34, region: '🇺🇸' },
  { symbol: '^IXIC', name: 'NASDAQ', value: 23584.27, change: 37.65, changePercent: 0.16, region: '🇺🇸' },
  { symbol: '^DJI', name: '다우존스', value: 48996.08, change: -466.00, changePercent: -0.94, region: '🇺🇸' },
  { symbol: '^GSPTSE', name: 'TSX종합', value: 27850.45, change: 125.30, changePercent: 0.45, region: '🇨🇦' },
];

// 유럽 지수
export const europeIndices: MarketIndex[] = [
  { symbol: '^FTSE', name: 'FTSE 100', value: 10052.30, change: 30.15, changePercent: 0.30, region: '🇬🇧' },
  { symbol: '^GDAXI', name: 'DAX', value: 25200.00, change: 78.00, changePercent: 0.31, region: '🇩🇪' },
  { symbol: '^FCHI', name: 'CAC 40', value: 8237.43, change: 26.35, changePercent: 0.32, region: '🇫🇷' },
  { symbol: '^FTSEMIB', name: 'FTSE MIB', value: 38520.00, change: 173.50, changePercent: 0.45, region: '🇮🇹' },
  { symbol: '^IBEX', name: 'IBEX 35', value: 14280.00, change: 51.40, changePercent: 0.36, region: '🇪🇸' },
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
