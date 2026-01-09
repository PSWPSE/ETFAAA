import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowUpCircle, ArrowDownCircle, Calculator, Calendar, BarChart3,
  Flame, Globe, DollarSign, Droplets, Target, Gift, TrendingUp
} from 'lucide-react';
import { Card } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanETFs, usETFs, koreanThemes, usThemes, getDividendForecast, MARKET_DATA } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPercent, formatLargeNumber, getChangeClass, formatPriceByMarket } from '../utils/format';

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [marketCategory, setMarketCategory] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0); // 각 카테고리 내 페이지
  const [dividendSort, setDividendSort] = useState<'yield' | 'dday'>('dday');

  // 섹션 참조
  const servicesSectionRef = useRef<HTMLElement>(null);
  const hotNowSectionRef = useRef<HTMLElement>(null);
  const recordSectionRef = useRef<HTMLElement>(null);
  const dividendSectionRef = useRef<HTMLElement>(null);
  const themeSectionRef = useRef<HTMLElement>(null);

  // Animation state
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set());

  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const themes = selectedMarket === 'korea' ? koreanThemes : usThemes;

  // ETF 통계 계산
  const etfStats = useMemo(() => {
    const up10Plus = etfs.filter(etf => etf.changePercent >= 10).length;
    const up5Plus = etfs.filter(etf => etf.changePercent >= 5 && etf.changePercent < 10).length;
    const up5Total = etfs.filter(etf => etf.changePercent >= 5).length;
    const upAll = etfs.filter(etf => etf.changePercent > 0).length;
    const downAll = etfs.filter(etf => etf.changePercent < 0).length;
    const down5Plus = etfs.filter(etf => etf.changePercent <= -5 && etf.changePercent > -10).length;
    const down5Total = etfs.filter(etf => etf.changePercent <= -5).length;
    const down10Plus = etfs.filter(etf => etf.changePercent <= -10).length;

    // 비율 형식으로 변경 (숫자 : 숫자)
    const upDownRatio = `${upAll} : ${downAll}`;
    const up5Down5Ratio = `${up5Total} : ${down5Total}`;

    // 지역 식별자 (아이콘 타입)
    const region = selectedMarket === 'korea' ? 'KR' : 'US';

    return [
      { name: '10% 이상 상승', value: up10Plus, change: 0, isCount: true, type: 'up', region },
      { name: '5% 이상 상승', value: up5Plus, change: 0, isCount: true, type: 'up', region },
      { name: '전체 상승', value: upAll, change: 0, isCount: true, type: 'up', region },
      { name: '전체 하락', value: downAll, change: 0, isCount: true, type: 'down', region },
      { name: '5% 이상 하락', value: down5Plus, change: 0, isCount: true, type: 'down', region },
      { name: '10% 이상 하락', value: down10Plus, change: 0, isCount: true, type: 'down', region },
      { name: '상승 : 하락', value: upDownRatio, change: 0, isRatio: true, type: 'ratio', region },
      { name: '5%상승 : 5%하락', value: up5Down5Ratio, change: 0, isRatio: true, type: 'ratio', region },
    ];
  }, [etfs, selectedMarket]);

  // 시황 전광판 카테고리
  const marketCategories = useMemo(() => [
    { key: 'indices', label: '증시', icon: Globe, data: MARKET_DATA.indices },
    { key: 'forex', label: '환율', icon: DollarSign, data: MARKET_DATA.forex },
    { key: 'commodities', label: '원자재', icon: Droplets, data: MARKET_DATA.commodities },
    { key: 'etf', label: 'ETF', icon: BarChart3, data: etfStats },
  ], [etfStats]);

  const currentMarketData = marketCategories[marketCategory];

  // 현재 카테고리 데이터를 4개씩 페이지로 나누기
  const ITEMS_PER_PAGE = 4;
  const currentCategoryData = currentMarketData.data;
  const totalPages = Math.ceil(currentCategoryData.length / ITEMS_PER_PAGE);
  const currentPageData = currentCategoryData.slice(
    categoryPage * ITEMS_PER_PAGE,
    (categoryPage + 1) * ITEMS_PER_PAGE
  );

  // 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setCategoryPage(0);
  }, [marketCategory]);

  // 시황 카테고리 및 페이지 자동 전환 (5초)
  useEffect(() => {
    const interval = setInterval(() => {
      setCategoryPage(prev => {
        // 현재 카테고리의 다음 페이지로
        if (prev + 1 < totalPages) {
          return prev + 1;
        } else {
          // 다음 카테고리의 첫 페이지로
          setMarketCategory(prevCat => (prevCat + 1) % marketCategories.length);
          return 0;
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [marketCategories.length, totalPages]);

  // 실시간 급등
  const hotNow = useMemo(() =>
    [...etfs]
      .filter(e => e.changePercent > 0)
      .sort((a, b) => (b.changePercent * Math.log10(b.volume + 1)) - (a.changePercent * Math.log10(a.volume + 1)))
      .slice(0, 5)
  , [etfs]);

  // 오늘 사면 배당받는 ETF (전체)
  const dividendAll = useMemo(() => {
    const withForecast = etfs
      .filter(e => e.dividendYield > 0)
      .map(e => {
        const forecast = getDividendForecast(e.id);
        return {
          ...e,
          forecast,
          estimatedDividend: forecast?.estimatedAmount || Math.round(e.price * e.dividendYield / 100 / 4),
          payDate: forecast?.nextPayDate || '',
        };
      })
      .filter(e => e.forecast && e.forecast.daysUntilEx <= 14 && e.forecast.daysUntilEx >= 0);

    // 정렬
    if (dividendSort === 'yield') {
      return withForecast.sort((a, b) => b.dividendYield - a.dividendYield);
    }
    return withForecast.sort((a, b) => (a.forecast?.daysUntilEx || 0) - (b.forecast?.daysUntilEx || 0));
  }, [etfs, dividendSort]);

  const dividendDisplay = dividendAll.slice(0, 5);

  // 52주 신고가 ETF (5개)
  const nearHigh52w = useMemo(() => {
    return etfs.map(e => {
      // 기간별 등락률 생성 (가상 데이터)
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (2 + Math.random() * 1.5);
      const return3m = baseReturn * (3.5 + Math.random() * 2);

      return {
        ...e,
        return1w: Number(return1w.toFixed(2)),
        return1m: Number(return1m.toFixed(2)),
        return3m: Number(return3m.toFixed(2))
      };
    })
    .filter(e => e.changePercent > 0)
    .sort((a, b) => b.return1w - a.return1w)
    .slice(0, 5);
  }, [etfs]);

  // 52주 신저가 ETF (5개)
  const nearLow52w = useMemo(() => {
    return etfs.map(e => {
      // 기간별 등락률 생성 (가상 데이터)
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (2 + Math.random() * 1.5);
      const return3m = baseReturn * (3.5 + Math.random() * 2);

      return {
        ...e,
        return1w: Number(return1w.toFixed(2)),
        return1m: Number(return1m.toFixed(2)),
        return3m: Number(return3m.toFixed(2))
      };
    })
    .filter(e => e.changePercent < 0)
    .sort((a, b) => a.return1w - b.return1w)
    .slice(0, 5);
  }, [etfs]);

  // 핫 테마 (1주 수익률 기준)
  const hotThemes = useMemo(() =>
    [...themes]
      .sort((a, b) => Math.abs(b.avgReturn) - Math.abs(a.avgReturn))
      .slice(0, 5)
      .map(theme => {
        // representativeETFId가 있으면 해당 ETF 찾기, 없으면 테마명으로 매칭
        const representativeETF = theme.representativeETFId
          ? etfs.find(e => e.id === theme.representativeETFId)
          : etfs.find(e => e.themes?.some(t =>
              t.toLowerCase().includes(theme.name.toLowerCase().slice(0, 2))
            ));

        return {
          ...theme,
          topETF: representativeETF?.name || (selectedMarket === 'korea' ? 'KODEX 200' : 'SPY'),
          period: '1주'
        };
      })
  , [themes, etfs, selectedMarket]);

  // 실시간 티커 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % hotNow.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hotNow.length]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId && !animatedSections.has(sectionId)) {
            setAnimatedSections(prev => new Set(prev).add(sectionId));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 섹션 관찰 시작
    const sections = [
      servicesSectionRef.current,
      hotNowSectionRef.current,
      recordSectionRef.current,
      dividendSectionRef.current,
      themeSectionRef.current
    ];

    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, [animatedSections]);

  const isAnimated = (sectionId: string) => animatedSections.has(sectionId);

  return (
    <PageContainer
      title="ETF 홈"
      subtitle="다양한 ETF 정보를 한눈에 확인하세요"
      showMarketSelector={true}
    >
      <div className="flex flex-col gap-2xl md:gap-[48px]">

      {/* 시황 전광판 */}
      <section className="flex flex-col bg-white border border-border rounded-md overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-sm py-xs bg-white border-b border-border">
          <div className="flex gap-xs">
            {marketCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  className={`flex items-center gap-1 px-sm py-xs text-xs font-medium rounded-sm transition-all duration-fast ${
                    i === marketCategory
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/[0.08]'
                  }`}
                  onClick={() => setMarketCategory(i)}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#22c55e] before:shadow-[0_0_8px_rgba(34,197,94,0.6)] before:animate-pulse">
            {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
          </span>
        </div>
        <div className="grid grid-cols-2 h-[152px] md:h-[168px] lg:h-[180px] xl:h-[200px] overflow-hidden" key={`${marketCategory}-${categoryPage}`}>
          {currentPageData.map((item: any, i: number) => (
            <div
              key={item.name}
              className="flex flex-col justify-center gap-1.5 p-[10px_12px] md:p-[14px_16px] lg:p-[16px_20px] xl:p-[18px_24px] bg-white border-r border-b border-border h-[76px] md:h-[84px] lg:h-[90px] xl:h-[100px] overflow-hidden transition-all duration-fast hover:bg-primary/[0.03] animate-fade-slide-up [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="flex items-center gap-1.5 text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] text-text-secondary font-medium tracking-wide leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {item.region && (
                  <span className="text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] leading-none flex-shrink-0">
                    {item.region === 'KR' ? '🇰🇷' : '🇺🇸'}
                  </span>
                )}
                {item.type === 'up' ? (
                  <>
                    {item.name.includes('10% 이상') ? (
                      <>
                        <span className="text-[#22c55e] font-bold">10% 이상</span> 상승
                      </>
                    ) : item.name.includes('5% 이상') ? (
                      <>
                        <span className="text-[#22c55e] font-bold">5% 이상</span> 상승
                      </>
                    ) : (
                      item.name
                    )}
                  </>
                ) : item.type === 'down' ? (
                  <>
                    {item.name.includes('10% 이상') ? (
                      <>
                        <span className="text-[#ef4444] font-bold">10% 이상</span> 하락
                      </>
                    ) : item.name.includes('5% 이상') ? (
                      <>
                        <span className="text-[#ef4444] font-bold">5% 이상</span> 하락
                      </>
                    ) : (
                      item.name
                    )}
                  </>
                ) : (
                  item.name
                )}
              </span>
              <div className="flex items-center justify-start gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 w-full">
                {item.isCount ? (
                  // ETF 개수 표시 - 흰색, 일반 스타일
                  <span className="font-numeric text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-extrabold text-text-primary tracking-tight leading-tight whitespace-nowrap">
                    {item.value.toLocaleString()}개
                  </span>
                ) : item.isRatio ? (
                  // ETF 비율 표시 - 흰색, 일반 스타일
                  <span className="font-numeric text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-extrabold text-text-primary tracking-tight leading-tight whitespace-nowrap">
                    {item.value}
                  </span>
                ) : (
                  // 일반 값과 변동률 표시
                  <>
                    <span className="font-numeric text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-extrabold text-text-primary tracking-tight leading-tight whitespace-nowrap">
                      {item.unit ? `${item.value.toLocaleString()}` : item.value.toLocaleString()}
                      {item.unit && <span className="text-[9px] font-normal text-white/40 ml-0.5">{item.unit}</span>}
                    </span>
                    <span className={`inline-flex items-center justify-center gap-0.5 font-numeric text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] font-bold px-1.5 py-0.5 rounded-[3px] leading-none whitespace-nowrap flex-shrink-0 ${
                      item.change >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'
                    }`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-2.5 p-3 bg-white border-t border-border h-[38px]">
          {marketCategories.map((_, i) => (
            <span
              key={i}
              className={`w-[7px] h-[7px] rounded-full cursor-pointer transition-all duration-fast flex-shrink-0 ${
                i === marketCategory
                  ? 'bg-primary w-5 rounded-[3.5px]'
                  : 'bg-primary/20 hover:bg-primary/50'
              }`}
              onClick={() => setMarketCategory(i)}
            />
          ))}
        </div>
      </section>

      {/* 차별화 서비스 */}
      <section ref={servicesSectionRef} data-section-id="services" className="flex flex-col gap-lg">
        <h2 className={`text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-extrabold text-text-primary tracking-tight text-center bg-gradient-to-br from-primary to-[rgba(30,58,95,0.85)] bg-clip-text text-transparent ${
          isAnimated('services') ? 'animate-fade-slide-up' : 'opacity-0 translate-y-[15px]'
        }`}>
          꼭 한번 이용해보세요!
        </h2>
        <div className="flex flex-col md:flex-row gap-md">
          <button
            className={`flex md:flex-1 items-center gap-md p-[16px_24px] md:p-lg lg:p-xl bg-white rounded-sm text-left transition-all duration-fast border border-border shadow-card hover:border-brand hover:shadow-md ${
              isAnimated('services') ? 'animate-fade-slide-up [animation-delay:0.2s]' : 'opacity-0 translate-y-5'
            }`}
            onClick={() => navigate('/simulator')}
          >
            <div className="flex items-center justify-center w-[44px] h-[44px] lg:w-12 lg:h-12 bg-brand-lighter text-brand rounded-sm flex-shrink-0 transition-all duration-fast group-hover:bg-brand group-hover:text-white">
              <Calculator size={20} className="lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-lg lg:text-lg font-bold text-text-primary tracking-tight">투자 실험실</span>
              <span className="text-sm lg:text-sm text-text-secondary">수익률 미리보기</span>
            </div>
            <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 md:hidden" />
          </button>
          <button
            className={`flex md:flex-1 items-center gap-md p-[16px_24px] md:p-lg lg:p-xl bg-white rounded-sm text-left transition-all duration-fast border border-border shadow-card hover:border-brand hover:shadow-md ${
              isAnimated('services') ? 'animate-fade-slide-up [animation-delay:0.3s]' : 'opacity-0 translate-y-5'
            }`}
            onClick={() => navigate('/calendar')}
          >
            <div className="flex items-center justify-center w-[44px] h-[44px] lg:w-12 lg:h-12 bg-brand-lighter text-brand rounded-sm flex-shrink-0 transition-all duration-fast group-hover:bg-brand group-hover:text-white">
              <Calendar size={20} className="lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-lg lg:text-lg font-bold text-text-primary tracking-tight">배당 캘린더</span>
              <span className="text-sm lg:text-sm text-text-secondary">배당 일정 확인</span>
            </div>
            <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 md:hidden" />
          </button>
          <button
            className={`flex md:flex-1 items-center gap-md p-[16px_24px] md:p-lg lg:p-xl bg-white rounded-sm text-left transition-all duration-fast border border-border shadow-card hover:border-brand hover:shadow-md ${
              isAnimated('services') ? 'animate-fade-slide-up [animation-delay:0.4s]' : 'opacity-0 translate-y-5'
            }`}
            onClick={() => navigate('/compare')}
          >
            <div className="flex items-center justify-center w-[44px] h-[44px] lg:w-12 lg:h-12 bg-brand-lighter text-brand rounded-sm flex-shrink-0 transition-all duration-fast group-hover:bg-brand group-hover:text-white">
              <BarChart3 size={20} className="lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-lg lg:text-lg font-bold text-text-primary tracking-tight">ETF 비교</span>
              <span className="text-sm lg:text-sm text-text-secondary">한눈에 비교분석</span>
            </div>
            <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 md:hidden" />
          </button>
        </div>
      </section>

      {/* 실시간 급등 */}
      <section ref={hotNowSectionRef} data-section-id="hotNow" className="flex flex-col gap-lg">
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-2.5">
            <Flame size={18} className="text-[#F97316] drop-shadow-[0_2px_4px_rgba(249,115,22,0.2)]" />
            <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight">실시간 급등</h2>
            <span className="flex items-center gap-[5px] px-2.5 py-[5px] text-xs font-bold tracking-wide text-chart-up bg-gradient-to-br from-[rgba(239,68,68,0.08)] to-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.15)] rounded-sm before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-chart-up before:shadow-[0_0_6px_rgba(239,68,68,0.5)] before:animate-pulse">
              LIVE
            </span>
          </div>
          <button
            className="flex items-center gap-1 text-sm font-semibold text-text-secondary px-2.5 py-1.5 -mr-1.5 rounded-sm transition-all duration-fast whitespace-nowrap hover:text-primary hover:bg-[rgba(30,58,95,0.04)]"
            onClick={() => navigate('/ranking?category=return&period=1d')}
          >
            전체 <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-sm p-[16px_24px] md:p-[24px_32px] bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(74,144,164,0.03)] rounded-lg border border-[rgba(30,58,95,0.08)]">
          <button
            className="flex flex-col gap-xs md:gap-sm w-full p-0 text-left cursor-pointer transition-all duration-fast hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] animate-[fadeSlideIn_0.5s_ease]"
            key={tickerIndex}
            onClick={() => navigate(`/etf/${hotNow[tickerIndex]?.id}`)}
          >
            <div className="flex items-center gap-sm mb-0.5">
              <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-[7px] text-sm font-bold text-white bg-primary rounded-sm flex-shrink-0">
                #{tickerIndex + 1}
              </span>
              <span className="text-lg md:text-lg font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                {hotNow[tickerIndex]?.name}
              </span>
              <span className="font-numeric text-sm font-semibold text-text-secondary px-2 py-0.5 bg-bg-secondary rounded-sm whitespace-nowrap flex-shrink-0">
                {hotNow[tickerIndex]?.ticker}
              </span>
            </div>
            <div className="flex items-baseline gap-sm mb-0.5">
              <span className="font-numeric text-xl md:text-[32px] font-bold text-text-primary tracking-tight">
                {formatPriceByMarket(hotNow[tickerIndex]?.price || 0, selectedMarket)}
              </span>
              <span className={`font-numeric text-lg md:text-2xl font-bold ${getChangeClass(hotNow[tickerIndex]?.changePercent || 0)}`}>
                {formatPercent(hotNow[tickerIndex]?.changePercent || 0)}
              </span>
            </div>
            <span className="font-numeric text-xs text-text-tertiary whitespace-nowrap">
              거래량 {formatLargeNumber(hotNow[tickerIndex]?.volume || 0)}
            </span>
          </button>
          <div className="flex justify-center gap-1.5">
            {hotNow.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-fast ${
                  i === tickerIndex ? 'bg-primary w-[18px] rounded-[3px]' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="!p-0 overflow-hidden">
          {hotNow.map((etf, i) => (
            <button
              key={etf.id}
              className={`flex items-center gap-md p-[16px_24px] md:p-[24px_32px] text-left w-full border-b border-border-light transition-all duration-fast last:border-b-0 hover:bg-bg ${
                i === tickerIndex ? 'bg-[rgba(30,58,95,0.04)] border-l-[3px] border-l-primary' : ''
              } ${isAnimated('hotNow') ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`}
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              <span className={`w-5 text-sm font-bold text-center flex-shrink-0 ${i < 3 ? 'text-primary' : 'text-text-tertiary'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm md:text-base font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {etf.name}
                </span>
                <span className="font-numeric text-xs text-text-tertiary">
                  거래량 {formatLargeNumber(etf.volume)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className={`font-numeric text-base md:text-lg font-semibold ${getChangeClass(etf.changePercent)}`}>
                  {formatPercent(etf.changePercent)}
                </span>
                <span className="font-numeric text-xs text-text-tertiary">{formatPriceByMarket(etf.price, selectedMarket)}</span>
              </div>
            </button>
          ))}
        </Card>
      </section>

      {/* 신기록 달성 */}
      <section ref={recordSectionRef} data-section-id="record" className="flex flex-col gap-lg">
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-2.5">
            <Target size={20} className="text-primary drop-shadow-[0_2px_4px_rgba(30,58,95,0.15)] w-5 h-5 md:w-[22px] md:h-[22px] flex-shrink-0" />
            <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight">신기록 달성</h2>
          </div>
          <button
            className="flex items-center gap-1 text-sm font-semibold text-text-secondary px-2.5 py-1.5 -mr-1.5 rounded-sm transition-all duration-fast whitespace-nowrap hover:text-primary hover:bg-[rgba(30,58,95,0.04)]"
            onClick={() => navigate('/high-low')}
          >
            전체 <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg md:gap-xl lg:gap-md">
          <div className="bg-white rounded-lg overflow-hidden border border-border-light shadow-[0_1px_3px_rgba(30,58,95,0.04)] md:shadow-[0_2px_4px_rgba(30,58,95,0.06)]">
            <div className="flex items-center gap-2.5 p-[16px_24px] md:p-[24px_32px] text-base md:text-lg font-bold text-text-primary bg-bg border-b border-border-light">
              <ArrowUpCircle size={16} className="text-chart-up flex-shrink-0 w-4 h-4 md:w-[18px] md:h-[18px]" />
              <span>52주 신고가 ETF</span>
            </div>
            <div className="flex flex-col">
              {nearHigh52w.map((etf, i) => (
                <button
                  key={etf.id}
                  className={`flex flex-col gap-sm md:gap-md p-[16px_24px] md:p-[24px_32px] lg:p-md text-left border-b border-border-light transition-all duration-fast bg-white last:border-b-0 hover:bg-[rgba(30,58,95,0.02)] active:bg-[rgba(30,58,95,0.04)] ${
                    isAnimated('record') ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                  onClick={() => navigate(`/etf/${etf.id}`)}
                >
                  <span className="text-base md:text-xl lg:text-sm font-semibold md:font-bold text-text-primary leading-relaxed break-keep">
                    {etf.name}
                  </span>
                  <div className="flex items-center justify-between gap-sm md:gap-md">
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">오늘</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">1주일</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.return1w)}`}>
                        {etf.return1w >= 0 ? '+' : ''}{etf.return1w.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">1개월</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.return1m)}`}>
                        {etf.return1m >= 0 ? '+' : ''}{etf.return1m.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden border border-border-light shadow-[0_1px_3px_rgba(30,58,95,0.04)] md:shadow-[0_2px_4px_rgba(30,58,95,0.06)]">
            <div className="flex items-center gap-2.5 p-[16px_24px] md:p-[24px_32px] text-base md:text-lg font-bold text-text-primary bg-bg border-b border-border-light">
              <ArrowDownCircle size={16} className="text-chart-down flex-shrink-0 w-4 h-4 md:w-[18px] md:h-[18px]" />
              <span>52주 신저가 ETF</span>
            </div>
            <div className="flex flex-col">
              {nearLow52w.map((etf, i) => (
                <button
                  key={etf.id}
                  className={`flex flex-col gap-sm md:gap-md p-[16px_24px] md:p-[24px_32px] lg:p-md text-left border-b border-border-light transition-all duration-fast bg-white last:border-b-0 hover:bg-[rgba(30,58,95,0.02)] active:bg-[rgba(30,58,95,0.04)] ${
                    isAnimated('record') ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                  onClick={() => navigate(`/etf/${etf.id}`)}
                >
                  <span className="text-base md:text-xl lg:text-sm font-semibold md:font-bold text-text-primary leading-relaxed break-keep">
                    {etf.name}
                  </span>
                  <div className="flex items-center justify-between gap-sm md:gap-md">
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">오늘</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">1주일</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.return1w)}`}>
                        {etf.return1w >= 0 ? '+' : ''}{etf.return1w.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-[3px] md:gap-1">
                      <span className="text-[10px] md:text-xs font-medium text-text-tertiary whitespace-nowrap">1개월</span>
                      <span className={`font-numeric text-sm md:text-base font-bold whitespace-nowrap ${getChangeClass(etf.return1m)}`}>
                        {etf.return1m >= 0 ? '+' : ''}{etf.return1m.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 오늘 사면 배당받는 ETF */}
      {dividendAll.length > 0 && (
        <section ref={dividendSectionRef} data-section-id="dividend" className="flex flex-col gap-lg">
          <div className="flex items-center justify-between gap-md">
            <div className="flex items-center gap-2.5">
              <Gift size={20} className="text-[#10B981] drop-shadow-[0_2px_4px_rgba(16,185,129,0.2)]" />
              <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight">오늘 사면 배당받는 ETF</h2>
            </div>
            <button
              className="flex items-center gap-1 text-sm font-semibold text-text-secondary px-2.5 py-1.5 -mr-1.5 rounded-sm transition-all duration-fast whitespace-nowrap hover:text-primary hover:bg-[rgba(30,58,95,0.04)]"
              onClick={() => navigate('/calendar')}
            >
              전체 <ChevronRight size={16} />
            </button>
          </div>

          {/* 정렬 탭 */}
          <div className="flex gap-sm">
            <button
              className={`flex items-center gap-1.5 px-md py-sm text-sm font-semibold rounded-md transition-all duration-fast border-[1.5px] ${
                dividendSort === 'dday'
                  ? 'text-white bg-primary border-primary shadow-[0_2px_6px_rgba(30,58,95,0.2)]'
                  : 'text-text-secondary bg-white border-border-light hover:text-text-primary hover:border-border'
              }`}
              onClick={() => setDividendSort('dday')}
            >
              마감임박순
            </button>
            <button
              className={`flex items-center gap-1.5 px-md py-sm text-sm font-semibold rounded-md transition-all duration-fast border-[1.5px] ${
                dividendSort === 'yield'
                  ? 'text-white bg-primary border-primary shadow-[0_2px_6px_rgba(30,58,95,0.2)]'
                  : 'text-text-secondary bg-white border-border-light hover:text-text-primary hover:border-border'
              }`}
              onClick={() => setDividendSort('yield')}
            >
              배당수익률순
            </button>
          </div>

          <Card className="!p-0 overflow-hidden">
            {dividendDisplay.map((etf, i) => (
              <button
                key={etf.id}
                className={`flex items-center gap-md p-[16px_24px] md:p-[24px_32px] text-left w-full border-b border-border-light transition-all duration-fast last:border-b-0 hover:bg-bg ${
                  isAnimated('dividend') ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'
                }`}
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center min-w-[40px] lg:min-w-[48px] px-2 lg:px-2.5 py-1 lg:py-1.5 text-xs lg:text-sm font-bold rounded-sm ${
                    etf.forecast?.daysUntilEx && etf.forecast.daysUntilEx <= 3
                      ? 'text-chart-up bg-[rgba(239,68,68,0.08)]'
                      : 'text-primary bg-[rgba(30,58,95,0.06)]'
                  }`}>
                    {etf.forecast?.daysUntilEx === 0 ? 'D-day' : `D-${etf.forecast?.daysUntilEx}`}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-sm md:text-base font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                    {etf.name}
                  </span>
                  <div className="flex items-center gap-md flex-wrap">
                    <span className="text-xs text-text-tertiary">
                      지급일 <strong className="text-text-secondary font-medium">{etf.payDate?.slice(5).replace('-', '/')}</strong>
                    </span>
                    <span className="text-xs text-text-tertiary">
                      1주당 <strong className="text-text-secondary font-medium">약 {formatPriceByMarket(etf.estimatedDividend, selectedMarket)}</strong>
                    </span>
                    <span className={`text-xs ${getChangeClass(etf.changePercent)}`}>
                      오늘 {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="font-numeric text-base md:text-lg lg:text-xl font-bold text-primary">
                    {etf.dividendYield}%
                  </span>
                  <span className="text-xs text-text-tertiary">연 배당률</span>
                </div>
              </button>
            ))}
          </Card>


        </section>
      )}

      {/* 핫 테마 */}
      <section ref={themeSectionRef} data-section-id="theme" className="flex flex-col gap-lg">
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={20} className="text-[#8B5CF6] drop-shadow-[0_2px_4px_rgba(139,92,246,0.2)]" />
            <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight">핫 테마</h2>
          </div>
          <button
            className="flex items-center gap-1 text-sm font-semibold text-text-secondary px-2.5 py-1.5 -mr-1.5 rounded-sm transition-all duration-fast whitespace-nowrap hover:text-primary hover:bg-[rgba(30,58,95,0.04)]"
            onClick={() => navigate('/theme')}
          >
            전체 <ChevronRight size={16} />
          </button>
        </div>

        <Card className="!p-0 overflow-hidden">
          {hotThemes.map((theme, i) => (
            <button
              key={theme.id}
              className={`flex items-center gap-md p-[16px_24px] md:p-[24px_32px] text-left w-full border-b border-border-light transition-all duration-fast last:border-b-0 hover:bg-bg ${
                isAnimated('theme') ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'
              }`}
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              onClick={() => navigate(`/theme/${theme.id}`)}
            >
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 text-sm lg:text-base font-bold rounded-sm ${
                  i < 3 ? 'text-white bg-primary' : 'text-text-tertiary bg-bg-secondary'
                }`}>
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-sm">
                  <span className="text-sm md:text-base font-semibold text-text-primary">{theme.name}</span>
                  {i === 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold text-chart-up bg-[rgba(239,68,68,0.08)] rounded-sm tracking-wide">
                      HOT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-md flex-wrap">
                  <span className="text-xs text-text-tertiary">
                    대표 <strong className="text-text-secondary font-medium">{theme.topETF}</strong>
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {theme.etfCount}개 ETF
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className={`font-numeric text-base md:text-lg lg:text-xl font-bold ${getChangeClass(theme.avgReturn)}`}>
                  {theme.avgReturn >= 0 ? '+' : ''}{theme.avgReturn.toFixed(1)}%
                </span>
                <span className="text-[10px] text-text-tertiary">최근 1주일 수익률</span>
              </div>
            </button>
          ))}
        </Card>
      </section>
      </div>
    </PageContainer>
  );
}
