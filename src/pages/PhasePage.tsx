import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, HelpCircle, ArrowLeft, Flame, TrendingUpIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { Card, CardHeader, Badge } from '../components/common';
import { koreanETFs, usETFs, getPhaseAnalysis, generatePriceHistory } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import styles from './PhasePage.module.css';

// 기간 옵션
const PERIOD_OPTIONS = [
  { value: 30, label: '단기', description: '1개월' },
  { value: 180, label: '중기', description: '6개월' },
  { value: 365, label: '장기', description: '12개월' },
];

// 지표 타입
type IndicatorType = 'rsi' | 'deviation' | 'macd' | 'histogram';

const INDICATOR_INFO = {
  rsi: { name: 'RSI (14)', category: 'fear', unit: '' },
  deviation: { name: '이격도', category: 'fear', unit: '%' },
  macd: { name: 'MACD', category: 'trend', unit: '' },
  histogram: { name: '히스토그램', category: 'trend', unit: '' },
};

export default function PhasePage() {
  const { selectedMarket } = useETFStore();
  const resultRef = useRef<HTMLDivElement>(null);
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  const [selectedETF, setSelectedETF] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(180);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType>('rsi');
  
  useEffect(() => {
    setSelectedETF('');
    setSearchQuery('');
    setShowDropdown(false);
  }, [selectedMarket]);
  
  const filteredETFs = etfs.filter(etf => 
    etf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etf.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleETFSelect = (etfId: string) => {
    setSelectedETF(etfId);
    setShowDropdown(false);
    setSearchQuery('');
    
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
  const handleBack = () => {
    setSelectedETF('');
    setSearchQuery('');
  };
  
  const etf = selectedETF ? etfs.find(e => e.id === selectedETF) : null;
  const analysis = etf ? getPhaseAnalysis(selectedETF) : { rsi: 50, status: 'neutral', deviation: 0, macd: 0, signal: 0, histogram: 0 };
  const priceHistory = etf ? generatePriceHistory(etf.price, selectedPeriod) : [];
  
  const currentPeriod = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[1];
  
  // 각 지표별 히스토리 데이터 생성
  const indicatorHistory = useMemo(() => {
    return priceHistory.map((p, i) => {
      const baseRsi = analysis.rsi;
      const baseDeviation = analysis.deviation;
      const baseMacd = analysis.macd;
      const baseHistogram = analysis.histogram;
      
      const variance = Math.sin(i / 10) * 0.3 + (Math.random() - 0.5) * 0.2;
      
      return {
        date: p.date,
        rsi: Math.max(0, Math.min(100, baseRsi + variance * 50)),
        deviation: baseDeviation + variance * 3,
        macd: baseMacd + variance * 200,
        signal: analysis.signal + variance * 150,
        histogram: baseHistogram + variance * 100,
      };
    });
  }, [priceHistory, analysis]);
  
  // 모든 ETF 분석 데이터
  const allETFsWithAnalysis = useMemo(() => {
    return etfs.map(e => ({ ...e, analysis: getPhaseAnalysis(e.id) }));
  }, [etfs]);
  
  // 큐레이션 카테고리
  const curatedCategories = useMemo(() => {
    const shortTermOverbought = allETFsWithAnalysis
      .filter(e => e.analysis.rsi > 70 && e.analysis.deviation > 2)
      .sort((a, b) => b.analysis.rsi - a.analysis.rsi)
      .slice(0, 6);
    
    const shortTermOversold = allETFsWithAnalysis
      .filter(e => e.analysis.rsi < 30 && e.analysis.deviation < -2)
      .sort((a, b) => a.analysis.rsi - b.analysis.rsi)
      .slice(0, 6);
    
    const longTermOverbought = allETFsWithAnalysis
      .filter(e => e.analysis.rsi > 65 && e.analysis.histogram > 0 && e.analysis.deviation > 0)
      .sort((a, b) => b.analysis.rsi - a.analysis.rsi)
      .slice(0, 6);
    
    const longTermOversold = allETFsWithAnalysis
      .filter(e => e.analysis.rsi < 35 && e.analysis.histogram < 0 && e.analysis.deviation < 0)
      .sort((a, b) => a.analysis.rsi - b.analysis.rsi)
      .slice(0, 6);
    
    const uptrend = allETFsWithAnalysis
      .filter(e => e.analysis.histogram > 0 && e.analysis.macd > e.analysis.signal)
      .sort((a, b) => b.analysis.histogram - a.analysis.histogram)
      .slice(0, 6);
    
    const downtrend = allETFsWithAnalysis
      .filter(e => e.analysis.histogram < 0 && e.analysis.macd < e.analysis.signal)
      .sort((a, b) => a.analysis.histogram - b.analysis.histogram)
      .slice(0, 6);
    
    return {
      shortTermOverbought,
      shortTermOversold,
      longTermOverbought,
      longTermOversold,
      uptrend,
      downtrend,
    };
  }, [allETFsWithAnalysis]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overbought': return 'danger';
      case 'oversold': return 'info';
      default: return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'overbought': return '과매수';
      case 'oversold': return '과매도';
      default: return '중립';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overbought': return <TrendingUp size={20} />;
      case 'oversold': return <TrendingDown size={20} />;
      default: return <Minus size={20} />;
    }
  };
  
  // 차트 렌더링 함수
  const renderChart = () => {
    if (indicatorHistory.length === 0) return null;
    
    const chartConfig: Record<IndicatorType, {
      dataKey: string;
      domain: [number | string, number | string];
      ticks?: number[];
      referenceLines?: { y: number; color: string; label?: string }[];
      color: string;
      isBar?: boolean;
    }> = {
      rsi: {
        dataKey: 'rsi',
        domain: [0, 100],
        ticks: [0, 30, 50, 70, 100],
        referenceLines: [
          { y: 70, color: '#EF4444', label: '과매수' },
          { y: 30, color: '#3B82F6', label: '과매도' },
          { y: 50, color: '#9CA3AF' },
        ],
        color: '#1E3A5F',
      },
      deviation: {
        dataKey: 'deviation',
        domain: [-10, 10],
        ticks: [-10, -5, 0, 5, 10],
        referenceLines: [
          { y: 5, color: '#EF4444', label: '과열' },
          { y: -5, color: '#3B82F6', label: '침체' },
          { y: 0, color: '#9CA3AF' },
        ],
        color: '#8B5CF6',
      },
      macd: {
        dataKey: 'macd',
        domain: ['auto', 'auto'],
        referenceLines: [{ y: 0, color: '#9CA3AF' }],
        color: '#10B981',
      },
      histogram: {
        dataKey: 'histogram',
        domain: ['auto', 'auto'],
        referenceLines: [{ y: 0, color: '#9CA3AF' }],
        color: '#F59E0B',
        isBar: true,
      },
    };
    
    const config = chartConfig[selectedIndicator];
    const indicatorName = INDICATOR_INFO[selectedIndicator].name;
    
    if (config.isBar) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={indicatorHistory}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(v) => v.slice(5)}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={config.domain}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip 
              formatter={(value: number) => [value.toFixed(1), indicatorName]}
              labelFormatter={(label) => label}
              contentStyle={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            {config.referenceLines?.map((ref, i) => (
              <ReferenceLine key={i} y={ref.y} stroke={ref.color} strokeDasharray="3 3" />
            ))}
            <Bar dataKey={config.dataKey}>
              {indicatorHistory.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={entry[config.dataKey as keyof typeof entry] >= 0 ? '#22C55E' : '#EF4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={indicatorHistory}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(v) => v.slice(5)}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={config.domain}
            ticks={config.ticks}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(1), indicatorName]}
            labelFormatter={(label) => label}
            contentStyle={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          {config.referenceLines?.map((ref, i) => (
            <ReferenceLine key={i} y={ref.y} stroke={ref.color} strokeDasharray="3 3" />
          ))}
          {selectedIndicator === 'macd' && (
            <Line 
              type="monotone" 
              dataKey="signal" 
              stroke="#9CA3AF" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          <Line 
            type="monotone" 
            dataKey={config.dataKey} 
            stroke={config.color} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // 차트 범례
  const renderChartLegend = () => {
    if (selectedIndicator === 'rsi') {
      return (
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#EF4444' }} />
            <span>과매수 (70)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#3B82F6' }} />
            <span>과매도 (30)</span>
          </div>
        </div>
      );
    }
    if (selectedIndicator === 'deviation') {
      return (
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#EF4444' }} />
            <span>과열 (+5%)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#3B82F6' }} />
            <span>침체 (-5%)</span>
          </div>
        </div>
      );
    }
    if (selectedIndicator === 'macd') {
      return (
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#10B981' }} />
            <span>MACD</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLineDashed} style={{ background: '#9CA3AF' }} />
            <span>시그널</span>
          </div>
        </div>
      );
    }
    if (selectedIndicator === 'histogram') {
      return (
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#22C55E' }} />
            <span>상승 모멘텀</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#EF4444' }} />
            <span>하락 모멘텀</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={styles.page}>
      {/* ===== ETF 미선택 시: 검색 + 큐레이션 ===== */}
      {!selectedETF && (
        <>
          {/* ETF Search */}
          <Card padding="md" className={`${styles.selectorCard} ${styles.required}`}>
            <label className={styles.selectorLabel}>
              {selectedMarket === 'korea' ? '한국' : '미국'} ETF 국면 분석
            </label>
            <div className={styles.etfSelector}>
              <div className={styles.searchBox}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="ETF 이름 또는 종목코드 검색..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={styles.searchInput}
                />
              </div>
              
              {showDropdown && searchQuery && (
                <div className={styles.dropdown}>
                  {filteredETFs.length > 0 ? (
                    <div className={styles.dropdownList}>
                      {filteredETFs.slice(0, 10).map(e => {
                        const a = getPhaseAnalysis(e.id);
                        return (
                          <button
                            key={e.id}
                            className={styles.dropdownItem}
                            onClick={() => handleETFSelect(e.id)}
                          >
                            <div className={styles.dropdownItemInfo}>
                              <span className={styles.dropdownItemName}>{e.name}</span>
                              <span className={styles.dropdownItemMeta}>
                                RSI {a.rsi.toFixed(0)} · {e.issuer}
                              </span>
                            </div>
                            <Badge variant={getStatusColor(a.status)} size="sm">
                              {getStatusText(a.status)}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noResults}>검색 결과가 없습니다</div>
                  )}
                </div>
              )}
            </div>
          </Card>
          
          {/* Curated Sections - Clean & Simple */}
          <div className={styles.insightGrid}>
            {/* 과열 종목 */}
            <Card padding="md">
              <div className={styles.insightHeader}>
                <h3 className={styles.insightTitle}>
                  <span className={styles.insightIcon} data-type="hot">●</span>
                  과열 종목
                </h3>
                <span className={styles.insightBadge}>RSI 70↑</span>
              </div>
              <div className={styles.insightList}>
                {[...curatedCategories.shortTermOverbought, ...curatedCategories.longTermOverbought].slice(0, 5).map((e, i) => (
                  <button key={e.id} className={styles.insightItem} onClick={() => handleETFSelect(e.id)}>
                    <span className={styles.insightRank}>{i + 1}</span>
                    <span className={styles.insightName}>{e.name}</span>
                    <span className={styles.insightValue} data-type="hot">{e.analysis.rsi.toFixed(0)}</span>
                  </button>
                ))}
                {[...curatedCategories.shortTermOverbought, ...curatedCategories.longTermOverbought].length === 0 && (
                  <p className={styles.insightEmpty}>해당 종목 없음</p>
                )}
              </div>
            </Card>
            
            {/* 침체 종목 */}
            <Card padding="md">
              <div className={styles.insightHeader}>
                <h3 className={styles.insightTitle}>
                  <span className={styles.insightIcon} data-type="cold">●</span>
                  침체 종목
                </h3>
                <span className={styles.insightBadge}>RSI 30↓</span>
              </div>
              <div className={styles.insightList}>
                {[...curatedCategories.shortTermOversold, ...curatedCategories.longTermOversold].slice(0, 5).map((e, i) => (
                  <button key={e.id} className={styles.insightItem} onClick={() => handleETFSelect(e.id)}>
                    <span className={styles.insightRank}>{i + 1}</span>
                    <span className={styles.insightName}>{e.name}</span>
                    <span className={styles.insightValue} data-type="cold">{e.analysis.rsi.toFixed(0)}</span>
                  </button>
                ))}
                {[...curatedCategories.shortTermOversold, ...curatedCategories.longTermOversold].length === 0 && (
                  <p className={styles.insightEmpty}>해당 종목 없음</p>
                )}
              </div>
            </Card>
            
            {/* 상승 추세 */}
            <Card padding="md">
              <div className={styles.insightHeader}>
                <h3 className={styles.insightTitle}>
                  <span className={styles.insightIcon} data-type="up">▲</span>
                  상승 추세
                </h3>
                <span className={styles.insightBadge}>MACD+</span>
              </div>
              <div className={styles.insightList}>
                {curatedCategories.uptrend.slice(0, 5).map((e, i) => (
                  <button key={e.id} className={styles.insightItem} onClick={() => handleETFSelect(e.id)}>
                    <span className={styles.insightRank}>{i + 1}</span>
                    <span className={styles.insightName}>{e.name}</span>
                    <span className={styles.insightValue} data-type="up">+{e.analysis.histogram.toFixed(0)}</span>
                  </button>
                ))}
                {curatedCategories.uptrend.length === 0 && (
                  <p className={styles.insightEmpty}>해당 종목 없음</p>
                )}
              </div>
            </Card>
            
            {/* 하락 추세 */}
            <Card padding="md">
              <div className={styles.insightHeader}>
                <h3 className={styles.insightTitle}>
                  <span className={styles.insightIcon} data-type="down">▼</span>
                  하락 추세
                </h3>
                <span className={styles.insightBadge}>MACD-</span>
              </div>
              <div className={styles.insightList}>
                {curatedCategories.downtrend.slice(0, 5).map((e, i) => (
                  <button key={e.id} className={styles.insightItem} onClick={() => handleETFSelect(e.id)}>
                    <span className={styles.insightRank}>{i + 1}</span>
                    <span className={styles.insightName}>{e.name}</span>
                    <span className={styles.insightValue} data-type="down">{e.analysis.histogram.toFixed(0)}</span>
                  </button>
                ))}
                {curatedCategories.downtrend.length === 0 && (
                  <p className={styles.insightEmpty}>해당 종목 없음</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
      
      {/* ===== ETF 선택 후: 분석 결과 ===== */}
      {etf && (
        <div ref={resultRef} className={styles.resultContainer}>
          {/* Back & Selected ETF */}
          <Card padding="md" className={styles.selectedCard}>
            <div className={styles.selectedHeader}>
              <div className={styles.selectedInfo}>
                <div className={styles.selectedMain}>
                  <h2 className={styles.selectedName}>{etf.name}</h2>
                  <Badge variant={getStatusColor(analysis.status)} size="md">
                    {getStatusText(analysis.status)}
                  </Badge>
                </div>
                <span className={styles.selectedMeta}>{etf.ticker} · {etf.issuer}</span>
              </div>
              <button className={styles.backButton} onClick={handleBack}>
                <ArrowLeft size={16} />
                다른 ETF 선택
              </button>
            </div>
          </Card>
          
          {/* Period Selector */}
          <Card padding="md" className={styles.periodCard}>
            <h4 className={styles.periodLabel}>분석 기간</h4>
            <div className={styles.periodSelector}>
              {PERIOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={`${styles.periodButton} ${selectedPeriod === option.value ? styles.active : ''}`}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  <span className={styles.periodButtonLabel}>{option.label}</span>
                  <span className={styles.periodDesc}>({option.description})</span>
                </button>
              ))}
            </div>
          </Card>
          
          {/* RSI Gauge */}
          <Card padding="lg" className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div 
                className={styles.statusIcon}
                data-status={analysis.status}
              >
                {getStatusIcon(analysis.status)}
              </div>
              <div className={styles.statusInfo}>
                <h3 className={styles.statusTitle}>현재 국면</h3>
                <span className={styles.statusDesc}>
                  {analysis.status === 'overbought' && '단기 조정 가능성이 있습니다'}
                  {analysis.status === 'oversold' && '반등 가능성이 있습니다'}
                  {analysis.status === 'neutral' && '뚜렷한 방향성이 없습니다'}
                </span>
              </div>
            </div>
            
            {/* RSI Gauge - Modern Arc Style */}
            <div className={styles.gaugeContainer}>
              <div className={styles.gaugeWrapper}>
                <svg viewBox="0 0 200 120" className={styles.gaugeSvg}>
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="30%" stopColor="#60A5FA" />
                      <stop offset="50%" stopColor="#9CA3AF" />
                      <stop offset="70%" stopColor="#FCA5A5" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={100 + 80 * Math.cos((Math.PI * (180 - analysis.rsi * 1.8)) / 180)}
                    cy={100 - 80 * Math.sin((Math.PI * (180 - analysis.rsi * 1.8)) / 180)}
                    r="8"
                    fill="var(--color-primary)"
                    stroke="white"
                    strokeWidth="3"
                  />
                </svg>
                <div className={styles.gaugeValueBox}>
                  <span className={styles.gaugeValue}>{analysis.rsi.toFixed(1)}</span>
                  <span className={styles.gaugeLabel}>RSI</span>
                </div>
              </div>
              <div className={styles.gaugeScale}>
                <div className={styles.scaleItem}>
                  <span className={styles.scaleValue}>0</span>
                  <span className={styles.scaleLabel}>과매도</span>
                </div>
                <div className={styles.scaleItem}>
                  <span className={styles.scaleValue}>30</span>
                </div>
                <div className={styles.scaleItem}>
                  <span className={styles.scaleValue}>50</span>
                  <span className={styles.scaleLabel}>중립</span>
                </div>
                <div className={styles.scaleItem}>
                  <span className={styles.scaleValue}>70</span>
                </div>
                <div className={styles.scaleItem}>
                  <span className={styles.scaleValue}>100</span>
                  <span className={styles.scaleLabel}>과매수</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* ===== 공포과열 분석 ===== */}
          <div className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <Flame size={18} />
              <h3 className={styles.categoryTitle}>공포과열 분석</h3>
            </div>
            <div className={styles.indicatorRow}>
              <button 
                className={`${styles.indicatorCard} ${selectedIndicator === 'rsi' ? styles.active : ''}`}
                onClick={() => setSelectedIndicator('rsi')}
              >
                <div className={styles.indicatorHeader}>
                  <h4 className={styles.indicatorTitle}>RSI (14)</h4>
                  <div className={styles.helpTrigger}>
                    <HelpCircle size={14} />
                    <div className={styles.helpTooltip}>
                      <strong>상대강도지수</strong>
                      <p>14일간 상승폭과 하락폭의 비율. 0~100 범위.</p>
                      <p>• 70↑: 과매수 • 30↓: 과매도</p>
                    </div>
                  </div>
                </div>
                <span className={styles.indicatorValue}>{analysis.rsi.toFixed(1)}</span>
                <span className={styles.indicatorDesc}>
                  {analysis.rsi > 70 ? '과매수 구간' : analysis.rsi < 30 ? '과매도 구간' : '중립 구간'}
                </span>
              </button>
              
              <button 
                className={`${styles.indicatorCard} ${selectedIndicator === 'deviation' ? styles.active : ''}`}
                onClick={() => setSelectedIndicator('deviation')}
              >
                <div className={styles.indicatorHeader}>
                  <h4 className={styles.indicatorTitle}>이격도</h4>
                  <div className={styles.helpTrigger}>
                    <HelpCircle size={14} />
                    <div className={styles.helpTooltip}>
                      <strong>이동평균 이격도</strong>
                      <p>현재가와 이동평균선 간의 괴리율.</p>
                      <p>• +5%↑: 과열 • -5%↓: 침체</p>
                    </div>
                  </div>
                </div>
                <span className={`${styles.indicatorValue} ${analysis.deviation > 0 ? 'number-up' : 'number-down'}`}>
                  {analysis.deviation > 0 ? '+' : ''}{analysis.deviation.toFixed(1)}%
                </span>
                <span className={styles.indicatorDesc}>
                  {analysis.deviation > 5 ? '단기 과열' : analysis.deviation < -5 ? '단기 침체' : '적정 수준'}
                </span>
              </button>
            </div>
          </div>
          
          {/* ===== 추세 분석 ===== */}
          <div className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <TrendingUpIcon size={18} />
              <h3 className={styles.categoryTitle}>추세 분석</h3>
            </div>
            <div className={styles.indicatorRow}>
              <button 
                className={`${styles.indicatorCard} ${selectedIndicator === 'macd' ? styles.active : ''}`}
                onClick={() => setSelectedIndicator('macd')}
              >
                <div className={styles.indicatorHeader}>
                  <h4 className={styles.indicatorTitle}>MACD</h4>
                  <div className={styles.helpTrigger}>
                    <HelpCircle size={14} />
                    <div className={styles.helpTooltip}>
                      <strong>이동평균수렴확산</strong>
                      <p>12일 EMA - 26일 EMA로 계산.</p>
                      <p>시그널선 돌파 시 매매 신호</p>
                    </div>
                  </div>
                </div>
                <span className={styles.indicatorValue}>{analysis.macd.toFixed(0)}</span>
                <span className={styles.indicatorDesc}>
                  시그널: {analysis.signal.toFixed(0)}
                </span>
              </button>
              
              <button 
                className={`${styles.indicatorCard} ${selectedIndicator === 'histogram' ? styles.active : ''}`}
                onClick={() => setSelectedIndicator('histogram')}
              >
                <div className={styles.indicatorHeader}>
                  <h4 className={styles.indicatorTitle}>히스토그램</h4>
                  <div className={styles.helpTrigger}>
                    <HelpCircle size={14} />
                    <div className={styles.helpTooltip}>
                      <strong>MACD 히스토그램</strong>
                      <p>MACD - 시그널선</p>
                      <p>• 양수: 상승 • 음수: 하락</p>
                    </div>
                  </div>
                </div>
                <span className={`${styles.indicatorValue} ${analysis.histogram > 0 ? 'number-up' : 'number-down'}`}>
                  {analysis.histogram > 0 ? '+' : ''}{analysis.histogram.toFixed(0)}
                </span>
                <span className={styles.indicatorDesc}>
                  {analysis.histogram > 0 ? '상승 모멘텀' : '하락 모멘텀'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Dynamic Chart */}
          {indicatorHistory.length > 0 && (
            <Card padding="md">
              <CardHeader 
                title={`${INDICATOR_INFO[selectedIndicator].name} 추이`} 
                subtitle={`${currentPeriod.label} (${currentPeriod.description})`} 
              />
              <div className={styles.chartContainer}>
                {renderChart()}
              </div>
              {renderChartLegend()}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
