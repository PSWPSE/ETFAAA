// 국면분석 데이터를 위한 커스텀 훅

import { useState, useEffect, useCallback } from 'react';
import type { SymbolPhaseAnalysis, MarketType } from '../types/phaseApi';
import { fetchSymbolPhase, fetchMultipleSymbols } from '../services/phaseApi';

interface UsePhaseAnalysisResult {
  data: SymbolPhaseAnalysis | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseMultiplePhasesResult {
  data: Map<string, SymbolPhaseAnalysis>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 단일 심볼 국면분석 훅
 */
export function usePhaseAnalysis(
  symbol: string | null,
  market: MarketType
): UsePhaseAnalysisResult {
  const [data, setData] = useState<SymbolPhaseAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchSymbolPhase(symbol, market);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, market]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 여러 심볼 국면분석 훅 (PhasePage용)
 */
export function useMultiplePhases(
  symbols: string[],
  market: MarketType
): UseMultiplePhasesResult {
  const [data, setData] = useState<Map<string, SymbolPhaseAnalysis>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) {
      setData(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchMultipleSymbols(symbols, market);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [symbols.join(','), market]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 시장 타입을 API MarketType으로 변환
 */
export function getApiMarket(selectedMarket: 'korea' | 'us'): MarketType {
  return selectedMarket === 'korea' ? 'KOR' : 'USA';
}
