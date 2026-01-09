import { useMemo, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Plus, Search, ArrowRight, Info, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import { Card, CardHeader, Button } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, generatePriceHistory, getReturns, getRiskMetrics } from '../data';
import { formatPriceByMarket, formatPercent, getChangeClass, formatLargeNumber, formatLargeNumberByMarket } from '../utils/format';
import type { ETF } from '../types/etf';

const COLORS = ['#1E3A5F', '#4A90A4', '#E8A838', '#22C55E'];
const MAX_COMPARE = 4;

// 탭 타입
type CompareTab = 'basic' | 'returns' | 'holdings' | 'charts';

// 탭 옵션
const TAB_OPTIONS: { value: CompareTab; label: string; icon: any }[] = [
  { value: 'basic', label: '기본정보', icon: Info },
  { value: 'returns', label: '수익률', icon: TrendingUp },
  { value: 'holdings', label: '구성종목', icon: PieChart },
  { value: 'charts', label: '차트', icon: BarChart2 },
];

// 기간 선택 옵션 (확장)
const PERIOD_OPTIONS = [
  { value: 7, label: '1주', shortLabel: '1W' },
  { value: 30, label: '1개월', shortLabel: '1M' },
  { value: 90, label: '3개월', shortLabel: '3M' },
  { value: 180, label: '6개월', shortLabel: '6M' },
  { value: 365, label: '1년', shortLabel: '1Y' },
  { value: 1095, label: '3년', shortLabel: '3Y' },
  { value: 1825, label: '5년', shortLabel: '5Y' },
];

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedMarket, compareList } = useETFStore();

  // 상태 관리
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  const [activeTab, setActiveTab] = useState<CompareTab>('basic');

  // 섹션 참조
  const selectionSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // 시장별 ETF 선택
  const allETFs = selectedMarket === 'korea'
    ? koreanETFs
    : selectedMarket === 'us'
      ? usETFs
      : [...koreanETFs, ...usETFs];

  // 페이지 진입 시 스크롤 최상단으로
  useEffect(() => {
    const autoCompare = searchParams.get('autoCompare');

    // autoCompare가 없으면 최상단으로 스크롤
    if (autoCompare !== 'true') {
      window.scrollTo(0, 0);
    }
  }, [searchParams]);

  // 비교 바에서 온 경우 자동으로 비교 실행
  useEffect(() => {
    const autoCompare = searchParams.get('autoCompare');
    if (autoCompare === 'true' && compareList.length >= 2) {
      // compareList의 ETF들을 selectedETFs에 설정
      const etfsToCompare = compareList
        .map(id => allETFs.find(etf => etf.id === id))
        .filter((etf): etf is ETF => etf !== undefined);

      if (etfsToCompare.length >= 2) {
        setSelectedETFs(etfsToCompare);
        setShowResults(true);

        // URL 파라미터 제거 (히스토리 정리)
        setSearchParams({}, { replace: true });

        // 결과 섹션으로 스크롤
        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [searchParams, compareList, allETFs, setSearchParams]);

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const selectedIds = selectedETFs.map(e => e.id);

    return allETFs
      .filter(etf =>
        !selectedIds.includes(etf.id) &&
        (etf.name.toLowerCase().includes(query) ||
         etf.ticker.toLowerCase().includes(query))
      )
      .slice(0, 20);
  }, [searchQuery, allETFs, selectedETFs]);

  // 인기 ETF (시가총액과 거래량 기준)
  const popularETFs = useMemo(() => {
    const selectedIds = selectedETFs.map(e => e.id);

    return [...allETFs]
      .filter(etf => !selectedIds.includes(etf.id))
      .sort((a, b) => {
        // 시가총액과 거래량을 함께 고려한 점수 계산
        const scoreA = (a.marketCap * 0.6) + (a.volume * a.price * 0.4);
        const scoreB = (b.marketCap * 0.6) + (b.volume * b.price * 0.4);
        return scoreB - scoreA;
      })
      .slice(0, 12);
  }, [allETFs, selectedETFs]);

  // ETF 추가
  const handleAddETF = (etf: ETF) => {
    if (selectedETFs.length < MAX_COMPARE) {
      setSelectedETFs([...selectedETFs, etf]);
      setSearchQuery('');
    }
  };

  // ETF 삭제
  const handleRemoveETF = (id: string) => {
    setSelectedETFs(selectedETFs.filter(e => e.id !== id));
  };

  // 전체 삭제
  const handleClearAll = () => {
    setSelectedETFs([]);
    setShowResults(false);
  };

  // 비교 시작
  const handleStartCompare = () => {
    setShowResults(true);
    // 결과 섹션으로 스크롤
    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = [selectionSectionRef.current, resultsSectionRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // 선택된 기간 라벨
  const selectedPeriodLabel = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label || '3개월';

  // 가격 데이터 준비 (상대 수익률)
  const { priceData, yDomain } = useMemo(() => {
    if (selectedETFs.length === 0) return { priceData: [], yDomain: [0, 0] as [number, number] };

    const allPrices = selectedETFs.map(etf => generatePriceHistory(etf.price, selectedPeriod));
    let minValue = Infinity;
    let maxValue = -Infinity;

    const baseData = allPrices[0].map((_, i) => {
      const item: Record<string, number | string> = { date: allPrices[0][i].date };
      selectedETFs.forEach((etf, j) => {
        const basePrice = allPrices[j][0].close;
        const currentPrice = allPrices[j][i].close;
        const returnValue = Number(((currentPrice - basePrice) / basePrice * 100).toFixed(2));
        item[etf.name] = returnValue;

        if (returnValue < minValue) minValue = returnValue;
        if (returnValue > maxValue) maxValue = returnValue;
      });
      return item;
    });

    const range = maxValue - minValue;
    const padding = Math.max(range * 0.15, 1);
    const yMin = Math.floor((minValue - padding) * 10) / 10;
    const yMax = Math.ceil((maxValue + padding) * 10) / 10;

    return { priceData: baseData, yDomain: [yMin, yMax] as [number, number] };
  }, [selectedETFs, selectedPeriod]);

  // 레이더 차트 데이터
  const radarData = selectedETFs.length > 0 ? [
    { subject: '수익률', fullMark: 100, ...selectedETFs.reduce((acc, etf) => {
      const returns = getReturns(etf.id);
      acc[etf.name] = Math.min(Math.max((returns.year1 + 50), 0), 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '안정성', fullMark: 100, ...selectedETFs.reduce((acc, etf) => {
      const risk = getRiskMetrics(etf.id);
      acc[etf.name] = Math.max(100 - risk.volatility * 2, 0);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '배당', fullMark: 100, ...selectedETFs.reduce((acc, etf) => {
      acc[etf.name] = Math.min(etf.dividendYield * 15, 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '유동성', fullMark: 100, ...selectedETFs.reduce((acc, etf) => {
      acc[etf.name] = Math.min(etf.volume / 100000, 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '비용효율', fullMark: 100, ...selectedETFs.reduce((acc, etf) => {
      acc[etf.name] = Math.max(100 - etf.expenseRatio * 100, 0);
      return acc;
    }, {} as Record<string, number>) },
  ] : [];

  // 수익률 비교 데이터 (기간별로 그룹화)
  const returnsCompareData = useMemo(() => {
    if (selectedETFs.length === 0) return [];

    const periods = [
      { key: 'week1', label: '1주' },
      { key: 'month1', label: '1개월' },
      { key: 'month3', label: '3개월' },
      { key: 'month6', label: '6개월' },
      { key: 'ytd', label: 'YTD' },
      { key: 'year1', label: '1년' },
    ];

    return periods.map(period => {
      const dataPoint: any = { period: period.label };
      selectedETFs.forEach((etf, _index) => {
        const returns = getReturns(etf.id);
        dataPoint[etf.name] = returns[period.key as keyof typeof returns];
      });
      return dataPoint;
    });
  }, [selectedETFs]);

  // 최선/최악 값 판단 헬퍼 함수
  const getBestWorst = (values: number[], higherIsBetter: boolean = true) => {
    if (values.length <= 1) return { bestIndex: -1, worstIndex: -1 };

    const maxIndex = values.indexOf(Math.max(...values));
    const minIndex = values.indexOf(Math.min(...values));

    return higherIsBetter
      ? { bestIndex: maxIndex, worstIndex: minIndex }
      : { bestIndex: minIndex, worstIndex: maxIndex };
  };

  // 셀 스타일 결정
  const getCellHighlight = (index: number, bestIndex: number, worstIndex: number) => {
    if (selectedETFs.length <= 1) return '';
    if (index === bestIndex) return 'relative bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(34,197,94,0.04)] font-semibold before:content-["✓"] before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#22C55E] before:font-bold before:opacity-80 !pl-5 sm:!pl-6';
    if (index === worstIndex) return 'relative bg-gradient-to-br from-[rgba(239,68,68,0.08)] to-[rgba(239,68,68,0.04)] font-semibold before:content-["!"] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#EF4444] before:font-bold before:opacity-80 !pl-5 sm:!pl-6';
    return '';
  };

  return (
    <PageContainer
      title="ETF 비교 분석"
      subtitle={`최대 ${MAX_COMPARE}개의 ETF를 선택하여 비교하세요`}
      showMarketSelector={true}
    >
      {/* ETF 검색 */}
      <Card
        padding="md"
        overflow="visible"
        className={`relative z-10 transition-all duration-300 ${selectedETFs.length < 2 ? '!border-2 !border-[#EF4444] !shadow-[0_0_0_4px_rgba(239,68,68,0.1),0_4px_12px_rgba(239,68,68,0.15)] animate-[pulseRequiredCard_2s_ease-in-out_infinite]' : ''}`}
      >
        <CardHeader
          title="ETF 검색"
          subtitle="비교할 ETF를 검색하세요"
        />

        <div ref={selectionSectionRef} className="relative mt-sm flex flex-col gap-sm min-h-[60px]" style={{ marginBottom: searchQuery && searchResults.length > 0 ? '340px' : '0' }}>
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              className="w-full h-12 px-11 bg-white border border-border rounded-lg text-base text-text-primary transition-all duration-150 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:bg-layer-1 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-text-tertiary"
              placeholder="ETF 이름 또는 종목코드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedETFs.length >= MAX_COMPARE}
            />
            {searchQuery && (
              <button
                className="absolute right-3 flex items-center justify-center w-6 h-6 text-text-tertiary bg-transparent rounded-full transition-all duration-200 hover:text-text-primary hover:bg-layer-1 hover:scale-110"
                onClick={() => setSearchQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* 검색 결과 */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-border rounded-lg shadow-lg z-[1000] max-h-[400px] overflow-y-auto">
              {searchResults.map((etf, index) => (
                <button
                  key={etf.id}
                  className="flex justify-between items-center w-full py-sm px-md text-left transition-colors duration-150 min-h-[44px] gap-md border-b border-border/50 last:border-b-0 hover:bg-layer-1"
                  onClick={() => handleAddETF(etf)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</span>
                    <span className="text-xs text-text-tertiary">{etf.issuer} · {etf.category}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-sm font-medium text-text-primary">{formatPriceByMarket(etf.price, selectedMarket)}</span>
                    <span className={getChangeClass(etf.changePercent)}>
                      {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                  <Plus size={20} className="text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 p-lg text-center text-sm text-text-tertiary bg-white border border-border rounded-lg shadow-lg z-[1000]">
              <p className="m-0">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </Card>

      {/* 선택된 ETF 목록 */}
      {selectedETFs.length > 0 && (
        <div className="mt-md p-md bg-white rounded-md border border-border flex flex-col gap-sm shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-text-primary m-0">
              선택한 ETF <span className="text-primary font-bold">({selectedETFs.length}/{MAX_COMPARE})</span>
            </h3>
            <button className="py-1 px-3 bg-layer-1 border border-border rounded-md text-xs font-medium text-text-secondary cursor-pointer transition-all duration-150 hover:bg-layer-2 hover:border-primary hover:text-primary" onClick={handleClearAll}>
              전체 삭제
            </button>
          </div>

          <div className="flex flex-wrap gap-xs mb-md">
            {selectedETFs.map((etf, index) => (
              <div
                key={etf.id}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-layer-1 border rounded-full text-xs text-text-primary font-semibold animate-[fadeIn_0.2s_ease-out] transition-all duration-150 hover:bg-layer-2 hover:border-primary"
                style={{
                  borderColor: COLORS[index],
                  color: COLORS[index],
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis leading-[1.4]">{etf.name}</span>
                <button
                  className="flex items-center justify-center p-0 bg-transparent border-none text-text-secondary cursor-pointer transition-all duration-150 flex-shrink-0 hover:text-danger"
                  onClick={() => handleRemoveETF(etf.id)}
                  aria-label="삭제"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* 비교하기 버튼 */}
          {selectedETFs.length >= 2 && (
            <Button
              size="lg"
              onClick={handleStartCompare}
              rightIcon={<ArrowRight size={20} />}
              className="w-full h-11 text-[13px] font-bold shadow-[0_2px_8px_rgba(30,58,95,0.12)] animate-[pulse_2s_ease-in-out_infinite] sm:h-[50px] sm:text-sm md:h-[52px] md:text-[15px] hover:-translate-y-0.5"
            >
              비교 분석 {showResults ? '다시 ' : ''}시작하기
            </Button>
          )}

          {selectedETFs.length === 1 && (
            <p className="inline-flex items-center gap-1.5 text-primary text-xs font-medium mx-auto py-1.5 px-3 bg-[rgba(95,155,143,0.08)] rounded-full border border-[rgba(95,155,143,0.2)]">
              <Info size={12} />
              1개 더 선택하면 비교할 수 있습니다
            </p>
          )}
        </div>
      )}

      {!showResults && !searchQuery && (
        <div className="mt-md p-lg bg-white border border-border rounded-md shadow-sm animate-[fadeIn_0.3s_ease-out] md:p-lg lg:py-md lg:px-lg">
          <div className="mb-lg">
            <div className="flex items-center gap-sm">
              <TrendingUp size={18} className="flex-shrink-0 text-primary" />
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
                className="flex py-3.5 px-4 bg-layer-1 border border-border rounded-md text-left transition-all duration-150 cursor-pointer animate-[fadeIn_0.3s_ease-out_backwards] sm:py-4 sm:px-[18px] hover:border-primary hover:bg-white hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] group"
                onClick={() => handleAddETF(etf)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3 w-full sm:gap-3.5">
                  <span className="inline-flex items-center justify-center w-[22px] h-[22px] text-[11px] font-bold text-text-secondary bg-white rounded-sm flex-shrink-0 sm:w-6 sm:h-6 sm:text-xs">{index + 1}</span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="text-[13px] font-semibold text-text-primary m-0 whitespace-nowrap overflow-hidden text-ellipsis sm:text-sm">{etf.name}</h4>
                    <div className="flex items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
                      <span className="font-semibold text-text-tertiary font-mono">{etf.ticker}</span>
                      <span className="text-border">•</span>
                      <span className={`font-semibold font-mono ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                  </div>
                  <Plus size={16} className="flex-shrink-0 text-text-tertiary transition-all duration-150 group-hover:text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 비교 결과 섹션 */}
      {showResults && selectedETFs.length >= 2 && (
        <div ref={resultsSectionRef} className="flex flex-col gap-lg pt-8 border-t border-border/50 mt-6 max-w-full overflow-x-hidden">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-text-primary tracking-[-0.01em] m-0 lg:text-xl">비교 분석 결과</h2>
          </div>

          {/* 탭 네비게이션 */}
          <div className="grid grid-cols-2 gap-sm max-md:gap-2 md:grid-cols-4 md:gap-md">
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  className={`flex flex-col items-center justify-center gap-xs py-3 px-4 border rounded-md cursor-pointer transition-all duration-150 text-sm font-semibold min-h-[52px] max-md:py-2.5 max-md:px-3 max-md:text-xs max-md:min-h-12 ${activeTab === tab.value ? 'bg-primary border-primary text-white shadow-[0_4px_12px_rgba(30,58,95,0.15)]' : 'bg-white border-border text-text-secondary hover:border-primary hover:shadow-[0_2px_8px_rgba(30,58,95,0.08)] hover:-translate-y-0.5'}`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <Icon size={18} className="flex-shrink-0 transition-all duration-150 group-hover:scale-110" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex flex-col gap-lg mt-md animate-[fadeIn_0.3s_ease-out] max-w-full overflow-x-hidden">
            {/* 기본정보 탭 */}
            {activeTab === 'basic' && (
              <div className="flex flex-col gap-lg max-w-full overflow-x-hidden">
                <Card padding="none" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch]">
                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">일반정보</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">운용사</div>
                        {selectedETFs.map((etf, index) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm" style={{ color: COLORS[index] }}>
                            {etf.issuer}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">상장일</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.inceptionDate}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">추적지수</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.trackingIndex || '-'}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">레버리지</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.leverage ? `${etf.leverage}X` : '-'}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">규모 및 거래</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">순자산(AUM)</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.aum);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumberByMarket(etf.aum, selectedMarket)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">거래량</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.volume);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumber(etf.volume)}주
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">거래대금</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.turnover || etf.volume * etf.price);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumberByMarket(etf.turnover || etf.volume * etf.price, selectedMarket)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">시가총액</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.marketCap);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumberByMarket(etf.marketCap, selectedMarket)}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">배당정보</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">배당수익률</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.dividendYield);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {etf.dividendYield.toFixed(2)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">비용</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">총보수율(TER)</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.expenseRatio);
                          const { bestIndex, worstIndex } = getBestWorst(values, false);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {etf.expenseRatio.toFixed(2)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="border-b border-border last:border-b-0">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">가격정보</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">현재가</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {formatPriceByMarket(etf.price, selectedMarket)}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">등락률</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(etf.changePercent)}`}>
                            {formatPercent(etf.changePercent)}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">52주 최고</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.high52w ? `${formatPriceByMarket(etf.high52w, selectedMarket)}` : '-'}
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">52주 최저</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.low52w ? `${formatPriceByMarket(etf.low52w, selectedMarket)}` : '-'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 수익률 탭 */}
            {activeTab === 'returns' && (
              <div className="flex flex-col gap-lg max-w-full overflow-x-hidden">
                {/* 수익률 추이 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <div className="flex items-start justify-between gap-md flex-wrap">
                    <CardHeader title="수익률 추이 비교" subtitle={`최근 ${selectedPeriodLabel} 상대 수익률 추이 (%)`} />
                    <div className="flex bg-layer-2 rounded-md p-[3px] gap-0.5 flex-shrink-0">
                      {PERIOD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`py-1.5 px-2.5 min-w-8 min-h-7 rounded-sm text-[10px] font-semibold text-text-secondary bg-transparent transition-all duration-150 sm:py-xs sm:px-sm sm:min-w-10 sm:min-h-8 sm:text-xs hover:text-text-primary ${selectedPeriod === option.value ? 'bg-white text-primary shadow-sm' : ''}`}
                          onClick={() => setSelectedPeriod(option.value)}
                        >
                          {option.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={priceData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => v.slice(5)}
                          tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                          interval="preserveStartEnd"
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                          width={50}
                          domain={yDomain}
                          allowDataOverflow={false}
                          scale="linear"
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(2)}%`, '수익률']}
                          labelFormatter={(label) => label}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '16px' }}
                          verticalAlign="bottom"
                          iconType="circle"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Line
                            key={etf.id}
                            type="monotone"
                            dataKey={etf.name}
                            stroke={COLORS[index]}
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 수익률 비교 바 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <CardHeader title="기간별 수익률 비교" subtitle="각 기간별로 ETF 수익률을 직접 비교" />
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={returnsCompareData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                          labelFormatter={(label) => `기간: ${label}`}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '16px' }}
                          iconType="circle"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Bar
                            key={etf.id}
                            dataKey={etf.name}
                            fill={COLORS[index]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 수익률 테이블 */}
                <Card padding="none" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch]">
                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">기간별 수익률</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">1주</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.week1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].week1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].week1)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">1개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].month1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month1)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">3개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month3);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].month3)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month3)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">6개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month6);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].month6)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month6)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">YTD</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.ytd);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].ytd)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].ytd)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">1년</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.year1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getChangeClass(returnsData[idx].year1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].year1)}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="border-b border-border last:border-b-0">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">위험지표</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">변동성</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.volatility);
                          const { bestIndex, worstIndex } = getBestWorst(values, false);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {riskData[idx].volatility.toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">샤프비율</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.sharpeRatio);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {riskData[idx].sharpeRatio.toFixed(2)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">베타</div>
                        {selectedETFs.map((etf) => {
                          const risk = getRiskMetrics(etf.id);
                          return (
                            <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                              {risk.beta.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">최대낙폭(MDD)</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.maxDrawdown);
                          const { bestIndex, worstIndex } = getBestWorst(values, false);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm text-danger ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(riskData[idx].maxDrawdown)}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 구성종목 탭 */}
            {activeTab === 'holdings' && (
              <div className="flex flex-col gap-lg max-w-full overflow-x-hidden">
                <Card padding="none" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch]">
                    <div className="border-b border-border">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">구성종목 개요</div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">구성종목수</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                            {etf.holdings?.length || '-'}개
                          </div>
                        ))}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">상위 5종목 비중</div>
                        {(() => {
                          const values = selectedETFs.map(etf =>
                            etf.holdings?.slice(0, 5).reduce((sum, h) => sum + h.weight, 0) || 0
                          );
                          const { bestIndex, worstIndex } = getBestWorst(values, false);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {values[idx].toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                        <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">상위 10종목 비중</div>
                        {(() => {
                          const values = selectedETFs.map(etf =>
                            etf.holdings?.slice(0, 10).reduce((sum, h) => sum + h.weight, 0) || 0
                          );
                          const { bestIndex, worstIndex } = getBestWorst(values, false);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {values[idx].toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="border-b border-border last:border-b-0">
                      <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-[-0.01em] sm:text-[13px] sm:py-3.5 sm:px-4">상위 보유종목</div>

                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex border-b border-border/50 transition-colors duration-150 hover:bg-layer-1 last:border-b-0">
                          <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm first:text-left first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans">구성종목 {i + 1}</div>
                          {selectedETFs.map((etf) => {
                            const holding = etf.holdings?.[i];
                            return (
                              <div key={etf.id} className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-mono sm:min-w-[100px] sm:p-md sm:text-sm">
                                {holding ? (
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-[11px] font-medium text-text-primary leading-[1.3] sm:text-xs">{holding.name}</span>
                                    <span className="text-[10px] font-semibold text-text-tertiary sm:text-[11px]">{holding.weight.toFixed(1)}%</span>
                                  </div>
                                ) : '-'}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 차트 탭 */}
            {activeTab === 'charts' && (
              <div className="flex flex-col gap-lg max-w-full overflow-x-hidden">
                {/* 수익률 비교 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <div className="flex items-start justify-between gap-md flex-wrap">
                    <CardHeader title="수익률 추이 비교" subtitle={`최근 ${selectedPeriodLabel} 상대 수익률 (%)`} />
                    <div className="flex bg-layer-2 rounded-md p-[3px] gap-0.5 flex-shrink-0">
                      {PERIOD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`py-1.5 px-2.5 min-w-8 min-h-7 rounded-sm text-[10px] font-semibold text-text-secondary bg-transparent transition-all duration-150 sm:py-xs sm:px-sm sm:min-w-10 sm:min-h-8 sm:text-xs hover:text-text-primary ${selectedPeriod === option.value ? 'bg-white text-primary shadow-sm' : ''}`}
                          onClick={() => setSelectedPeriod(option.value)}
                        >
                          {option.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={priceData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => v.slice(5)}
                          tick={{ fontSize: 10, fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                          interval="preserveStartEnd"
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                          width={50}
                          domain={yDomain}
                          allowDataOverflow={false}
                          scale="linear"
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(2)}%`, '수익률']}
                          labelFormatter={(label) => label}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px' }}
                          verticalAlign="bottom"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Line
                            key={etf.id}
                            type="monotone"
                            dataKey={etf.name}
                            stroke={COLORS[index]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 배당수익률 추이 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <CardHeader title="배당수익률 추이" subtitle="최근 12개월 배당수익률 변화" />
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={(() => {
                          const months = [];
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };

                            selectedETFs.forEach((etf) => {
                              const baseYield = etf.dividendYield;
                              const variation = (Math.random() - 0.5) * 0.3;
                              dataPoint[etf.name] = Number((baseYield + variation).toFixed(2));
                            });

                            months.push(dataPoint);
                          }
                          return months;
                        })()}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(2)}%`, '배당수익률']}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px' }}
                          verticalAlign="bottom"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Line
                            key={etf.id}
                            type="monotone"
                            dataKey={etf.name}
                            stroke={COLORS[index]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 총보수율 추이 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <CardHeader title="총보수율(TER) 추이" subtitle="최근 12개월 총보수율 변화 - 낮을수록 유리" />
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={(() => {
                          const months = [];
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };

                            selectedETFs.forEach((etf) => {
                              const baseRatio = etf.expenseRatio;
                              const variation = (Math.random() - 0.5) * 0.02;
                              dataPoint[etf.name] = Number((baseRatio + variation).toFixed(3));
                            });

                            months.push(dataPoint);
                          }
                          return months;
                        })()}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(3)}%`, '총보수율']}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px' }}
                          verticalAlign="bottom"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Line
                            key={etf.id}
                            type="monotone"
                            dataKey={etf.name}
                            stroke={COLORS[index]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 순자금유입 누적 추이 차트 */}
                <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                  <CardHeader title="순자금유입 누적 추이" subtitle="최근 12개월 누적 순자금유입 현황" />
                  <div className="mt-sm overflow-hidden w-full max-w-full relative">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={(() => {
                          const months = [];
                          const cumulativeFlows: Record<string, number> = {};

                          selectedETFs.forEach((etf) => {
                            cumulativeFlows[etf.name] = 0;
                          });

                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };

                            selectedETFs.forEach((etf) => {
                              const baseFlow = etf.aum * 0.001;
                              const randomFactor = (Math.random() - 0.3) * 1.5;
                              const monthlyFlow = Math.round(baseFlow * randomFactor);

                              cumulativeFlows[etf.name] += monthlyFlow;
                              dataPoint[etf.name] = cumulativeFlows[etf.name];
                            });

                            months.push(dataPoint);
                          }
                          return months;
                        })()}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => {
                            const absV = Math.abs(v);
                            if (absV >= 1000000000) return `${(v / 1000000000).toFixed(1)}B`;
                            if (absV >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                            if (absV >= 1000) return `${(v / 1000).toFixed(0)}K`;
                            return v.toString();
                          }}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatLargeNumberByMarket(value, selectedMarket), '누적 순유입']}
                          contentStyle={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px' }}
                          verticalAlign="bottom"
                        />
                        {selectedETFs.map((etf, index) => (
                          <Line
                            key={etf.id}
                            type="monotone"
                            dataKey={etf.name}
                            stroke={COLORS[index]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 레이더 차트 */}
                {selectedETFs.length >= 2 && (
                  <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_backwards] delay-200 overflow-hidden max-w-full">
                    <CardHeader title="종합 비교" subtitle="각 항목별 상대 점수" />
                    <div className="mt-sm overflow-hidden w-full max-w-full relative">
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          {selectedETFs.map((etf, index) => (
                            <Radar
                              key={etf.id}
                              name={etf.name}
                              dataKey={etf.name}
                              stroke={COLORS[index]}
                              fill={COLORS[index]}
                              fillOpacity={0.15}
                              strokeWidth={2}
                              isAnimationActive={true}
                              animationDuration={1000}
                            />
                          ))}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
