// ETF 데이터 통합 export (기존 호환성 유지)
// 모든 기존 import 경로가 동작하도록 re-export

// ========== ETF 데이터 ==========
export {
  etfs,
  koreanETFs,
  usETFs,
  getETFById,
  getETFsByMarket,
  getETFByTicker,
  getETFsByCategory,
  getETFsByTheme,
  getETFsByIssuer,
  getHighDividendETFs,
  getHighVolumeETFs,
  getLargestETFs,
  getTopGainersETFs,
  getTopLosersETFs,
} from './etf';

// ========== 테마 데이터 ==========
export {
  themes,
  koreanThemes,
  usThemes,
  getThemeById,
  getThemesByCategory,
  getThemesByMarket,
  getTopPerformingThemes,
  getWorstPerformingThemes,
  getMostPopularThemes,
  searchThemes,
  getThemeCategories,
} from './themes';

// ========== 시장 데이터 ==========
export {
  indices,
  allIndices,
  asiaIndices,
  usIndices,
  europeIndices,
  forex,
  forexRates,
  commodities,
  commoditiesData,
  MARKET_DATA,
} from './market';

// ========== 가격 히스토리 ==========
export {
  generatePriceHistory,
  getPriceHistory,
  getPriceHistoryByPeriod,
  getCachedPriceHistory,
  clearPriceHistoryCache,
  getComparePriceHistory,
  calculateReturnFromHistory,
} from './price-history';

// ========== 함수들 ==========
export {
  // 수익률
  getReturns,
  getMonthlyReturns,
  getGrowthSimulation,
  // 배당
  getDividends,
  getDividendChartData,
  getDividendForecast,
  // 위험 지표
  getRiskMetrics,
  getExtendedRiskMetrics,
  // 보유종목
  getHoldings,
  getSectorAllocation,
  getAssetAllocation,
  getCountryAllocation,
  // 기술적 분석
  getPhaseAnalysis,
  getTechnicalIndicators,
  // ETF 분석
  getETFGrades,
  getFundamentals,
  getCostAnalysis,
  getTaxInfo,
  // 유사 ETF
  getSimilarETFs,
  getCorrelatedETFs,
  getCompetingETFs,
  // 펀드 정보
  getExtendedETFInfo,
  getFundOperationInfo,
  getFundFlows,
  getRelatedNews,
  // 필터 및 상관관계
  correlations,
  filterOptions,
  getETFsByThemeFilter,
} from './functions';

// ========== 타입 re-export ==========
export type {
  ETF,
  Theme,
  PriceHistory,
  Returns,
  Dividend,
  RiskMetrics,
  Holding,
  PhaseAnalysis,
  Correlation,
  MarketIndex,
  ForexRate,
  Commodity,
} from '../types/etf';
