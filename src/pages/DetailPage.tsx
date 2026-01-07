import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, Share2, TrendingUp, TrendingDown, Activity, Calculator, ChevronRight, Clock, Target, Zap, Shield, Users, Info, PieChart as PieChartIcon, Globe, List, DollarSign, BarChart3, Calendar, Layers, Newspaper } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, ReferenceLine, Label } from 'recharts';
import { Card, Button, Badge } from '../components/common';
import { Tabs, TabList, Tab, TabPanel } from '../components/common';
import { getETFById, generatePriceHistory, getReturns, getHoldings, getDividends, getRiskMetrics, getExtendedETFInfo, getSimilarETFs, getSectorAllocation, getAssetAllocation, getCountryAllocation, getDividendChartData, getDividendForecast, getExtendedRiskMetrics, getMonthlyReturns, getTechnicalIndicators, getGrowthSimulation, getFundFlows, getTaxInfo, getCompetingETFs, getRelatedNews, getCostAnalysis, getCorrelatedETFs } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, formatDate, getChangeClass } from '../utils/format';
import styles from './DetailPage.module.css';

const CHART_COLORS = ['#1E3A5F', '#4A90A4', '#6B7280', '#9CA3AF', '#D1D5DB'];

const CHART_PERIODS = [
  { value: '1m', label: '1M', days: 30 },
  { value: '3m', label: '3M', days: 90 },
  { value: '6m', label: '6M', days: 180 },
  { value: '1y', label: '1Y', days: 365 },
  { value: 'all', label: '전체', days: -1 },
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
  const correlatedETFs = getCorrelatedETFs(etf.id, 5);
  
  const sectorAllocation = getSectorAllocation(etf.id);
  const assetAllocation = getAssetAllocation(etf.id);
  const countryAllocation = getCountryAllocation(etf.id);
  const dividendChartData = getDividendChartData(etf.id);
  const dividendForecast = getDividendForecast(etf.id);
  const extendedRiskMetrics = getExtendedRiskMetrics(etf.id);
  const monthlyReturns = getMonthlyReturns(etf.id);
  
  const technicals = getTechnicalIndicators(etf.id);
  const growthData = getGrowthSimulation(etf.id, 5);
  const fundFlows = getFundFlows(etf.id);
  const taxInfo = getTaxInfo(etf.id);
  const competingETFs = getCompetingETFs(etf.id);
  const relatedNews = getRelatedNews(etf.id);
  const costAnalysis = getCostAnalysis(etf.id);
  
  const selectedPeriod = CHART_PERIODS.find(p => p.value === chartPeriod) || CHART_PERIODS[1];
  const chartData = useMemo(() => {
    const dataToShow = selectedPeriod.days === -1 
      ? priceHistory 
      : priceHistory.slice(-selectedPeriod.days);
    return dataToShow.map(p => ({
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
    return points.slice(0, 5);
  }, [returns, etf, riskMetrics]);

  const periodReturn = useMemo(() => {
    switch (chartPeriod) {
      case '1m':
        return { label: '1개월 수익률', value: returns.month1 };
      case '3m':
        return { label: '3개월 수익률', value: returns.month3 };
      case '6m':
        return { label: '6개월 수익률', value: returns.month6 };
      case '1y':
        return { label: '1년 수익률', value: returns.year1 };
      case 'all':
        // Calculate total return from all price history
        const firstPrice = priceHistory[0]?.close || etf.price;
        const lastPrice = priceHistory[priceHistory.length - 1]?.close || etf.price;
        const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
        return { label: '전체 수익률', value: totalReturn };
      default:
        return { label: '1년 수익률', value: returns.year1 };
    }
  }, [chartPeriod, returns, priceHistory, etf.price]);

  const monthlyStats = useMemo(() => {
    const allReturns = monthlyReturns.flatMap(year => year.returns.map(m => m.value));
    const max = Math.max(...allReturns);
    const min = Math.min(...allReturns);
    const avg = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
    const variance = allReturns.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allReturns.length;
    const stdDev = Math.sqrt(variance);
    
    return { max, min, avg, stdDev };
  }, [monthlyReturns]);

  return (
    <div className={styles.page}>
      {/* 헤더 - ETF 기본 정보 */}
      <Card className={styles.headerCard}>
        <div className={styles.headerMain}>
          {/* 왼쪽: ETF 정보 */}
          <div className={styles.etfInfo}>
            <div className={styles.etfTitleRow}>
              <h1 className={styles.etfName}>{etf.name}</h1>
              <div className={styles.badges}>
                <Badge variant="default">{etf.ticker}</Badge>
                {etf.leverage && etf.leverage !== 1 && (
                  <Badge variant={etf.leverage > 0 ? 'success' : 'danger'}>
                    {etf.leverage > 0 ? `${etf.leverage}X` : `인버스`}
                  </Badge>
                )}
              </div>
            </div>
            <div className={styles.etfMeta}>
              <span className={styles.issuer}>{etf.issuer}</span>
              {(etf.personalPension || etf.retirementPension) && (
                <>
                  <span className={styles.separator}>·</span>
                  <div className={styles.pensionBadges}>
                    {etf.personalPension && (
                      <span className={styles.pensionBadge}>개인연금</span>
                    )}
                    {etf.retirementPension && (
                      <span className={styles.pensionBadge}>퇴직연금</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* 오른쪽: 가격 정보 */}
          <div className={styles.priceSection}>
            <div className={styles.priceMain}>
              <span className={styles.price}>{formatPrice(etf.price)}</span>
              <span className={styles.currency}>원</span>
            </div>
            <div className={`${styles.priceChange} ${getChangeClass(etf.changePercent)}`}>
              <span className={styles.changeValue}>{formatPercent(etf.changePercent)}</span>
            </div>
          </div>
        </div>
        
        {/* 가격 차트 */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <div className={styles.sectionTitleWrapper}>
              <TrendingUp size={18} />
              <h3 className={styles.sectionTitle}>가격 차트</h3>
            </div>
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
                <ReferenceLine
                  y={etf.price}
                  stroke="var(--color-primary)"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: `${formatPrice(etf.price)}원`,
                    position: 'insideTopRight',
                    fill: 'var(--color-white)',
                    fontSize: 11,
                    fontWeight: 600,
                    offset: 10,
                    content: (props: any) => {
                      const { viewBox } = props;
                      const x = viewBox.width - 10;
                      const y = viewBox.y;
                      
                      return (
                        <g>
                          <rect
                            x={x - 70}
                            y={y - 12}
                            width={70}
                            height={20}
                            fill="var(--color-primary)"
                            rx={4}
                            ry={4}
                            opacity={0.95}
                          />
                          <text
                            x={x - 35}
                            y={y + 2}
                            fill="white"
                            fontSize={11}
                            fontWeight={600}
                            textAnchor="middle"
                          >
                            {`${formatPrice(etf.price)}원`}
                          </text>
                        </g>
                      );
                    }
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
          <div className={styles.chartFooter}>
            <Clock size={12} />
            <span>Last | {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>
        
        {/* 핵심 지표 */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>{periodReturn.label}</div>
            <div className={`${styles.metricValue} ${getChangeClass(periodReturn.value)}`}>
              {periodReturn.value >= 0 ? '+' : ''}{periodReturn.value.toFixed(1)}%
            </div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>배당수익률</div>
            <div className={styles.metricValue}>{etf.dividendYield}%</div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>총보수</div>
            <div className={styles.metricValue}>{etf.expenseRatio}%</div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>순자산</div>
            <div className={styles.metricValue}>{formatLargeNumber(etf.aum)}</div>
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <div className={styles.headerActions}>
          <Button 
            variant={inCompare ? 'primary' : 'outline'}
            leftIcon={inCompare ? <Check size={16} /> : <Plus size={16} />}
            onClick={handleCompareToggle}
            disabled={!inCompare && compareList.length >= 4}
            size="sm"
          >
            {inCompare ? '비교중' : '비교하기'}
          </Button>
          <Button variant="outline" leftIcon={<Share2 size={16} />} size="sm">
            공유하기
          </Button>
        </div>
      </Card>
      
      {/* 상세 정보 탭 */}
      <Tabs defaultTab="overview" className={styles.tabs}>
        <TabList variant="underline">
          <Tab value="overview">개요</Tab>
          <Tab value="holdings">구성종목</Tab>
          <Tab value="dividend">배당</Tab>
          <Tab value="deep-analysis">심층 분석</Tab>
          <Tab value="news">뉴스</Tab>
        </TabList>
        
        {/* 개요 탭 */}
        <TabPanel value="overview" className={styles.tabContent}>
          {/* 투자 포인트 */}
          {investmentPoints.length > 0 && (
            <Card className={styles.investmentPointsCard}>
              <div className={styles.investmentPointsHeader}>
                <Activity size={18} />
                <h3 className={styles.investmentPointsTitle}>핵심 키워드</h3>
              </div>
              <div className={styles.pointsRow}>
                {investmentPoints.map((point, i) => (
                  <div key={i} className={styles.pointItem}>
                    <point.icon size={14} />
                    <span>{point.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* 투자전략 */}
          <Card className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Target size={18} />
              <h3 className={styles.sectionTitle}>투자전략</h3>
            </div>
            <p className={styles.strategyText}>
              이 투자신탁은 {etf.trackingIndex}를 기초지수로 하여 1좌당 순자산가치의 변동률을 기초지수의 변동률과 유사하도록 
              투자신탁재산을 운용하는 것을 목적으로 합니다. {etf.category === '국내주식' ? '국내' : '해외'} {etf.category.includes('채권') ? '채권' : '주식'} 
              시장에 투자하며, {etf.leverage && etf.leverage !== 1 ? (etf.leverage > 0 ? `${etf.leverage}배 레버리지` : '인버스') : '현물'} 
              상품으로 운용됩니다.
            </p>
          </Card>
          
          {/* 기본 정보 */}
          <Card className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Info size={18} />
              <h3 className={styles.sectionTitle}>기본 정보</h3>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>운용사</span>
                <span className={styles.infoValue}>{etf.issuer}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>상장일</span>
                <span className={styles.infoValue}>{formatDate(etf.inceptionDate)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>기초자산</span>
                <span className={styles.infoValue}>{etf.category}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>추적지수</span>
                <span className={styles.infoValue}>{etf.trackingIndex}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>시가총액</span>
                <span className={styles.infoValue}>{formatLargeNumber(etf.marketCap)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>순자산(AUM)</span>
                <span className={styles.infoValue}>{formatLargeNumber(etf.marketCap * 1.005)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>상장주식수</span>
                <span className={styles.infoValue}>{formatLargeNumber(sharesOutstanding)}주</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>구성종목수</span>
                <span className={styles.infoValue}>{holdings.length}종목</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>레버리지</span>
                <span className={styles.infoValue}>
                  {etf.leverage && etf.leverage !== 1 ? (etf.leverage > 0 ? `${etf.leverage}배` : '인버스') : '1배'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>거래소</span>
                <span className={styles.infoValue}>{etf.listingExchange}</span>
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
                <span className={styles.infoLabel}>거래량</span>
                <span className={styles.infoValue}>{formatLargeNumber(etf.volume)}</span>
              </div>
            </div>
          </Card>
          
          {/* 비용 & 세금 */}
          <Card className={styles.section}>
            <div className={styles.sectionTitleWrapper}>
              <Calculator size={18} />
              <h3 className={styles.sectionTitle}>비용 & 세금</h3>
            </div>
            <div className={styles.infoGrid}>
              {costAnalysis && (
                <>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>총보수율</span>
                    <span className={styles.infoValue}>{(costAnalysis.ter * 0.9).toFixed(4)}%</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>TER</span>
                    <span className={styles.infoValue}>{costAnalysis.ter}%</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>실부담비용률</span>
                    <span className={`${styles.infoValue} ${styles.highlight}`}>{costAnalysis.totalCost}%</span>
                  </div>
                </>
              )}
              {taxInfo && (
                <>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>증권거래세</span>
                    <span className={styles.infoValue}>비과세</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>매매차익</span>
                    <span className={styles.infoValue}>{taxInfo.capitalGainsDistribution}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>현금배당</span>
                    <span className={styles.infoValue}>배당소득세 {taxInfo.dividendTaxRate}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabPanel>
        
        {/* 구성종목 탭 */}
        <TabPanel value="holdings" className={styles.tabContent}>
          {/* 자산/섹터 비중 */}
          <div className={styles.allocationGrid}>
            {/* 자산 비중 */}
            <Card className={styles.section}>
              <div className={styles.sectionTitleWrapper}>
                <Layers size={18} />
                <h3 className={styles.sectionTitle}>자산 비중</h3>
              </div>
              <div className={styles.allocationContent}>
                <div className={styles.pieChart}>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={assetAllocation}
                        dataKey="weight"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={40}
                      >
                        {assetAllocation.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.legendList}>
                  {assetAllocation.map((asset, i) => (
                    <div key={asset.name} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className={styles.legendName}>{asset.name}</span>
                      <span className={styles.legendValue}>{asset.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* 섹터 비중 */}
            <Card className={styles.section}>
              <div className={styles.sectionTitleWrapper}>
                <PieChartIcon size={18} />
                <h3 className={styles.sectionTitle}>섹터 비중</h3>
              </div>
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
          </div>
          
          {/* 국가 비중 */}
          {countryAllocation.length > 1 && (
            <Card className={styles.section}>
              <div className={styles.sectionTitleWrapper}>
                <Globe size={18} />
                <h3 className={styles.sectionTitle}>국가 비중</h3>
              </div>
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
              <div className={styles.sectionHeaderLeft}>
                <List size={18} />
                <h3 className={styles.sectionTitle}>상위 종목</h3>
              </div>
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
                <div className={styles.sectionTitleWrapper}>
                  <DollarSign size={18} />
                  <h3 className={styles.sectionTitle}>배당 정보</h3>
                </div>
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
                    <span className={styles.dividendInfoLabel}>다음 매수 마감일</span>
                    <span className={styles.dividendInfoValue}>{dividendForecast?.nextExDate || '-'}</span>
                  </div>
                  <div className={styles.dividendInfoItem}>
                    <span className={styles.dividendInfoLabel}>다음 배당 예상금액</span>
                    <span className={styles.dividendInfoValue}>{formatPrice(dividendForecast?.estimatedAmount || 0)}원</span>
                  </div>
                </div>
              </Card>
              
              {/* 배당 추이 */}
              {dividendChartData.length > 0 && (
                <Card className={styles.section}>
                  <div className={styles.sectionTitleWrapper}>
                    <BarChart3 size={18} />
                    <h3 className={styles.sectionTitle}>배당금 추이</h3>
                  </div>
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
                <div className={styles.sectionTitleWrapper}>
                  <Clock size={18} />
                  <h3 className={styles.sectionTitle}>배당 이력</h3>
                </div>
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
        
        {/* 심층 분석 탭 */}
        <TabPanel value="deep-analysis" className={styles.tabContent}>
          {/* 기간별 수익률 */}
          <Card className={styles.section}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionTitleWrapper}>
                <TrendingUp size={18} />
                <h3 className={styles.sectionTitle}>기간별 수익률</h3>
              </div>
              <p className={styles.sectionDescription}>다양한 기간의 수익률을 비교하여 단기 및 장기 성과를 평가합니다</p>
            </div>
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
          
          {/* 월별 수익률 히트맵 */}
          <Card className={styles.section}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionTitleWrapper}>
                <Calendar size={18} />
                <h3 className={styles.sectionTitle}>월별 수익률</h3>
              </div>
              <p className={styles.sectionDescription}>월별 수익률을 한눈에 파악할 수 있습니다. 양수는 녹색, 음수는 빨간색으로 표시됩니다</p>
            </div>
            <div className={styles.returnsTable}>
              <div className={styles.returnsTableHeader}>
                <div className={styles.returnsTableCell}></div>
                {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map(m => (
                  <div key={m} className={styles.returnsTableCell}>{m}</div>
                ))}
              </div>
              {monthlyReturns.slice(0, 3).map((yearData) => (
                <div key={yearData.year} className={styles.returnsTableRow}>
                  <div className={`${styles.returnsTableCell} ${styles.yearCell}`}>{yearData.year}</div>
                  {yearData.returns.map((m, i) => (
                    <div 
                      key={i}
                      className={`${styles.returnsTableCell} ${styles.valueCell}`}
                      style={{
                        background: m.value >= 0 
                          ? `rgba(34, 197, 94, ${Math.min(Math.abs(m.value) / 15, 0.15) + 0.08})` 
                          : `rgba(239, 68, 68, ${Math.min(Math.abs(m.value) / 15, 0.15) + 0.08})`,
                        color: m.value >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        fontWeight: Math.abs(m.value) > 5 ? 700 : 600
                      }}
                    >
                      {m.value >= 0 ? '+' : ''}{m.value.toFixed(1)}%
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className={styles.monthlyStatsGrid}>
              <div className={styles.monthlyStatItem}>
                <span className={styles.monthlyStatLabel}>월간 최고</span>
                <span className={`${styles.monthlyStatValue} number-up`}>
                  +{monthlyStats.max.toFixed(1)}%
                </span>
              </div>
              <div className={styles.monthlyStatItem}>
                <span className={styles.monthlyStatLabel}>월간 최저</span>
                <span className={`${styles.monthlyStatValue} number-down`}>
                  {monthlyStats.min.toFixed(1)}%
                </span>
              </div>
              <div className={styles.monthlyStatItem}>
                <span className={styles.monthlyStatLabel}>월간 평균</span>
                <span className={`${styles.monthlyStatValue} ${monthlyStats.avg >= 0 ? 'number-up' : 'number-down'}`}>
                  {monthlyStats.avg >= 0 ? '+' : ''}{monthlyStats.avg.toFixed(1)}%
                </span>
              </div>
              <div className={styles.monthlyStatItem}>
                <span className={styles.monthlyStatLabel}>변동성</span>
                <span className={styles.monthlyStatValue}>
                  {monthlyStats.stdDev.toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
          
          {/* 52주 가격 범위 */}
          <Card className={styles.rangeCard}>
            <div className={styles.rangeHeader}>
              <div className={styles.rangeHeaderLeft}>
                <div className={styles.sectionTitleWrapper}>
                  <Activity size={18} />
                  <h3 className={styles.sectionTitle}>52주 가격 범위</h3>
                </div>
                <p className={styles.rangeDescription}>
                  현재 가격이 52주 최저가와 최고가 사이 어디에 위치하는지 보여줍니다
                </p>
              </div>
              <div className={styles.rangePosition}>
                <span>{pricePosition.toFixed(0)}%</span>
              </div>
            </div>
            <div className={styles.rangeBar}>
              <div className={styles.rangeTrack} style={{ '--fill-width': `${pricePosition}%` } as any}>
                <div className={styles.rangeIndicator} style={{ left: `${pricePosition}%` }} />
              </div>
            </div>
            <div className={styles.rangeLabels}>
              <span>{formatPrice(etf.low52w || 0)}원</span>
              <span className={styles.currentPrice}>{formatPrice(etf.price)}원</span>
              <span>{formatPrice(etf.high52w || 0)}원</span>
            </div>
          </Card>
          
          {/* 국면 분석 */}
          {technicals && (
            <Card className={styles.section}>
              <div className={styles.sectionHeaderWrapper}>
                <div className={styles.sectionTitleWrapper}>
                  <Activity size={18} />
                  <h3 className={styles.sectionTitle}>국면 분석</h3>
                </div>
                <p className={styles.sectionDescription}>단기, 중기, 장기 시장 국면을 종합적으로 분석합니다</p>
              </div>
              
              <div className={styles.phaseGrid}>
                {/* 단기 국면 */}
                <div className={styles.phaseItem}>
                  <div className={styles.phaseItemHeader}>
                    <span className={styles.phaseLabel}>단기</span>
                    <span className={styles.phasePeriod}>5-20일</span>
                  </div>
                  <div className={styles.phaseItemContent}>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>국면</span>
                      <span className={`${styles.phaseStatusValue} ${
                        technicals.rsi >= 70 ? 'number-up' : 
                        technicals.rsi <= 30 ? 'number-down' : ''
                      }`}>
                        {technicals.rsi >= 70 ? '과열' : technicals.rsi <= 30 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>추세</span>
                      <span className={`${styles.phaseStatusValue} ${
                        etf.price > technicals.movingAverages.ma20 ? 'number-up' : 'number-down'
                      }`}>
                        {etf.price > technicals.movingAverages.ma20 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className={styles.phaseMetric}>
                      <span className={styles.phaseMetricLabel}>RSI</span>
                      <span className={styles.phaseMetricValue}>{technicals.rsi}</span>
                    </div>
                  </div>
                </div>

                {/* 중기 국면 */}
                <div className={styles.phaseItem}>
                  <div className={styles.phaseItemHeader}>
                    <span className={styles.phaseLabel}>중기</span>
                    <span className={styles.phasePeriod}>20-50일</span>
                  </div>
                  <div className={styles.phaseItemContent}>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>국면</span>
                      <span className={`${styles.phaseStatusValue} ${
                        parseFloat(technicals.macd.value) > 0 ? 'number-up' : 
                        parseFloat(technicals.macd.value) < -50 ? 'number-down' : ''
                      }`}>
                        {parseFloat(technicals.macd.value) > 0 ? '과열' : parseFloat(technicals.macd.value) < -50 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>추세</span>
                      <span className={`${styles.phaseStatusValue} ${
                        etf.price > technicals.movingAverages.ma50 ? 'number-up' : 'number-down'
                      }`}>
                        {etf.price > technicals.movingAverages.ma50 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className={styles.phaseMetric}>
                      <span className={styles.phaseMetricLabel}>MACD</span>
                      <span className={styles.phaseMetricValue}>{parseFloat(technicals.macd.value).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* 장기 국면 */}
                <div className={styles.phaseItem}>
                  <div className={styles.phaseItemHeader}>
                    <span className={styles.phaseLabel}>장기</span>
                    <span className={styles.phasePeriod}>50-200일</span>
                  </div>
                  <div className={styles.phaseItemContent}>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>국면</span>
                      <span className={`${styles.phaseStatusValue} ${
                        etf.price > technicals.movingAverages.ma200 * 1.2 ? 'number-up' : 
                        etf.price < technicals.movingAverages.ma200 * 0.8 ? 'number-down' : ''
                      }`}>
                        {etf.price > technicals.movingAverages.ma200 * 1.2 ? '과열' : 
                         etf.price < technicals.movingAverages.ma200 * 0.8 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className={styles.phaseStatus}>
                      <span className={styles.phaseStatusLabel}>추세</span>
                      <span className={`${styles.phaseStatusValue} ${
                        etf.price > technicals.movingAverages.ma200 ? 'number-up' : 'number-down'
                      }`}>
                        {etf.price > technicals.movingAverages.ma200 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className={styles.phaseMetric}>
                      <span className={styles.phaseMetricLabel}>괴리율</span>
                      <span className={`${styles.phaseMetricValue} ${
                        etf.price > technicals.movingAverages.ma200 ? 'number-up' : 'number-down'
                      }`}>
                        {((etf.price - technicals.movingAverages.ma200) / technicals.movingAverages.ma200 * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* 핵심 위험 지표 */}
          <Card className={styles.section}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionTitleWrapper}>
                <Shield size={18} />
                <h3 className={styles.sectionTitle}>위험 분석</h3>
              </div>
              <p className={styles.sectionDescription}>변동성, 샤프비율, 베타, MDD 등 핵심 위험 지표를 평가합니다</p>
            </div>
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
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionTitleWrapper}>
                <TrendingUp size={18} />
                <h3 className={styles.sectionTitle}>시장 캡처</h3>
              </div>
              <p className={styles.sectionDescription}>상승장과 하락장에서 시장 대비 수익률 민감도를 보여줍니다</p>
            </div>
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
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionTitleWrapper}>
                <Zap size={18} />
                <h3 className={styles.sectionTitle}>고급 지표</h3>
              </div>
              <p className={styles.sectionDescription}>알파, R², 소르티노, VaR 등 전문적인 투자 지표를 제공합니다</p>
            </div>
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
          
          {/* 연관도 */}
          {(correlatedETFs.positive.length > 0 || correlatedETFs.negative.length > 0) && (
            <Card className={styles.section}>
              <div className={styles.sectionHeaderWrapper}>
                <div className={styles.sectionTitleWrapper}>
                  <Activity size={18} />
                  <h3 className={styles.sectionTitle}>연관도</h3>
                </div>
                <p className={styles.sectionDescription}>이 ETF와 같거나 반대 방향으로 움직이는 ETF를 분석합니다</p>
              </div>
              
              {correlatedETFs.positive.length > 0 && (
                <div className={`${styles.correlationGroup} ${styles.positiveGroup}`}>
                  <h4 className={styles.correlationGroupTitle}>
                    <TrendingUp size={16} />
                    같은 방향 (양의 상관관계)
                  </h4>
                  <div className={styles.correlationList}>
                    {correlatedETFs.positive.slice(0, 5).map((r: any) => (
                      <button key={r.id} className={styles.correlationItem} onClick={() => navigate(`/etf/${r.id}`)}>
                        <div className={styles.correlationLeft}>
                          <span className={styles.correlationName}>{r.name}</span>
                          <span className={styles.correlationTicker}>{r.ticker}</span>
                        </div>
                        <div className={styles.correlationRight}>
                          <span className={styles.correlationValue}>
                            {(r.correlation * 100).toFixed(0)}%
                          </span>
                          <span className={styles.correlationPrice}>{formatPrice(r.price)}원</span>
                          <span className={getChangeClass(r.changePercent)}>{formatPercent(r.changePercent)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {correlatedETFs.negative.length > 0 && (
                <div className={`${styles.correlationGroup} ${styles.negativeGroup}`}>
                  <h4 className={styles.correlationGroupTitle}>
                    <TrendingDown size={16} />
                    반대 방향 (음의 상관관계)
                  </h4>
                  <div className={styles.correlationList}>
                    {correlatedETFs.negative.slice(0, 5).map((r: any) => (
                      <button key={r.id} className={styles.correlationItem} onClick={() => navigate(`/etf/${r.id}`)}>
                        <div className={styles.correlationLeft}>
                          <span className={styles.correlationName}>{r.name}</span>
                          <span className={styles.correlationTicker}>{r.ticker}</span>
                        </div>
                        <div className={styles.correlationRight}>
                          <span className={styles.correlationValue}>
                            {(r.correlation * 100).toFixed(0)}%
                          </span>
                          <span className={styles.correlationPrice}>{formatPrice(r.price)}원</span>
                          <span className={getChangeClass(r.changePercent)}>{formatPercent(r.changePercent)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.correlationNote}>
                <strong>상관도란?</strong> 두 ETF의 가격이 얼마나 비슷하게 움직이는지를 나타내는 지표입니다. 
                100%에 가까울수록 같은 방향으로 움직이고, -100%에 가까울수록 반대 방향으로 움직입니다. 
                포트폴리오 분산 투자 시 상관도가 낮은 ETF를 함께 보유하면 리스크를 줄일 수 있습니다.
              </div>
            </Card>
          )}
        </TabPanel>
        
        {/* 뉴스 탭 */}
        <TabPanel value="news" className={styles.tabContent}>
          {relatedNews.length > 0 ? (
            <Card className={styles.section}>
              <div className={styles.sectionTitleWrapper}>
                <Newspaper size={18} />
                <h3 className={styles.sectionTitle}>관련 뉴스</h3>
              </div>
              <div className={styles.newsList}>
                {relatedNews.map((news) => (
                  <a key={news.id} href={news.url} className={styles.newsItem} target="_blank" rel="noopener noreferrer">
                    <span className={styles.newsTitle}>{news.title}</span>
                    <span className={styles.newsMeta}>{news.source} · {news.date}</span>
                  </a>
                ))}
              </div>
            </Card>
          ) : (
            <Card className={styles.emptyState}>
              <p>최근 뉴스가 없습니다.</p>
            </Card>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
