// ETF 분석 관련 함수
import { getETFById } from '../etf';

// ETF 등급 시스템
export const getETFGrades = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  // 효율성 점수 (비용 기반)
  let efficiencyScore = 0;
  if (etf.expenseRatio <= 0.1) efficiencyScore = 95;
  else if (etf.expenseRatio <= 0.2) efficiencyScore = 85;
  else if (etf.expenseRatio <= 0.3) efficiencyScore = 75;
  else if (etf.expenseRatio <= 0.5) efficiencyScore = 65;
  else efficiencyScore = 55;

  // 거래용이성 점수 (거래량 기반)
  let tradabilityScore = 0;
  if (etf.volume >= 5000000) tradabilityScore = 95;
  else if (etf.volume >= 1000000) tradabilityScore = 85;
  else if (etf.volume >= 500000) tradabilityScore = 75;
  else if (etf.volume >= 100000) tradabilityScore = 65;
  else tradabilityScore = 55;

  // 적합성 점수 (추적오차 기반)
  const trackingError = 0.01 + Math.random() * 0.49;
  let fitScore = 0;
  if (trackingError <= 0.1) fitScore = 95;
  else if (trackingError <= 0.2) fitScore = 85;
  else if (trackingError <= 0.3) fitScore = 75;
  else fitScore = 65;

  const overallScore = Math.round((efficiencyScore + tradabilityScore + fitScore) / 3);

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return {
    overall: { score: overallScore, grade: getGrade(overallScore) },
    efficiency: { score: efficiencyScore, grade: getGrade(efficiencyScore), desc: '비용 효율성' },
    tradability: { score: tradabilityScore, grade: getGrade(tradabilityScore), desc: '거래 용이성' },
    fit: { score: fitScore, grade: getGrade(fitScore), desc: '지수 추적 정확도' },
  };
};

// 펀더멘털 지표
export const getFundamentals = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  if (etf.category === '채권' || etf.category === '원자재' || etf.category === '통화') {
    return null;
  }

  return {
    pe: (15 + Math.random() * 15).toFixed(2),
    pb: (1.5 + Math.random() * 3).toFixed(2),
    ps: (2 + Math.random() * 4).toFixed(2),
    pcf: (10 + Math.random() * 10).toFixed(2),
    roe: (10 + Math.random() * 20).toFixed(2),
    roa: (5 + Math.random() * 10).toFixed(2),
    debtToEquity: (0.3 + Math.random() * 1.2).toFixed(2),
    earningsGrowth: (-5 + Math.random() * 30).toFixed(2),
    revenueGrowth: (-2 + Math.random() * 20).toFixed(2),
    dividendGrowth: (0 + Math.random() * 15).toFixed(2),
    avgMarketCap: etf.marketCap / 1000000000,
    medianMarketCap: etf.marketCap / 1500000000,
  };
};

// 비용 분석 데이터
export const getCostAnalysis = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  const ter = etf.expenseRatio;
  const tradingCost = 0.05 + Math.random() * 0.1;
  const otherCost = 0.02 + Math.random() * 0.05;
  const totalCost = ter + tradingCost + otherCost;

  return {
    ter,
    tradingCost: Number(tradingCost.toFixed(3)),
    otherCost: Number(otherCost.toFixed(3)),
    totalCost: Number(totalCost.toFixed(3)),
    historicalCost: [
      { year: '2023', cost: totalCost + (Math.random() - 0.5) * 0.1 },
      { year: '2024', cost: totalCost + (Math.random() - 0.5) * 0.05 },
      { year: '2025', cost: totalCost },
    ],
  };
};

// 세금 정보
export const getTaxInfo = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  const isKorean = etf.id.startsWith('kr');

  return {
    taxEfficiency: Math.round(85 + Math.random() * 15),
    capitalGainsDistribution: isKorean ? '비과세' : '15.4% (배당소득세)',
    dividendTaxRate: '15.4%',
    foreignTaxWithheld: isKorean ? 'N/A' : '15%',
    taxLossHarvesting: isKorean ? '가능' : '가능 (환율 주의)',
    notes: isKorean
      ? '국내 상장 ETF는 거래차익 비과세, 배당금 15.4% 원천징수'
      : '해외 ETF는 양도차익 22% (250만원 초과분), 배당금 15.4%',
    structureType: etf.name.includes('합성') ? '합성(Synthetic)' : '실물(Physical)',
    replicationMethod: etf.name.includes('합성') ? '스왑 기반' : '실물 복제',
  };
};
