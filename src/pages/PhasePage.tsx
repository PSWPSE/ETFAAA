import { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Snowflake, TrendingUp,
  AlertTriangle, Loader2
} from 'lucide-react';
import { Card } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanETFs, usETFs } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPriceByMarket, formatPercent, getChangeClass } from '../utils/format';
import { useMultiplePhases, getApiMarket } from '../hooks/usePhaseAnalysis';
import type { SymbolPhaseAnalysis, PeriodType } from '../types/phaseApi';
import type { ETF } from '../types/etf';

type Period = 'short' | 'mid' | 'long';

// ETF와 API 국면분석 데이터를 결합한 타입
interface ETFWithPhase extends ETF {
  phaseData: SymbolPhaseAnalysis | null;
}

// 기간 타입 매핑
const PERIOD_TO_API: Record<Period, PeriodType> = {
  short: 'S',
  mid: 'M',
  long: 'L',
};

export default function PhasePage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();

  const [tickerIndex, setTickerIndex] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const phaseCardRef = useRef<HTMLDivElement>(null);
  const trendCardRef = useRef<HTMLDivElement>(null);

  // Section refs
  const shortOverheatedRef = useRef<HTMLElement>(null);
  const shortOversoldRef = useRef<HTMLElement>(null);
  const midOverheatedRef = useRef<HTMLElement>(null);
  const midOversoldRef = useRef<HTMLElement>(null);
  const shortBullishRef = useRef<HTMLElement>(null);
  const shortBearishRef = useRef<HTMLElement>(null);
  const midBullishRef = useRef<HTMLElement>(null);
  const midBearishRef = useRef<HTMLElement>(null);
  const crashRiskRef = useRef<HTMLElement>(null);

  // ETF 목록
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;

  // 심볼 목록 추출
  const symbols = useMemo(() => etfs.map(e => e.ticker), [etfs]);

  // API 시장 타입
  const apiMarket = getApiMarket(selectedMarket === 'korea' ? 'korea' : 'us');

  // API에서 국면분석 데이터 조회
  const { data: phaseDataMap, loading, error } = useMultiplePhases(symbols, apiMarket);

  // ETF와 국면분석 데이터 결합
  const etfsWithPhase: ETFWithPhase[] = useMemo(() => {
    return etfs.map(etf => ({
      ...etf,
      phaseData: phaseDataMap.get(etf.ticker) || null,
    }));
  }, [etfs, phaseDataMap]);

  // 특정 기간의 status_level 가져오기 (null인 경우 0 반환 - 데이터 없음)
  const getStatusLevel = (etf: ETFWithPhase, period: Period): number => {
    if (!etf.phaseData) return 0;
    const apiPeriod = PERIOD_TO_API[period];
    const level = etf.phaseData[apiPeriod]?.status?.status_level;
    return level ?? 0; // null인 경우 0 (데이터 없음)
  };

  // 특정 기간의 predict_ratio 가져오기
  const getPredictRatio = (etf: ETFWithPhase, period: Period): number => {
    if (!etf.phaseData) return 0;
    const apiPeriod = PERIOD_TO_API[period];
    return etf.phaseData[apiPeriod]?.status?.predict_ratio ?? 0;
  };

  // 특정 기간의 status_level_text 가져오기
  const getStatusText = (etf: ETFWithPhase, period: Period): string => {
    if (!etf.phaseData) return '데이터 없음';
    const apiPeriod = PERIOD_TO_API[period];
    return etf.phaseData[apiPeriod]?.status?.status_level_text ?? '데이터 없음';
  };

  // 특정 기간의 recommend_opinion 가져오기
  const getRecommendOpinion = (etf: ETFWithPhase, period: Period): string => {
    if (!etf.phaseData) return '';
    const apiPeriod = PERIOD_TO_API[period];
    return etf.phaseData[apiPeriod]?.status?.recommend_opinion ?? '';
  };

  // 티커 아이템 생성
  const tickerItems = useMemo(() => {
    if (loading || etfsWithPhase.length === 0) return [];

    const items: Array<{
      period: string;
      category: string;
      description: string;
      etf: ETFWithPhase;
      color: string;
      bgColor: string;
      icon: string;
      metric: string;
    }> = [];

    const periods: { key: Period; label: string }[] = [
      { key: 'short', label: '단기' },
      { key: 'mid', label: '중기' },
      { key: 'long', label: '장기' },
    ];

    periods.forEach((period) => {
      // 과열 종목 (status_level >= 3)
      const overheated = etfsWithPhase
        .filter(e => e.phaseData && getStatusLevel(e, period.key) >= 3)
        .sort((a, b) => getStatusLevel(b, period.key) - getStatusLevel(a, period.key) || getPredictRatio(b, period.key) - getPredictRatio(a, period.key));

      if (overheated.length > 0) {
        const top = overheated[0];
        items.push({
          period: period.label,
          category: getStatusText(top, period.key),
          description: `신뢰도 ${getPredictRatio(top, period.key)}% · ${getRecommendOpinion(top, period.key)}`,
          etf: top,
          color: getStatusLevel(top, period.key) === 4 ? '#EF4444' : '#F59E0B',
          bgColor: 'rgba(239, 68, 68, 0.05)',
          icon: '🔥',
          metric: `레벨 ${getStatusLevel(top, period.key)}`,
        });
      }

      // 공포 종목 (status_level === 1)
      const oversold = etfsWithPhase
        .filter(e => e.phaseData && getStatusLevel(e, period.key) === 1)
        .sort((a, b) => getPredictRatio(b, period.key) - getPredictRatio(a, period.key));

      if (oversold.length > 0) {
        const top = oversold[0];
        items.push({
          period: period.label,
          category: getStatusText(top, period.key),
          description: `신뢰도 ${getPredictRatio(top, period.key)}% · ${getRecommendOpinion(top, period.key)}`,
          etf: top,
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.05)',
          icon: '❄️',
          metric: `레벨 ${getStatusLevel(top, period.key)}`,
        });
      }
    });

    return items;
  }, [etfsWithPhase, loading]);

  // 큐레이팅 섹션 데이터
  const curatedSections = useMemo(() => {
    if (loading) return [];

    // 단기 과열 (status_level >= 3)
    const shortOverheated = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'short') >= 3)
      .sort((a, b) => getPredictRatio(b, 'short') - getPredictRatio(a, 'short'))
      .slice(0, 5);

    // 단기 공포 (status_level === 1)
    const shortOversold = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'short') === 1)
      .sort((a, b) => getPredictRatio(b, 'short') - getPredictRatio(a, 'short'))
      .slice(0, 5);

    // 중기 과열
    const midOverheated = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'mid') >= 3)
      .sort((a, b) => getPredictRatio(b, 'mid') - getPredictRatio(a, 'mid'))
      .slice(0, 5);

    // 중기 공포
    const midOversold = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'mid') === 1)
      .sort((a, b) => getPredictRatio(b, 'mid') - getPredictRatio(a, 'mid'))
      .slice(0, 5);

    // 장기 과열
    const longOverheated = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'long') >= 3)
      .sort((a, b) => getPredictRatio(b, 'long') - getPredictRatio(a, 'long'))
      .slice(0, 5);

    // 장기 공포
    const longOversold = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'long') === 1)
      .sort((a, b) => getPredictRatio(b, 'long') - getPredictRatio(a, 'long'))
      .slice(0, 5);

    // 중립 섹션 (status_level === 2)
    const shortNeutral = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'short') === 2)
      .sort((a, b) => getPredictRatio(b, 'short') - getPredictRatio(a, 'short'))
      .slice(0, 5);

    const midNeutral = etfsWithPhase
      .filter(e => e.phaseData && getStatusLevel(e, 'mid') === 2)
      .sort((a, b) => getPredictRatio(b, 'mid') - getPredictRatio(a, 'mid'))
      .slice(0, 5);

    // 큰 과열 (status_level === 4)
    const extremeOverheated = etfsWithPhase
      .filter(e => e.phaseData && (
        getStatusLevel(e, 'short') === 4 ||
        getStatusLevel(e, 'mid') === 4 ||
        getStatusLevel(e, 'long') === 4
      ))
      .sort((a, b) => {
        const aMax = Math.max(getStatusLevel(a, 'short'), getStatusLevel(a, 'mid'), getStatusLevel(a, 'long'));
        const bMax = Math.max(getStatusLevel(b, 'short'), getStatusLevel(b, 'mid'), getStatusLevel(b, 'long'));
        return bMax - aMax;
      })
      .slice(0, 5);

    return [
      {
        id: 'short_overheated',
        title: '단기 과열 국면',
        icon: Flame,
        period: 'short' as Period,
        periodLabel: '단기',
        description: '빠른 조정 가능성, 신중한 접근 필요',
        data: shortOverheated,
        ref: shortOverheatedRef,
        iconColor: 'text-[#EF4444]',
      },
      {
        id: 'short_oversold',
        title: '단기 공포 국면',
        icon: Snowflake,
        period: 'short' as Period,
        periodLabel: '단기',
        description: '반등 기회, 저점 매수 검토',
        data: shortOversold,
        ref: shortOversoldRef,
        iconColor: 'text-[#3B82F6]',
      },
      {
        id: 'mid_overheated',
        title: '중기 과열 국면',
        icon: Flame,
        period: 'mid' as Period,
        periodLabel: '중기',
        description: '조정 대기, 비중 축소 고려',
        data: midOverheated,
        ref: midOverheatedRef,
        iconColor: 'text-[#F59E0B]',
      },
      {
        id: 'mid_oversold',
        title: '중기 공포 국면',
        icon: Snowflake,
        period: 'mid' as Period,
        periodLabel: '중기',
        description: '반등 잠재력, 분할 매수 검토',
        data: midOversold,
        ref: midOversoldRef,
        iconColor: 'text-[#3B82F6]',
      },
      {
        id: 'short_neutral',
        title: '단기 중립 국면',
        icon: TrendingUp,
        period: 'short' as Period,
        periodLabel: '단기',
        description: '안정적 흐름, 추세 관찰',
        data: shortNeutral,
        ref: shortBullishRef,
        iconColor: 'text-[#10B981]',
      },
      {
        id: 'mid_neutral',
        title: '중기 중립 국면',
        icon: TrendingUp,
        period: 'mid' as Period,
        periodLabel: '중기',
        description: '박스권, 방향성 주시',
        data: midNeutral,
        ref: shortBearishRef,
        iconColor: 'text-[#8B5CF6]',
      },
      {
        id: 'long_overheated',
        title: '장기 과열 국면',
        icon: Flame,
        period: 'long' as Period,
        periodLabel: '장기',
        description: '장기 고점 경고, 리밸런싱 고려',
        data: longOverheated,
        ref: midBullishRef,
        iconColor: 'text-[#DC2626]',
      },
      {
        id: 'long_oversold',
        title: '장기 공포 국면',
        icon: Snowflake,
        period: 'long' as Period,
        periodLabel: '장기',
        description: '장기 투자 기회, 적립식 매수',
        data: longOversold,
        ref: midBearishRef,
        iconColor: 'text-[#0EA5E9]',
      },
      {
        id: 'extreme_overheated',
        title: '극단적 과열 경고',
        icon: AlertTriangle,
        period: 'mid' as Period,
        periodLabel: '복합',
        description: '레벨 4 과열, 적극적 비중 축소 권장',
        data: extremeOverheated,
        ref: crashRiskRef,
        iconColor: 'text-[#991B1B]',
      },
    ];
  }, [etfsWithPhase, loading]);

  // Intersection Observer for animations
  useEffect(() => {
    const sectionElements = curatedSections
      .map(section => section.ref.current)
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionElements.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  }, [curatedSections]);

  // Dashboard animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (phaseCardRef.current) {
        phaseCardRef.current.classList.add('animate-pulse');
        setTimeout(() => {
          phaseCardRef.current?.classList.remove('animate-pulse');
        }, 1000);
      }

      setTimeout(() => {
        if (trendCardRef.current) {
          trendCardRef.current.classList.add('animate-pulse');
          setTimeout(() => {
            trendCardRef.current?.classList.remove('animate-pulse');
          }, 1000);
        }
      }, 1500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Ticker rotation
  useEffect(() => {
    if (tickerItems.length === 0) return;

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tickerItems.length]);

  const handleETFClick = (etfId: string) => {
    navigate(`/etf/${etfId}`);
  };

  // 로딩 상태
  if (loading) {
    return (
      <PageContainer
        title="시장 국면"
        subtitle="현재 시장 상황에 맞는 ETF를 찾아보세요"
        showMarketSelector={true}
      >
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">국면 분석 데이터를 불러오는 중...</p>
        </div>
      </PageContainer>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <PageContainer
        title="시장 국면"
        subtitle="현재 시장 상황에 맞는 ETF를 찾아보세요"
        showMarketSelector={true}
      >
        <Card className="!p-xl text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-2">데이터를 불러오는 중 오류가 발생했습니다</p>
          <p className="text-xs text-text-tertiary">{error.message}</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="시장 국면"
      subtitle="현재 시장 상황에 맞는 ETF를 찾아보세요"
      showMarketSelector={true}
    >
      {/* Phase Analysis Matrix */}
      <section ref={pageRef} className="flex flex-col gap-lg">
        {/* Ticker Banner */}
        {tickerItems.length > 0 && (
          <div className="flex flex-col gap-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-[20px] rounded-xl border border-[rgba(30,58,95,0.08)] shadow-[0_1px_3px_rgba(30,58,95,0.03),0_8px_24px_rgba(30,58,95,0.06)] transition-all relative overflow-hidden hover:shadow-[0_1px_3px_rgba(30,58,95,0.05),0_12px_32px_rgba(30,58,95,0.1)] hover:-translate-y-0.5 max-md:rounded-md max-md:p-sm max-md:px-md">
            <button
              className="flex items-stretch gap-xl p-xl animate-[tickerSlideIn_0.5s_cubic-bezier(0.16,1,0.3,1)] bg-transparent border-none w-full text-left cursor-pointer transition-all hover:bg-[rgba(30,58,95,0.02)] active:bg-[rgba(30,58,95,0.04)] active:scale-[0.99] max-md:flex-col max-md:gap-md max-md:p-md"
              key={tickerIndex}
              onClick={() => handleETFClick(tickerItems[tickerIndex].etf.id)}
            >
              <div className="flex gap-md flex-1 min-w-0 max-md:flex-col max-md:gap-sm">
                <div
                  className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-md shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] min-w-[70px] max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-2 max-md:px-3 max-md:py-2 max-md:w-full max-md:min-w-0"
                  style={{ backgroundColor: tickerItems[tickerIndex].color }}
                >
                  <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.05em] max-md:text-[10px]">{tickerItems[tickerIndex].period}</span>
                  <span className="text-[13px] font-extrabold text-white tracking-[-0.01em] text-center leading-[1.2] max-md:text-xs max-md:text-left">{tickerItems[tickerIndex].category}</span>
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
                  <div className="flex items-center gap-[10px] flex-wrap">
                    <span className="text-base font-bold text-text-primary tracking-[-0.01em] leading-[1.3] max-md:text-sm">{tickerItems[tickerIndex].etf.name}</span>
                    <span className="font-mono text-[11px] font-semibold text-text-tertiary px-2 py-0.5 bg-[rgba(30,58,95,0.06)] rounded-sm whitespace-nowrap tabular-nums max-md:text-[10px]">{tickerItems[tickerIndex].etf.ticker}</span>
                  </div>
                  <div className="text-xs font-medium text-text-secondary leading-[1.4] max-md:text-[11px]">
                    {tickerItems[tickerIndex].description}
                  </div>
                </div>
              </div>
              <div className="flex gap-md shrink-0 items-center max-md:w-full max-md:gap-sm">
                <div className="flex flex-col items-end gap-1 px-4 py-3 bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(30,58,95,0.01)] rounded-md border border-[rgba(30,58,95,0.06)] min-w-[100px] max-md:flex-1 max-md:min-w-0 max-md:px-3 max-md:py-[10px]">
                  <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.05em] max-md:text-[9px]">국면</span>
                  <span className="font-mono text-lg font-extrabold text-text-primary tabular-nums max-md:text-base">{tickerItems[tickerIndex].metric}</span>
                </div>
                <div className="flex flex-col items-end gap-1 px-4 py-3 bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(30,58,95,0.01)] rounded-md border border-[rgba(30,58,95,0.06)] min-w-[100px] max-md:flex-1 max-md:min-w-0 max-md:px-3 max-md:py-[10px]">
                  <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.05em] max-md:text-[9px]">오늘</span>
                  <span className={`font-mono text-lg font-extrabold tabular-nums leading-[1.2] max-md:text-base ${getChangeClass(tickerItems[tickerIndex].etf.changePercent)}`}>
                    {formatPercent(tickerItems[tickerIndex].etf.changePercent)}
                  </span>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-md px-xl pb-md relative max-md:px-md max-md:pb-sm">
              <div className="flex-1 h-[3px] bg-[rgba(30,58,95,0.08)] rounded-[3px] overflow-hidden max-md:h-0.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-[3px] transition-[width_0.5s_cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(59,130,246,0.3)] max-md:h-0.5"
                  style={{ width: `${((tickerIndex + 1) / tickerItems.length) * 100}%` }}
                />
              </div>
              <div className="font-mono text-[11px] font-bold text-text-tertiary tabular-nums tracking-[0.02em] shrink-0 max-md:text-[10px]">
                {tickerIndex + 1} / {tickerItems.length}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Curated Sections */}
      {curatedSections.map((section) => {
        const Icon = section.icon;
        const hasData = section.data.length > 0;

        return (
          <section key={section.id} ref={section.ref} className="flex flex-col gap-lg max-md:gap-md">
            <div className="flex items-start justify-between gap-md max-md:gap-2 max-md:items-start">
              <div className="flex items-start gap-3 flex-1 min-w-0 max-md:gap-2 max-md:items-start">
                <Icon size={20} className={`shrink-0 mt-0.5 drop-shadow-sm max-md:w-[18px] max-md:h-[18px] max-md:mt-0 ${section.iconColor}`} />
                <div className="flex flex-col gap-1 flex-1 min-w-0 overflow-hidden max-md:gap-0.5">
                  <h2 className="text-lg font-extrabold text-text-primary tracking-[-0.02em] flex items-center gap-2 flex-nowrap min-w-0 max-md:text-sm max-md:gap-1.5 md:text-xl">
                    {section.title}
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-primary bg-primary/10 rounded-sm tracking-normal max-md:text-[9px] max-md:px-1.5">{section.periodLabel}</span>
                  </h2>
                  <span className="text-[13px] font-medium text-text-secondary tracking-[-0.01em] leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis max-md:text-[11px] max-md:max-w-[180px] md:text-sm">{section.description}</span>
                </div>
              </div>
            </div>

            {hasData ? (
              <Card className="!p-0 overflow-hidden max-md:m-0">
                {section.data.map((etf, idx) => {
                  const statusText = getStatusText(etf, section.period);
                  const predictRatio = getPredictRatio(etf, section.period);
                  const recommendation = getRecommendOpinion(etf, section.period);

                  return (
                    <button
                      key={etf.id}
                      className="flex items-center gap-md px-lg py-md text-left w-full border-b border-border/50 transition-all opacity-0 translate-y-5 [.animated_&]:animate-[slideInUp_0.5s_ease-out_forwards] last:border-b-0 hover:bg-layer-0 max-md:gap-sm max-md:px-md max-md:py-sm"
                      style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
                      onClick={() => handleETFClick(etf.id)}
                    >
                      <span className={`w-5 text-sm font-bold text-center shrink-0 max-md:w-4 max-md:text-[11px] ${idx < 3 ? 'text-primary' : 'text-text-tertiary'}`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-md:text-[13px]">{etf.name}</span>
                        <span className="font-mono text-xs text-text-tertiary tabular-nums max-md:text-[11px]">
                          {statusText} · 신뢰도 {predictRatio}% · {recommendation}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0 max-md:gap-0.5">
                        <span className={`font-mono text-base font-semibold tabular-nums max-md:text-sm ${getChangeClass(etf.changePercent)}`}>
                          {formatPercent(etf.changePercent)}
                        </span>
                        <span className="font-mono text-xs text-text-tertiary tabular-nums max-md:text-[11px]">
                          {formatPriceByMarket(etf.price, selectedMarket === 'all' ? 'us' : selectedMarket)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </Card>
            ) : (
              <Card className="!p-xl text-center">
                <p className="text-[13px] font-medium text-text-tertiary">해당 조건의 ETF가 없습니다</p>
              </Card>
            )}
          </section>
        );
      })}

      <style>{`
        @keyframes tickerSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PageContainer>
  );
}
