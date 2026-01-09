import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Plus } from 'lucide-react';
import { Card, ETFSearchCard } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { getETFById, getCorrelatedETFs, koreanETFs, usETFs } from '../data';
import { formatPriceByMarket, formatPercent, getChangeClass } from '../utils/format';
import { useETFStore } from '../store/etfStore';
import type { ETF } from '../types/etf';

export default function CorrelationPage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [baseETFId, setBaseETFId] = useState<string>('');

  // 기준 ETF 및 상관 ETF들
  const baseETF = baseETFId ? getETFById(baseETFId) : null;
  const correlatedETFs = baseETFId ? getCorrelatedETFs(baseETFId, 4) : { positive: [], negative: [] };

  // 전체 ETF 목록
  const allETFs = selectedMarket === 'korea' ? koreanETFs : usETFs;

  // 인기 ETF (시가총액과 거래량 기준)
  const popularETFs = useMemo(() => {
    return [...allETFs]
      .sort((a, b) => {
        // 시가총액과 거래량을 함께 고려한 점수 계산
        const scoreA = (a.marketCap * 0.6) + (a.volume * a.price * 0.4);
        const scoreB = (b.marketCap * 0.6) + (b.volume * b.price * 0.4);
        return scoreB - scoreA;
      })
      .slice(0, 12);
  }, [allETFs]);

  // ETF 선택
  const handleAddETF = (etf: ETF) => {
    setBaseETFId(etf.id);
  };

  // 매트릭스용 ETF 목록 (기준 + 양의 상관 3개 + 음의 상관 3개)
  const matrixETFs = useMemo(() => {
    if (!baseETF) return [];
    return [
      baseETF,
      ...correlatedETFs.positive.slice(0, 3),
      ...correlatedETFs.negative.slice(0, 3),
    ];
  }, [baseETF, correlatedETFs]);

  // 상관관계 매트릭스 생성
  const correlationMatrix = useMemo(() => {
    if (matrixETFs.length === 0) return {};

    const matrix: Record<string, Record<string, number>> = {};
    const baseId = matrixETFs[0].id;

    // 먼저 각 ETF의 기준 ETF와의 상관계수를 저장
    const baseCorrelations: Record<string, number> = {};
    baseCorrelations[baseId] = 1; // 자기 자신

    correlatedETFs.positive.forEach((etf: any) => {
      baseCorrelations[etf.id] = etf.correlation;
    });

    correlatedETFs.negative.forEach((etf: any) => {
      baseCorrelations[etf.id] = etf.correlation;
    });

    // 매트릭스 생성 (대칭성 보장)
    matrixETFs.forEach((etf1, i) => {
      matrix[etf1.id] = {};

      matrixETFs.forEach((etf2, j) => {
        if (i === j) {
          // 대각선: 자기 자신과의 상관계수는 1
          matrix[etf1.id][etf2.id] = 1;
        } else if (etf1.id === baseId) {
          // 기준 ETF와 다른 ETF의 상관계수
          matrix[etf1.id][etf2.id] = baseCorrelations[etf2.id] || 0;
        } else if (etf2.id === baseId) {
          // 대칭성: 다른 ETF와 기준 ETF의 상관계수
          matrix[etf1.id][etf2.id] = baseCorrelations[etf1.id] || 0;
        } else {
          // 다른 ETF들끼리의 상관계수
          // 같은 그룹(양의 or 음의)이면 높은 상관관계
          const etf1IsPositive = correlatedETFs.positive.some((e: any) => e.id === etf1.id);
          const etf2IsPositive = correlatedETFs.positive.some((e: any) => e.id === etf2.id);

          if (etf1IsPositive === etf2IsPositive) {
            // 같은 그룹: 0.6 ~ 0.85
            matrix[etf1.id][etf2.id] = 0.6 + Math.random() * 0.25;
          } else {
            // 다른 그룹: -0.6 ~ -0.3
            matrix[etf1.id][etf2.id] = -0.6 + Math.random() * 0.3;
          }
        }
      });
    });

    // 대칭성 강제 적용 (하삼각행렬을 상삼각행렬에 복사)
    matrixETFs.forEach((etf1, i) => {
      matrixETFs.forEach((etf2, j) => {
        if (i < j) {
          matrix[etf2.id][etf1.id] = matrix[etf1.id][etf2.id];
        }
      });
    });

    return matrix;
  }, [matrixETFs, correlatedETFs]);

  const getCorrelationColor = (value: number): string => {
    if (value === 1) return 'rgba(99, 102, 241, 0.1)'; // 대각선 (자기 자신)
    if (value >= 0.7) return 'rgba(34, 197, 94, 0.2)'; // 강한 양의 상관
    if (value >= 0.3) return 'rgba(34, 197, 94, 0.1)'; // 약한 양의 상관
    if (value >= -0.3) return 'rgba(229, 231, 235, 0.5)'; // 무상관
    if (value >= -0.7) return 'rgba(239, 68, 68, 0.1)'; // 약한 음의 상관
    return 'rgba(239, 68, 68, 0.2)'; // 강한 음의 상관
  };

  const getCorrelationTextColor = (value: number): string => {
    if (value === 1) return '#6366F1'; // 대각선
    if (value >= 0.7) return '#16A34A'; // 강한 양의 상관
    if (value >= 0.3) return '#22C55E'; // 약한 양의 상관
    if (value >= -0.3) return '#6B7280'; // 무상관
    if (value >= -0.7) return '#EF4444'; // 약한 음의 상관
    return '#DC2626'; // 강한 음의 상관
  };

  const getCorrelationLabel = (value: number): string => {
    if (value >= 0.7) return '강한 양의 상관';
    if (value >= 0.3) return '약한 양의 상관';
    if (value >= -0.3) return '상관관계 없음';
    if (value >= -0.7) return '약한 음의 상관';
    return '강한 음의 상관';
  };

  return (
    <PageContainer
      title="연관도 분석"
      subtitle="ETF 간의 상관관계를 분석하세요"
      showMarketSelector={true}
    >
      {/* ETF 검색 */}
      <ETFSearchCard
        title="기준 ETF 선택"
        subtitle="상관관계를 분석할 기준 ETF를 검색하세요"
        selectedETFId={baseETFId}
        onSelect={(id) => setBaseETFId(id)}
        placeholder="ETF 이름 또는 티커 입력"
        required={true}
      />

      {/* 최근 관심이 많이 받는 ETF */}
      {!baseETF && (
        <div className="mt-md p-lg bg-white border border-border rounded-md shadow-card animate-[fadeIn_0.3s_ease-out] md:p-lg lg:p-md lg:px-lg">
          <div className="mb-lg">
            <div className="flex items-center gap-sm">
              <TrendingUp size={18} className="shrink-0 text-primary" />
              <div>
                <h3 className="text-base font-bold text-text-primary m-0 mb-1 tracking-[-0.01em]">최근 관심이 많이 받는 ETF</h3>
                <p className="text-xs text-text-secondary m-0 font-medium">시가총액과 거래량 기준</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 md:grid-cols-3">
            {popularETFs.map((etf, index) => (
              <button
                key={etf.id}
                className="flex p-[14px] sm:p-4 bg-layer-0 border border-border rounded-md text-left transition-all cursor-pointer animate-[fadeIn_0.3s_ease-out_backwards] hover:border-primary hover:bg-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] group"
                onClick={() => handleAddETF(etf)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 w-full">
                  <span className="inline-flex items-center justify-center w-[22px] h-[22px] sm:w-6 sm:h-6 text-[11px] sm:text-xs font-bold text-text-secondary bg-white rounded-sm shrink-0">{index + 1}</span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="text-[13px] sm:text-sm font-semibold text-text-primary m-0 whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                      <span className="font-semibold text-text-tertiary font-mono">{etf.ticker}</span>
                      <span className="text-border">•</span>
                      <span className={`font-semibold font-mono tabular-nums ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                  </div>
                  <Plus size={16} className="shrink-0 text-text-tertiary transition-all group-hover:text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {baseETF && (
        <>
          {/* 상관관계 매트릭스 */}
          <Card>
            <div className="flex flex-col gap-1.5 mb-lg">
              <div className="flex items-center gap-xs">
                <Activity size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-text-primary m-0">상관관계 매트릭스</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-[1.4]">선택된 ETF들 간의 상관관계를 한눈에 확인할 수 있습니다</p>
            </div>

            <div className="flex flex-col gap-md">
              <div className="overflow-x-auto scrollbar-touch">
                <div className="flex flex-col border border-border/50 rounded-md overflow-hidden max-md:min-w-full">
                  {/* Header Row */}
                  <div className="flex">
                    <div className="flex-[0_0_80px] w-20 max-md:flex-[0_0_60px] max-md:w-[60px] bg-layer-1 border-b border-border border-r" />
                    {matrixETFs.map((etf, index) => (
                      <button
                        key={etf.id}
                        className={`flex-1 min-w-[80px] max-md:min-w-[60px] flex items-center justify-center px-2 py-3.5 max-md:py-3 max-md:px-1.5 min-h-[48px] max-md:min-h-[40px] border-none border-b border-border border-r border-r-border/50 last:border-r-0 cursor-pointer transition-all hover:bg-layer-0 hover:-translate-y-0.5 max-md:hover:transform-none ${
                          index === 0
                            ? 'bg-gradient-to-br from-[rgba(99,102,241,0.08)] to-[rgba(99,102,241,0.04)] hover:from-[rgba(99,102,241,0.12)] hover:to-[rgba(99,102,241,0.06)]'
                            : 'bg-layer-1'
                        }`}
                        onClick={() => navigate(`/etf/${etf.id}`)}
                        title={`${etf.name} 상세보기`}
                      >
                        <span className={`text-[11px] max-md:text-[10px] font-bold text-center tracking-[-0.01em] ${index === 0 ? 'text-primary font-extrabold' : 'text-text-primary'}`}>{etf.ticker}</span>
                      </button>
                    ))}
                  </div>

                  {/* Data Rows */}
                  {matrixETFs.map((etf1, rowIndex) => (
                    <div key={etf1.id} className="flex">
                      <button
                        className={`flex-[0_0_80px] w-20 max-md:flex-[0_0_60px] max-md:w-[60px] flex items-center justify-center px-2 py-3.5 max-md:py-3 max-md:px-1.5 min-h-[48px] max-md:min-h-[40px] border-none border-b border-border/50 last:border-b-0 border-r border-r-border cursor-pointer transition-all hover:bg-layer-0 hover:-translate-x-0.5 max-md:hover:transform-none ${
                          rowIndex === 0
                            ? 'bg-gradient-to-br from-[rgba(99,102,241,0.08)] to-[rgba(99,102,241,0.04)] font-extrabold hover:from-[rgba(99,102,241,0.12)] hover:to-[rgba(99,102,241,0.06)]'
                            : 'bg-layer-1'
                        }`}
                        onClick={() => navigate(`/etf/${etf1.id}`)}
                        title={`${etf1.name} 상세보기`}
                      >
                        <span className={`text-[11px] max-md:text-[10px] font-bold tracking-[-0.01em] ${rowIndex === 0 ? 'text-primary' : 'text-text-primary'}`}>{etf1.ticker}</span>
                      </button>
                      {matrixETFs.map((etf2) => {
                        const value = correlationMatrix[etf1.id]?.[etf2.id] || 0;
                        return (
                          <div
                            key={etf2.id}
                            className="flex-1 min-w-[80px] max-md:min-w-[60px] flex items-center justify-center px-2 py-3.5 max-md:py-3 max-md:px-1.5 min-h-[48px] max-md:min-h-[40px] text-[13px] max-md:text-[11px] font-bold tabular-nums border-r border-r-border/50 border-b border-b-border/50 last:border-r-0 transition-all relative hover:scale-[1.08] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:z-10 hover:rounded"
                            style={{
                              background: getCorrelationColor(value),
                              color: getCorrelationTextColor(value),
                            }}
                            title={`${etf1.ticker} ↔ ${etf2.ticker}: ${getCorrelationLabel(value)}`}
                          >
                            {value.toFixed(2)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap gap-sm max-md:gap-[10px] p-md max-md:p-3 bg-layer-0 rounded-md">
                <div className="flex items-center gap-1.5 max-md:gap-1">
                  <span className="w-5 h-5 max-md:w-4 max-md:h-4 rounded border border-border/50 shrink-0" style={{ background: 'rgba(239, 68, 68, 0.2)' }} />
                  <span className="text-[11px] max-md:text-[10px] font-semibold text-text-secondary whitespace-nowrap">강한 음의 상관</span>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-text-tertiary whitespace-nowrap tabular-nums">-1.0 ~ -0.7</span>
                </div>
                <div className="flex items-center gap-1.5 max-md:gap-1">
                  <span className="w-5 h-5 max-md:w-4 max-md:h-4 rounded border border-border/50 shrink-0" style={{ background: 'rgba(239, 68, 68, 0.1)' }} />
                  <span className="text-[11px] max-md:text-[10px] font-semibold text-text-secondary whitespace-nowrap">약한 음의 상관</span>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-text-tertiary whitespace-nowrap tabular-nums">-0.7 ~ -0.3</span>
                </div>
                <div className="flex items-center gap-1.5 max-md:gap-1">
                  <span className="w-5 h-5 max-md:w-4 max-md:h-4 rounded border border-border/50 shrink-0" style={{ background: 'rgba(229, 231, 235, 0.5)' }} />
                  <span className="text-[11px] max-md:text-[10px] font-semibold text-text-secondary whitespace-nowrap">무상관</span>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-text-tertiary whitespace-nowrap tabular-nums">-0.3 ~ 0.3</span>
                </div>
                <div className="flex items-center gap-1.5 max-md:gap-1">
                  <span className="w-5 h-5 max-md:w-4 max-md:h-4 rounded border border-border/50 shrink-0" style={{ background: 'rgba(34, 197, 94, 0.1)' }} />
                  <span className="text-[11px] max-md:text-[10px] font-semibold text-text-secondary whitespace-nowrap">약한 양의 상관</span>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-text-tertiary whitespace-nowrap tabular-nums">0.3 ~ 0.7</span>
                </div>
                <div className="flex items-center gap-1.5 max-md:gap-1">
                  <span className="w-5 h-5 max-md:w-4 max-md:h-4 rounded border border-border/50 shrink-0" style={{ background: 'rgba(34, 197, 94, 0.2)' }} />
                  <span className="text-[11px] max-md:text-[10px] font-semibold text-text-secondary whitespace-nowrap">강한 양의 상관</span>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-text-tertiary whitespace-nowrap tabular-nums">0.7 ~ 1.0</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 상관관계 분석 */}
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-md">
            {/* 양의 상관관계 */}
            <Card>
              <div className="flex flex-col gap-1.5 mb-lg">
                <h4 className="text-sm font-bold text-text-primary m-0 mb-sm pb-xs border-b border-border/50">같은 방향 (양의 상관관계)</h4>
              </div>
              <div className="flex flex-col gap-0 m-0 p-0">
                {correlatedETFs.positive.slice(0, 4).map((etf: any) => (
                  <button
                    key={etf.id}
                    className="w-full flex items-center justify-between py-sm px-0 bg-transparent border-none border-b border-border/50 cursor-pointer transition-all text-left last:border-b-0 hover:bg-layer-1 hover:px-xs max-md:hover:px-0"
                    onClick={() => navigate(`/etf/${etf.id}`)}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm max-md:text-[13px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</span>
                      <span className="text-xs max-md:text-[11px] font-medium text-text-tertiary">{etf.ticker}</span>
                    </div>
                    <div className="flex items-center gap-sm max-md:gap-xs shrink-0">
                      <span className="text-[11px] max-md:text-[10px] font-semibold text-text-tertiary tabular-nums min-w-[36px] max-md:min-w-8 text-right">
                        +{(etf.correlation * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm max-md:text-[13px] font-semibold text-text-primary tabular-nums min-w-[70px] max-md:min-w-[60px] text-right">{formatPriceByMarket(etf.price, selectedMarket)}</span>
                      <span className={`text-xs max-md:text-[11px] font-semibold min-w-[50px] max-md:min-w-[45px] text-right ${getChangeClass(etf.changePercent)}`}>{formatPercent(etf.changePercent)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* 음의 상관관계 */}
            <Card>
              <div className="flex flex-col gap-1.5 mb-lg">
                <h4 className="text-sm font-bold text-text-primary m-0 mb-sm pb-xs border-b border-border/50">반대 방향 (음의 상관관계)</h4>
              </div>
              <div className="flex flex-col gap-0 m-0 p-0">
                {correlatedETFs.negative.slice(0, 4).map((etf: any) => (
                  <button
                    key={etf.id}
                    className="w-full flex items-center justify-between py-sm px-0 bg-transparent border-none border-b border-border/50 cursor-pointer transition-all text-left last:border-b-0 hover:bg-layer-1 hover:px-xs max-md:hover:px-0"
                    onClick={() => navigate(`/etf/${etf.id}`)}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-sm max-md:text-[13px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</span>
                      <span className="text-xs max-md:text-[11px] font-medium text-text-tertiary">{etf.ticker}</span>
                    </div>
                    <div className="flex items-center gap-sm max-md:gap-xs shrink-0">
                      <span className="text-[11px] max-md:text-[10px] font-semibold text-text-tertiary tabular-nums min-w-[36px] max-md:min-w-8 text-right">
                        {(etf.correlation * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm max-md:text-[13px] font-semibold text-text-primary tabular-nums min-w-[70px] max-md:min-w-[60px] text-right">{formatPriceByMarket(etf.price, selectedMarket)}</span>
                      <span className={`text-xs max-md:text-[11px] font-semibold min-w-[50px] max-md:min-w-[45px] text-right ${getChangeClass(etf.changePercent)}`}>{formatPercent(etf.changePercent)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}
