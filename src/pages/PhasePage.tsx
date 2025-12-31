import { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, Snowflake, TrendingUp, TrendingDown, 
  AlertTriangle, ChevronRight
} from 'lucide-react';
import { Card } from '../components/common';
import { koreanETFs, usETFs, getPhaseAnalysis } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './PhasePage.module.css';

type Period = 'short' | 'mid' | 'long';

export default function PhasePage() {
  const navigate = useNavigate();
  const { selectedMarket, setSelectedMarket } = useETFStore();
  
  const [tickerIndex, setTickerIndex] = useState(0);
  
  const pageRef = useRef<HTMLDivElement>(null);
  const phaseCardRef = useRef<HTMLDivElement>(null);
  const trendCardRef = useRef<HTMLDivElement>(null);
  
  // Section refs - 각 섹션마다 고유 ref
  const shortOverheatedRef = useRef<HTMLElement>(null);
  const shortOversoldRef = useRef<HTMLElement>(null);
  const midOverheatedRef = useRef<HTMLElement>(null);
  const midOversoldRef = useRef<HTMLElement>(null);
  const shortBullishRef = useRef<HTMLElement>(null);
  const shortBearishRef = useRef<HTMLElement>(null);
  const midBullishRef = useRef<HTMLElement>(null);
  const midBearishRef = useRef<HTMLElement>(null);
  const longBullishRef = useRef<HTMLElement>(null);
  const longBearishRef = useRef<HTMLElement>(null);
  const bounceRef = useRef<HTMLElement>(null);
  const ultraBullishRef = useRef<HTMLElement>(null);
  const crashRiskRef = useRef<HTMLElement>(null);
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  // 모든 ETF 분석 데이터
  const allETFsWithAnalysis = useMemo(() => {
    return etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
  }, [etfs]);
  
  // 티커 아이템 생성 (다양한 국면과 기간 조합)
  const tickerItems = useMemo(() => {
    const items: Array<{
      period: string;
      category: string;
      description: string;
      etf: typeof allETFsWithAnalysis[0];
      color: string;
      bgColor: string;
      icon: string;
      metric: string;
    }> = [];
    
    // 모든 기간의 ETF 분석
    const periods: { key: Period; label: string; days: number }[] = [
      { key: 'short', label: '단기', days: 14 },
      { key: 'mid', label: '중기', days: 30 },
      { key: 'long', label: '장기', days: 60 },
    ];
    
    periods.forEach((period) => {
      const etfsForPeriod = etfs.map(e => ({
        ...e,
        analysis: getPhaseAnalysis(e.id)
      }));
      
      // 과열 종목
      const overheated = etfsForPeriod.filter(e => e.analysis.rsi >= 70).sort((a, b) => b.analysis.rsi - a.analysis.rsi);
      if (overheated.length > 0) {
        items.push({
          period: period.label,
          category: '과열 국면',
          description: `${period.days}일 기준 RSI ${overheated[0].analysis.rsi.toFixed(0)} 돌파`,
          etf: overheated[0],
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.05)',
          icon: '🔥',
          metric: `RSI ${overheated[0].analysis.rsi.toFixed(0)}`,
        });
      }
      
      // 공포 종목
      const oversold = etfsForPeriod.filter(e => e.analysis.rsi <= 30).sort((a, b) => a.analysis.rsi - b.analysis.rsi);
      if (oversold.length > 0) {
        items.push({
          period: period.label,
          category: '공포 국면',
          description: `${period.days}일 기준 RSI ${oversold[0].analysis.rsi.toFixed(0)} 하회`,
          etf: oversold[0],
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.05)',
          icon: '❄️',
          metric: `RSI ${oversold[0].analysis.rsi.toFixed(0)}`,
        });
      }
      
      // 상승 추세
      const bullish = etfsForPeriod.filter(e => e.analysis.macd > 100).sort((a, b) => b.analysis.macd - a.analysis.macd);
      if (bullish.length > 0) {
        items.push({
          period: period.label,
          category: '상승 추세',
          description: `${period.days}일 MACD 강세 신호`,
          etf: bullish[0],
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.05)',
          icon: '📈',
          metric: `MACD ${bullish[0].analysis.macd.toFixed(0)}`,
        });
      }
      
      // 하락 추세
      const bearish = etfsForPeriod.filter(e => e.analysis.macd < -100).sort((a, b) => a.analysis.macd - b.analysis.macd);
      if (bearish.length > 0) {
        items.push({
          period: period.label,
          category: '하락 추세',
          description: `${period.days}일 MACD 약세 신호`,
          etf: bearish[0],
          color: '#DC2626',
          bgColor: 'rgba(220, 38, 38, 0.05)',
          icon: '📉',
          metric: `MACD ${bearish[0].analysis.macd.toFixed(0)}`,
        });
      }
    });
    
    return items;
  }, [etfs, selectedMarket]);
  
  // 큐레이팅 섹션 데이터 (기간별 독립 섹션)
  const curatedSections = useMemo(() => {
    // 각 기간별 ETF 분석 데이터 (실제로는 동일한 분석을 사용, 실제 구현시 기간별 차이 반영)
    const shortETFs = etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
    const midETFs = etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
    const longETFs = etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
    
    // === 단기 섹션 (14일) ===
    
    // 1. 단기 과열 종목
    const shortOverheated = shortETFs
      .filter(e => e.analysis.rsi >= 70)
      .sort((a, b) => b.analysis.rsi - a.analysis.rsi)
      .slice(0, 5);
    
    // 2. 단기 공포 종목
    const shortOversold = shortETFs
      .filter(e => e.analysis.rsi <= 30)
      .sort((a, b) => a.analysis.rsi - b.analysis.rsi)
      .slice(0, 5);
    
    // 3. 단기 급등 포착
    const shortSurge = shortETFs
      .filter(e => e.analysis.rsi >= 60 && e.analysis.histogram > 100)
      .sort((a, b) => b.analysis.histogram - a.analysis.histogram)
      .slice(0, 5);
    
    // === 중기 섹션 (30일) ===
    
    // 4. 중기 상승 추세
    const midBullish = midETFs
      .filter(e => e.analysis.rsi >= 50 && e.analysis.macd > 50 && e.analysis.histogram > 0)
      .sort((a, b) => (b.analysis.macd + b.analysis.histogram) - (a.analysis.macd + a.analysis.histogram))
      .slice(0, 5);
    
    // 6. 중기 하락 전환
    const midBearish = midETFs
      .filter(e => e.analysis.rsi >= 60 && e.analysis.histogram < -50)
      .sort((a, b) => a.analysis.histogram - b.analysis.histogram)
      .slice(0, 5);
    
    // === 장기 섹션 (60일) ===
    
    // 7. 장기 강세 트렌드
    const longBullish = longETFs
      .filter(e => e.analysis.rsi >= 55 && e.analysis.macd > 80)
      .sort((a, b) => b.analysis.macd - a.analysis.macd)
      .slice(0, 5);
    
    // 8. 장기 약세 트렌드
    const longBearish = longETFs
      .filter(e => e.analysis.rsi <= 45 && e.analysis.macd < -50)
      .sort((a, b) => a.analysis.macd - b.analysis.macd)
      .slice(0, 5);
    
    // === 특수 섹션 ===
    
    // 10. 반등 기회 (단기 공포 + 추세 전환)
    const bounceOpportunity = shortETFs
      .filter(e => e.analysis.rsi <= 35 && e.analysis.histogram > 0)
      .sort((a, b) => (a.analysis.rsi + b.analysis.histogram) - (b.analysis.rsi + a.analysis.histogram))
      .slice(0, 5);
    
    // 11. 초강세 모멘텀 (중기 과열 + 급등)
    const ultraBullish = midETFs
      .filter(e => e.analysis.rsi >= 70 && e.analysis.macd > 150)
      .sort((a, b) => (b.analysis.rsi + b.analysis.macd) - (a.analysis.rsi + a.analysis.macd))
      .slice(0, 5);
    
    // 12. 급락 위험 (중기 과열 + 추세 약화)
    const crashRisk = midETFs
      .filter(e => e.analysis.rsi >= 65 && e.analysis.macd < -100)
      .sort((a, b) => (b.analysis.rsi - b.analysis.macd) - (a.analysis.rsi - a.analysis.macd))
      .slice(0, 5);
    
    return [
      // === 공포와 과열 국면 섹션 ===
      {
        id: 'short_overheated',
        title: '단기 과열 국면',
        icon: Flame,
        period: 'short' as Period,
        periodLabel: '14일',
        description: 'RSI 70 이상, 빠른 조정 가능성',
        data: shortOverheated,
        ref: shortOverheatedRef,
      },
      {
        id: 'short_oversold',
        title: '단기 공포 국면',
        icon: Snowflake,
        period: 'short' as Period,
        periodLabel: '14일',
        description: 'RSI 30 이하, 즉각 반등 기회',
        data: shortOversold,
        ref: shortOversoldRef,
      },
      {
        id: 'mid_overheated',
        title: '중기 과열 국면',
        icon: Flame,
        period: 'mid' as Period,
        periodLabel: '30일',
        description: 'RSI 70 이상, 조정 대기',
        data: midETFs.filter(e => e.analysis.rsi >= 70).sort((a, b) => b.analysis.rsi - a.analysis.rsi).slice(0, 5),
        ref: midOverheatedRef,
      },
      {
        id: 'mid_oversold',
        title: '중기 공포 국면',
        icon: Snowflake,
        period: 'mid' as Period,
        periodLabel: '30일',
        description: 'RSI 30 이하, 반등 잠재력',
        data: midETFs.filter(e => e.analysis.rsi <= 30).sort((a, b) => a.analysis.rsi - b.analysis.rsi).slice(0, 5),
        ref: midOversoldRef,
      },
      
      // === 추세 국면 섹션 ===
      {
        id: 'short_bullish',
        title: '단기 상승 추세',
        icon: TrendingUp,
        period: 'short' as Period,
        periodLabel: '14일',
        description: '단기 모멘텀 급상승, 단타 기회',
        data: shortSurge,
        ref: shortBullishRef,
      },
      {
        id: 'short_bearish',
        title: '단기 하락 추세',
        icon: TrendingDown,
        period: 'short' as Period,
        periodLabel: '14일',
        description: '단기 약세 전환, 주의 필요',
        data: shortETFs.filter(e => e.analysis.macd < -100).sort((a, b) => a.analysis.macd - b.analysis.macd).slice(0, 5),
        ref: shortBearishRef,
      },
      {
        id: 'mid_bullish',
        title: '중기 상승 추세',
        icon: TrendingUp,
        period: 'mid' as Period,
        periodLabel: '30일',
        description: '안정적 상승 트렌드 지속',
        data: midBullish,
        ref: midBullishRef,
      },
      {
        id: 'mid_bearish',
        title: '중기 하락 추세',
        icon: TrendingDown,
        period: 'mid' as Period,
        periodLabel: '30일',
        description: '추세 약화, 매도 타이밍 검토',
        data: midBearish,
        ref: midBearishRef,
      },
      {
        id: 'long_bullish',
        title: '장기 상승 추세',
        icon: TrendingUp,
        period: 'long' as Period,
        periodLabel: '60일',
        description: '장기 구조적 상승, 투자 적기',
        data: longBullish,
        ref: longBullishRef,
      },
      {
        id: 'long_bearish',
        title: '장기 하락 추세',
        icon: TrendingDown,
        period: 'long' as Period,
        periodLabel: '60일',
        description: '장기 하락세, 회피 권장',
        data: longBearish,
        ref: longBearishRef,
      },
      
      // === 특수 국면 섹션 ===
      {
        id: 'bounce',
        title: '반등 기회 포착',
        icon: AlertTriangle,
        period: 'short' as Period,
        periodLabel: '단기',
        description: '공포 국면 탈출, 반등 신호',
        data: bounceOpportunity,
        ref: bounceRef,
      },
      {
        id: 'ultra_bullish',
        title: '초강세 모멘텀',
        icon: TrendingUp,
        period: 'mid' as Period,
        periodLabel: '중기',
        description: '과열 + 강한 상승 추세, 최고 모멘텀',
        data: ultraBullish,
        ref: ultraBullishRef,
      },
      {
        id: 'crash_risk',
        title: '급락 위험 신호',
        icon: TrendingDown,
        period: 'mid' as Period,
        periodLabel: '중기',
        description: '과열 + 하락 추세 전환, 고위험',
        data: crashRisk,
        ref: crashRiskRef,
      },
    ];
  }, [etfs, selectedMarket]);
  
  // Intersection Observer for animations
  useEffect(() => {
    const sectionElements = curatedSections
      .map(section => section.ref.current)
      .filter(Boolean);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animated);
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
        phaseCardRef.current.classList.add(styles.pulse);
        setTimeout(() => {
          phaseCardRef.current?.classList.remove(styles.pulse);
        }, 1000);
      }
      
      setTimeout(() => {
        if (trendCardRef.current) {
          trendCardRef.current.classList.add(styles.pulse);
          setTimeout(() => {
            trendCardRef.current?.classList.remove(styles.pulse);
          }, 1000);
        }
      }, 1500);
    }, 10000); // 10초마다 반복
    
    return () => clearInterval(interval);
  }, []);
  
  // Ticker rotation
  useEffect(() => {
    if (tickerItems.length === 0) return;
    
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5000); // 5초마다 티커 변경 (더 많은 항목이 있으므로 약간 길게)
    
    return () => clearInterval(interval);
  }, [tickerItems.length]);
  
  const handleETFClick = (etfId: string) => {
    navigate(`/etf/${etfId}`);
  };
  
  return (
    <div className={styles.page} ref={pageRef}>
      {/* Market Selector */}
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
      
      {/* Phase Analysis Matrix */}
      <section className={styles.matrixSection}>
        {/* Ticker Banner */}
        {tickerItems.length > 0 && (
          <div className={styles.tickerBanner}>
            <button 
              className={styles.tickerContent} 
              key={tickerIndex}
              onClick={() => handleETFClick(tickerItems[tickerIndex].etf.id)}
            >
              <div className={styles.tickerLeft}>
                <div className={styles.tickerBadge} style={{ backgroundColor: tickerItems[tickerIndex].color }}>
                  <span className={styles.tickerBadgePeriod}>{tickerItems[tickerIndex].period}</span>
                  <span className={styles.tickerBadgeCategory}>{tickerItems[tickerIndex].category}</span>
                </div>
                <div className={styles.tickerInfo}>
                  <div className={styles.tickerETF}>
                    <span className={styles.tickerName}>{tickerItems[tickerIndex].etf.name}</span>
                    <span className={styles.tickerCode}>{tickerItems[tickerIndex].etf.ticker}</span>
                  </div>
                  <div className={styles.tickerDescription}>
                    {tickerItems[tickerIndex].description}
                  </div>
                </div>
              </div>
              <div className={styles.tickerRight}>
                <div className={styles.tickerMetricCard}>
                  <span className={styles.tickerMetricLabel}>지표</span>
                  <span className={styles.tickerMetricValue}>{tickerItems[tickerIndex].metric}</span>
                </div>
                <div className={styles.tickerPriceCard}>
                  <span className={styles.tickerPriceLabel}>오늘</span>
                  <span className={`${styles.tickerChange} ${getChangeClass(tickerItems[tickerIndex].etf.changePercent)}`}>
                    {formatPercent(tickerItems[tickerIndex].etf.changePercent)}
                  </span>
                </div>
              </div>
            </button>
            <div className={styles.tickerFooter}>
              <div className={styles.tickerProgress}>
                <div 
                  className={styles.tickerProgressBar} 
                  style={{ width: `${((tickerIndex + 1) / tickerItems.length) * 100}%` }}
                />
              </div>
              <div className={styles.tickerCounter}>
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
          <section key={section.id} ref={section.ref} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <Icon size={20} className={styles.sectionIcon} />
                <div className={styles.sectionTitleWrapper}>
                  <h2 className={styles.sectionTitle}>
                    {section.title}
                    <span className={styles.sectionPeriodBadge}>{section.periodLabel}</span>
                  </h2>
                  <span className={styles.sectionDescription}>{section.description}</span>
                </div>
              </div>
              <button 
                className={styles.moreBtn} 
                onClick={() => navigate(`/phase/detail?category=${section.id}&period=${section.period}`)}
              >
                전체 <ChevronRight size={16} />
              </button>
            </div>
            
            {hasData ? (
              <Card className={styles.listCard}>
                {section.data.map((etf, idx) => (
                  <button
                    key={etf.id}
                    className={styles.listItem}
                    onClick={() => handleETFClick(etf.id)}
                  >
                    <span className={styles.listRank}>{idx + 1}</span>
                    <div className={styles.listInfo}>
                      <span className={styles.listName}>{etf.name}</span>
                      <span className={styles.listMeta}>
                        RSI {etf.analysis.rsi.toFixed(0)} · {etf.issuer}
                      </span>
                    </div>
                    <div className={styles.listPriceGroup}>
                      <span className={`${styles.listChange} ${getChangeClass(etf.changePercent)}`}>
                        {formatPercent(etf.changePercent)}
                      </span>
                      <span className={styles.listPrice}>
                        {formatPrice(etf.price)}{selectedMarket === 'korea' ? '원' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </Card>
            ) : (
              <Card className={styles.emptyCard}>
                <p className={styles.emptyText}>해당 조건의 ETF가 없습니다</p>
              </Card>
            )}
          </section>
        );
      })}
    </div>
  );
}
