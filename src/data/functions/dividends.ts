// 배당 관련 함수
import type { Dividend } from '../../types/etf';
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
  } catch {
    // 실제 데이터 없음
  }

  try {
    const usModule = await import('../real/us-market-data.json');
    realUSData = usModule.default;
  } catch {
    // 실제 데이터 없음
  }
};

// 초기 로드 실행
loadRealData();

// 실제 배당 데이터 가져오기
const getRealDividends = (etfId: string): Dividend[] | null => {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? realKoreanData : realUSData;

  if (!dataList) return null;

  const etfData = dataList.find((e: any) => e.id === etfId);
  if (!etfData || !etfData.dividends?.length) return null;

  return etfData.dividends.map((d: any) => ({
    exDate: d.exDate,
    payDate: d.payDate,
    amount: d.amount,
    frequency: 'quarterly' as const,
  }));
};

// 배당 정보 (시뮬레이션 폴백)
const generateSimulatedDividends = (etfId: string): Dividend[] => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf || etf.dividendYield === 0) return [];

  const dividends: Dividend[] = [];
  const baseAmount = etf.price * (etf.dividendYield / 100 / 4);

  for (let i = 0; i < 8; i++) {
    const exDate = new Date();
    exDate.setMonth(exDate.getMonth() - (i * 3));
    exDate.setDate(15);

    const payDate = new Date(exDate);
    payDate.setDate(payDate.getDate() + 15);

    dividends.push({
      exDate: exDate.toISOString().split('T')[0],
      payDate: payDate.toISOString().split('T')[0],
      amount: Math.round(baseAmount * (0.9 + Math.random() * 0.2)),
      frequency: 'quarterly',
    });
  }

  return dividends;
};

// 배당 정보 (실제 데이터 우선, 없으면 시뮬레이션)
export const getDividends = (etfId: string): Dividend[] => {
  // 1. 먼저 실제 데이터 시도
  const realData = getRealDividends(etfId);
  if (realData && realData.length > 0) {
    return realData;
  }

  // 2. 실제 데이터 없으면 시뮬레이션 사용
  return generateSimulatedDividends(etfId);
};

// 배당 차트 데이터
export const getDividendChartData = (etfId: string) => {
  const dividends = getDividends(etfId);
  if (dividends.length === 0) return [];

  return dividends.slice(0, 8).reverse().map(d => ({
    date: d.payDate.slice(0, 7),
    amount: d.amount,
  }));
};

// 배당 예측 정보
export const getDividendForecast = (etfId: string) => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return null;

  // 실제 배당 데이터가 있으면 그것을 기반으로 예측
  const realDividends = getRealDividends(etfId);
  if (realDividends && realDividends.length > 0) {
    // 가장 최근 배당에서 3개월 후로 예측
    const lastDividend = realDividends[0]; // 이미 정렬되어 있음
    const lastExDate = new Date(lastDividend.exDate);
    const nextExDate = new Date(lastExDate);
    nextExDate.setMonth(nextExDate.getMonth() + 3);

    const today = new Date();
    const daysUntilEx = Math.ceil((nextExDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    return {
      nextExDate: nextExDate.toISOString().slice(0, 10),
      nextPayDate: new Date(nextExDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      estimatedAmount: lastDividend.amount,
      frequency: etf.dividendYield > 3 ? '월배당' : '분기배당',
      daysUntilEx: daysUntilEx > 0 ? daysUntilEx : daysUntilEx + 90, // 이미 지났으면 다음 분기
    };
  }

  // 실제 데이터 없으면 기존 시뮬레이션 로직
  const today = new Date();

  // etfId 해시로 일부 ETF에 7일 이내 배당락일 할당
  const hash = etfId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isNearDividend = hash % 5 === 0;

  let daysUntilEx: number;
  if (isNearDividend && etf.dividendYield > 0) {
    daysUntilEx = (hash % 6) + 1;
  } else {
    const nextQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 15);
    daysUntilEx = Math.ceil((nextQuarter.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  }

  const exDate = new Date(today.getTime() + daysUntilEx * 24 * 60 * 60 * 1000);

  return {
    nextExDate: exDate.toISOString().slice(0, 10),
    nextPayDate: new Date(exDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estimatedAmount: Math.round(etf.price * (etf.dividendYield / 100 / 4)),
    frequency: etf.dividendYield > 3 ? '월배당' : '분기배당',
    daysUntilEx,
  };
};

// 실제 데이터 사용 여부 확인
export const isUsingRealDividendData = (etfId: string): boolean => {
  const realData = getRealDividends(etfId);
  return !!realData && realData.length > 0;
};
