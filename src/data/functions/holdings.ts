// 보유종목 및 구성 관련 함수
import type { Holding } from '../../types/etf';
import { etfs, getETFById } from '../etf';

// ETF별 구성종목
export const getHoldings = (etfId: string): Holding[] => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return [];

  // ETF에 holdings 데이터가 있으면 반환
  if (etf.holdings && etf.holdings.length > 0) {
    return etf.holdings.map((h, idx) => ({
      name: h.name,
      ticker: h.ticker,
      weight: h.weight,
      sector: getSectorByTicker(h.ticker, idx),
    }));
  }

  // 기본 구성종목 반환
  return [
    { name: '기타 종목 1', ticker: '000001', weight: 15.0, sector: '기타' },
    { name: '기타 종목 2', ticker: '000002', weight: 12.0, sector: '기타' },
    { name: '기타 종목 3', ticker: '000003', weight: 10.0, sector: '기타' },
  ];
};

// 티커로 섹터 추정
const getSectorByTicker = (ticker: string, idx: number): string => {
  const sectors = ['전자', '반도체', '2차전지', '바이오', '자동차', '금융', 'IT', '화학', '에너지'];
  // 티커 기반 해시로 섹터 결정
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sectors[(hash + idx) % sectors.length];
};

// 섹터별 비중
export const getSectorAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  const sectorTemplates: Record<string, { name: string; weight: number }[]> = {
    '반도체': [
      { name: '반도체', weight: 45 },
      { name: '전자장비', weight: 25 },
      { name: 'IT서비스', weight: 15 },
      { name: '소프트웨어', weight: 10 },
      { name: '기타', weight: 5 },
    ],
    '국내주식': [
      { name: '금융', weight: 20 },
      { name: '제조업', weight: 25 },
      { name: 'IT', weight: 20 },
      { name: '에너지', weight: 15 },
      { name: '소비재', weight: 12 },
      { name: '기타', weight: 8 },
    ],
    '해외주식': [
      { name: 'IT', weight: 30 },
      { name: '헬스케어', weight: 15 },
      { name: '금융', weight: 15 },
      { name: '소비재', weight: 15 },
      { name: '산업재', weight: 12 },
      { name: '기타', weight: 13 },
    ],
    '채권': [
      { name: '국채', weight: 60 },
      { name: '회사채', weight: 25 },
      { name: '금융채', weight: 10 },
      { name: '기타', weight: 5 },
    ],
  };

  // 테마별 매핑
  if (etf.themes.some(t => t.includes('반도체'))) {
    return sectorTemplates['반도체'].map(s => ({
      ...s,
      weight: s.weight + (Math.random() * 4 - 2),
    }));
  }

  const template = sectorTemplates[etf.category] || sectorTemplates['국내주식'];
  return template.map(s => ({
    ...s,
    weight: s.weight + (Math.random() * 4 - 2),
  }));
};

// 자산 비중
export const getAssetAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  const assetTemplates: Record<string, { name: string; weight: number }[]> = {
    '국내주식': [
      { name: '주식', weight: 97 },
      { name: '현금', weight: 3 },
    ],
    '해외주식': [
      { name: '주식', weight: 96 },
      { name: '현금', weight: 4 },
    ],
    '채권': [
      { name: '채권', weight: 95 },
      { name: '현금', weight: 5 },
    ],
    '원자재': [
      { name: '원자재', weight: 85 },
      { name: '선물', weight: 10 },
      { name: '현금', weight: 5 },
    ],
  };

  const template = assetTemplates[etf.category] || assetTemplates['국내주식'];
  return template.map(a => ({
    ...a,
    weight: a.weight + (Math.random() * 2 - 1),
  }));
};

// 국가별 비중
export const getCountryAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  if (etf.id.startsWith('kr') && !etf.themes.some(t =>
    t.includes('미국') || t.includes('S&P') || t.includes('나스닥') || t.includes('중국') || t.includes('인도')
  )) {
    return [{ name: '한국', weight: 100, code: 'KR' }];
  }

  if (etf.themes.some(t => t.includes('S&P') || t.includes('나스닥') || t.includes('미국'))) {
    return [{ name: '미국', weight: 100, code: 'US' }];
  }

  if (etf.themes.some(t => t.includes('중국'))) {
    return [
      { name: '중국', weight: 85, code: 'CN' },
      { name: '홍콩', weight: 15, code: 'HK' },
    ];
  }

  if (etf.themes.some(t => t.includes('인도'))) {
    return [{ name: '인도', weight: 100, code: 'IN' }];
  }

  // 글로벌 ETF
  return [
    { name: '미국', weight: 60, code: 'US' },
    { name: '일본', weight: 10, code: 'JP' },
    { name: '영국', weight: 8, code: 'GB' },
    { name: '프랑스', weight: 6, code: 'FR' },
    { name: '독일', weight: 5, code: 'DE' },
    { name: '기타', weight: 11, code: 'OTHER' },
  ];
};
