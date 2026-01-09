/**
 * 실제 시장 데이터 로더
 * Yahoo Finance에서 가져온 실제 가격/배당 데이터를 로드합니다.
 */

import type { PriceHistory, Dividend } from '../../types/etf';

// JSON 데이터 타입 정의
interface RealPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface RealDividendData {
  exDate: string;
  payDate: string;
  amount: number;
}

interface RealETFData {
  id: string;
  ticker: string;
  name: string;
  lastUpdated: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  priceHistory: RealPriceData[];
  dividends: RealDividendData[];
}

// 데이터 캐시
let koreanDataCache: RealETFData[] | null = null;
let usDataCache: RealETFData[] | null = null;

// 한국 ETF 데이터 로드
async function loadKoreanData(): Promise<RealETFData[]> {
  if (koreanDataCache) return koreanDataCache;

  try {
    const data = await import('./korean-market-data.json');
    koreanDataCache = data.default as RealETFData[];
    return koreanDataCache;
  } catch (error) {
    console.warn('한국 ETF 실제 데이터 로드 실패, 더미 데이터 사용');
    return [];
  }
}

// 미국 ETF 데이터 로드
async function loadUSData(): Promise<RealETFData[]> {
  if (usDataCache) return usDataCache;

  try {
    const data = await import('./us-market-data.json');
    usDataCache = data.default as RealETFData[];
    return usDataCache;
  } catch (error) {
    console.warn('미국 ETF 실제 데이터 로드 실패, 더미 데이터 사용');
    return [];
  }
}

// ETF ID로 실제 가격 히스토리 가져오기
export async function getRealPriceHistory(
  etfId: string,
  days: number = 30
): Promise<PriceHistory[] | null> {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? await loadKoreanData() : await loadUSData();

  const etfData = dataList.find(e => e.id === etfId);
  if (!etfData || !etfData.priceHistory.length) {
    return null;
  }

  // 요청된 일수만큼 최근 데이터 반환
  const history = etfData.priceHistory.slice(-days);

  return history.map(p => ({
    date: p.date,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close,
    volume: p.volume,
  }));
}

// ETF ID로 실제 배당 데이터 가져오기
export async function getRealDividends(etfId: string): Promise<Dividend[] | null> {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? await loadKoreanData() : await loadUSData();

  const etfData = dataList.find(e => e.id === etfId);
  if (!etfData || !etfData.dividends.length) {
    return null;
  }

  return etfData.dividends.map(d => ({
    exDate: d.exDate,
    payDate: d.payDate,
    amount: d.amount,
    frequency: 'quarterly' as const,
  }));
}

// ETF ID로 현재 가격 정보 가져오기
export async function getRealCurrentPrice(etfId: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  volume: number;
} | null> {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? await loadKoreanData() : await loadUSData();

  const etfData = dataList.find(e => e.id === etfId);
  if (!etfData) {
    return null;
  }

  return {
    price: etfData.currentPrice,
    change: etfData.change,
    changePercent: etfData.changePercent,
    volume: etfData.volume,
  };
}

// 데이터 마지막 업데이트 시간 가져오기
export async function getLastUpdated(etfId: string): Promise<string | null> {
  const isKorean = etfId.startsWith('kr-');
  const dataList = isKorean ? await loadKoreanData() : await loadUSData();

  const etfData = dataList.find(e => e.id === etfId);
  return etfData?.lastUpdated || null;
}

// 캐시 초기화
export function clearRealDataCache(): void {
  koreanDataCache = null;
  usDataCache = null;
}

// 실제 데이터 사용 가능 여부 확인
export async function isRealDataAvailable(): Promise<boolean> {
  try {
    const korean = await loadKoreanData();
    const us = await loadUSData();
    return korean.length > 0 || us.length > 0;
  } catch {
    return false;
  }
}
