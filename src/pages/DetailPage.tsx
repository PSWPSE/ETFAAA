import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Share2, TrendingUp, TrendingDown, Activity, Calculator, ChevronRight, Info, BarChart3, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, ReferenceLine } from 'recharts';
import { Card, CardHeader, Button, Badge } from '../components/common';
import { Tabs, TabList, Tab, TabPanel } from '../components/common';
import { getETFById, generatePriceHistory, getReturns, getHoldings, getDividends, getRiskMetrics, getExtendedETFInfo, getSimilarETFs } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, formatDate, getChangeClass } from '../utils/format';
import styles from './DetailPage.module.css';

const CHART_COLORS = ['#1E3A5F', '#4A90A4', '#E8A838', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const CHART_PERIODS = [
  { value: '1m', label: '1개월', days: 30 },
  { value: '3m', label: '3개월', days: 90 },
  { value: '6m', label: '6개월', days: 180 },
  { value: '1y', label: '1년', days: 365 },
];

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useETFStore();
  
  const [chartPeriod, setChartPeriod] = useState('3m');
  
  const baseEtf = getETFById(id || '');
  
  if (!baseEtf) {
    return (
      <div className={styles.notFound}>
        <p>ETF를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/search')}>목록으로</Button>
      </div>
    );
  }
  
  // 확장된 ETF 정보
  const etf = getExtendedETFInfo(baseEtf);
  
  const priceHistory = generatePriceHistory(etf.price, 365);
  const returns = getReturns(etf.id);
  const holdings = getHoldings(etf.id);
  const dividends = getDividends(etf.id);
  const riskMetrics = getRiskMetrics(etf.id);
  const similarETFs = getSimilarETFs(etf.id, 5);
  
  // 차트 기간에 따른 데이터
  const selectedPeriod = CHART_PERIODS.find(p => p.value === chartPeriod) || CHART_PERIODS[1];
  const chartData = useMemo(() => {
    return priceHistory.slice(-selectedPeriod.days).map(p => ({
      date: p.date,
      price: p.close,
    }));
  }, [priceHistory, selectedPeriod.days]);
  
  // 차트 Y축 도메인 계산
  const yDomain = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);
  
  const holdingsChartData = holdings.slice(0, 5).map(h => ({
    name: h.name,
    value: h.weight,
  }));
  
  const inCompare = isInCompare(etf.id);
  
  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(etf.id);
    } else {
      addToCompare(etf.id);
    }
  };
  
  // 52주 대비 현재가 위치 (%)
  const pricePosition = etf.high52w && etf.low52w 
    ? ((etf.price - etf.low52w) / (etf.high52w - etf.low52w)) * 100 
    : 50;
  
  // 52주 고가 대비
  const vsHigh52w = etf.high52w 
    ? ((etf.price - etf.high52w) / etf.high52w) * 100 
    : 0;
  
  // 52주 저가 대비
  const vsLow52w = etf.low52w 
    ? ((etf.price - etf.low52w) / etf.low52w) * 100 
    : 0;
  
  return (
    <div className={styles.page}>
      {/* Header Card */}
      <Card padding="lg" className={styles.headerCard}>
        <div className={styles.etfHeader}>
          <div className={styles.etfTitle}>
            <h1 className={styles.etfName}>{etf.name}</h1>
            <div className={styles.etfMeta}>
              <Badge variant="default">{etf.ticker}</Badge>
              <span className={styles.etfIssuer}>{etf.issuer}</span>
              {etf.leverage && etf.leverage !== 1 && (
                <Badge variant={etf.leverage > 0 ? 'success' : 'danger'}>
                  {etf.leverage > 0 ? `${etf.leverage}X` : `인버스${Math.abs(etf.leverage)}X`}
                </Badge>
              )}
            </div>
          </div>
          <div className={styles.etfPrice}>
            <span className={styles.price}>{formatPrice(etf.price)}원</span>
            <span className={`${styles.change} ${getChangeClass(etf.changePercent)}`}>
              {formatPercent(etf.changePercent)} ({etf.change > 0 ? '+' : ''}{formatPrice(etf.change)}원)
            </span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant={inCompare ? 'primary' : 'outline'}
            leftIcon={inCompare ? <Check size={18} /> : <Plus size={18} />}
            onClick={handleCompareToggle}
            disabled={!inCompare && compareList.length >= 4}
          >
            {inCompare ? '비교 추가됨' : '비교하기'}
          </Button>
          <Button variant="ghost" leftIcon={<Share2 size={18} />}>
            공유
          </Button>
        </div>
      </Card>
      
      {/* 52주 가격 범위 */}
      <Card padding="md" className={styles.priceRangeCard}>
        <div className={styles.priceRangeHeader}>
          <h3 className={styles.cardTitle}>52주 가격 범위</h3>
          <span className={styles.priceRangeHint}>
            현재가 위치: <strong>{pricePosition.toFixed(0)}%</strong>
          </span>
        </div>
        <div className={styles.priceRange}>
          <div className={styles.priceRangeLabels}>
            <div className={styles.priceRangeLow}>
              <span className={styles.priceRangeLowLabel}>52주 최저</span>
              <span className={styles.priceRangeLowValue}>{formatPrice(etf.low52w || 0)}원</span>
              <span className={`${styles.priceRangePercent} number-up`}>+{vsLow52w.toFixed(1)}%</span>
            </div>
            <div className={styles.priceRangeHigh}>
              <span className={styles.priceRangeHighLabel}>52주 최고</span>
              <span className={styles.priceRangeHighValue}>{formatPrice(etf.high52w || 0)}원</span>
              <span className={`${styles.priceRangePercent} number-down`}>{vsHigh52w.toFixed(1)}%</span>
            </div>
          </div>
          <div className={styles.priceRangeBar}>
            <div 
              className={styles.priceRangeBarFill} 
              style={{ width: `${pricePosition}%` }}
            />
            <div 
              className={styles.priceRangeIndicator} 
              style={{ left: `${pricePosition}%` }}
            >
              <span className={styles.priceRangeIndicatorValue}>{formatPrice(etf.price)}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button 
          className={styles.quickActionButton}
          onClick={() => navigate(`/simulator?etf=${etf.id}`)}
        >
          <Calculator size={20} />
          <span>투자 시뮬레이션</span>
          <ChevronRight size={16} />
        </button>
        <button 
          className={styles.quickActionButton}
          onClick={() => navigate(`/phase?etf=${etf.id}`)}
        >
          <Activity size={20} />
          <span>국면 분석</span>
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Price Chart */}
      <Card padding="md">
        <div className={styles.chartHeader}>
          <CardHeader 
            title="가격 차트" 
            subtitle={`최근 ${selectedPeriod.label} 추이`} 
          />
          <div className={styles.chartPeriodSelector}>
            {CHART_PERIODS.map((period) => (
              <button
                key={period.value}
                className={`${styles.chartPeriodButton} ${chartPeriod === period.value ? styles.active : ''}`}
                onClick={() => setChartPeriod(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={yDomain}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                width={45}
              />
              <Tooltip 
                formatter={(value: number) => [`${formatPrice(value)}원`, '가격']}
                labelFormatter={(label) => label}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#1E3A5F" 
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Trading Info */}
      <Card padding="md">
        <h3 className={styles.cardTitle}>거래 정보</h3>
        <div className={styles.tradingGrid}>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>전일종가</span>
            <span className={styles.tradingValue}>{formatPrice(etf.prevClose || 0)}원</span>
          </div>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>당일고가</span>
            <span className={`${styles.tradingValue} number-up`}>{formatPrice(etf.dayHigh || 0)}원</span>
          </div>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>당일저가</span>
            <span className={`${styles.tradingValue} number-down`}>{formatPrice(etf.dayLow || 0)}원</span>
          </div>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>거래량</span>
            <span className={styles.tradingValue}>{formatLargeNumber(etf.volume)}주</span>
          </div>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>거래대금</span>
            <span className={styles.tradingValue}>{formatLargeNumber(etf.turnover || 0)}원</span>
          </div>
          <div className={styles.tradingItem}>
            <span className={styles.tradingLabel}>시가총액</span>
            <span className={styles.tradingValue}>{formatLargeNumber(etf.marketCap)}</span>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultTab="overview">
        <TabList variant="underline">
          <Tab value="overview">개요</Tab>
          <Tab value="holdings">구성종목</Tab>
          <Tab value="dividend">배당</Tab>
          <Tab value="risk">위험지표</Tab>
        </TabList>
        
        {/* Overview Tab */}
        <TabPanel value="overview">
          <div className={styles.overviewGrid}>
            <Card padding="md" className={styles.returnsCard}>
              <h3 className={styles.cardTitle}>기간별 수익률</h3>
              
              {/* Returns Chart */}
              <div className={styles.returnsChartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { label: '1일', value: returns.day1, fullLabel: '1일' },
                      { label: '1주', value: returns.week1, fullLabel: '1주' },
                      { label: '1개월', value: returns.month1, fullLabel: '1개월' },
                      { label: '3개월', value: returns.month3, fullLabel: '3개월' },
                      { label: '6개월', value: returns.month6, fullLabel: '6개월' },
                      { label: '1년', value: returns.year1, fullLabel: '1년' },
                      { label: 'YTD', value: returns.ytd, fullLabel: 'YTD' },
                    ]}
                    layout="vertical"
                    margin={{ top: 5, right: 60, bottom: 5, left: 50 }}
                  >
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="label"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                    />
                    <ReferenceLine x={0} stroke="#E5E7EB" />
                    <Tooltip
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, '수익률']}
                      labelFormatter={(label) => `${label} 수익률`}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                      fill="#1E3A5F"
                    >
                      {[
                        { label: '1일', value: returns.day1 },
                        { label: '1주', value: returns.week1 },
                        { label: '1개월', value: returns.month1 },
                        { label: '3개월', value: returns.month3 },
                        { label: '6개월', value: returns.month6 },
                        { label: '1년', value: returns.year1 },
                        { label: 'YTD', value: returns.ytd },
                      ].map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value >= 0 ? '#22C55E' : '#EF4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Returns Summary Cards */}
              <div className={styles.returnsSummary}>
                <div className={`${styles.returnsSummaryCard} ${returns.year1 >= 0 ? styles.positive : styles.negative}`}>
                  <span className={styles.returnsSummaryLabel}>1년 수익률</span>
                  <span className={styles.returnsSummaryValue}>
                    {returns.year1 >= 0 ? '+' : ''}{returns.year1.toFixed(2)}%
                  </span>
                </div>
                <div className={`${styles.returnsSummaryCard} ${returns.ytd >= 0 ? styles.positive : styles.negative}`}>
                  <span className={styles.returnsSummaryLabel}>YTD</span>
                  <span className={styles.returnsSummaryValue}>
                    {returns.ytd >= 0 ? '+' : ''}{returns.ytd.toFixed(2)}%
                  </span>
                </div>
                <div className={`${styles.returnsSummaryCard} ${returns.month1 >= 0 ? styles.positive : styles.negative}`}>
                  <span className={styles.returnsSummaryLabel}>1개월</span>
                  <span className={styles.returnsSummaryValue}>
                    {returns.month1 >= 0 ? '+' : ''}{returns.month1.toFixed(2)}%
                  </span>
                </div>
              </div>
            </Card>
            
            <Card padding="md">
              <h3 className={styles.cardTitle}>기본 정보</h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>추적지수</span>
                  <span className={styles.infoValue}>{etf.trackingIndex}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>순자산(NAV)</span>
                  <span className={styles.infoValue}>{formatPrice(etf.nav)}원</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>총보수율</span>
                  <span className={styles.infoValue}>{etf.expenseRatio}%</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>배당수익률</span>
                  <span className={styles.infoValue}>{etf.dividendYield}%</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>추적오차</span>
                  <span className={styles.infoValue}>{etf.trackingError?.toFixed(2)}%</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>설정일</span>
                  <span className={styles.infoValue}>{formatDate(etf.inceptionDate)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>상장거래소</span>
                  <span className={styles.infoValue}>{etf.listingExchange}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>카테고리</span>
                  <span className={styles.infoValue}>{etf.category}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
        
        {/* Holdings Tab */}
        <TabPanel value="holdings">
          <Card padding="md">
            <div className={styles.holdingsContainer}>
              <div className={styles.holdingsChart}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={holdingsChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {holdingsChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '비중']}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className={styles.holdingsList}>
                <h4 className={styles.holdingsTitle}>TOP 10 구성종목</h4>
                {holdings.map((holding, index) => (
                  <div key={holding.ticker} className={styles.holdingItem}>
                    <span className={styles.holdingRank}>{index + 1}</span>
                    <div className={styles.holdingInfo}>
                      <span className={styles.holdingName}>{holding.name}</span>
                      <span className={styles.holdingSector}>{holding.sector}</span>
                    </div>
                    <span className={styles.holdingWeight}>{holding.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabPanel>
        
        {/* Dividend Tab */}
        <TabPanel value="dividend">
          <Card padding="md">
            {dividends.length > 0 ? (
              <>
                <div className={styles.dividendSummary}>
                  <div className={styles.dividendStat}>
                    <span className={styles.dividendLabel}>연간 배당수익률</span>
                    <span className={styles.dividendValue}>{etf.dividendYield}%</span>
                  </div>
                  <div className={styles.dividendStat}>
                    <span className={styles.dividendLabel}>배당 주기</span>
                    <span className={styles.dividendValue}>분기배당</span>
                  </div>
                  <div className={styles.dividendStat}>
                    <span className={styles.dividendLabel}>최근 배당금</span>
                    <span className={styles.dividendValue}>{formatPrice(dividends[0]?.amount || 0)}원</span>
                  </div>
                  <div className={styles.dividendStat}>
                    <span className={styles.dividendLabel}>연간 배당 횟수</span>
                    <span className={styles.dividendValue}>4회</span>
                  </div>
                </div>
                
                <h4 className={styles.dividendHistoryTitle}>배당 내역</h4>
                <div className={styles.dividendList}>
                  {dividends.slice(0, 8).map((dividend, index) => (
                    <div key={index} className={styles.dividendItem}>
                      <div className={styles.dividendDates}>
                        <span className={styles.dividendExDate}>배당락일: {dividend.exDate}</span>
                        <span className={styles.dividendPayDate}>지급일: {dividend.payDate}</span>
                      </div>
                      <span className={styles.dividendAmount}>{formatPrice(dividend.amount)}원</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noDividend}>
                <p>배당 정보가 없습니다.</p>
              </div>
            )}
          </Card>
        </TabPanel>
        
        {/* Risk Tab */}
        <TabPanel value="risk">
          <Card padding="md">
            <div className={styles.riskGrid}>
              <div className={styles.riskItem}>
                <div className={styles.riskItemHeader}>
                  <span className={styles.riskLabel}>변동성</span>
                  <button className={styles.riskInfoButton} title="연간 표준편차 기준">
                    <Info size={14} />
                  </button>
                </div>
                <span className={styles.riskValue}>{riskMetrics.volatility.toFixed(1)}%</span>
                <div className={styles.riskBar}>
                  <div 
                    className={styles.riskBarFill} 
                    style={{ width: `${Math.min(riskMetrics.volatility * 2, 100)}%` }}
                  />
                </div>
                <span className={styles.riskDesc}>
                  {riskMetrics.volatility < 15 ? '낮음' : riskMetrics.volatility < 25 ? '보통' : '높음'}
                </span>
              </div>
              
              <div className={styles.riskItem}>
                <div className={styles.riskItemHeader}>
                  <span className={styles.riskLabel}>샤프 비율</span>
                  <button className={styles.riskInfoButton} title="위험 대비 초과수익">
                    <Info size={14} />
                  </button>
                </div>
                <span className={styles.riskValue}>{riskMetrics.sharpeRatio.toFixed(2)}</span>
                <span className={styles.riskDesc}>
                  {riskMetrics.sharpeRatio >= 1 ? '양호' : riskMetrics.sharpeRatio >= 0.5 ? '보통' : '낮음'}
                </span>
              </div>
              
              <div className={styles.riskItem}>
                <div className={styles.riskItemHeader}>
                  <span className={styles.riskLabel}>베타</span>
                  <button className={styles.riskInfoButton} title="시장 대비 민감도">
                    <Info size={14} />
                  </button>
                </div>
                <span className={styles.riskValue}>{riskMetrics.beta.toFixed(2)}</span>
                <span className={styles.riskDesc}>
                  {riskMetrics.beta > 1.2 ? '공격적' : riskMetrics.beta > 0.8 ? '중립' : '방어적'}
                </span>
              </div>
              
              <div className={styles.riskItem}>
                <div className={styles.riskItemHeader}>
                  <span className={styles.riskLabel}>최대 낙폭</span>
                  <button className={styles.riskInfoButton} title="고점 대비 최대 하락폭">
                    <Info size={14} />
                  </button>
                </div>
                <span className={`${styles.riskValue} number-down`}>{riskMetrics.maxDrawdown.toFixed(1)}%</span>
                <span className={styles.riskDesc}>
                  {Math.abs(riskMetrics.maxDrawdown) < 15 ? '양호' : Math.abs(riskMetrics.maxDrawdown) < 30 ? '보통' : '주의'}
                </span>
              </div>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
      
      {/* Similar ETFs */}
      {similarETFs.length > 0 && (
        <Card padding="md" className={styles.similarCard}>
          <h3 className={styles.cardTitle}>유사 ETF</h3>
          <div className={styles.similarList}>
            {similarETFs.map((similar) => (
              <button 
                key={similar.id} 
                className={styles.similarItem}
                onClick={() => navigate(`/etf/${similar.id}`)}
              >
                <div className={styles.similarInfo}>
                  <span className={styles.similarName}>{similar.name}</span>
                  <span className={styles.similarMeta}>{similar.ticker} · {similar.issuer}</span>
                </div>
                <div className={styles.similarPrice}>
                  <span className={styles.similarPriceValue}>{formatPrice(similar.price)}원</span>
                  <span className={`${styles.similarChange} ${getChangeClass(similar.changePercent)}`}>
                    {formatPercent(similar.changePercent)}
                  </span>
                </div>
                <ChevronRight size={16} className={styles.similarArrow} />
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
