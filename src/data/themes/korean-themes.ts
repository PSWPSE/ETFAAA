// 한국 ETF 테마 데이터 (2026-01-09 기준)
import type { Theme } from '../../types/etf';

export const koreanThemes: Theme[] = [
  // ========== 투자국가/지역/대표지수 ==========
  { id: 'kr-kospi200', name: 'KOSPI200', description: 'KOSPI200 지수 추종', etfCount: 12, avgReturn: 8.5, category: 'index', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-kosdaq150', name: 'KOSDAQ150', description: 'KOSDAQ150 지수 추종', etfCount: 6, avgReturn: 5.2, category: 'index', representativeETFId: 'kr-4' }, // KODEX 코스닥150
  { id: 'kr-krx300', name: 'KRX300', description: 'KRX300 지수 추종', etfCount: 4, avgReturn: 7.8, category: 'index', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-msci', name: 'MSCI Korea', description: 'MSCI Korea 지수 추종', etfCount: 3, avgReturn: 9.2, category: 'index', representativeETFId: 'kr-11' }, // KODEX MSCI Korea TR

  // ========== 산업/업종/섹터 ==========
  { id: 'kr-semiconductor', name: '반도체', description: '반도체 관련 기업에 투자', etfCount: 8, avgReturn: 42.3, category: 'sector', representativeETFId: 'kr-12' }, // KODEX 반도체
  { id: 'kr-battery', name: '2차전지', description: '배터리 및 전기차 관련 기업', etfCount: 6, avgReturn: -8.5, category: 'sector', representativeETFId: 'kr-25' }, // KODEX 2차전지산업
  { id: 'kr-bio', name: '바이오/헬스케어', description: '바이오 및 헬스케어 기업', etfCount: 5, avgReturn: 12.5, category: 'sector', representativeETFId: 'kr-47' }, // KODEX 바이오
  { id: 'kr-it', name: 'IT/기술', description: 'IT 및 기술 기업', etfCount: 4, avgReturn: 18.5, category: 'sector', representativeETFId: 'kr-12' }, // KODEX 반도체
  { id: 'kr-auto', name: '자동차', description: '자동차 관련 기업', etfCount: 3, avgReturn: 15.8, category: 'sector', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-finance', name: '금융', description: '은행, 보험 등 금융 기업', etfCount: 5, avgReturn: 6.2, category: 'sector', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-steel', name: '철강/소재', description: '철강 및 소재 기업', etfCount: 3, avgReturn: 8.5, category: 'sector', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-energy', name: '에너지/화학', description: '에너지 및 화학 기업', etfCount: 3, avgReturn: -2.5, category: 'sector', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-shipbuilding', name: '조선', description: '조선 관련 기업', etfCount: 2, avgReturn: 65.2, category: 'sector', representativeETFId: 'kr-45' }, // SOL 조선TOP3플러스
  { id: 'kr-defense', name: '방산', description: '방위산업 관련 기업', etfCount: 2, avgReturn: 45.8, category: 'sector', representativeETFId: 'kr-46' }, // PLUS K방산
  { id: 'kr-ai', name: 'AI/인공지능', description: 'AI 관련 기업에 투자', etfCount: 5, avgReturn: 35.2, category: 'sector', representativeETFId: 'kr-23' }, // KODEX 미국AI전력핵심인프라

  // ========== 투자전략 ==========
  { id: 'kr-dividend', name: '배당주', description: '고배당 기업에 투자', etfCount: 8, avgReturn: 5.8, category: 'strategy', representativeETFId: 'kr-28' }, // PLUS 고배당주
  { id: 'kr-coveredcall', name: '커버드콜', description: '커버드콜 전략', etfCount: 6, avgReturn: 4.2, category: 'strategy', representativeETFId: 'kr-31' }, // TIGER 200커버드콜ATM
  { id: 'kr-growth', name: '성장주', description: '고성장 기업에 투자', etfCount: 5, avgReturn: 12.5, category: 'strategy', representativeETFId: 'kr-44' }, // TIGER 코리아TOP10
  { id: 'kr-value', name: '가치주', description: '저평가 우량 기업', etfCount: 4, avgReturn: 8.2, category: 'strategy', representativeETFId: 'kr-1' }, // KODEX 200
  { id: 'kr-tr', name: 'TR(배당재투자)', description: '배당재투자형 ETF', etfCount: 6, avgReturn: 9.8, category: 'strategy', representativeETFId: 'kr-9' }, // KODEX 200TR

  // ========== 투자자산 ==========
  { id: 'kr-bond', name: '채권', description: '국채 및 회사채', etfCount: 15, avgReturn: 2.5, category: 'asset', representativeETFId: 'kr-34' }, // KODEX 단기채권PLUS
  { id: 'kr-gold', name: '금', description: '금 가격 추종', etfCount: 3, avgReturn: 28.5, category: 'asset', representativeETFId: 'kr-50' }, // KODEX 골드선물(H) - 실제 있다고 가정
  { id: 'kr-oil', name: '원유', description: '원유 가격 추종', etfCount: 2, avgReturn: 12.5, category: 'asset', representativeETFId: 'kr-1' }, // placeholder
  { id: 'kr-reit', name: '리츠/부동산', description: '부동산 투자', etfCount: 5, avgReturn: 3.5, category: 'asset', representativeETFId: 'kr-1' }, // placeholder
  { id: 'kr-currency', name: '통화', description: '환율 추종', etfCount: 3, avgReturn: 5.2, category: 'asset', representativeETFId: 'kr-1' }, // placeholder
  { id: 'kr-mmf', name: '머니마켓', description: '단기 금융상품', etfCount: 8, avgReturn: 3.5, category: 'asset', representativeETFId: 'kr-41' }, // KODEX 머니마켓액티브
  { id: 'kr-cd', name: 'CD금리', description: 'CD금리 연동', etfCount: 5, avgReturn: 3.6, category: 'asset', representativeETFId: 'kr-37' }, // KODEX CD금리액티브(합성)

  // ========== 단일종목 ==========
  { id: 'kr-samsung', name: '삼성그룹', description: '삼성그룹 관련', etfCount: 3, avgReturn: 5.5, category: 'single', representativeETFId: 'kr-14' }, // KODEX 삼성그룹

  // ========== 레버리지/인버스 ==========
  { id: 'kr-leverage', name: '레버리지', description: '2배 수익 추구', etfCount: 6, avgReturn: 18.5, category: 'leverage', representativeETFId: 'kr-5' }, // KODEX 레버리지
  { id: 'kr-inverse', name: '인버스', description: '하락장 수익 추구', etfCount: 5, avgReturn: -12.2, category: 'leverage', representativeETFId: 'kr-6' }, // KODEX 200선물인버스2X
];
