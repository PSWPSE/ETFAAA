import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  ArrowUpCircle, ArrowDownCircle, Calculator, Calendar, BarChart3,
  Flame, Globe, DollarSign, Droplets, Target, Gift, TrendingUp
} from 'lucide-react';
import { Card } from '../components/common';
import { koreanETFs, usETFs, koreanThemes, usThemes, getDividendForecast } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, getChangeClass } from '../utils/format';
import styles from './HomePage.module.css';

// 시황 데이터 (더미)
const MARKET_DATA = {
  indices: [
    { name: 'KOSPI', value: 2486.75, change: 1.23 },
    { name: 'KOSDAQ', value: 728.43, change: -0.45 },
    { name: 'S&P 500', value: 5998.74, change: 0.87 },
    { name: 'NASDAQ', value: 19764.88, change: 1.54 },
    { name: '니케이225', value: 39568.06, change: 0.32 },
  ],
  forex: [
    { name: 'USD/KRW', value: 1451.20, change: 0.15 },
    { name: 'EUR/KRW', value: 1512.85, change: -0.23 },
    { name: 'JPY/KRW', value: 9.21, change: 0.08 },
    { name: 'CNY/KRW', value: 198.45, change: -0.12 },
  ],
  commodities: [
    { name: '금', value: 2638.50, change: 0.42, unit: '$/oz' },
    { name: '은', value: 29.85, change: -0.65, unit: '$/oz' },
    { name: 'WTI유', value: 69.24, change: 1.87, unit: '$/배럴' },
    { name: '천연가스', value: 3.42, change: -2.15, unit: '$/MMBtu' },
  ]
};

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedMarket, setSelectedMarket } = useETFStore();
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
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const themes = selectedMarket === 'korea' ? koreanThemes : usThemes;
  
  // 시황 전광판 카테고리
  const marketCategories = useMemo(() => [
    { key: 'indices', label: '증시', icon: Globe, data: MARKET_DATA.indices },
    { key: 'forex', label: '환율', icon: DollarSign, data: MARKET_DATA.forex },
    { key: 'commodities', label: '원자재', icon: Droplets, data: MARKET_DATA.commodities },
  ], []);
  
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
      .filter(e => e.forecast && e.forecast.daysUntilEx <= 14 && e.forecast.daysUntilEx > 0);
    
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
      .map(theme => ({
        ...theme,
        topETF: etfs.find(e => e.themes?.includes(theme.id))?.name || 'KODEX 200',
        period: '1주'
      }))
  , [themes, etfs]);

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
        if (entry.isIntersecting && !entry.target.classList.contains(styles.animated)) {
          entry.target.classList.add(styles.animated);
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
  }, []);

  return (
    <div className={styles.page}>
      {/* 국가 선택 섹션 */}
      <section className={styles.marketSelector}>
        <div className={styles.marketSelectorHeader}>
          <h3 className={styles.marketSelectorTitle}>홈 화면에서 보여줄 ETF 국가 선택</h3>
        </div>
        <div className={styles.marketOptions}>
          <button
            className={`${styles.marketOption} ${selectedMarket === 'korea' ? styles.active : ''}`}
            onClick={() => setSelectedMarket('korea')}
          >
            <span className={styles.marketFlag}>🇰🇷</span>
            <span className={styles.marketName}>한국</span>
          </button>
          <button
            className={`${styles.marketOption} ${selectedMarket === 'us' ? styles.active : ''}`}
            onClick={() => setSelectedMarket('us')}
          >
            <span className={styles.marketFlag}>🇺🇸</span>
            <span className={styles.marketName}>미국</span>
          </button>
        </div>
      </section>
      
      {/* 시황 전광판 */}
      <section className={styles.marketTicker}>
        <div className={styles.tickerHeader}>
          <div className={styles.tickerTabs}>
            {marketCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  className={`${styles.tickerTab} ${i === marketCategory ? styles.active : ''}`}
                  onClick={() => setMarketCategory(i)}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          <span className={styles.tickerTime}>
            {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
          </span>
        </div>
        <div className={styles.tickerBoard} key={`${marketCategory}-${categoryPage}`}>
          {currentPageData.map((item, i) => (
            <div key={item.name} className={styles.tickerItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className={styles.tickerItemName}>{item.name}</span>
              <div className={styles.tickerItemRow}>
                <span className={styles.tickerItemValue}>
                  {item.unit ? `${item.value.toLocaleString()}` : item.value.toLocaleString()}
                  {item.unit && <span className={styles.tickerItemUnit}>{item.unit}</span>}
                </span>
                <span className={`${styles.tickerItemChange} ${item.change >= 0 ? styles.up : styles.down}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.tickerIndicator}>
          {marketCategories.map((_, i) => (
            <span 
              key={i} 
              className={`${styles.indicatorDot} ${i === marketCategory ? styles.active : ''}`}
              onClick={() => setMarketCategory(i)}
            />
          ))}
        </div>
      </section>
      
      {/* 차별화 서비스 */}
      <section ref={servicesSectionRef} className={styles.servicesSection}>
        <h2 className={styles.servicesSectionTitle}>꼭 한번 이용해보세요!</h2>
        <div className={styles.quickServices}>
          <button className={styles.serviceCard} onClick={() => navigate('/simulator')}>
            <div className={styles.serviceIcon}>
              <Calculator size={20} />
            </div>
            <div className={styles.serviceInfo}>
              <span className={styles.serviceName}>투자 실험실</span>
              <span className={styles.serviceDesc}>수익률 미리보기</span>
            </div>
            <ChevronRight size={18} className={styles.serviceArrow} />
          </button>
        <button className={styles.serviceCard} onClick={() => navigate('/calendar')}>
          <div className={styles.serviceIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.serviceInfo}>
            <span className={styles.serviceName}>배당 캘린더</span>
            <span className={styles.serviceDesc}>배당 일정 확인</span>
          </div>
          <ChevronRight size={18} className={styles.serviceArrow} />
        </button>
        <button className={styles.serviceCard} onClick={() => navigate('/compare')}>
          <div className={styles.serviceIcon}>
            <BarChart3 size={20} />
          </div>
          <div className={styles.serviceInfo}>
            <span className={styles.serviceName}>ETF 비교</span>
            <span className={styles.serviceDesc}>한눈에 비교분석</span>
          </div>
          <ChevronRight size={18} className={styles.serviceArrow} />
        </button>
        </div>
      </section>
      
      {/* 실시간 급등 */}
      <section ref={hotNowSectionRef} className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Flame size={18} className={styles.fireIcon} />
            <h2 className={styles.sectionTitle}>실시간 급등</h2>
            <span className={styles.liveIndicator}>LIVE</span>
          </div>
          <button className={styles.moreBtn} onClick={() => navigate('/search')}>
            전체 <ChevronRight size={16} />
          </button>
        </div>
        
        <div className={styles.tickerBanner}>
          <button 
            className={styles.tickerContent} 
            key={tickerIndex}
            onClick={() => navigate(`/etf/${hotNow[tickerIndex]?.id}`)}
          >
            <div className={styles.tickerMainInfo}>
              <span className={styles.tickerRank}>#{tickerIndex + 1}</span>
              <span className={styles.tickerName}>{hotNow[tickerIndex]?.name}</span>
              <span className={styles.tickerCode}>{hotNow[tickerIndex]?.ticker}</span>
            </div>
            <div className={styles.tickerPriceInfo}>
              <span className={styles.tickerPrice}>
                {formatPrice(hotNow[tickerIndex]?.price || 0)}원
              </span>
              <span className={`${styles.tickerChange} ${getChangeClass(hotNow[tickerIndex]?.changePercent || 0)}`}>
                {formatPercent(hotNow[tickerIndex]?.changePercent || 0)}
              </span>
            </div>
            <span className={styles.tickerVolume}>
              거래량 {formatLargeNumber(hotNow[tickerIndex]?.volume || 0)}
            </span>
          </button>
          <div className={styles.tickerDots}>
            {hotNow.map((_, i) => (
              <span key={i} className={`${styles.tickerDot} ${i === tickerIndex ? styles.active : ''}`} />
            ))}
          </div>
        </div>
        
        <Card className={styles.listCard}>
          {hotNow.map((etf, i) => (
            <button 
              key={etf.id} 
              className={`${styles.listItem} ${i === tickerIndex ? styles.highlighted : ''}`}
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              <span className={styles.listRank}>{i + 1}</span>
              <div className={styles.listInfo}>
                <span className={styles.listName}>{etf.name}</span>
                <span className={styles.listMeta}>
                  거래량 {formatLargeNumber(etf.volume)}
                </span>
              </div>
              <div className={styles.listPriceGroup}>
                <span className={`${styles.listChange} ${getChangeClass(etf.changePercent)}`}>
                  {formatPercent(etf.changePercent)}
                </span>
                <span className={styles.listPrice}>{formatPrice(etf.price)}원</span>
              </div>
            </button>
          ))}
        </Card>
      </section>
      
      {/* 신기록 달성 */}
      <section ref={recordSectionRef} className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Target size={20} className={styles.targetIcon} />
            <h2 className={styles.sectionTitle}>신기록 달성</h2>
          </div>
          <button className={styles.moreBtn} onClick={() => navigate('/search?filter=52w')}>
            전체 <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.highLowGrid}>
          <div className={styles.highLowCard}>
            <div className={styles.highLowHeader}>
              <ArrowUpCircle size={16} className={styles.highIcon} />
              <span>52주 신고가 ETF</span>
            </div>
            <div className={styles.highLowList}>
              {nearHigh52w.map((etf, i) => (
                <button 
                  key={etf.id} 
                  className={styles.highLowItem}
                  onClick={() => navigate(`/etf/${etf.id}`)}
                >
                  <span className={styles.highLowName}>{etf.name}</span>
                  <div className={styles.highLowReturns}>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>오늘</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>1주일</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.return1w)}`}>
                        {etf.return1w >= 0 ? '+' : ''}{etf.return1w.toFixed(2)}%
                      </span>
                    </div>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>1개월</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.return1m)}`}>
                        {etf.return1m >= 0 ? '+' : ''}{etf.return1m.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.highLowCard}>
            <div className={styles.highLowHeader}>
              <ArrowDownCircle size={16} className={styles.lowIcon} />
              <span>52주 신저가 ETF</span>
            </div>
            <div className={styles.highLowList}>
              {nearLow52w.map((etf, i) => (
                <button 
                  key={etf.id} 
                  className={styles.highLowItem}
                  onClick={() => navigate(`/etf/${etf.id}`)}
                >
                  <span className={styles.highLowName}>{etf.name}</span>
                  <div className={styles.highLowReturns}>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>오늘</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                    </div>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>1주일</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.return1w)}`}>
                        {etf.return1w >= 0 ? '+' : ''}{etf.return1w.toFixed(2)}%
                      </span>
                    </div>
                    <div className={styles.returnItem}>
                      <span className={styles.returnLabel}>1개월</span>
                      <span className={`${styles.returnValue} ${getChangeClass(etf.return1m)}`}>
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
        <section ref={dividendSectionRef} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Gift size={20} className={styles.giftIcon} />
              <h2 className={styles.sectionTitle}>오늘 사면 배당받는 ETF</h2>
            </div>
            <button className={styles.moreBtn} onClick={() => navigate('/calendar')}>
              전체 <ChevronRight size={16} />
            </button>
          </div>
          
          {/* 정렬 탭 */}
          <div className={styles.sortTabs}>
            <button 
              className={`${styles.sortTab} ${dividendSort === 'dday' ? styles.active : ''}`}
              onClick={() => setDividendSort('dday')}
            >
              마감임박순
            </button>
            <button 
              className={`${styles.sortTab} ${dividendSort === 'yield' ? styles.active : ''}`}
              onClick={() => setDividendSort('yield')}
            >
              배당수익률순
            </button>
          </div>
          
          <Card className={styles.listCard}>
            {dividendDisplay.map((etf, i) => (
              <button 
                key={etf.id} 
                className={styles.dividendItem}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <div className={styles.dividendRank}>
                  <span className={`${styles.ddayBadge} ${etf.forecast?.daysUntilEx && etf.forecast.daysUntilEx <= 3 ? styles.urgent : ''}`}>
                    D-{etf.forecast?.daysUntilEx}
                  </span>
                </div>
                <div className={styles.dividendInfo}>
                  <span className={styles.dividendName}>{etf.name}</span>
                  <div className={styles.dividendMetaRow}>
                    <span className={styles.dividendMetaItem}>
                      지급일 <strong>{etf.payDate?.slice(5).replace('-', '/')}</strong>
                    </span>
                    <span className={styles.dividendMetaItem}>
                      1주당 <strong>약 {formatPrice(etf.estimatedDividend)}원</strong>
                    </span>
                    <span className={`${styles.dividendMetaItem} ${getChangeClass(etf.changePercent)}`}>
                      오늘 {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                </div>
                <div className={styles.dividendDataGroup}>
                  <span className={styles.dividendYieldValue}>{etf.dividendYield}%</span>
                  <span className={styles.dividendAmount}>연 배당률</span>
                </div>
              </button>
            ))}
          </Card>
          
          
        </section>
      )}
      
      {/* 핫 테마 */}
      <section ref={themeSectionRef} className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <TrendingUp size={20} className={styles.trendIcon} />
            <h2 className={styles.sectionTitle}>핫 테마</h2>
            <span className={styles.periodBadge}>1주 수익률</span>
          </div>
          <button className={styles.moreBtn} onClick={() => navigate('/theme')}>
            전체 <ChevronRight size={16} />
          </button>
        </div>
        
        <Card className={styles.listCard}>
          {hotThemes.map((theme, i) => (
            <button 
              key={theme.id} 
              className={styles.themeItem}
              onClick={() => navigate(`/theme/${theme.id}`)}
            >
              <div className={styles.themeRank}>
                <span className={`${styles.rankNumber} ${i < 3 ? styles.top : ''}`}>{i + 1}</span>
              </div>
              <div className={styles.themeInfo}>
                <div className={styles.themeNameRow}>
                  <span className={styles.themeName}>{theme.name}</span>
                  {i === 0 && <span className={styles.hotBadge}>HOT</span>}
                </div>
                <div className={styles.themeMetaRow}>
                  <span className={styles.themeMetaItem}>
                    대표 <strong>{theme.topETF}</strong>
                  </span>
                  <span className={styles.themeMetaItem}>
                    {theme.etfCount}개 ETF
                  </span>
                </div>
              </div>
              <div className={styles.themeDataGroup}>
                <span className={`${styles.themeReturnValue} ${getChangeClass(theme.avgReturn)}`}>
                  {theme.avgReturn >= 0 ? '+' : ''}{theme.avgReturn.toFixed(1)}%
                </span>
                <span className={styles.themeSubReturn}>평균 수익률</span>
              </div>
            </button>
          ))}
        </Card>
      </section>
    </div>
  );
}
