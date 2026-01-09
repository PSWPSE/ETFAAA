// 유사 ETF 관련 함수
import { etfs, getETFById } from '../etf';
import { getReturns } from './returns';

// 유사 ETF 찾기
export const getSimilarETFs = (etfId: string, limit: number = 5) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  const similar = etfs
    .filter(e =>
      e.id !== etfId &&
      (e.category === etf.category ||
        e.themes.some(t => etf.themes.includes(t)))
    )
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);

  return similar;
};

// 상관관계 ETF 가져오기
export const getCorrelatedETFs = (etfId: string, limit: number = 5) => {
  const etf = getETFById(etfId);
  if (!etf) return { positive: [], negative: [] };

  const allOtherETFs = etfs.filter(e => e.id !== etfId);

  const correlations = allOtherETFs.map(other => {
    const sameCategory = other.category === etf.category;
    const commonThemes = other.themes.filter(t => etf.themes.includes(t)).length;

    let correlation: number;

    if (sameCategory && commonThemes > 0) {
      correlation = 0.85 + Math.random() * 0.1;
    } else if (sameCategory || commonThemes > 0) {
      correlation = 0.6 + Math.random() * 0.2;
    } else if (
      (etf.name.includes('인버스') && !other.name.includes('인버스')) ||
      (!etf.name.includes('인버스') && other.name.includes('인버스')) ||
      (etf.category === '국내주식' && other.category === '채권') ||
      (etf.category === '채권' && other.category === '국내주식')
    ) {
      correlation = -0.5 - Math.random() * 0.4;
    } else {
      correlation = -0.2 + Math.random() * 0.4;
    }

    return {
      etf: other,
      correlation: Math.max(-1, Math.min(1, correlation)),
    };
  });

  const positive = correlations
    .filter(c => c.correlation > 0.5)
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit)
    .map(c => ({ ...c.etf, correlation: c.correlation }));

  const negative = correlations
    .filter(c => c.correlation < -0.3)
    .sort((a, b) => a.correlation - b.correlation)
    .slice(0, limit)
    .map(c => ({ ...c.etf, correlation: c.correlation }));

  return { positive, negative };
};

// 경쟁 ETF 비교 데이터
export const getCompetingETFs = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  const similarETFs = getSimilarETFs(etfId, 5);

  return similarETFs.map(similar => {
    const similarReturns = getReturns(similar.id);
    return {
      id: similar.id,
      name: similar.name,
      ticker: similar.ticker,
      issuer: similar.issuer,
      price: similar.price,
      changePercent: similar.changePercent,
      aum: similar.aum,
      expenseRatio: similar.expenseRatio,
      dividendYield: similar.dividendYield,
      volume: similar.volume,
      returns: {
        month1: similarReturns.month1,
        month3: similarReturns.month3,
        year1: similarReturns.year1,
        ytd: similarReturns.ytd,
      },
    };
  });
};
