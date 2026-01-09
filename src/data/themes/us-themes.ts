// 미국/해외 ETF 테마 데이터 (2026-01-09 기준)
import type { Theme } from '../../types/etf';

export const usThemes: Theme[] = [
  // ========== 미국 대표지수 ==========
  { id: 'us-sp500', name: 'S&P500', description: 'S&P500 지수 추종', etfCount: 8, avgReturn: 25.8, category: 'index', representativeETFId: 'us-1' }, // SPY
  { id: 'us-nasdaq100', name: 'NASDAQ100', description: 'NASDAQ100 지수 추종', etfCount: 6, avgReturn: 32.5, category: 'index', representativeETFId: 'us-4' }, // QQQ
  { id: 'us-dow', name: '다우존스', description: 'Dow Jones 지수 추종', etfCount: 3, avgReturn: 18.2, category: 'index', representativeETFId: 'us-6' }, // DIA
  { id: 'us-russell', name: '러셀2000', description: 'Russell 2000 소형주 지수', etfCount: 2, avgReturn: 12.5, category: 'index', representativeETFId: 'us-9' }, // IWM

  // ========== 기술/성장 ==========
  { id: 'us-bigtech', name: '빅테크', description: 'FAANG, 빅테크 기업', etfCount: 5, avgReturn: 45.2, category: 'sector', representativeETFId: 'us-12' }, // XLK
  { id: 'us-ai', name: 'AI/인공지능', description: 'AI 및 인공지능 관련', etfCount: 4, avgReturn: 55.8, category: 'sector', representativeETFId: 'us-35' }, // ARKK
  { id: 'us-semiconductor', name: '반도체(미국)', description: '미국 반도체 기업', etfCount: 3, avgReturn: 48.5, category: 'sector', representativeETFId: 'us-10' }, // SOXX
  { id: 'us-cloud', name: '클라우드', description: '클라우드 컴퓨팅 기업', etfCount: 2, avgReturn: 28.5, category: 'sector', representativeETFId: 'us-12' }, // XLK
  { id: 'us-software', name: '소프트웨어', description: '소프트웨어 기업', etfCount: 2, avgReturn: 22.8, category: 'sector', representativeETFId: 'us-13' }, // VGT

  // ========== 산업/섹터 ==========
  { id: 'us-healthcare', name: '헬스케어(미국)', description: '미국 헬스케어 기업', etfCount: 3, avgReturn: 8.5, category: 'sector', representativeETFId: 'us-15' }, // XLV
  { id: 'us-finance', name: '금융(미국)', description: '미국 금융 기업', etfCount: 2, avgReturn: 15.2, category: 'sector', representativeETFId: 'us-14' }, // XLF
  { id: 'us-consumer', name: '소비재', description: '미국 소비재 기업', etfCount: 2, avgReturn: 12.8, category: 'sector', representativeETFId: 'us-1' }, // SPY
  { id: 'us-energy', name: '에너지(미국)', description: '미국 에너지 기업', etfCount: 2, avgReturn: -5.2, category: 'sector', representativeETFId: 'us-16' }, // XLE
  { id: 'us-utility', name: '유틸리티', description: '미국 유틸리티 기업', etfCount: 2, avgReturn: 18.5, category: 'sector', representativeETFId: 'us-1' }, // SPY
  { id: 'us-realestate', name: '부동산(미국)', description: '미국 리츠/부동산', etfCount: 2, avgReturn: 5.8, category: 'sector', representativeETFId: 'us-38' }, // VNQ

  // ========== 채권 ==========
  { id: 'us-treasury', name: '미국채', description: '미국 국채', etfCount: 8, avgReturn: -2.5, category: 'bond', representativeETFId: 'us-23' }, // BND
  { id: 'us-treasury-short', name: '미국 단기채', description: '미국 단기 국채', etfCount: 3, avgReturn: 4.2, category: 'bond', representativeETFId: 'us-26' }, // SHY
  { id: 'us-treasury-long', name: '미국 장기채', description: '미국 장기 국채 (20-30년)', etfCount: 4, avgReturn: -8.5, category: 'bond', representativeETFId: 'us-25' }, // TLT
  { id: 'us-corporate', name: '미국 회사채', description: '미국 회사채', etfCount: 3, avgReturn: 2.8, category: 'bond', representativeETFId: 'us-27' }, // LQD
  { id: 'us-tips', name: 'TIPS', description: '물가연동국채', etfCount: 2, avgReturn: 1.5, category: 'bond', representativeETFId: 'us-23' }, // BND

  // ========== 투자전략 ==========
  { id: 'us-dividend', name: '미국 배당주', description: '미국 고배당 기업', etfCount: 5, avgReturn: 12.5, category: 'strategy', representativeETFId: 'us-17' }, // SCHD
  { id: 'us-growth', name: '미국 성장주', description: '미국 고성장 기업', etfCount: 3, avgReturn: 28.5, category: 'strategy', representativeETFId: 'us-20' }, // VUG
  { id: 'us-value', name: '미국 가치주', description: '미국 저평가 기업', etfCount: 2, avgReturn: 8.2, category: 'strategy', representativeETFId: 'us-22' }, // VTV
  { id: 'us-coveredcall', name: '미국 커버드콜', description: '미국 커버드콜 전략', etfCount: 4, avgReturn: 8.5, category: 'strategy', representativeETFId: 'us-1' }, // SPY
  { id: 'us-quality', name: '퀄리티', description: '우량 기업 선별', etfCount: 2, avgReturn: 18.5, category: 'strategy', representativeETFId: 'us-1' }, // SPY

  // ========== 글로벌/지역 ==========
  { id: 'global-developed', name: '선진국', description: '선진국 주식', etfCount: 3, avgReturn: 15.8, category: 'region', representativeETFId: 'us-31' }, // VEA
  { id: 'global-emerging', name: '신흥국', description: '신흥국 주식', etfCount: 3, avgReturn: 8.5, category: 'region', representativeETFId: 'us-32' }, // VWO
  { id: 'china', name: '중국', description: '중국 주식', etfCount: 5, avgReturn: -12.5, category: 'region', representativeETFId: 'us-34' }, // EEM
  { id: 'india', name: '인도', description: '인도 주식', etfCount: 3, avgReturn: 22.5, category: 'region', representativeETFId: 'us-34' }, // EEM
  { id: 'japan', name: '일본', description: '일본 주식', etfCount: 3, avgReturn: 18.2, category: 'region', representativeETFId: 'us-33' }, // EFA
  { id: 'vietnam', name: '베트남', description: '베트남 주식', etfCount: 2, avgReturn: 15.8, category: 'region', representativeETFId: 'us-32' }, // VWO
  { id: 'europe', name: '유럽', description: '유럽 주식', etfCount: 2, avgReturn: 8.5, category: 'region', representativeETFId: 'us-33' }, // EFA

  // ========== 원자재 ==========
  { id: 'commodity-gold', name: '금(해외)', description: '금 가격 추종', etfCount: 2, avgReturn: 28.5, category: 'commodity', representativeETFId: 'us-28' }, // GLD
  { id: 'commodity-silver', name: '은', description: '은 가격 추종', etfCount: 2, avgReturn: 32.8, category: 'commodity', representativeETFId: 'us-30' }, // SLV
  { id: 'commodity-oil', name: '원유(해외)', description: '원유 가격 추종', etfCount: 2, avgReturn: -8.5, category: 'commodity', representativeETFId: 'us-16' }, // XLE

  // ========== 테마/메가트렌드 ==========
  { id: 'theme-ev', name: '전기차', description: '전기차 및 자율주행', etfCount: 3, avgReturn: -5.8, category: 'theme', representativeETFId: 'us-37' }, // ICLN
  { id: 'theme-clean', name: '클린에너지', description: '친환경/재생에너지', etfCount: 2, avgReturn: -12.5, category: 'theme', representativeETFId: 'us-37' }, // ICLN
  { id: 'theme-metaverse', name: '메타버스', description: '메타버스 관련', etfCount: 2, avgReturn: 15.2, category: 'theme', representativeETFId: 'us-35' }, // ARKK
  { id: 'theme-robotics', name: '로봇/자동화', description: '로봇 및 자동화', etfCount: 2, avgReturn: 18.5, category: 'theme', representativeETFId: 'us-36' }, // BOTZ
  { id: 'theme-cyber', name: '사이버보안', description: '사이버 보안', etfCount: 2, avgReturn: 22.5, category: 'theme', representativeETFId: 'us-12' }, // XLK

  // ========== 레버리지/인버스 ==========
  { id: 'us-leverage', name: '미국 레버리지', description: '미국 지수 2배', etfCount: 3, avgReturn: 55.2, category: 'leverage', representativeETFId: 'us-44' }, // TQQQ
  { id: 'us-inverse', name: '미국 인버스', description: '미국 지수 인버스', etfCount: 3, avgReturn: -28.5, category: 'leverage', representativeETFId: 'us-46' }, // SH
];
