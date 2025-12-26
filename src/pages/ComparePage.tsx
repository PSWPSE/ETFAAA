import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardHeader, Button, Badge } from '../components/common';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, generatePriceHistory, getReturns, getRiskMetrics } from '../data/etfs';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './ComparePage.module.css';

const COLORS = ['#1E3A5F', '#4A90A4', '#E8A838', '#22C55E'];

// 기간 선택 옵션
const PERIOD_OPTIONS = [
  { value: 30, label: '1개월', shortLabel: '1M' },
  { value: 90, label: '3개월', shortLabel: '3M' },
  { value: 180, label: '6개월', shortLabel: '6M' },
  { value: 365, label: '12개월', shortLabel: '1Y' },
];

export default function ComparePage() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare, selectedMarket } = useETFStore();
  
  // 기간 선택 상태
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  
  // 시장별 ETF 선택
  const allETFs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  const getETFById = (id: string) => {
    return [...koreanETFs, ...usETFs].find(e => e.id === id);
  };
  
  const etfs = compareList.map(id => getETFById(id)).filter(Boolean);
  
  // 선택된 기간 라벨
  const selectedPeriodLabel = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label || '3개월';
  
  // 가격 데이터 준비 (상대 수익률) - 숫자로 저장
  const { priceData, yDomain } = useMemo(() => {
    if (etfs.length === 0) return { priceData: [], yDomain: [0, 0] as [number, number] };
    
    const allPrices = etfs.map(etf => generatePriceHistory(etf!.price, selectedPeriod));
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    const baseData = allPrices[0].map((_, i) => {
      const item: Record<string, number | string> = { date: allPrices[0][i].date };
      etfs.forEach((etf, j) => {
        const basePrice = allPrices[j][0].close;
        const currentPrice = allPrices[j][i].close;
        const returnValue = Number(((currentPrice - basePrice) / basePrice * 100).toFixed(2));
        item[etf!.ticker] = returnValue;
        
        // 최소/최대값 추적
        if (returnValue < minValue) minValue = returnValue;
        if (returnValue > maxValue) maxValue = returnValue;
      });
      return item;
    });
    
    // Y축 도메인에 여유 공간 추가 (10% 정도)
    const range = maxValue - minValue;
    const padding = Math.max(range * 0.15, 1); // 최소 1% 여유
    const yMin = Math.floor((minValue - padding) * 10) / 10;
    const yMax = Math.ceil((maxValue + padding) * 10) / 10;
    
    return { priceData: baseData, yDomain: [yMin, yMax] as [number, number] };
  }, [etfs, selectedPeriod]);
  
  // 레이더 차트 데이터
  const radarData = etfs.length > 0 ? [
    { subject: '수익률', fullMark: 100, ...etfs.reduce((acc, etf) => {
      const returns = getReturns(etf!.id);
      acc[etf!.ticker] = Math.min(Math.max((returns.year1 + 50), 0), 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '안정성', fullMark: 100, ...etfs.reduce((acc, etf) => {
      const risk = getRiskMetrics(etf!.id);
      acc[etf!.ticker] = Math.max(100 - risk.volatility * 2, 0);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '배당', fullMark: 100, ...etfs.reduce((acc, etf) => {
      acc[etf!.ticker] = Math.min(etf!.dividendYield * 15, 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '유동성', fullMark: 100, ...etfs.reduce((acc, etf) => {
      acc[etf!.ticker] = Math.min(etf!.volume / 100000, 100);
      return acc;
    }, {} as Record<string, number>) },
    { subject: '비용효율', fullMark: 100, ...etfs.reduce((acc, etf) => {
      acc[etf!.ticker] = Math.max(100 - etf!.expenseRatio * 100, 0);
      return acc;
    }, {} as Record<string, number>) },
  ] : [];
  
  if (compareList.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Plus size={48} />
          </div>
          <h2>비교할 ETF를 선택해주세요</h2>
          <p>ETF 검색에서 비교하고 싶은 ETF를 추가하세요.<br />최대 4개까지 비교할 수 있습니다.</p>
          <Button onClick={() => navigate('/search')} rightIcon={<ArrowRight size={18} />}>
            ETF 검색하기
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.page}>
      {/* Selected ETFs */}
      <div className={styles.selectedList}>
        {etfs.map((etf, index) => (
          <div 
            key={etf!.id} 
            className={styles.selectedItem}
            style={{ borderLeftColor: COLORS[index] }}
          >
            <div className={styles.selectedInfo}>
              <span className={styles.selectedName}>{etf!.name}</span>
              <span className={styles.selectedTicker}>{etf!.ticker}</span>
            </div>
            <button 
              className={styles.removeButton}
              onClick={() => removeFromCompare(etf!.id)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {compareList.length < 4 && (
          <button 
            className={styles.addButton}
            onClick={() => navigate('/search')}
          >
            <Plus size={20} />
            <span>ETF 추가</span>
          </button>
        )}
      </div>
      
      {compareList.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearCompare}
          className={styles.clearButton}
        >
          전체 삭제
        </Button>
      )}
      
      {/* Price Comparison Chart */}
      <Card padding="md">
        <div className={styles.chartHeader}>
          <CardHeader title="수익률 비교" subtitle={`최근 ${selectedPeriodLabel} 상대 수익률 (%)`} />
          <div className={styles.periodSelector}>
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.periodButton} ${selectedPeriod === option.value ? styles.active : ''}`}
                onClick={() => setSelectedPeriod(option.value)}
              >
                {option.shortLabel}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>
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
              {etfs.map((etf, index) => (
                <Line 
                  key={etf!.id}
                  type="monotone" 
                  dataKey={etf!.ticker}
                  stroke={COLORS[index]} 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Radar Comparison */}
      {etfs.length >= 2 && (
        <Card padding="md">
          <CardHeader title="종합 비교" subtitle="각 항목별 상대 점수" />
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {etfs.map((etf, index) => (
                  <Radar
                    key={etf!.id}
                    name={etf!.ticker}
                    dataKey={etf!.ticker}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.metricsInfo}>
            <span>수익률(연수익률)</span>
            <span>안정성(연변동성)</span>
            <span>배당(연배당률)</span>
            <span>유동성(일거래량)</span>
            <span>비용효율(연보수율)</span>
          </div>
        </Card>
      )}
      
      {/* Comparison Table */}
      <Card padding="none">
        <div className={styles.compareTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>항목</div>
            {etfs.map((etf, index) => (
              <div 
                key={etf!.id} 
                className={styles.tableHeaderCell}
                style={{ color: COLORS[index] }}
              >
                {etf!.name}
              </div>
            ))}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>현재가</div>
            {etfs.map((etf) => (
              <div key={etf!.id} className={styles.tableCell}>
                {formatPrice(etf!.price)}원
              </div>
            ))}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>등락률</div>
            {etfs.map((etf) => (
              <div key={etf!.id} className={`${styles.tableCell} ${getChangeClass(etf!.changePercent)}`}>
                {formatPercent(etf!.changePercent)}
              </div>
            ))}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>1년 수익률</div>
            {etfs.map((etf) => {
              const returns = getReturns(etf!.id);
              return (
                <div key={etf!.id} className={`${styles.tableCell} ${getChangeClass(returns.year1)}`}>
                  {formatPercent(returns.year1)}
                </div>
              );
            })}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>배당수익률</div>
            {etfs.map((etf) => (
              <div key={etf!.id} className={styles.tableCell}>
                {etf!.dividendYield.toFixed(2)}%
              </div>
            ))}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>총보수율</div>
            {etfs.map((etf) => (
              <div key={etf!.id} className={styles.tableCell}>
                {etf!.expenseRatio.toFixed(2)}%
              </div>
            ))}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>변동성</div>
            {etfs.map((etf) => {
              const risk = getRiskMetrics(etf!.id);
              return (
                <div key={etf!.id} className={styles.tableCell}>
                  {risk.volatility.toFixed(1)}%
                </div>
              );
            })}
          </div>
          
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>샤프비율</div>
            {etfs.map((etf) => {
              const risk = getRiskMetrics(etf!.id);
              return (
                <div key={etf!.id} className={styles.tableCell}>
                  {risk.sharpeRatio.toFixed(2)}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
