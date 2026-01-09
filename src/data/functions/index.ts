// 함수 통합 export

// 수익률 관련
export { getReturns, getMonthlyReturns, getGrowthSimulation } from './returns';

// 배당 관련
export { getDividends, getDividendChartData, getDividendForecast } from './dividends';

// 위험 지표 관련
export { getRiskMetrics, getExtendedRiskMetrics } from './risk-metrics';

// 보유종목 및 구성 관련
export { getHoldings, getSectorAllocation, getAssetAllocation, getCountryAllocation } from './holdings';

// 기술적 분석 관련
export { getPhaseAnalysis, getTechnicalIndicators } from './technical';

// ETF 분석 관련
export { getETFGrades, getFundamentals, getCostAnalysis, getTaxInfo } from './analysis';

// 유사 ETF 관련
export { getSimilarETFs, getCorrelatedETFs, getCompetingETFs } from './similar';

// ETF 펀드 정보 관련
export { getExtendedETFInfo, getFundOperationInfo, getFundFlows, getRelatedNews } from './fund-info';

// 필터 및 상관관계
export { correlations, filterOptions, getETFsByThemeFilter } from './filters';
