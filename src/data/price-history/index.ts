// 가격 히스토리 데이터 및 생성 함수
import type { PriceHistory } from '../../types/etf';
import { etfs } from '../etf';

// 실제 데이터 캐시
let realKoreanData: any[] | null = null;
let realUSData: any[] | null = null;
let realDataLoaded = false;

// 실제 데이터 로드 시도
const loadRealData = async () => {
  if (realDataLoaded) return;
  realDataLoaded = true;

  try {
    const koreanModule = await import('../real/korean-market-data.json');
    realKoreanData = koreanModule.default;
    console.log(`✅ 한국 ETF 실제 데이터 로드 완료: ${realKoreanData?.length}개`);
  } catch {
    console.log('ℹ️ 한국 ETF 실제 데이터 없음, 시뮬레이션 사용');
  }

  try {
    const usModule = await import('../real/us-market-data.json');
    realUSData = usModule.default;
    console.log(`✅ 미국 ETF 실제 데이터 로드 완료: ${realUSData?.length}개`);
  } catch {
    console.log('ℹ️ 미국 ETF 실제 데이터 없음, 시뮬레이션 사용');
  }
};

// 초기 로드 실행
loadRealData();

// 실제 데이터에서 가격 히스토리 가져오기
const getRealPriceHistory = (etfId: string, days: number): PriceHistory[] | null => {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? realKoreanData : realUSData;

  if (!dataList) return null;

  const etfData = dataList.find((e: any) => e.id === etfId);
  if (!etfData || !etfData.priceHistory?.length) return null;

  // 요청된 일수만큼 최근 데이터 반환
  return etfData.priceHistory.slice(-days);
};

// 30일 가격 히스토리 생성 (종가 기준, 실제 시장 데이터 시뮬레이션) - 폴백용
export const generatePriceHistory = (basePrice: number, days: number = 30, volatility: number = 0.015): PriceHistory[] => {
  const history: PriceHistory[] = [];

  // 시작 가격은 현재 가격의 약 95-105% 범위에서 시작
  let price = basePrice * (0.97 + Math.random() * 0.06);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // 주말 제외 (실제 거래일만)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // 일일 변동 (현실적인 변동폭)
    const dailyChange = (Math.random() - 0.48) * volatility * 2;
    price = price * (1 + dailyChange);

    // OHLC 생성 (종가 기준으로 역산)
    const intraVolatility = 0.008; // 일중 변동폭
    const high = price * (1 + Math.random() * intraVolatility);
    const low = price * (1 - Math.random() * intraVolatility);
    const open = low + Math.random() * (high - low);

    // 거래량 (기본 거래량의 80-120%)
    const baseVolume = 1000000;
    const volume = Math.floor(baseVolume * (0.8 + Math.random() * 0.4));

    history.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(price),
      volume,
    });
  }

  // 마지막 데이터 포인트를 현재 가격으로 조정
  if (history.length > 0) {
    const lastIdx = history.length - 1;
    history[lastIdx].close = basePrice;
    history[lastIdx].high = Math.max(history[lastIdx].high, basePrice);
    history[lastIdx].low = Math.min(history[lastIdx].low, basePrice);
  }

  return history;
};

// ETF ID로 가격 히스토리 가져오기
export const getPriceHistory = (etfId: string, days: number = 30): PriceHistory[] => {
  // 1. 먼저 실제 데이터 시도
  const realData = getRealPriceHistory(etfId, days);
  if (realData && realData.length > 0) {
    return realData;
  }

  // 2. 실제 데이터 없으면 시뮬레이션 사용
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return [];

  // 카테고리별 변동성 조정
  let volatility = 0.015; // 기본 변동성

  // US ETF 변동성 설정
  if (etfId.startsWith('us')) {
    // 레버리지/인버스 ETF (가장 높은 변동성)
    if (etf.themes.includes('Leveraged') || etf.name.includes('3X') || etf.ticker === 'TQQQ' || etf.ticker === 'SSO') {
      volatility = 0.035;
    } else if (etf.themes.includes('Inverse') || etf.ticker === 'SH' || etf.ticker === 'SDS') {
      volatility = 0.03;
    }
    // 채권 ETF (낮은 변동성)
    else if (etf.category === 'US Bond' || etf.themes.includes('Bond')) {
      if (etf.themes.includes('Short-Term') || etf.ticker === 'SHY' || etf.ticker === 'SGOV') {
        volatility = 0.001; // 단기채 - 매우 낮음
      } else if (etf.themes.includes('Long-Term') || etf.ticker === 'TLT') {
        volatility = 0.012; // 장기채 - 다소 높은 변동성
      } else if (etf.ticker === 'HYG' || etf.themes.includes('High Yield')) {
        volatility = 0.008; // 하이일드 - 중간
      } else {
        volatility = 0.005; // 일반 채권 ETF
      }
    }
    // 원자재/금/은 ETF
    else if (etf.category === 'Commodity' || etf.themes.includes('Commodity')) {
      if (etf.ticker === 'GLD' || etf.ticker === 'IAU') {
        volatility = 0.012; // 금 - 중간
      } else if (etf.ticker === 'SLV') {
        volatility = 0.018; // 은 - 다소 높음
      } else {
        volatility = 0.015; // 기타 원자재
      }
    }
    // 신흥국/국제 ETF
    else if (etf.themes.includes('Emerging Markets') || etf.ticker === 'VWO' || etf.ticker === 'EEM') {
      volatility = 0.02; // 신흥국 - 높은 변동성
    } else if (etf.themes.includes('International') || etf.ticker === 'VEA' || etf.ticker === 'EFA') {
      volatility = 0.016; // 선진국 - 중간
    }
    // 섹터/테마 ETF
    else if (etf.themes.includes('Semiconductor') || etf.ticker === 'SOXX' || etf.ticker === 'SMH') {
      volatility = 0.025; // 반도체 - 높음
    } else if (etf.themes.includes('Innovation') || etf.ticker === 'ARKK') {
      volatility = 0.03; // 혁신 - 매우 높음
    } else if (etf.themes.includes('Technology') || etf.ticker === 'XLK') {
      volatility = 0.02; // 기술 - 높음
    } else if (etf.themes.includes('Clean Energy') || etf.ticker === 'ICLN') {
      volatility = 0.025; // 클린에너지 - 높음
    }
    // 배당 ETF
    else if (etf.themes.includes('Dividend') || etf.ticker === 'SCHD' || etf.ticker === 'VYM' || etf.ticker === 'DVY') {
      volatility = 0.012; // 배당 - 낮은 변동성
    }
    // 리츠 ETF
    else if (etf.themes.includes('REITs') || etf.ticker === 'VNQ' || etf.ticker === 'IYR') {
      volatility = 0.016; // 리츠 - 중간
    }
    // 기본 미국 지수 ETF (S&P500, NASDAQ 등)
    else if (etf.themes.includes('S&P500') || etf.themes.includes('Large Cap')) {
      volatility = 0.014; // S&P500 - 표준
    } else if (etf.themes.includes('NASDAQ') || etf.themes.includes('NASDAQ100')) {
      volatility = 0.018; // 나스닥 - 약간 높음
    } else if (etf.themes.includes('Small Cap') || etf.ticker === 'IWM') {
      volatility = 0.02; // 소형주 - 높음
    }
  }
  // 한국 ETF 변동성 설정
  else {
    if (etf.themes.includes('레버리지')) {
      volatility = 0.03; // 레버리지 ETF는 더 높은 변동성
    } else if (etf.themes.includes('인버스')) {
      volatility = 0.025;
    } else if (etf.category === '채권' || etf.themes.includes('MMF') || etf.themes.includes('CD금리')) {
      volatility = 0.001; // 채권/머니마켓은 매우 낮은 변동성
    } else if (etf.category === '원자재') {
      volatility = 0.02; // 원자재는 다소 높은 변동성
    } else if (etf.themes.includes('반도체') || etf.themes.includes('AI')) {
      volatility = 0.022; // 반도체/AI는 높은 변동성
    } else if (etf.themes.includes('2차전지') || etf.themes.includes('전기차')) {
      volatility = 0.025; // 2차전지는 높은 변동성
    }
  }

  return generatePriceHistory(etf.price, days, volatility);
};

// 특정 기간의 가격 히스토리 가져오기
export const getPriceHistoryByPeriod = (
  etfId: string,
  period: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
): PriceHistory[] => {
  const periodDays: Record<string, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': 365 * 3,
  };

  const days = periodDays[period] || 30;
  return getPriceHistory(etfId, days);
};

// 캐시된 가격 히스토리 저장소 (메모이제이션)
const priceHistoryCache: Map<string, PriceHistory[]> = new Map();

export const getCachedPriceHistory = (etfId: string, days: number = 30): PriceHistory[] => {
  const cacheKey = `${etfId}-${days}`;

  if (!priceHistoryCache.has(cacheKey)) {
    priceHistoryCache.set(cacheKey, getPriceHistory(etfId, days));
  }

  return priceHistoryCache.get(cacheKey) || [];
};

// 캐시 초기화
export const clearPriceHistoryCache = (): void => {
  priceHistoryCache.clear();
};

// 여러 ETF의 가격 히스토리 비교용 데이터
export const getComparePriceHistory = (etfIds: string[], days: number = 30): Map<string, PriceHistory[]> => {
  const result = new Map<string, PriceHistory[]>();

  etfIds.forEach(id => {
    result.set(id, getPriceHistory(id, days));
  });

  return result;
};

// 가격 히스토리에서 수익률 계산
export const calculateReturnFromHistory = (history: PriceHistory[]): number => {
  if (history.length < 2) return 0;

  const startPrice = history[0].close;
  const endPrice = history[history.length - 1].close;

  return ((endPrice - startPrice) / startPrice) * 100;
};

// 실제 데이터 사용 여부 확인
export const isUsingRealData = (etfId: string): boolean => {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? realKoreanData : realUSData;
  if (!dataList) return false;

  const etfData = dataList.find((e: any) => e.id === etfId);
  return !!etfData?.priceHistory?.length;
};
