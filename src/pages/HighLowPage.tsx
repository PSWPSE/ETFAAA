import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { Card } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanETFs, usETFs } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './HighLowPage.module.css';

type HighLowCategory = 'high' | 'low';

export default function HighLowPage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [activeCategory, setActiveCategory] = useState<HighLowCategory>('high');
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  // 52주 신고가 ETF
  const nearHigh52w = useMemo(() => {
    return etfs.map(e => {
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (1.0 + Math.random() * 0.5);
      const return3m = baseReturn * (1.2 + Math.random() * 0.8);
      const distanceFromHigh = Math.random() * 5; // 0~5% 이내
      
      return { ...e, return1w, return1m, return3m, distanceFromHigh };
    })
    .sort((a, b) => a.distanceFromHigh - b.distanceFromHigh);
  }, [etfs]);
  
  // 52주 신저가 ETF
  const nearLow52w = useMemo(() => {
    return etfs.map(e => {
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (1.0 + Math.random() * 0.5);
      const return3m = baseReturn * (1.2 + Math.random() * 0.8);
      const distanceFromLow = Math.random() * 5; // 0~5% 이내
      
      return { ...e, return1w, return1m, return3m, distanceFromLow };
    })
    .sort((a, b) => a.distanceFromLow - b.distanceFromLow);
  }, [etfs]);
  
  const displayList = activeCategory === 'high' ? nearHigh52w : nearLow52w;
  
  return (
    <PageContainer
      title="52주 신기록"
      subtitle="52주 신고가/신저가를 기록한 ETF 목록"
      showMarketSelector={true}
    >
      <div className={styles.page}>
        {/* 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          <button
            className={`${styles.categoryTab} ${activeCategory === 'high' ? styles.active : ''}`}
            onClick={() => setActiveCategory('high')}
          >
            <ArrowUpCircle size={18} />
            <span>52주 신고가</span>
            <span className={styles.tabCount}>{nearHigh52w.length}</span>
          </button>
          <button
            className={`${styles.categoryTab} ${activeCategory === 'low' ? styles.active : ''}`}
            onClick={() => setActiveCategory('low')}
          >
            <ArrowDownCircle size={18} />
            <span>52주 신저가</span>
            <span className={styles.tabCount}>{nearLow52w.length}</span>
          </button>
        </div>
        
        {/* 안내 카드 */}
        <Card padding="md" className={styles.infoCard}>
          <div className={styles.infoContent}>
            <TrendingUp size={20} className={styles.infoIcon} />
            <div className={styles.infoText}>
              <p className={styles.infoTitle}>
                {activeCategory === 'high' ? '52주 신고가' : '52주 신저가'}란?
              </p>
              <p className={styles.infoDesc}>
                {activeCategory === 'high' 
                  ? '최근 52주(1년) 동안 가장 높은 가격을 기록한 ETF입니다. 강한 상승 추세를 나타냅니다.'
                  : '최근 52주(1년) 동안 가장 낮은 가격을 기록한 ETF입니다. 반등 가능성을 주목할 수 있습니다.'}
              </p>
            </div>
          </div>
        </Card>
        
        {/* ETF 리스트 */}
        <div className={styles.etfList}>
          {displayList.map((etf, index) => (
            <Card 
              key={etf.id} 
              padding="md" 
              className={styles.etfCard}
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              <div className={styles.etfCardHeader}>
                <div className={styles.etfRank}>
                  {index + 1}
                </div>
                <div className={styles.etfInfo}>
                  <h3 className={styles.etfName}>{etf.name}</h3>
                  <p className={styles.etfCode}>{etf.code}</p>
                  <div className={styles.etfMeta}>
                    <span className={styles.metaItem}>{etf.company}</span>
                    <span className={styles.metaDivider}>•</span>
                    <span className={styles.metaItem}>배당 {formatPercent(etf.dividendYield)}</span>
                  </div>
                </div>
                <div className={styles.etfPrice}>
                  <span className={styles.priceValue}>{formatPrice(etf.currentPrice)}</span>
                  <span className={`${styles.priceChange} ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </div>
              
              <div className={styles.etfReturns}>
                <div className={styles.returnItem}>
                  <span className={styles.returnLabel}>1주</span>
                  <span className={`${styles.returnValue} ${getChangeClass(etf.return1w)}`}>
                    {formatPercent(etf.return1w)}
                  </span>
                </div>
                <div className={styles.returnItem}>
                  <span className={styles.returnLabel}>1개월</span>
                  <span className={`${styles.returnValue} ${getChangeClass(etf.return1m)}`}>
                    {formatPercent(etf.return1m)}
                  </span>
                </div>
                <div className={styles.returnItem}>
                  <span className={styles.returnLabel}>3개월</span>
                  <span className={`${styles.returnValue} ${getChangeClass(etf.return3m)}`}>
                    {formatPercent(etf.return3m)}
                  </span>
                </div>
                <div className={styles.distanceItem}>
                  <span className={styles.distanceLabel}>
                    {activeCategory === 'high' ? '고점대비' : '저점대비'}
                  </span>
                  <span className={styles.distanceValue}>
                    {activeCategory === 'high' 
                      ? `-${etf.distanceFromHigh.toFixed(2)}%`
                      : `+${etf.distanceFromLow.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

