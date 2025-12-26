import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, BarChart2, DollarSign, Droplets } from 'lucide-react';
import { Card, MarketSelector } from '../components/common';
import { koreanETFs, usETFs, koreanThemes, usThemes } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, getChangeClass } from '../utils/format';
import styles from './HomePage.module.css';

// 시황 데이터 타입
type TickerCategory = 'indices' | 'forex' | 'commodities';

// 시황 데이터 (실제로는 API에서 가져옴)
const TICKER_DATA = {
  korea: {
    indices: [
      { symbol: 'KOSPI', name: '코스피', value: 2654.12, change: 1.25 },
      { symbol: 'KOSDAQ', name: '코스닥', value: 854.32, change: 2.15 },
      { symbol: 'KOSPI200', name: 'KOSPI 200', value: 357.82, change: 0.85 },
      { symbol: 'KRX300', name: 'KRX 300', value: 432.15, change: 1.52 },
    ],
    forex: [
      { symbol: 'USD/KRW', name: '달러', value: 1432.50, change: -0.32 },
      { symbol: 'EUR/KRW', name: '유로', value: 1498.20, change: 0.15 },
      { symbol: 'JPY/KRW', name: '엔(100)', value: 952.30, change: -0.45 },
      { symbol: 'CNY/KRW', name: '위안', value: 196.85, change: 0.22 },
    ],
    commodities: [
      { symbol: 'WTI', name: 'WTI유', value: 71.28, change: 1.85, unit: '$' },
      { symbol: 'GOLD', name: '금', value: 2652.40, change: 0.42, unit: '$' },
      { symbol: 'SILVER', name: '은', value: 30.15, change: -0.78, unit: '$' },
      { symbol: 'COPPER', name: '구리', value: 4.12, change: 1.23, unit: '$' },
    ],
  },
  us: {
    indices: [
      { symbol: 'SPX', name: 'S&P 500', value: 5998.74, change: 0.85 },
      { symbol: 'NDX', name: 'NASDAQ', value: 19572.60, change: 1.12 },
      { symbol: 'DJI', name: 'Dow Jones', value: 43825.92, change: 0.45 },
      { symbol: 'RUT', name: 'Russell 2000', value: 2285.47, change: -0.32 },
    ],
    forex: [
      { symbol: 'DXY', name: 'Dollar Index', value: 107.82, change: 0.18 },
      { symbol: 'EUR/USD', name: 'EUR/USD', value: 1.0425, change: -0.22 },
      { symbol: 'USD/JPY', name: 'USD/JPY', value: 157.25, change: 0.35 },
      { symbol: 'GBP/USD', name: 'GBP/USD', value: 1.2515, change: -0.15 },
    ],
    commodities: [
      { symbol: 'CL', name: 'Crude Oil', value: 71.28, change: 1.85, unit: '$' },
      { symbol: 'GC', name: 'Gold', value: 2652.40, change: 0.42, unit: '$' },
      { symbol: 'SI', name: 'Silver', value: 30.15, change: -0.78, unit: '$' },
      { symbol: 'NG', name: 'Natural Gas', value: 3.42, change: 2.15, unit: '$' },
    ],
  },
};

const CATEGORY_INFO = {
  indices: { label: '지수', icon: BarChart2 },
  forex: { label: '환율', icon: DollarSign },
  commodities: { label: '원자재', icon: Droplets },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [tickerCategory, setTickerCategory] = useState<TickerCategory>('indices');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 자동 로테이션
  useEffect(() => {
    const categories: TickerCategory[] = ['indices', 'forex', 'commodities'];
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setTickerCategory(prev => {
          const currentIndex = categories.indexOf(prev);
          return categories[(currentIndex + 1) % categories.length];
        });
        setIsAnimating(false);
      }, 300);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: TickerCategory) => {
    if (category !== tickerCategory) {
      setIsAnimating(true);
      setTimeout(() => {
        setTickerCategory(category);
        setIsAnimating(false);
      }, 150);
    }
  };
  
  const tickerData = TICKER_DATA[selectedMarket][tickerCategory];
  
  // 시장별 데이터 선택
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const themes = selectedMarket === 'korea' ? koreanThemes : usThemes;
  
  // 상승 TOP 5
  const topGainers = [...etfs]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
  
  // 하락 TOP 5
  const topLosers = [...etfs]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);
  
  // 거래량 TOP 5
  const topVolume = [...etfs]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);
  
  // 인기 테마 TOP 4
  const popularThemes = themes.slice(0, 4);
  
  return (
    <div className={styles.page}>
      {/* Market Selector */}
      <section className={styles.marketSelectorSection}>
        <MarketSelector />
      </section>

      {/* Market Ticker Board */}
      <section className={styles.tickerSection}>
        {/* 카테고리 탭 */}
        <div className={styles.tickerTabs}>
          {(Object.keys(CATEGORY_INFO) as TickerCategory[]).map((cat) => {
            const Icon = CATEGORY_INFO[cat].icon;
            return (
              <button
                key={cat}
                className={`${styles.tickerTab} ${tickerCategory === cat ? styles.active : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                <Icon size={14} />
                <span>{CATEGORY_INFO[cat].label}</span>
              </button>
            );
          })}
          <div className={styles.tickerIndicator}>
            <span className={styles.liveIndicator} />
            <span className={styles.liveText}>LIVE</span>
          </div>
        </div>
        
        {/* 시세 그리드 */}
        <div className={`${styles.tickerGrid} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
          {tickerData.map((item, index) => (
            <div 
              key={item.symbol} 
              className={styles.tickerCard}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={styles.tickerHeader}>
                <span className={styles.tickerSymbol}>{item.symbol}</span>
                <span className={styles.tickerName}>{item.name}</span>
              </div>
              <div className={styles.tickerBody}>
                <span className={styles.tickerValue}>
                  {'unit' in item && item.unit}{item.value.toLocaleString()}
                </span>
                <span className={`${styles.tickerChange} ${item.change >= 0 ? styles.up : styles.down}`}>
                  <span className={styles.tickerArrow}>{item.change >= 0 ? '▲' : '▼'}</span>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* 프로그레스 바 */}
        <div className={styles.tickerProgress}>
          <div className={styles.tickerProgressBar} key={tickerCategory} />
        </div>
      </section>
      
      {/* Popular Themes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>인기 테마</h2>
          <button 
            className={styles.moreButton}
            onClick={() => navigate('/theme')}
          >
            더보기 <ArrowRight size={16} />
          </button>
        </div>
        <div className={styles.themesGrid}>
          {popularThemes.map((theme) => (
            <Card 
              key={theme.id} 
              padding="md" 
              clickable
              onClick={() => navigate(`/theme/${theme.id}`)}
            >
              <div className={styles.themeCard}>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>{theme.name}</span>
                  <span className={`${styles.themeReturn} ${getChangeClass(theme.avgReturn)}`}>
                    {formatPercent(theme.avgReturn)}
                  </span>
                </div>
                <span className={styles.themeCount}>{theme.etfCount}개</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Top Movers */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={20} className={styles.sectionIcon} />
            상승 TOP
          </h2>
        </div>
        <Card padding="none">
          <div className={styles.etfList}>
            {topGainers.map((etf, index) => (
              <div 
                key={etf.id} 
                className={styles.etfItem}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <span className={styles.etfRank}>{index + 1}</span>
                <div className={styles.etfInfo}>
                  <span className={styles.etfName}>{etf.name}</span>
                  <span className={styles.etfTicker}>{etf.ticker}</span>
                </div>
                <div className={styles.etfPrice}>
                  <span className={styles.etfPriceValue}>{formatPrice(etf.price)}원</span>
                  <span className={`${styles.etfChange} ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      
      {/* Top Losers */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingDown size={20} className={styles.sectionIcon} />
            하락 TOP
          </h2>
        </div>
        <Card padding="none">
          <div className={styles.etfList}>
            {topLosers.map((etf, index) => (
              <div 
                key={etf.id} 
                className={styles.etfItem}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <span className={styles.etfRank}>{index + 1}</span>
                <div className={styles.etfInfo}>
                  <span className={styles.etfName}>{etf.name}</span>
                  <span className={styles.etfTicker}>{etf.ticker}</span>
                </div>
                <div className={styles.etfPrice}>
                  <span className={styles.etfPriceValue}>{formatPrice(etf.price)}원</span>
                  <span className={`${styles.etfChange} ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      
      {/* Volume Leaders */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>거래량 TOP</h2>
          <button 
            className={styles.moreButton}
            onClick={() => navigate('/search')}
          >
            전체보기 <ArrowRight size={16} />
          </button>
        </div>
        <Card padding="none">
          <div className={styles.etfList}>
            {topVolume.map((etf, index) => (
              <div 
                key={etf.id} 
                className={styles.etfItem}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <span className={styles.etfRank}>{index + 1}</span>
                <div className={styles.etfInfo}>
                  <span className={styles.etfName}>{etf.name}</span>
                  <span className={styles.etfTicker}>{etf.ticker}</span>
                </div>
                <div className={styles.etfPrice}>
                  <span className={styles.etfVolume}>{formatLargeNumber(etf.volume)}주</span>
                  <span className={`${styles.etfChange} ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
