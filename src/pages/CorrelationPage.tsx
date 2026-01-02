import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, X } from 'lucide-react';
import { Card } from '../components/common';
import { getETFById, getCorrelatedETFs, koreanETFs, usETFs } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './CorrelationPage.module.css';

export default function CorrelationPage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  
  const [baseETFId, setBaseETFId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  // 검색 필터링
  const filteredETFs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return etfs.filter(etf =>
      etf.name.toLowerCase().includes(query) ||
      etf.ticker.toLowerCase().includes(query) ||
      etf.issuer.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchQuery, etfs]);
  
  // 기준 ETF 및 상관 ETF들
  const baseETF = baseETFId ? getETFById(baseETFId) : null;
  const correlatedETFs = baseETFId ? getCorrelatedETFs(baseETFId, 4) : { positive: [], negative: [] };
  
  // 매트릭스용 ETF 목록 (기준 + 양의 상관 3개 + 음의 상관 3개)
  const matrixETFs = useMemo(() => {
    if (!baseETF) return [];
    return [
      baseETF,
      ...correlatedETFs.positive.slice(0, 3),
      ...correlatedETFs.negative.slice(0, 3),
    ];
  }, [baseETF, correlatedETFs]);
  
  // 상관관계 매트릭스 생성
  const correlationMatrix = useMemo(() => {
    if (matrixETFs.length === 0) return {};
    
    const matrix: Record<string, Record<string, number>> = {};
    const baseId = matrixETFs[0].id;
    
    // 먼저 각 ETF의 기준 ETF와의 상관계수를 저장
    const baseCorrelations: Record<string, number> = {};
    baseCorrelations[baseId] = 1; // 자기 자신
    
    correlatedETFs.positive.forEach((etf: any) => {
      baseCorrelations[etf.id] = etf.correlation;
    });
    
    correlatedETFs.negative.forEach((etf: any) => {
      baseCorrelations[etf.id] = etf.correlation;
    });
    
    // 매트릭스 생성 (대칭성 보장)
    matrixETFs.forEach((etf1, i) => {
      matrix[etf1.id] = {};
      
      matrixETFs.forEach((etf2, j) => {
        if (i === j) {
          // 대각선: 자기 자신과의 상관계수는 1
          matrix[etf1.id][etf2.id] = 1;
        } else if (etf1.id === baseId) {
          // 기준 ETF와 다른 ETF의 상관계수
          matrix[etf1.id][etf2.id] = baseCorrelations[etf2.id] || 0;
        } else if (etf2.id === baseId) {
          // 대칭성: 다른 ETF와 기준 ETF의 상관계수
          matrix[etf1.id][etf2.id] = baseCorrelations[etf1.id] || 0;
        } else {
          // 다른 ETF들끼리의 상관계수
          // 같은 그룹(양의 or 음의)이면 높은 상관관계
          const etf1IsPositive = correlatedETFs.positive.some((e: any) => e.id === etf1.id);
          const etf2IsPositive = correlatedETFs.positive.some((e: any) => e.id === etf2.id);
          
          if (etf1IsPositive === etf2IsPositive) {
            // 같은 그룹: 0.6 ~ 0.85
            matrix[etf1.id][etf2.id] = 0.6 + Math.random() * 0.25;
          } else {
            // 다른 그룹: -0.6 ~ -0.3
            matrix[etf1.id][etf2.id] = -0.6 + Math.random() * 0.3;
          }
        }
      });
    });
    
    // 대칭성 강제 적용 (하삼각행렬을 상삼각행렬에 복사)
    matrixETFs.forEach((etf1, i) => {
      matrixETFs.forEach((etf2, j) => {
        if (i < j) {
          matrix[etf2.id][etf1.id] = matrix[etf1.id][etf2.id];
        }
      });
    });
    
    return matrix;
  }, [matrixETFs, correlatedETFs]);
  
  const selectETF = (id: string) => {
    setBaseETFId(id);
    setSearchQuery('');
    setShowResults(false);
  };
  
  const clearETF = () => {
    setBaseETFId(null);
    setSearchQuery('');
  };
  
  const getCorrelationColor = (value: number): string => {
    if (value === 1) return 'rgba(99, 102, 241, 0.1)'; // 대각선 (자기 자신)
    if (value >= 0.7) return 'rgba(34, 197, 94, 0.2)'; // 강한 양의 상관
    if (value >= 0.3) return 'rgba(34, 197, 94, 0.1)'; // 약한 양의 상관
    if (value >= -0.3) return 'rgba(229, 231, 235, 0.5)'; // 무상관
    if (value >= -0.7) return 'rgba(239, 68, 68, 0.1)'; // 약한 음의 상관
    return 'rgba(239, 68, 68, 0.2)'; // 강한 음의 상관
  };
  
  const getCorrelationTextColor = (value: number): string => {
    if (value === 1) return '#6366F1'; // 대각선
    if (value >= 0.7) return '#16A34A'; // 강한 양의 상관
    if (value >= 0.3) return '#22C55E'; // 약한 양의 상관
    if (value >= -0.3) return '#6B7280'; // 무상관
    if (value >= -0.7) return '#EF4444'; // 약한 음의 상관
    return '#DC2626'; // 강한 음의 상관
  };
  
  const getCorrelationLabel = (value: number): string => {
    if (value >= 0.7) return '강한 양의 상관';
    if (value >= 0.3) return '약한 양의 상관';
    if (value >= -0.3) return '상관관계 없음';
    if (value >= -0.7) return '약한 음의 상관';
    return '강한 음의 상관';
  };
  
  return (
    <div className={styles.page}>
      {/* ETF 검색 */}
      <Card className={`${styles.etfCard} ${!baseETF ? styles.required : ''}`}>
        <div className={styles.etfCardHeader}>
          <Activity size={20} />
          <h3 className={styles.etfCardTitle}>기준 ETF 선택</h3>
        </div>
        <p className={styles.etfCardDescription}>상관관계를 분석할 기준 ETF를 검색하세요</p>
        
        {baseETF ? (
          <div className={styles.selectedETF}>
            <div className={styles.selectedETFInfo}>
              <span className={styles.selectedETFName}>{baseETF.name}</span>
              <span className={styles.selectedETFTicker}>{baseETF.ticker}</span>
            </div>
            <div className={styles.selectedETFRight}>
              <span className={styles.selectedETFPrice}>{formatPrice(baseETF.price)}원</span>
              <span className={getChangeClass(baseETF.changePercent)}>{formatPercent(baseETF.changePercent)}</span>
              <button className={styles.clearButton} onClick={clearETF}>
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.searchSection}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="ETF 이름 또는 티커 입력"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className={styles.searchInput}
              />
              {showResults && filteredETFs.length > 0 && (
                <div className={styles.searchResults}>
                  {filteredETFs.map((etf) => (
                    <button
                      key={etf.id}
                      className={styles.searchResultItem}
                      onClick={() => selectETF(etf.id)}
                    >
                      <div className={styles.searchResultInfo}>
                        <span className={styles.searchResultName}>{etf.name}</span>
                        <span className={styles.searchResultTicker}>{etf.ticker} · {etf.issuer}</span>
                      </div>
                      <div className={styles.searchResultPrice}>
                        <span>{formatPrice(etf.price)}원</span>
                        <span className={getChangeClass(etf.changePercent)}>{formatPercent(etf.changePercent)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
      
      {!baseETF && (
        <div className={styles.emptyState}>
          <Activity size={48} className={styles.emptyIcon} />
          <h3>기준 ETF를 검색하여 선택해보세요</h3>
          <p>검색창에 ETF 이름이나 코드를 입력하면<br />상관관계를 분석할 ETF를 선택할 수 있습니다</p>
        </div>
      )}
      
      {baseETF && (
        <>
          {/* 상관관계 매트릭스 */}
          <Card>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <Activity size={18} />
                <h3 className={styles.sectionTitle}>상관관계 매트릭스</h3>
              </div>
              <p className={styles.sectionDescription}>선택된 ETF들 간의 상관관계를 한눈에 확인할 수 있습니다</p>
            </div>
            
            <div className={styles.matrixWrapper}>
              <div className={styles.matrixContainer}>
                <div className={styles.matrix}>
                  {/* Header Row */}
                  <div className={styles.matrixRow}>
                    <div className={styles.matrixCorner} />
                    {matrixETFs.map((etf, index) => (
                      <button
                        key={etf.id}
                        className={`${styles.matrixHeader} ${index === 0 ? styles.baseETF : ''}`}
                        onClick={() => navigate(`/etf/${etf.id}`)}
                        title={`${etf.name} 상세보기`}
                      >
                        <span className={styles.matrixHeaderTicker}>{etf.ticker}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Data Rows */}
                  {matrixETFs.map((etf1, rowIndex) => (
                    <div key={etf1.id} className={styles.matrixRow}>
                      <button
                        className={`${styles.matrixLabel} ${rowIndex === 0 ? styles.baseETF : ''}`}
                        onClick={() => navigate(`/etf/${etf1.id}`)}
                        title={`${etf1.name} 상세보기`}
                      >
                        <span className={styles.matrixLabelTicker}>{etf1.ticker}</span>
                      </button>
                      {matrixETFs.map((etf2, colIndex) => {
                        const value = correlationMatrix[etf1.id]?.[etf2.id] || 0;
                        const isBase = rowIndex === 0 || colIndex === 0;
                        return (
                          <div
                            key={etf2.id}
                            className={`${styles.matrixCell} ${isBase ? styles.baseCell : ''}`}
                            style={{
                              background: getCorrelationColor(value),
                              color: getCorrelationTextColor(value),
                            }}
                            title={`${etf1.ticker} ↔ ${etf2.ticker}: ${getCorrelationLabel(value)}`}
                          >
                            {value.toFixed(2)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Color Legend */}
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ background: 'rgba(239, 68, 68, 0.2)' }} />
                  <span className={styles.legendLabel}>강한 음의 상관</span>
                  <span className={styles.legendValue}>-1.0 ~ -0.7</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ background: 'rgba(239, 68, 68, 0.1)' }} />
                  <span className={styles.legendLabel}>약한 음의 상관</span>
                  <span className={styles.legendValue}>-0.7 ~ -0.3</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ background: 'rgba(229, 231, 235, 0.5)' }} />
                  <span className={styles.legendLabel}>무상관</span>
                  <span className={styles.legendValue}>-0.3 ~ 0.3</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ background: 'rgba(34, 197, 94, 0.1)' }} />
                  <span className={styles.legendLabel}>약한 양의 상관</span>
                  <span className={styles.legendValue}>0.3 ~ 0.7</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ background: 'rgba(34, 197, 94, 0.2)' }} />
                  <span className={styles.legendLabel}>강한 양의 상관</span>
                  <span className={styles.legendValue}>0.7 ~ 1.0</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* 상관관계 분석 */}
          <div className={styles.analysisGrid}>
            {/* 양의 상관관계 */}
            <Card>
              <div className={styles.sectionHeader}>
                <h4 className={styles.analysisTitle}>같은 방향 (양의 상관관계)</h4>
              </div>
              <div className={styles.correlationList}>
                {correlatedETFs.positive.slice(0, 4).map((etf: any) => (
                  <button
                    key={etf.id}
                    className={styles.correlationItem}
                    onClick={() => navigate(`/etf/${etf.id}`)}
                  >
                    <div className={styles.correlationLeft}>
                      <span className={styles.correlationName}>{etf.name}</span>
                      <span className={styles.correlationTicker}>{etf.ticker}</span>
                    </div>
                    <div className={styles.correlationRight}>
                      <span className={styles.correlationValue}>
                        +{(etf.correlation * 100).toFixed(0)}%
                      </span>
                      <span className={styles.correlationPrice}>{formatPrice(etf.price)}원</span>
                      <span className={getChangeClass(etf.changePercent)}>{formatPercent(etf.changePercent)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
            
            {/* 음의 상관관계 */}
            <Card>
              <div className={styles.sectionHeader}>
                <h4 className={styles.analysisTitle}>반대 방향 (음의 상관관계)</h4>
              </div>
              <div className={styles.correlationList}>
                {correlatedETFs.negative.slice(0, 4).map((etf: any) => (
                  <button
                    key={etf.id}
                    className={styles.correlationItem}
                    onClick={() => navigate(`/etf/${etf.id}`)}
                  >
                    <div className={styles.correlationLeft}>
                      <span className={styles.correlationName}>{etf.name}</span>
                      <span className={styles.correlationTicker}>{etf.ticker}</span>
                    </div>
                    <div className={styles.correlationRight}>
                      <span className={styles.correlationValue}>
                        {(etf.correlation * 100).toFixed(0)}%
                      </span>
                      <span className={styles.correlationPrice}>{formatPrice(etf.price)}원</span>
                      <span className={getChangeClass(etf.changePercent)}>{formatPercent(etf.changePercent)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
