// 위험 지표 관련 함수
import type { RiskMetrics } from '../../types/etf';
import { etfs } from '../etf';

// 위험 지표
export const getRiskMetrics = (etfId: string): RiskMetrics => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return { volatility: 20.0, sharpeRatio: 0.75, beta: 1.0, maxDrawdown: -30.0 };

  // 카테고리별 변동성 조정
  let baseVolatility = 15;
  if (etf.category === '채권') baseVolatility = 5;
  else if (etf.themes.includes('레버리지')) baseVolatility = 35;
  else if (etf.themes.includes('인버스')) baseVolatility = 30;
  else if (etf.themes.includes('반도체') || etf.themes.includes('AI')) baseVolatility = 25;
  else if (etf.themes.includes('2차전지')) baseVolatility = 30;

  const volatility = baseVolatility + Math.abs(etf.changePercent) * 3;
  const sharpeRatio = etf.changePercent > 0 ? 0.5 + etf.changePercent / 10 : -0.2;

  return {
    volatility,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    beta: 1.0 + (Math.random() - 0.5) * 0.5,
    maxDrawdown: -15 - Math.random() * 25,
  };
};

// 확장된 위험 지표
export const getExtendedRiskMetrics = (etfId: string) => {
  const baseMetrics = getRiskMetrics(etfId);

  return {
    ...baseMetrics,
    alpha: (Math.random() * 4 - 2).toFixed(2),
    r2: (0.85 + Math.random() * 0.14).toFixed(2),
    treynorRatio: (Math.random() * 0.3).toFixed(2),
    informationRatio: (Math.random() * 1 - 0.5).toFixed(2),
    sortino: (Math.random() * 2).toFixed(2),
    calmarRatio: (Math.random() * 1.5).toFixed(2),
    var95: (Math.random() * 5 + 2).toFixed(2),
    cvar95: (Math.random() * 3 + 3).toFixed(2),
    upCapture: (90 + Math.random() * 20).toFixed(1),
    downCapture: (85 + Math.random() * 25).toFixed(1),
  };
};
