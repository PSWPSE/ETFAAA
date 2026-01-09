// ETF 데이터 통합 export
import type { ETF } from '../../types/etf';
import { koreanETFs } from './korean-etfs';
import { usETFs } from './us-etfs';

// 개별 export
export { koreanETFs } from './korean-etfs';
export { usETFs } from './us-etfs';

// 전체 ETF 배열 (레거시 호환)
export const etfs: ETF[] = [...koreanETFs, ...usETFs];

// ID로 ETF 찾기
export const getETFById = (id: string): ETF | undefined => {
  return etfs.find(etf => etf.id === id);
};

// 시장별 ETF 가져오기
export const getETFsByMarket = (market: 'korea' | 'us'): ETF[] => {
  if (market === 'korea') {
    // 국내 ETF + 해외주식 테마 (국내 상장)
    return koreanETFs;
  }
  // 미국/해외 테마 ETF
  return usETFs;
};

// 티커로 ETF 찾기
export const getETFByTicker = (ticker: string): ETF | undefined => {
  return etfs.find(etf => etf.ticker === ticker);
};

// 카테고리별 ETF 가져오기
export const getETFsByCategory = (category: string): ETF[] => {
  return etfs.filter(etf => etf.category === category);
};

// 테마별 ETF 가져오기
export const getETFsByTheme = (themeKeyword: string): ETF[] => {
  return etfs.filter(etf =>
    etf.themes.some(theme => theme.toLowerCase().includes(themeKeyword.toLowerCase()))
  );
};

// 운용사별 ETF 가져오기
export const getETFsByIssuer = (issuer: string): ETF[] => {
  return etfs.filter(etf => etf.issuer === issuer);
};

// 배당수익률 상위 ETF
export const getHighDividendETFs = (limit: number = 10): ETF[] => {
  return [...etfs]
    .filter(etf => etf.dividendYield > 0)
    .sort((a, b) => b.dividendYield - a.dividendYield)
    .slice(0, limit);
};

// 거래량 상위 ETF
export const getHighVolumeETFs = (limit: number = 10): ETF[] => {
  return [...etfs]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
};

// AUM 상위 ETF
export const getLargestETFs = (limit: number = 10): ETF[] => {
  return [...etfs]
    .sort((a, b) => b.aum - a.aum)
    .slice(0, limit);
};

// 상승률 상위 ETF
export const getTopGainersETFs = (limit: number = 10): ETF[] => {
  return [...etfs]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
};

// 하락률 상위 ETF
export const getTopLosersETFs = (limit: number = 10): ETF[] => {
  return [...etfs]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
};
