// 국면분석 API 서비스

import type {
  ReadmeResponse,
  SymbolPhaseAnalysis,
  MarketType
} from '../types/phaseApi';

const BASE_URL = 'https://ab-algo-contents.alpha-bridge.kr/prod/json/symbol-detection-status';

// 캐시 저장소
let readmeCache: { data: ReadmeResponse; timestamp: number } | null = null;
const symbolCache = new Map<string, { data: SymbolPhaseAnalysis; timestamp: number }>();

const CACHE_TTL = {
  README: 5 * 60 * 1000,  // 5분
  SYMBOL: 1 * 60 * 1000,  // 1분
};

/**
 * readme.json에서 최신 폴더명 조회
 */
export async function fetchReadme(): Promise<ReadmeResponse> {
  // 캐시 확인
  if (readmeCache && Date.now() - readmeCache.timestamp < CACHE_TTL.README) {
    return readmeCache.data;
  }

  const response = await fetch(`${BASE_URL}/readme.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch readme: ${response.status}`);
  }

  const data: ReadmeResponse = await response.json();

  // 캐시 저장
  readmeCache = { data, timestamp: Date.now() };

  return data;
}

/**
 * 심볼을 API 형식으로 변환 (한국: .KS 접미사 추가)
 */
function formatSymbolForApi(symbol: string, market: MarketType): string {
  if (market === 'KOR') {
    // 한국 주식/ETF는 .KS 접미사 필요
    return `${symbol}.KS`;
  }
  return symbol;
}

/**
 * 단일 심볼의 국면분석 데이터 조회
 */
export async function fetchSymbolPhase(
  symbol: string,
  market: MarketType
): Promise<SymbolPhaseAnalysis> {
  const cacheKey = `${market}:${symbol}`;

  // 캐시 확인
  const cached = symbolCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.SYMBOL) {
    return cached.data;
  }

  // readme에서 폴더명 조회
  const readme = await fetchReadme();
  const folderName = readme[market];

  if (!folderName) {
    throw new Error(`No folder found for market: ${market}`);
  }

  // 심볼을 API 형식으로 변환
  const apiSymbol = formatSymbolForApi(symbol, market);
  const url = `${BASE_URL}/${folderName}/${apiSymbol}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch symbol ${symbol}: ${response.status}`);
  }

  const data: SymbolPhaseAnalysis = await response.json();

  // 캐시 저장
  symbolCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}

/**
 * 여러 심볼의 국면분석 데이터 병렬 조회
 */
export async function fetchMultipleSymbols(
  symbols: string[],
  market: MarketType
): Promise<Map<string, SymbolPhaseAnalysis>> {
  const results = new Map<string, SymbolPhaseAnalysis>();

  // 병렬로 모든 심볼 조회
  const promises = symbols.map(async (symbol) => {
    try {
      const data = await fetchSymbolPhase(symbol, market);
      return { symbol, data, error: null };
    } catch (error) {
      console.warn(`Failed to fetch ${symbol}:`, error);
      return { symbol, data: null, error };
    }
  });

  const responses = await Promise.all(promises);

  for (const { symbol, data } of responses) {
    if (data) {
      results.set(symbol, data);
    }
  }

  return results;
}

/**
 * 캐시 초기화
 */
export function clearPhaseCache(): void {
  readmeCache = null;
  symbolCache.clear();
}

/**
 * 현재 폴더명 가져오기 (디버깅용)
 */
export async function getCurrentFolderName(market: MarketType): Promise<string> {
  const readme = await fetchReadme();
  return readme[market] || '';
}
