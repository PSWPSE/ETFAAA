import { useState, useMemo, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Card, CardHeader, Badge } from '../components/common';
import { koreanETFs, usETFs, correlations } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import styles from './CorrelationPage.module.css';

export default function CorrelationPage() {
  const { selectedMarket } = useETFStore();
  
  // 시장별 ETF 선택
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const availableETFs = etfs.slice(0, 12);
  
  const [selectedETFs, setSelectedETFs] = useState<string[]>(availableETFs.slice(0, 6).map(e => e.id));
  
  // 시장 변경 시 ETF 목록 재설정
  useEffect(() => {
    setSelectedETFs(availableETFs.slice(0, 6).map(e => e.id));
  }, [selectedMarket]);
  
  // 선택된 ETF들의 상관관계 매트릭스 생성
  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    
    selectedETFs.forEach(id1 => {
      matrix[id1] = {};
      selectedETFs.forEach(id2 => {
        if (id1 === id2) {
          matrix[id1][id2] = 1;
        } else {
          const corr = correlations.find(
            c => (c.etf1 === id1 && c.etf2 === id2) || (c.etf1 === id2 && c.etf2 === id1)
          );
          matrix[id1][id2] = corr ? corr.value : (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
        }
      });
    });
    
    return matrix;
  }, [selectedETFs]);
  
  const toggleETF = (id: string) => {
    if (selectedETFs.includes(id)) {
      if (selectedETFs.length > 2) {
        setSelectedETFs(selectedETFs.filter(e => e !== id));
      }
    } else {
      if (selectedETFs.length < 8) {
        setSelectedETFs([...selectedETFs, id]);
      }
    }
  };
  
  const getCorrelationColor = (value: number): string => {
    if (value >= 0.7) return '#22C55E';
    if (value >= 0.3) return '#86EFAC';
    if (value >= -0.3) return '#E5E7EB';
    if (value >= -0.7) return '#FCA5A5';
    return '#EF4444';
  };
  
  const getCorrelationLabel = (value: number): string => {
    if (value >= 0.7) return '강한 양의 상관';
    if (value >= 0.3) return '약한 양의 상관';
    if (value >= -0.3) return '상관관계 없음';
    if (value >= -0.7) return '약한 음의 상관';
    return '강한 음의 상관';
  };
  
  // 높은 상관관계 / 낮은 상관관계 쌍 찾기
  const correlationPairs = useMemo(() => {
    const pairs: { etf1: string; etf2: string; value: number }[] = [];
    
    selectedETFs.forEach((id1, i) => {
      selectedETFs.forEach((id2, j) => {
        if (i < j) {
          pairs.push({
            etf1: id1,
            etf2: id2,
            value: correlationMatrix[id1]?.[id2] || 0,
          });
        }
      });
    });
    
    return pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [selectedETFs, correlationMatrix]);
  
  const highCorrelations = correlationPairs.filter(p => p.value > 0.5);
  const lowCorrelations = correlationPairs.filter(p => p.value < -0.2);
  
  return (
    <div className={styles.page}>
      {/* ETF Selection */}
      <Card padding="md">
        <CardHeader 
          title="ETF 선택" 
          subtitle="분석할 ETF를 선택하세요 (2~8개)"
        />
        <div className={styles.etfChips}>
          {availableETFs.map(etf => (
            <button
              key={etf.id}
              className={`${styles.etfChip} ${selectedETFs.includes(etf.id) ? styles.selected : ''}`}
              onClick={() => toggleETF(etf.id)}
            >
              {etf.ticker}
            </button>
          ))}
        </div>
      </Card>
      
      {/* Correlation Matrix */}
      <Card padding="md">
        <CardHeader title="상관관계 매트릭스" />
        <div className={styles.matrixContainer}>
          <div className={styles.matrix}>
            {/* Header Row */}
            <div className={styles.matrixRow}>
              <div className={styles.matrixCorner} />
              {selectedETFs.map(id => {
                const etf = etfs.find(e => e.id === id);
                return (
                  <div key={id} className={styles.matrixHeader}>
                    {etf?.ticker || id}
                  </div>
                );
              })}
            </div>
            
            {/* Data Rows */}
            {selectedETFs.map(id1 => {
              const etf1 = etfs.find(e => e.id === id1);
              return (
                <div key={id1} className={styles.matrixRow}>
                  <div className={styles.matrixLabel}>{etf1?.ticker || id1}</div>
                  {selectedETFs.map(id2 => {
                    const value = correlationMatrix[id1]?.[id2] || 0;
                    return (
                      <div 
                        key={id2} 
                        className={styles.matrixCell}
                        style={{ 
                          background: getCorrelationColor(value),
                          color: Math.abs(value) > 0.5 ? '#fff' : '#1F2937',
                        }}
                        title={getCorrelationLabel(value)}
                      >
                        {value.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Color Legend */}
        <div className={styles.colorLegend}>
          <span className={styles.legendLabel}>음의 상관</span>
          <div className={styles.legendGradient}>
            <span style={{ background: '#EF4444' }} />
            <span style={{ background: '#FCA5A5' }} />
            <span style={{ background: '#E5E7EB' }} />
            <span style={{ background: '#86EFAC' }} />
            <span style={{ background: '#22C55E' }} />
          </div>
          <span className={styles.legendLabel}>양의 상관</span>
        </div>
      </Card>
      
      {/* Insights */}
      <div className={styles.insightsGrid}>
        {/* High Correlation */}
        <Card padding="md">
          <CardHeader 
            title="유사한 움직임" 
            subtitle="높은 양의 상관관계"
          />
          {highCorrelations.length > 0 ? (
            <div className={styles.pairsList}>
              {highCorrelations.slice(0, 5).map((pair, index) => {
                const etf1 = etfs.find(e => e.id === pair.etf1);
                const etf2 = etfs.find(e => e.id === pair.etf2);
                return (
                  <div key={index} className={styles.pairItem}>
                    <div className={styles.pairNames}>
                      <span>{etf1?.ticker || pair.etf1}</span>
                      <span className={styles.pairDivider}>↔</span>
                      <span>{etf2?.ticker || pair.etf2}</span>
                    </div>
                    <Badge variant="success" size="sm">
                      {pair.value.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.noPairs}>높은 상관관계 쌍이 없습니다.</p>
          )}
        </Card>
        
        {/* Low Correlation */}
        <Card padding="md">
          <CardHeader 
            title="분산 효과" 
            subtitle="음의 상관관계"
          />
          {lowCorrelations.length > 0 ? (
            <div className={styles.pairsList}>
              {lowCorrelations.slice(0, 5).map((pair, index) => {
                const etf1 = etfs.find(e => e.id === pair.etf1);
                const etf2 = etfs.find(e => e.id === pair.etf2);
                return (
                  <div key={index} className={styles.pairItem}>
                    <div className={styles.pairNames}>
                      <span>{etf1?.ticker || pair.etf1}</span>
                      <span className={styles.pairDivider}>↔</span>
                      <span>{etf2?.ticker || pair.etf2}</span>
                    </div>
                    <Badge variant="info" size="sm">
                      {pair.value.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.noPairs}>음의 상관관계 쌍이 없습니다.</p>
          )}
        </Card>
      </div>
      
      {/* Info */}
      <Card padding="md" className={styles.infoCard}>
        <Info size={18} />
        <div className={styles.infoContent}>
          <h4>상관관계란?</h4>
          <p>
            상관관계는 두 자산의 가격 움직임이 얼마나 비슷한지를 나타냅니다.
            +1에 가까울수록 함께 움직이고, -1에 가까울수록 반대로 움직입니다.
            분산 투자를 위해서는 상관관계가 낮은 ETF를 조합하는 것이 좋습니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
