import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Flame, Snowflake, TrendingUp, TrendingDown, 
  Activity, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { Card } from '../components/common';
import { koreanETFs, usETFs, getPhaseAnalysis } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './PhaseDetailPage.module.css';

const CATEGORY_CONFIG = {
  oversold: {
    title: '공포 종목 전체',
    icon: Snowflake,
    description: 'RSI 30 이하인 모든 ETF',
    filter: (analysis: any) => analysis.rsi <= 30,
    sort: (a: any, b: any) => a.analysis.rsi - b.analysis.rsi,
  },
  neutral_phase: {
    title: '중립 국면 전체',
    icon: Activity,
    description: 'RSI 30-70 사이인 모든 ETF',
    filter: (analysis: any) => analysis.rsi > 30 && analysis.rsi < 70,
    sort: (a: any, b: any) => Math.abs(50 - a.analysis.rsi) - Math.abs(50 - b.analysis.rsi),
  },
  overheated: {
    title: '과열 종목 전체',
    icon: Flame,
    description: 'RSI 70 이상인 모든 ETF',
    filter: (analysis: any) => analysis.rsi >= 70,
    sort: (a: any, b: any) => b.analysis.rsi - a.analysis.rsi,
  },
  bullish: {
    title: '강세 모멘텀 전체',
    icon: TrendingUp,
    description: '과열 + 상승 추세 강화 ETF',
    filter: (analysis: any) => analysis.rsi >= 65 && analysis.macd > 0 && analysis.histogram > 50,
    sort: (a: any, b: any) => (b.analysis.rsi + b.analysis.histogram) - (a.analysis.rsi + a.analysis.histogram),
  },
  bearish: {
    title: '약세 전환 신호 전체',
    icon: TrendingDown,
    description: '과열 + 추세 약화 ETF',
    filter: (analysis: any) => analysis.rsi >= 65 && analysis.histogram < -50,
    sort: (a: any, b: any) => (b.analysis.rsi - b.analysis.histogram) - (a.analysis.rsi - a.analysis.histogram),
  },
  steady: {
    title: '안정적 상승 전체',
    icon: Activity,
    description: '중립 RSI + 상승 추세 ETF',
    filter: (analysis: any) => analysis.rsi >= 45 && analysis.rsi <= 65 && analysis.macd > 0 && analysis.histogram > 0,
    sort: (a: any, b: any) => b.analysis.histogram - a.analysis.histogram,
  },
  bounce: {
    title: '반등 기회 전체',
    icon: AlertTriangle,
    description: '침체 + 추세 전환 시작 ETF',
    filter: (analysis: any) => analysis.rsi <= 35 && analysis.histogram > 0,
    sort: (a: any, b: any) => (a.analysis.rsi + b.analysis.histogram) - (b.analysis.rsi + a.analysis.histogram),
  },
  bullish_trend: {
    title: '상승 추세 전체',
    icon: TrendingUp,
    description: 'MACD 100 이상인 모든 ETF',
    filter: (analysis: any) => analysis.macd > 100,
    sort: (a: any, b: any) => b.analysis.macd - a.analysis.macd,
  },
  neutral_trend: {
    title: '중립 추세 전체',
    icon: Activity,
    description: 'MACD -100 ~ 100 사이인 모든 ETF',
    filter: (analysis: any) => analysis.macd >= -100 && analysis.macd <= 100,
    sort: (a: any, b: any) => Math.abs(a.analysis.macd) - Math.abs(b.analysis.macd),
  },
  bearish_trend: {
    title: '하락 추세 전체',
    icon: TrendingDown,
    description: 'MACD -100 이하인 모든 ETF',
    filter: (analysis: any) => analysis.macd < -100,
    sort: (a: any, b: any) => a.analysis.macd - b.analysis.macd,
  },
};

export default function PhaseDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedMarket } = useETFStore();
  
  const category = searchParams.get('category') || 'overheated';
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  // 모든 ETF 분석 데이터
  const allETFsWithAnalysis = useMemo(() => {
    return etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
  }, [etfs]);
  
  // 카테고리별 필터링 및 정렬
  const filteredETFs = useMemo(() => {
    if (!config) return [];
    
    return allETFsWithAnalysis
      .filter(e => config.filter(e.analysis))
      .sort(config.sort);
  }, [allETFsWithAnalysis, config]);
  
  const handleETFClick = (etfId: string) => {
    navigate(`/etf/${etfId}`);
  };
  
  const handleBack = () => {
    navigate('/phase');
  };
  
  if (!config) {
    return (
      <div className={styles.page}>
        <Card padding="xl">
          <p>잘못된 카테고리입니다.</p>
          <button onClick={handleBack}>돌아가기</button>
        </Card>
      </div>
    );
  }
  
  const Icon = config.icon;
  
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>국면분석</span>
        </button>
        
        <div className={styles.titleGroup}>
          <Icon size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>{config.title}</h1>
            <p className={styles.description}>{config.description}</p>
          </div>
        </div>
        
        <div className={styles.count}>
          총 <strong>{filteredETFs.length}</strong>개
        </div>
      </div>
      
      {/* ETF List */}
      {filteredETFs.length > 0 ? (
        <Card className={styles.listCard}>
          {filteredETFs.map((etf, idx) => (
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
                  {formatPrice(etf.price, selectedMarket)}{selectedMarket === 'korea' ? '원' : ''}
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
    </div>
  );
}

