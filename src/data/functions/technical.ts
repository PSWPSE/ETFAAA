// 기술적 분석 관련 함수
import type { PhaseAnalysis } from '../../types/etf';
import { etfs, getETFById } from '../etf';

// 국면 분석
export const getPhaseAnalysis = (etfId: string): PhaseAnalysis => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return { rsi: 50, macd: 0, signal: 0, histogram: 0, status: 'neutral', deviation: 0 };

  const rsi = 50 + etf.changePercent * 5;
  const status = rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral';

  return {
    rsi: Math.max(0, Math.min(100, rsi)),
    macd: etf.changePercent * 100,
    signal: etf.changePercent * 80,
    histogram: etf.changePercent * 20,
    status: status as 'overbought' | 'neutral' | 'oversold',
    deviation: etf.changePercent * 2,
  };
};

// 기술적 지표
export const getTechnicalIndicators = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  const price = etf.price;
  const change = etf.changePercent;

  // RSI
  const rsi = Math.max(20, Math.min(80, 50 + change * 5));

  // MACD
  const macd = change * 100;
  const signal = macd * 0.8;
  const histogram = macd - signal;

  // 이동평균
  const ma5 = price * (1 + (Math.random() - 0.5) * 0.02);
  const ma10 = price * (1 + (Math.random() - 0.5) * 0.03);
  const ma20 = price * (1 + (Math.random() - 0.5) * 0.05);
  const ma50 = price * (1 + (Math.random() - 0.5) * 0.08);
  const ma200 = price * (1 + (Math.random() - 0.5) * 0.15);

  // 추세 판단
  const shortTermTrend = price > ma20 ? 'bullish' : 'bearish';
  const longTermTrend = price > ma200 ? 'bullish' : 'bearish';

  // 지지/저항선
  const support1 = Math.round(price * 0.95);
  const support2 = Math.round(price * 0.90);
  const resistance1 = Math.round(price * 1.05);
  const resistance2 = Math.round(price * 1.10);

  // 볼린저 밴드
  const bbUpper = Math.round(ma20 * 1.04);
  const bbLower = Math.round(ma20 * 0.96);
  const bbWidth = ((bbUpper - bbLower) / ma20 * 100).toFixed(2);

  // 모멘텀 지표
  const momentum = (Math.random() * 40 - 20).toFixed(2);
  const stochastic = Math.round(Math.random() * 100);
  const williams = Math.round(-Math.random() * 100);

  return {
    rsi: Math.round(rsi),
    rsiStatus: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
    macd: {
      value: macd.toFixed(2),
      signal: signal.toFixed(2),
      histogram: histogram.toFixed(2),
      trend: histogram > 0 ? 'bullish' : 'bearish',
    },
    movingAverages: {
      ma5: Math.round(ma5),
      ma10: Math.round(ma10),
      ma20: Math.round(ma20),
      ma50: Math.round(ma50),
      ma200: Math.round(ma200),
    },
    trend: {
      shortTerm: shortTermTrend,
      longTerm: longTermTrend,
    },
    supportResistance: {
      support1,
      support2,
      resistance1,
      resistance2,
    },
    bollingerBands: {
      upper: bbUpper,
      middle: Math.round(ma20),
      lower: bbLower,
      width: bbWidth,
    },
    momentum: {
      value: momentum,
      stochastic,
      williams,
    },
  };
};
