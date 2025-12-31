import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Plus, Search, ArrowRight, Info, TrendingUp, PieChart, BarChart2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell } from 'recharts';
import { Card, CardHeader, Button } from '../components/common';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, generatePriceHistory, getReturns, getRiskMetrics } from '../data/etfs';
import { formatPrice, formatPercent, getChangeClass, formatLargeNumber } from '../utils/format';
import styles from './ComparePage.module.css';
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
  const navigate = useNavigate();
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
  const allETFs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
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
      .slice(0, 10);
  }, [searchQuery, allETFs, selectedETFs]);
  
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
        if (entry.isIntersecting && !entry.target.classList.contains(styles.animated)) {
          entry.target.classList.add(styles.animated);
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
      selectedETFs.forEach((etf, index) => {
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
    if (index === bestIndex) return styles.bestValue;
    if (index === worstIndex) return styles.worstValue;
    return '';
  };
  
  return (
    <div className={styles.page}>
      {/* ETF 선택 섹션 */}
      <div ref={selectionSectionRef} className={styles.selectionSection}>
        <div className={styles.selectionHeader}>
          <div className={styles.headerTitleGroup}>
            <div>
              <h1 className={styles.selectionTitle}>ETF 비교 분석</h1>
              <p className={styles.selectionSubtitle}>최대 {MAX_COMPARE}개의 ETF를 선택하여 비교하세요</p>
            </div>
          </div>
        </div>
        
        {/* 검색 입력 */}
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={`${styles.searchInput} ${selectedETFs.length < 2 ? styles.required : ''}`}
              placeholder="ETF 이름 또는 코드로 검색... (예: KODEX 200, SPY)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedETFs.length >= MAX_COMPARE}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* 검색 결과 */}
          {searchQuery && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((etf, index) => (
                <button
                  key={etf.id}
                  className={styles.searchResultItem}
                  onClick={() => handleAddETF(etf)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{etf.name}</span>
                    <span className={styles.resultTicker}>{etf.ticker}</span>
                  </div>
                  <div className={styles.resultPrice}>
                    <span>{formatPrice(etf.price)}원</span>
                    <span className={getChangeClass(etf.changePercent)}>
                      {formatPercent(etf.changePercent)}
                    </span>
                  </div>
                  <Plus size={20} className={styles.addIcon} />
                </button>
              ))}
            </div>
          )}
          
          {searchQuery && searchResults.length === 0 && (
            <div className={styles.noResults}>
              <p>검색 결과가 없습니다</p>
            </div>
          )}
        </div>
        
        {/* 선택된 ETF 목록 */}
        {selectedETFs.length > 0 && (
          <div className={styles.selectedSection}>
            <div className={styles.selectedHeader}>
              <h3 className={styles.selectedTitle}>
                선택한 ETF <span className={styles.selectedCount}>({selectedETFs.length}/{MAX_COMPARE})</span>
              </h3>
              <button className={styles.clearAllBtn} onClick={handleClearAll}>
                전체 삭제
              </button>
            </div>
            
            <div className={styles.selectedList}>
              {selectedETFs.map((etf, index) => (
                <div
                  key={etf.id}
                  className={styles.selectedChip}
                  style={{ 
                    borderColor: COLORS[index],
                    color: COLORS[index],
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className={styles.chipDot} style={{ backgroundColor: COLORS[index] }} />
                  <span className={styles.chipName}>{etf.name}</span>
                  <button 
                    className={styles.chipRemoveBtn}
                    onClick={() => handleRemoveETF(etf.id)}
                    aria-label="삭제"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 비교하기 버튼 */}
            {selectedETFs.length >= 2 && !showResults && (
              <Button
                size="lg"
                onClick={handleStartCompare}
                rightIcon={<ArrowRight size={20} />}
                className={styles.compareButton}
              >
                비교 분석 시작하기
              </Button>
            )}
            
            {selectedETFs.length === 1 && (
              <p className={styles.helpText}>최소 2개 이상의 ETF를 선택해야 비교할 수 있습니다</p>
            )}
          </div>
        )}
        
        {selectedETFs.length === 0 && !searchQuery && (
          <div className={styles.emptyState}>
            <BarChart2 size={48} className={styles.emptyIcon} />
            <h3>ETF를 검색하여 선택해보세요</h3>
            <p>검색창에 ETF 이름이나 코드를 입력하면<br />비교하고 싶은 ETF를 선택할 수 있습니다</p>
          </div>
        )}
      </div>
      
      {/* 비교 결과 섹션 */}
      {showResults && selectedETFs.length >= 2 && (
        <div ref={resultsSectionRef} className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>비교 분석 결과</h2>
          </div>

          {/* 탭 네비게이션 */}
          <div className={styles.tabNavigation}>
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  className={`${styles.tabButton} ${activeTab === tab.value ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 탭 컨텐츠 */}
          <div className={styles.tabContent}>
            {/* 기본정보 탭 */}
            {activeTab === 'basic' && (
              <div className={styles.basicInfoSection}>
                <Card padding="none" className={styles.infoCard}>
                  <div className={styles.compareTable}>
                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>일반정보</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>운용사</div>
                        {selectedETFs.map((etf, index) => (
                          <div key={etf.id} className={styles.tableCell} style={{ color: COLORS[index] }}>
                            {etf.issuer}
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>상장일</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.inceptionDate}
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>추적지수</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.trackingIndex || '-'}
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>레버리지</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.leverage ? `${etf.leverage}X` : '-'}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>규모 및 거래</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>순자산(AUM)</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.aum);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumber(etf.aum)}원
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>거래량</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.volume);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumber(etf.volume)}주
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>거래대금</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.turnover || etf.volume * etf.price);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumber(etf.turnover || etf.volume * etf.price)}원
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>시가총액</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.marketCap);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatLargeNumber(etf.marketCap)}원
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>배당정보</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>배당수익률</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.dividendYield);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {etf.dividendYield.toFixed(2)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>비용</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>총보수율(TER)</div>
                        {(() => {
                          const values = selectedETFs.map(etf => etf.expenseRatio);
                          const { bestIndex, worstIndex } = getBestWorst(values, false); // 낮을수록 좋음
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {etf.expenseRatio.toFixed(2)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>가격정보</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>현재가</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {formatPrice(etf.price)}원
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>등락률</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(etf.changePercent)}`}>
                            {formatPercent(etf.changePercent)}
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>52주 최고</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.high52w ? `${formatPrice(etf.high52w)}원` : '-'}
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>52주 최저</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.low52w ? `${formatPrice(etf.low52w)}원` : '-'}
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
              <div className={styles.returnsSection}>
                {/* 수익률 비교 바 차트 */}
                <Card padding="md" className={styles.chartCard}>
                  <CardHeader title="기간별 수익률 비교" subtitle="각 기간별로 ETF 수익률을 직접 비교" />
                  <div className={styles.chartContainer}>
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
                <Card padding="none" className={styles.infoCard}>
                  <div className={styles.compareTable}>
                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>기간별 수익률</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>1주</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.week1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].week1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].week1)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>1개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].month1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month1)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>3개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month3);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].month3)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month3)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>6개월</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.month6);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].month6)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].month6)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>YTD</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.ytd);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].ytd)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].ytd)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>1년</div>
                        {(() => {
                          const returnsData = selectedETFs.map(etf => getReturns(etf.id));
                          const values = returnsData.map(r => r.year1);
                          const { bestIndex, worstIndex } = getBestWorst(values, true);
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getChangeClass(returnsData[idx].year1)} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {formatPercent(returnsData[idx].year1)}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>위험지표</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>변동성</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.volatility);
                          const { bestIndex, worstIndex } = getBestWorst(values, false); // 낮을수록 좋음
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {riskData[idx].volatility.toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>샤프비율</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.sharpeRatio);
                          const { bestIndex, worstIndex } = getBestWorst(values, true); // 높을수록 좋음
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {riskData[idx].sharpeRatio.toFixed(2)}
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>베타</div>
                        {selectedETFs.map((etf) => {
                          const risk = getRiskMetrics(etf.id);
                          return (
                            <div key={etf.id} className={styles.tableCell}>
                              {risk.beta.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>최대낙폭(MDD)</div>
                        {(() => {
                          const riskData = selectedETFs.map(etf => getRiskMetrics(etf.id));
                          const values = riskData.map(r => r.maxDrawdown);
                          const { bestIndex, worstIndex } = getBestWorst(values, false); // 낮을수록 좋음 (절대값이 작을수록)
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${styles.negative} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
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
              <div className={styles.holdingsSection}>
                <Card padding="none" className={styles.infoCard}>
                  <div className={styles.compareTable}>
                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>구성종목 개요</div>
                      
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>구성종목수</div>
                        {selectedETFs.map((etf) => (
                          <div key={etf.id} className={styles.tableCell}>
                            {etf.holdings?.length || '-'}개
                          </div>
                        ))}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>상위 5종목 비중</div>
                        {(() => {
                          const values = selectedETFs.map(etf => 
                            etf.holdings?.slice(0, 5).reduce((sum, h) => sum + h.weight, 0) || 0
                          );
                          const { bestIndex, worstIndex } = getBestWorst(values, false); // 낮을수록 분산 투자
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {values[idx].toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>상위 10종목 비중</div>
                        {(() => {
                          const values = selectedETFs.map(etf => 
                            etf.holdings?.slice(0, 10).reduce((sum, h) => sum + h.weight, 0) || 0
                          );
                          const { bestIndex, worstIndex } = getBestWorst(values, false); // 낮을수록 분산 투자
                          return selectedETFs.map((etf, idx) => (
                            <div key={etf.id} className={`${styles.tableCell} ${getCellHighlight(idx, bestIndex, worstIndex)}`}>
                              {values[idx].toFixed(1)}%
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className={styles.tableSection}>
                      <div className={styles.tableSectionTitle}>상위 보유종목</div>
                      
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className={styles.tableRow}>
                          <div className={styles.tableCell}>구성종목 {i + 1}</div>
                          {selectedETFs.map((etf) => {
                            const holding = etf.holdings?.[i];
                            return (
                              <div key={etf.id} className={styles.tableCell}>
                                {holding ? (
                                  <div className={styles.holdingInfo}>
                                    <span className={styles.holdingName}>{holding.name}</span>
                                    <span className={styles.holdingWeight}>{holding.weight.toFixed(1)}%</span>
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
              <div className={styles.chartsSection}>
                {/* 수익률 비교 차트 */}
                <Card padding="md" className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <CardHeader title="수익률 추이 비교" subtitle={`최근 ${selectedPeriodLabel} 상대 수익률 (%)`} />
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
                <Card padding="md" className={styles.chartCard}>
                  <CardHeader title="배당수익률 추이" subtitle="최근 12개월 배당수익률 변화" />
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart 
                        data={(() => {
                          // 12개월 배당수익률 추이 데이터 생성
                          const months = [];
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };
                            
                            selectedETFs.forEach((etf) => {
                              // 현재 배당률을 기준으로 약간의 변동 추가
                              const baseYield = etf.dividendYield;
                              const variation = (Math.random() - 0.5) * 0.3; // ±0.15% 변동
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
                <Card padding="md" className={styles.chartCard}>
                  <CardHeader title="총보수율(TER) 추이" subtitle="최근 12개월 총보수율 변화 - 낮을수록 유리" />
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart 
                        data={(() => {
                          // 12개월 총보수율 추이 데이터 생성
                          const months = [];
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };
                            
                            selectedETFs.forEach((etf) => {
                              // 현재 보수율을 기준으로 약간의 변동 추가
                              const baseRatio = etf.expenseRatio;
                              const variation = (Math.random() - 0.5) * 0.02; // ±0.01% 변동
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
                <Card padding="md" className={styles.chartCard}>
                  <CardHeader title="순자금유입 누적 추이" subtitle="최근 12개월 누적 순자금유입 현황" />
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart 
                        data={(() => {
                          // 12개월 누적 데이터 생성
                          const months = [];
                          const cumulativeFlows: Record<string, number> = {};
                          
                          // 각 ETF의 누적 초기값 설정
                          selectedETFs.forEach((etf) => {
                            cumulativeFlows[etf.name] = 0;
                          });
                          
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthLabel = `${date.getMonth() + 1}월`;
                            const dataPoint: any = { month: monthLabel };
                            
                            selectedETFs.forEach((etf) => {
                              // 월별 유입/유출 생성 후 누적
                              const baseFlow = etf.aum * 0.001; // 순자산의 0.1%
                              const randomFactor = (Math.random() - 0.3) * 1.5; // 약간 유입 편향
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
                          formatter={(value: number) => [formatLargeNumber(value) + '원', '누적 순유입']}
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
                  <Card padding="md" className={styles.chartCard}>
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
    </div>
  );
}
