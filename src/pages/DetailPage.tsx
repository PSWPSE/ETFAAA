import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, Share2, TrendingUp, TrendingDown, Activity, Calculator, ChevronRight, Clock, Target, Zap, Shield, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Card, Button, Badge } from '../components/common';
import { Tabs, TabList, Tab, TabPanel } from '../components/common';
import { getETFById, generatePriceHistory, getReturns, getHoldings, getDividends, getRiskMetrics, getExtendedETFInfo, getSimilarETFs, getSectorAllocation, getCountryAllocation, getDividendChartData, getDividendForecast, getExtendedRiskMetrics, getMonthlyReturns, getETFGrades, getFundamentals, getTechnicalIndicators, getGrowthSimulation, getFundFlows, getTaxInfo, getCompetingETFs, getRelatedNews, getCostAnalysis } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, formatDate, getChangeClass } from '../utils/format';
import styles from './DetailPage.module.css';

const CHART_COLORS = ['#1E3A5F', '#4A90A4', '#6B7280', '#9CA3AF', '#D1D5DB'];

const CHART_PERIODS = [
  { value: '1m', label: '1M', days: 30 },
  { value: '3m', label: '3M', days: 90 },
  { value: '6m', label: '6M', days: 180 },
  { value: '1y', label: '1Y', days: 365 },
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
        <Button onClick={() => navigate('/search')}>ETF 검색하기</Button>
      </div>
    );
  }
  
  const etf = getExtendedETFInfo(baseEtf);
  const priceHistory = generatePriceHistory(etf.price, 365);
  const returns = getReturns(etf.id);
  const holdings = getHoldings(etf.id);
  const dividends = getDividends(etf.id);
  const riskMetrics = getRiskMetrics(etf.id);
  const similarETFs = getSimilarETFs(etf.id, 5);
  
  const sectorAllocation = getSectorAllocation(etf.id);
  const countryAllocation = getCountryAllocation(etf.id);
  const dividendChartData = getDividendChartData(etf.id);
  const dividendForecast = getDividendForecast(etf.id);
  const extendedRiskMetrics = getExtendedRiskMetrics(etf.id);
  const monthlyReturns = getMonthlyReturns(etf.id);
  
  const etfGrades = getETFGrades(etf.id);
  const fundamentals = getFundamentals(etf.id);
  const technicals = getTechnicalIndicators(etf.id);
  const growthData = getGrowthSimulation(etf.id, 5);
  const fundFlows = getFundFlows(etf.id);
  const taxInfo = getTaxInfo(etf.id);
  const competingETFs = getCompetingETFs(etf.id);
  const relatedNews = getRelatedNews(etf.id);
  const costAnalysis = getCostAnalysis(etf.id);
  
  const selectedPeriod = CHART_PERIODS.find(p => p.value === chartPeriod) || CHART_PERIODS[1];
  const chartData = useMemo(() => {
    return priceHistory.slice(-selectedPeriod.days).map(p => ({
      date: p.date,
      price: p.close,
    }));
  }, [priceHistory, selectedPeriod.days]);
  
  const yDomain = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);
  
  const inCompare = isInCompare(etf.id);
  
  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(etf.id);
    } else {
      addToCompare(etf.id);
    }
  };
  
  const pricePosition = etf.high52w && etf.low52w 
    ? ((etf.price - etf.low52w) / (etf.high52w - etf.low52w)) * 100 
    : 50;
  
  const navPremium = etf.nav ? ((etf.price - etf.nav) / etf.nav) * 100 : 0;
  const sharesOutstanding = Math.round(etf.marketCap / etf.price);
  
  const benchmarkReturns = useMemo(() => ({
    month1: returns.month1 - (Math.random() * 2 - 1),
    month3: returns.month3 - (Math.random() * 3 - 1.5),
    month6: returns.month6 - (Math.random() * 4 - 2),
    year1: returns.year1 - (Math.random() * 5 - 2.5),
  }), [returns]);
  
  const investorFlow = useMemo(() => ({
    foreign: Math.round((Math.random() - 0.3) * 500000),
    institution: Math.round((Math.random() - 0.4) * 300000),
  }), []);
  
  const investmentPoints = useMemo(() => {
    const points = [];
    if (returns.year1 > 20) points.push({ icon: TrendingUp, title: '고수익' });
    if (etf.dividendYield > 3) points.push({ icon: Target, title: '고배당' });
    if (etf.expenseRatio < 0.2) points.push({ icon: Zap, title: '저비용' });
    if (riskMetrics.volatility < 15) points.push({ icon: Shield, title: '저위험' });
    if (etf.volume > 1000000) points.push({ icon: Users, title: '고유동성' });
    return points.slice(0, 4);
  }, [returns, etf, riskMetrics]);

  const overallScore = etfGrades ? Math.round((etfGrades.efficiency.score + etfGrades.tradability.score + etfGrades.fit.score) / 3) : 0;

  return (
    <div className={styles.page}>
      {/* 헤더 - ETF 기본 정보 */}
      <Card className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.etfInfo}>
            <div className={styles.badges}>
              <Badge variant="default">{etf.ticker}</Badge>
              {etf.leverage && etf.leverage !== 1 && (
                <Badge variant={etf.leverage > 0 ? 'success' : 'danger'}>
                  {etf.leverage > 0 ? `${etf.leverage}X` : `인버스`}
                </Badge>
              )}
            </div>
            <h1 className={styles.etfName}>{etf.name}</h1>
            <p className={styles.etfMeta}>{etf.issuer} · {etf.category}</p>
          </div>
          <div className={styles.priceInfo}>
            <span className={styles.price}>{formatPrice(etf.price)}원</span>
            <span className={`${styles.change} ${getChangeClass(etf.changePercent)}`}>
              {etf.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {formatPercent(etf.changePercent)}
            </span>
          </div>
        </div>
        
        {/* 핵심 지표 */}
        <div className={styles.keyMetrics}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>1년 수익률</span>
            <span className={`${styles.metricValue} ${getChangeClass(returns.year1)}`}>
              {returns.year1 >= 0 ? '+' : ''}{returns.year1.toFixed(1)}%
            </span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>배당수익률</span>
            <span className={styles.metricValue}>{etf.dividendYield}%</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>총보수</span>
            <span className={styles.metricValue}>{etf.expenseRatio}%</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>순자산</span>
            <span className={styles.metricValue}>{formatLargeNumber(etf.aum)}</span>
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <Button 
            variant={inCompare ? 'primary' : 'outline'}
            leftIcon={inCompare ? <Check size={16} /> : <Plus size={16} />}
            onClick={handleCompareToggle}
            disabled={!inCompare && compareList.length >= 4}
            size="sm"
          >
            {inCompare ? '비교중' : '비교하기'}
          </Button>
          <Button variant="ghost" leftIcon={<Share2 size={16} />} size="sm">
            공유
          </Button>
        </div>
      </Card>
      
      {/* 투자 포인트 */}
      {investmentPoints.length > 0 && (
        <div className={styles.pointsRow}>
          {investmentPoints.map((point, i) => (
            <div key={i} className={styles.pointItem}>
              <point.icon size={14} />
              <span>{point.title}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* 가격 차트 */}
      <Card className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.sectionTitle}>가격 차트</span>
          <div className={styles.periodSelector}>
            {CHART_PERIODS.map((period) => (
              <button
                key={period.value}
                className={`${styles.periodBtn} ${chartPeriod === period.value ? styles.active : ''}`}
                onClick={() => setChartPeriod(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartBody}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={yDomain}
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                width={35}
                orientation="right"
              />
              <Tooltip 
                formatter={(value: number) => [`${formatPrice(value)}원`, '가격']}
                contentStyle={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartActions}>
          <button className={styles.chartActionBtn} onClick={() => navigate(`/simulator?etf=${etf.id}`)}>
            <Calculator size={14} />
            <span>투자 시뮬레이션</span>
            <ChevronRight size={14} />
          </button>
          <button className={styles.chartActionBtn} onClick={() => navigate(`/phase?etf=${etf.id}`)}>
            <Activity size={14} />
            <span>국면 분석</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </Card>
      
      {/* 52주 가격 범위 */}
      <Card className={styles.rangeCard}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>52주 가격 범위</span>
          <span className={styles.rangePosition}>{pricePosition.toFixed(0)}%</span>
        </div>
        <div className={styles.rangeBar}>
          <div className={styles.rangeTrack}>
            <div className={styles.rangeIndicator} style={{ left: `${pricePosition}%` }} />
          </div>
        </div>
        <div className={styles.rangeLabels}>
          <span>{formatPrice(etf.low52w || 0)}원</span>
          <span className={styles.currentPrice}>{formatPrice(etf.price)}원</span>
          <span>{formatPrice(etf.high52w || 0)}원</span>
        </div>
      </Card>
      
      {/* 상세 정보 탭 */}
      <Tabs defaultTab="overview" className={styles.tabs}>
        <TabList variant="underline">
          <Tab value="overview">개요</Tab>
          <Tab value="holdings">구성종목</Tab>
          <Tab value="dividend">배당</Tab>
          <Tab value="risk">위험지표</Tab>
          <Tab value="analysis">분석</Tab>
        </TabList>
        
        {/* 개요 탭 */}
        <TabPanel value="overview" className={styles.tabContent}>
          {/* 수익률 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>수익률</h3>
            <div className={styles.returnsGrid}>
              {[
                { label: '1개월', value: returns.month1 },
                { label: '3개월', value: returns.month3 },
                { label: '6개월', value: returns.month6 },
                { label: '1년', value: returns.year1 },
                { label: 'YTD', value: returns.ytd },
              ].map(item => (
                <div key={item.label} className={styles.returnItem}>
                  <span className={styles.returnLabel}>{item.label}</span>
                  <span className={`${styles.returnValue} ${getChangeClass(item.value)}`}>
                    {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
          
          {/* 기본 정보 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>기본 정보</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>추적지수</span>
                <span className={styles.infoValue}>{etf.trackingIndex}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NAV</span>
                <span className={styles.infoValue}>{formatPrice(etf.nav)}원</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NAV 괴리율</span>
                <span className={`${styles.infoValue} ${getChangeClass(navPremium)}`}>
                  {navPremium >= 0 ? '+' : ''}{navPremium.toFixed(2)}%
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>상장주식수</span>
                <span className={styles.infoValue}>{formatLargeNumber(sharesOutstanding)}주</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>시가총액</span>
                <span className={styles.infoValue}>{formatLargeNumber(etf.marketCap)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>거래량</span>
                <span className={styles.infoValue}>{formatLargeNumber(etf.volume)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>설정일</span>
                <span className={styles.infoValue}>{formatDate(etf.inceptionDate)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>거래소</span>
                <span className={styles.infoValue}>{etf.listingExchange}</span>
              </div>
            </div>
          </Card>
          
          {/* ETF 등급 */}
          {etfGrades && (
            <Card className={styles.section}>
              <h3 className={styles.sectionTitle}>ETF 등급</h3>
              <div className={styles.gradeOverview}>
                <div className={styles.gradeMain}>
                  <span className={styles.gradeValue}>{etfGrades.overall.grade}</span>
                  <span className={styles.gradeLabel}>종합등급</span>
                </div>
                <div className={styles.gradeScore}>
                  <span>{overallScore}</span>
                  <span>/ 100</span>
                </div>
              </div>
              <div className={styles.gradeItems}>
                <div className={styles.gradeItem}>
                  <span className={styles.gradeItemLabel}>비용효율</span>
                  <div className={styles.gradeBar}>
                    <div className={styles.gradeBarFill} style={{ width: `${etfGrades.efficiency.score}%` }} />
                  </div>
                  <span className={styles.gradeItemScore}>{etfGrades.efficiency.score}</span>
                </div>
                <div className={styles.gradeItem}>
                  <span className={styles.gradeItemLabel}>거래편의</span>
                  <div className={styles.gradeBar}>
                    <div className={styles.gradeBarFill} style={{ width: `${etfGrades.tradability.score}%` }} />
                  </div>
                  <span className={styles.gradeItemScore}>{etfGrades.tradability.score}</span>
                </div>
                <div className={styles.gradeItem}>
                  <span className={styles.gradeItemLabel}>투자적합</span>
                  <div className={styles.gradeBar}>
                    <div className={styles.gradeBarFill} style={{ width: `${etfGrades.fit.score}%` }} />
                  </div>
                  <span className={styles.gradeItemScore}>{etfGrades.fit.score}</span>
                </div>
              </div>
            </Card>
          )}
        </TabPanel>
        
        {/* 구성종목 탭 */}
        <TabPanel value="holdings" className={styles.tabContent}>
          {/* 섹터 비중 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>섹터 비중</h3>
            <div className={styles.allocationContent}>
              <div className={styles.pieChart}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={sectorAllocation.slice(0, 5)}
                      dataKey="weight"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={40}
                    >
                      {sectorAllocation.slice(0, 5).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.legendList}>
                {sectorAllocation.slice(0, 5).map((sector, i) => (
                  <div key={sector.name} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className={styles.legendName}>{sector.name}</span>
                    <span className={styles.legendValue}>{sector.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* 국가 비중 */}
          {countryAllocation.length > 1 && (
            <Card className={styles.section}>
              <h3 className={styles.sectionTitle}>국가 비중</h3>
              <div className={styles.countryList}>
                {countryAllocation.slice(0, 5).map((country, i) => (
                  <div key={country.code} className={styles.countryItem}>
                    <span className={styles.countryName}>{country.name}</span>
                    <div className={styles.countryBar}>
                      <div 
                        className={styles.countryBarFill} 
                        style={{ width: `${country.weight}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} 
                      />
                    </div>
                    <span className={styles.countryWeight}>{country.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* 상위 종목 */}
          <Card className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>상위 종목</h3>
              <span className={styles.sectionMeta}>{holdings.length}개 보유</span>
            </div>
            <div className={styles.holdingsList}>
              {holdings.slice(0, 10).map((h, i) => (
                <div key={h.ticker} className={styles.holdingItem}>
                  <span className={styles.holdingRank}>{i + 1}</span>
                  <div className={styles.holdingInfo}>
                    <span className={styles.holdingName}>{h.name}</span>
                    <span className={styles.holdingTicker}>{h.ticker}</span>
                  </div>
                  <span className={styles.holdingWeight}>{h.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
        
        {/* 배당 탭 */}
        <TabPanel value="dividend" className={styles.tabContent}>
          {dividends.length > 0 ? (
            <>
              {/* 배당 요약 */}
              <Card className={styles.section}>
                <h3 className={styles.sectionTitle}>배당 정보</h3>
                <div className={styles.dividendSummary}>
                  <div className={styles.dividendMain}>
                    <span className={styles.dividendYield}>{etf.dividendYield}%</span>
                    <span className={styles.dividendLabel}>연간 배당수익률</span>
                  </div>
                  {dividendForecast && (
                    <div className={styles.dividendCountdown}>
                      <Clock size={14} />
                      <span>D-{dividendForecast.daysUntilEx}</span>
                    </div>
                  )}
                </div>
                <div className={styles.dividendInfo}>
                  <div className={styles.dividendInfoItem}>
                    <span className={styles.dividendInfoLabel}>배당주기</span>
                    <span className={styles.dividendInfoValue}>{dividendForecast?.frequency || '분기배당'}</span>
                  </div>
                  <div className={styles.dividendInfoItem}>
                    <span className={styles.dividendInfoLabel}>최근 배당</span>
                    <span className={styles.dividendInfoValue}>{formatPrice(dividends[0]?.amount || 0)}원</span>
                  </div>
                  <div className={styles.dividendInfoItem}>
                    <span className={styles.dividendInfoLabel}>예상 배당락</span>
                    <span className={styles.dividendInfoValue}>{dividendForecast?.nextExDate || '-'}</span>
                  </div>
                  <div className={styles.dividendInfoItem}>
                    <span className={styles.dividendInfoLabel}>예상 금액</span>
                    <span className={styles.dividendInfoValue}>{formatPrice(dividendForecast?.estimatedAmount || 0)}원</span>
                  </div>
                </div>
              </Card>
              
              {/* 배당 추이 */}
              {dividendChartData.length > 0 && (
                <Card className={styles.section}>
                  <h3 className={styles.sectionTitle}>배당금 추이</h3>
                  <div className={styles.dividendChart}>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={dividendChartData} margin={{ top: 10, right: 5, bottom: 0, left: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value: number) => [`${formatPrice(value)}원`, '배당금']}
                          contentStyle={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '11px' }}
                        />
                        <Bar dataKey="amount" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
              
              {/* 배당 이력 */}
              <Card className={styles.section}>
                <h3 className={styles.sectionTitle}>배당 이력</h3>
                <div className={styles.dividendHistory}>
                  {dividends.slice(0, 6).map((d, i) => (
                    <div key={i} className={styles.dividendHistoryItem}>
                      <span className={styles.historyDate}>{d.exDate}</span>
                      <span className={styles.historyAmount}>{formatPrice(d.amount)}원</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className={styles.emptyState}>
              <p>배당 정보가 없습니다.</p>
            </Card>
          )}
        </TabPanel>
        
        {/* 위험지표 탭 */}
        <TabPanel value="risk" className={styles.tabContent}>
          {/* 핵심 위험 지표 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>핵심 지표</h3>
            <div className={styles.riskGrid}>
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>변동성</span>
                <span className={styles.riskValue}>{riskMetrics.volatility.toFixed(1)}%</span>
                <span className={`${styles.riskStatus} ${riskMetrics.volatility < 15 ? styles.good : riskMetrics.volatility < 25 ? styles.mid : styles.bad}`}>
                  {riskMetrics.volatility < 15 ? '낮음' : riskMetrics.volatility < 25 ? '보통' : '높음'}
                </span>
              </div>
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>샤프비율</span>
                <span className={styles.riskValue}>{riskMetrics.sharpeRatio.toFixed(2)}</span>
                <span className={`${styles.riskStatus} ${riskMetrics.sharpeRatio >= 1 ? styles.good : riskMetrics.sharpeRatio >= 0.5 ? styles.mid : styles.bad}`}>
                  {riskMetrics.sharpeRatio >= 1 ? '양호' : riskMetrics.sharpeRatio >= 0.5 ? '보통' : '낮음'}
                </span>
              </div>
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>베타</span>
                <span className={styles.riskValue}>{riskMetrics.beta.toFixed(2)}</span>
                <span className={`${styles.riskStatus} ${riskMetrics.beta <= 0.8 ? styles.good : riskMetrics.beta <= 1.2 ? styles.mid : styles.bad}`}>
                  {riskMetrics.beta <= 0.8 ? '방어적' : riskMetrics.beta <= 1.2 ? '중립' : '공격적'}
                </span>
              </div>
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>MDD</span>
                <span className={styles.riskValue}>{riskMetrics.maxDrawdown.toFixed(1)}%</span>
                <span className={`${styles.riskStatus} ${Math.abs(riskMetrics.maxDrawdown) < 15 ? styles.good : Math.abs(riskMetrics.maxDrawdown) < 30 ? styles.mid : styles.bad}`}>
                  {Math.abs(riskMetrics.maxDrawdown) < 15 ? '양호' : Math.abs(riskMetrics.maxDrawdown) < 30 ? '보통' : '주의'}
                </span>
              </div>
            </div>
          </Card>
          
          {/* 시장 캡처 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>시장 캡처</h3>
            <div className={styles.captureGrid}>
              <div className={styles.captureItem}>
                <div className={styles.captureHeader}>
                  <TrendingUp size={14} />
                  <span>상승장 캡처</span>
                </div>
                <div className={styles.captureBar}>
                  <div className={styles.captureBarFill} style={{ width: `${Math.min(Number(extendedRiskMetrics.upCapture), 100)}%` }} />
                </div>
                <span className={styles.captureValue}>{extendedRiskMetrics.upCapture}%</span>
              </div>
              <div className={styles.captureItem}>
                <div className={styles.captureHeader}>
                  <TrendingDown size={14} />
                  <span>하락장 캡처</span>
                </div>
                <div className={styles.captureBar}>
                  <div className={`${styles.captureBarFill} ${styles.down}`} style={{ width: `${Math.min(Number(extendedRiskMetrics.downCapture), 100)}%` }} />
                </div>
                <span className={styles.captureValue}>{extendedRiskMetrics.downCapture}%</span>
              </div>
            </div>
          </Card>
          
          {/* 고급 지표 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>고급 지표</h3>
            <div className={styles.advancedGrid}>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>알파</span>
                <span className={`${styles.advancedValue} ${Number(extendedRiskMetrics.alpha) >= 0 ? 'number-up' : 'number-down'}`}>
                  {Number(extendedRiskMetrics.alpha) >= 0 ? '+' : ''}{extendedRiskMetrics.alpha}%
                </span>
              </div>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>R²</span>
                <span className={styles.advancedValue}>{extendedRiskMetrics.r2}</span>
              </div>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>소르티노</span>
                <span className={styles.advancedValue}>{extendedRiskMetrics.sortino}</span>
              </div>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>트레이너</span>
                <span className={styles.advancedValue}>{extendedRiskMetrics.treynorRatio}</span>
              </div>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>VaR 95%</span>
                <span className={`${styles.advancedValue} number-down`}>-{extendedRiskMetrics.var95}%</span>
              </div>
              <div className={styles.advancedItem}>
                <span className={styles.advancedLabel}>CVaR 95%</span>
                <span className={`${styles.advancedValue} number-down`}>-{extendedRiskMetrics.cvar95}%</span>
              </div>
            </div>
          </Card>
          
          {/* 월별 수익률 히트맵 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>월별 수익률</h3>
            <div className={styles.heatmap}>
              <div className={styles.heatmapHeader}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(m => (
                  <span key={m} className={styles.heatmapMonth}>{m}</span>
                ))}
              </div>
              {monthlyReturns.slice(0, 3).map((yearData) => (
                <div key={yearData.year} className={styles.heatmapRow}>
                  <span className={styles.heatmapYear}>{yearData.year}</span>
                  <div className={styles.heatmapCells}>
                    {yearData.returns.map((m, i) => (
                      <div 
                        key={i}
                        className={styles.heatmapCell}
                        style={{
                          background: m.value >= 0 
                            ? `rgba(34, 197, 94, ${Math.min(Math.abs(m.value) / 10, 0.8)})` 
                            : `rgba(239, 68, 68, ${Math.min(Math.abs(m.value) / 10, 0.8)})`
                        }}
                        title={`${m.month}: ${m.value >= 0 ? '+' : ''}${m.value.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
        
        {/* 분석 탭 */}
        <TabPanel value="analysis" className={styles.tabContent}>
          {/* 기술적 분석 */}
          {technicals && (
            <Card className={styles.section}>
              <h3 className={styles.sectionTitle}>기술적 분석</h3>
              <div className={styles.technicalSummary}>
                <div className={styles.rsiSection}>
                  <div className={styles.rsiHeader}>
                    <span>RSI (14)</span>
                    <span className={`${styles.rsiStatus} ${styles[technicals.rsiStatus]}`}>
                      {technicals.rsiStatus === 'overbought' ? '과매수' : technicals.rsiStatus === 'oversold' ? '과매도' : '중립'}
                    </span>
                  </div>
                  <div className={styles.rsiBar}>
                    <div className={styles.rsiTrack}>
                      <div className={styles.rsiIndicator} style={{ left: `${technicals.rsi}%` }} />
                    </div>
                    <span className={styles.rsiValue}>{technicals.rsi}</span>
                  </div>
                </div>
                <div className={styles.trendSection}>
                  <div className={`${styles.trendItem} ${technicals.trend.shortTerm === 'bullish' ? styles.bullish : styles.bearish}`}>
                    <span>단기</span>
                    {technicals.trend.shortTerm === 'bullish' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div className={`${styles.trendItem} ${technicals.trend.longTerm === 'bullish' ? styles.bullish : styles.bearish}`}>
                    <span>장기</span>
                    {technicals.trend.longTerm === 'bullish' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                </div>
              </div>
              
              <div className={styles.maGrid}>
                {[
                  { label: 'MA5', value: technicals.movingAverages.ma5 },
                  { label: 'MA20', value: technicals.movingAverages.ma20 },
                  { label: 'MA50', value: technicals.movingAverages.ma50 },
                  { label: 'MA200', value: technicals.movingAverages.ma200 },
                ].map(ma => (
                  <div key={ma.label} className={styles.maItem}>
                    <span className={styles.maLabel}>{ma.label}</span>
                    <span className={`${styles.maValue} ${etf.price >= ma.value ? 'number-up' : 'number-down'}`}>
                      {formatPrice(ma.value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* 펀더멘털 */}
          {fundamentals && (
            <Card className={styles.section}>
              <h3 className={styles.sectionTitle}>펀더멘털</h3>
              <div className={styles.fundamentalGrid}>
                <div className={styles.fundamentalItem}>
                  <span className={styles.fundamentalLabel}>P/E</span>
                  <span className={styles.fundamentalValue}>{fundamentals.pe}x</span>
                </div>
                <div className={styles.fundamentalItem}>
                  <span className={styles.fundamentalLabel}>P/B</span>
                  <span className={styles.fundamentalValue}>{fundamentals.pb}x</span>
                </div>
                <div className={styles.fundamentalItem}>
                  <span className={styles.fundamentalLabel}>ROE</span>
                  <span className={styles.fundamentalValue}>{fundamentals.roe}%</span>
                </div>
                <div className={styles.fundamentalItem}>
                  <span className={styles.fundamentalLabel}>성장률</span>
                  <span className={`${styles.fundamentalValue} ${Number(fundamentals.earningsGrowth) >= 0 ? 'number-up' : 'number-down'}`}>
                    {Number(fundamentals.earningsGrowth) >= 0 ? '+' : ''}{fundamentals.earningsGrowth}%
                  </span>
                </div>
              </div>
            </Card>
          )}
          
          {/* 비용 & 세금 */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>비용 구조</h3>
            {costAnalysis && (
              <div className={styles.costList}>
                <div className={styles.costItem}>
                  <span>총보수 (TER)</span>
                  <span>{costAnalysis.ter}%</span>
                </div>
                <div className={styles.costItem}>
                  <span>매매수수료</span>
                  <span>{costAnalysis.tradingCost}%</span>
                </div>
                <div className={`${styles.costItem} ${styles.costTotal}`}>
                  <span>실부담비용</span>
                  <span>{costAnalysis.totalCost}%</span>
                </div>
              </div>
            )}
            {taxInfo && (
              <div className={styles.taxInfo}>
                <div className={styles.taxItem}>
                  <span>배당소득세</span>
                  <span>{taxInfo.dividendTaxRate}</span>
                </div>
                <div className={styles.taxItem}>
                  <span>양도세</span>
                  <span>{taxInfo.capitalGainsDistribution}</span>
                </div>
              </div>
            )}
          </Card>
        </TabPanel>
      </Tabs>
      
      {/* 유사 ETF */}
      {(similarETFs.length > 0 || competingETFs.length > 0) && (
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>유사 ETF</h3>
            <ChevronRight size={16} className={styles.sectionMore} />
          </div>
          <div className={styles.similarList}>
            {(competingETFs.length > 0 ? competingETFs : similarETFs).slice(0, 4).map((r) => (
              <button key={r.id} className={styles.similarItem} onClick={() => navigate(`/etf/${r.id}`)}>
                <div className={styles.similarInfo}>
                  <span className={styles.similarName}>{r.name}</span>
                  <span className={styles.similarTicker}>{r.ticker}</span>
                </div>
                <div className={styles.similarPrice}>
                  <span>{formatPrice(r.price)}원</span>
                  <span className={getChangeClass(r.changePercent)}>{formatPercent(r.changePercent)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
      
      {/* 관련 뉴스 */}
      {relatedNews.length > 0 && (
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>관련 뉴스</h3>
          </div>
          <div className={styles.newsList}>
            {relatedNews.slice(0, 3).map((news) => (
              <a key={news.id} href={news.url} className={styles.newsItem} target="_blank" rel="noopener noreferrer">
                <span className={styles.newsTitle}>{news.title}</span>
                <span className={styles.newsMeta}>{news.source} · {news.date}</span>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
