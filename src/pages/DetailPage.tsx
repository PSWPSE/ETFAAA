import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, Share2, TrendingUp, TrendingDown, Activity, Calculator, Clock, Target, Zap, Shield, Users, Info, PieChart as PieChartIcon, Globe, List, DollarSign, BarChart3, Calendar, Layers, Newspaper } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, ReferenceLine } from 'recharts';
import { Card, Button, Badge } from '../components/common';
import { Tabs, TabList, Tab, TabPanel } from '../components/common';
import { getETFById, getPriceHistory, getReturns, getHoldings, getDividends, getRiskMetrics, getExtendedETFInfo, getSectorAllocation, getAssetAllocation, getCountryAllocation, getDividendChartData, getDividendForecast, getExtendedRiskMetrics, getMonthlyReturns, getTechnicalIndicators, getTaxInfo, getRelatedNews, getCostAnalysis, getCorrelatedETFs } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPercent, formatLargeNumber, formatDate, getChangeClass, formatPriceByMarket, formatLargeNumberByMarket, getMarketFromETFId } from '../utils/format';

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-md text-text-secondary">
        <p>ETF를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/search')}>ETF 검색하기</Button>
      </div>
    );
  }

  const etf = getExtendedETFInfo(baseEtf);
  const etfMarket = getMarketFromETFId(etf.id);
  const priceHistory = getPriceHistory(etf.id, 365);
  const returns = getReturns(etf.id);
  const holdings = getHoldings(etf.id);
  const dividends = getDividends(etf.id);
  const riskMetrics = getRiskMetrics(etf.id);
  const correlatedETFs = getCorrelatedETFs(etf.id, 5);

  const sectorAllocation = getSectorAllocation(etf.id);
  const assetAllocation = getAssetAllocation(etf.id);
  const countryAllocation = getCountryAllocation(etf.id);
  const dividendChartData = getDividendChartData(etf.id);
  const dividendForecast = getDividendForecast(etf.id);
  const extendedRiskMetrics = getExtendedRiskMetrics(etf.id);
  const monthlyReturns = getMonthlyReturns(etf.id);

  const technicals = getTechnicalIndicators(etf.id);
  const taxInfo = getTaxInfo(etf.id);
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
    <div className="flex flex-col gap-lg md:gap-[48px] p-md md:p-[32px_48px] lg:p-2xl pb-[180px] md:pb-[200px]">
      {/* 헤더 - ETF 기본 정보 */}
      <Card className="!p-[24px_32px] max-md:!p-md">
        <div className="flex justify-between items-center gap-xl md:gap-2xl mb-xl md:mb-md pb-lg md:pb-md border-b border-border-light max-md:flex-row max-md:items-start max-md:gap-sm">
          {/* 왼쪽: ETF 정보 */}
          <div className="flex-1 min-w-0 max-md:flex-1">
            <div className="flex items-center gap-3 mb-2 max-md:gap-1.5 max-md:flex-wrap max-md:items-baseline max-md:mb-1.5">
              <h1 className="text-2xl font-extrabold text-text-primary leading-tight tracking-tight flex-shrink-0 max-md:text-[17px] max-md:leading-[1.3]">{etf.name}</h1>
              <div className="flex items-center gap-1.5 flex-shrink-0 max-md:gap-1 [&>*]:text-[11px] [&>*]:px-2 [&>*]:py-[3px] [&>*]:font-semibold max-md:[&>*]:text-[10px] max-md:[&>*]:px-1.5 max-md:[&>*]:py-0.5">
                <Badge variant="default">{etf.ticker}</Badge>
                {etf.leverage && etf.leverage !== 1 && (
                  <Badge variant={etf.leverage > 0 ? 'success' : 'danger'}>
                    {etf.leverage > 0 ? `${etf.leverage}X` : `인버스`}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mt-1 max-md:text-xs max-md:gap-1.5 max-md:flex-wrap">
              <span className="font-semibold text-text-primary">{etf.issuer}</span>
              {(etf.personalPension || etf.retirementPension) && (
                <>
                  <span className="text-border-light">·</span>
                  <div className="flex items-center gap-1.5 max-md:gap-1">
                    {etf.personalPension && (
                      <span className="inline-flex items-center px-2 py-[3px] text-[11px] font-bold text-primary bg-gradient-to-br from-[rgba(30,58,95,0.08)] to-[rgba(30,58,95,0.12)] border border-[rgba(30,58,95,0.2)] rounded-md tracking-tight transition-all duration-fast hover:bg-gradient-to-br hover:from-[rgba(30,58,95,0.12)] hover:to-[rgba(30,58,95,0.16)] hover:border-[rgba(30,58,95,0.3)] hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(30,58,95,0.1)] max-md:text-[10px] max-md:px-1.5 max-md:py-0.5">개인연금</span>
                    )}
                    {etf.retirementPension && (
                      <span className="inline-flex items-center px-2 py-[3px] text-[11px] font-bold text-primary bg-gradient-to-br from-[rgba(30,58,95,0.08)] to-[rgba(30,58,95,0.12)] border border-[rgba(30,58,95,0.2)] rounded-md tracking-tight transition-all duration-fast hover:bg-gradient-to-br hover:from-[rgba(30,58,95,0.12)] hover:to-[rgba(30,58,95,0.16)] hover:border-[rgba(30,58,95,0.3)] hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(30,58,95,0.1)] max-md:text-[10px] max-md:px-1.5 max-md:py-0.5">퇴직연금</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 오른쪽: 가격 정보 */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 max-md:gap-1">
            <div className="flex items-baseline gap-1 max-md:gap-[3px]">
              <span className="font-numeric text-[26px] font-extrabold text-text-primary tracking-tight leading-none max-md:text-xl">{formatPriceByMarket(etf.price, etfMarket)}</span>
            </div>
            <div className={`inline-flex items-center flex-shrink-0 ${getChangeClass(etf.changePercent)}`}>
              <span className="font-numeric text-sm font-bold max-md:text-xs">{formatPercent(etf.changePercent)}</span>
            </div>
          </div>
        </div>

        {/* 가격 차트 */}
        <div className="mb-lg p-lg bg-bg rounded-md border border-border-light max-md:p-md max-md:mb-md">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-xs max-md:gap-1.5 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
              <TrendingUp size={18} />
              <h3 className="text-base font-extrabold text-text-primary tracking-tight max-md:text-sm">가격 차트</h3>
            </div>
            <div className="flex gap-1.5 bg-bg p-1 rounded-[10px] border border-border-light max-md:gap-1 max-md:p-[3px]">
              {CHART_PERIODS.map((period) => (
                <button
                  key={period.value}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[7px] transition-all duration-200 tracking-tight min-w-[38px] border-none bg-transparent cursor-pointer max-md:px-2.5 max-md:py-[5px] max-md:text-[11px] max-md:min-w-[34px] ${
                    chartPeriod === period.value
                      ? 'text-white bg-gradient-to-br from-primary to-[#2a4a6f] shadow-[0_2px_6px_rgba(30,58,95,0.2)]'
                      : 'text-text-tertiary hover:text-text-secondary hover:bg-[rgba(30,58,95,0.04)]'
                  }`}
                  onClick={() => setChartPeriod(period.value)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mx-[-8px] relative">
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
                  formatter={(value: number) => [`${formatPriceByMarket(value, etfMarket)}`, '가격']}
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
                    value: `${formatPriceByMarket(etf.price, etfMarket)}`,
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
                            {`${formatPriceByMarket(etf.price, etfMarket)}`}
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
          <div className="flex items-center gap-1.5 mt-md pt-sm border-t border-border-light text-xs text-text-tertiary [&>svg]:flex-shrink-0">
            <Clock size={12} />
            <span>Last | {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>

        {/* 핵심 지표 */}
        <div className="grid grid-cols-4 gap-2.5 mb-lg max-md:grid-cols-2 max-md:gap-2 max-md:mb-md">
          <div className="flex flex-col items-center text-center gap-1 p-3 bg-bg rounded-md border border-border-light transition-all duration-fast hover:bg-bg-secondary hover:border-border max-md:p-2.5">
            <div className="text-[10px] font-semibold text-text-tertiary tracking-wide leading-tight mb-1 text-center w-full max-md:text-[9px] max-md:mb-1">{periodReturn.label}</div>
            <div className={`font-numeric text-base font-bold leading-none text-center w-full max-md:text-[15px] ${getChangeClass(periodReturn.value)}`}>
              {periodReturn.value >= 0 ? '+' : ''}{periodReturn.value.toFixed(1)}%
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-1 p-3 bg-bg rounded-md border border-border-light transition-all duration-fast hover:bg-bg-secondary hover:border-border max-md:p-2.5">
            <div className="text-[10px] font-semibold text-text-tertiary tracking-wide leading-tight mb-1 text-center w-full max-md:text-[9px] max-md:mb-1">배당수익률</div>
            <div className="font-numeric text-base font-bold text-text-primary leading-none text-center w-full max-md:text-[15px]">{etf.dividendYield}%</div>
          </div>
          <div className="flex flex-col items-center text-center gap-1 p-3 bg-bg rounded-md border border-border-light transition-all duration-fast hover:bg-bg-secondary hover:border-border max-md:p-2.5">
            <div className="text-[10px] font-semibold text-text-tertiary tracking-wide leading-tight mb-1 text-center w-full max-md:text-[9px] max-md:mb-1">총보수</div>
            <div className="font-numeric text-base font-bold text-text-primary leading-none text-center w-full max-md:text-[15px]">{etf.expenseRatio}%</div>
          </div>
          <div className="flex flex-col items-center text-center gap-1 p-3 bg-bg rounded-md border border-border-light transition-all duration-fast hover:bg-bg-secondary hover:border-border max-md:p-2.5">
            <div className="text-[10px] font-semibold text-text-tertiary tracking-wide leading-tight mb-1 text-center w-full max-md:text-[9px] max-md:mb-1">순자산</div>
            <div className="font-numeric text-base font-bold text-text-primary leading-none text-center w-full max-md:text-[15px]">{formatLargeNumberByMarket(etf.aum, etfMarket)}</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2.5 max-md:flex-nowrap max-md:gap-2 [&>button:first-child]:min-w-[100px] max-md:[&>button]:flex-1 max-md:[&>button]:min-w-0 max-md:[&>button]:px-3 max-md:[&>button:first-child]:min-w-[90px]">
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
      <Tabs defaultTab="overview" className="bg-white rounded-2xl overflow-visible shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-border">
        <TabList variant="underline">
          <Tab value="overview">개요</Tab>
          <Tab value="holdings">구성종목</Tab>
          <Tab value="dividend">배당</Tab>
          <Tab value="deep-analysis">심층 분석</Tab>
          <Tab value="news">뉴스</Tab>
        </TabList>

        {/* 개요 탭 */}
        <TabPanel value="overview" className="flex flex-col gap-md p-md max-md:gap-lg">
          {/* 투자 포인트 */}
          {investmentPoints.length > 0 && (
            <Card className="!p-[24px_32px] bg-gradient-to-br from-white to-[#fafbfc] border-[1.5px] border-border-light max-md:!p-md">
              <div className="flex items-center gap-xs mb-lg max-md:gap-1.5 max-md:mb-sm [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Activity size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight max-md:text-sm">핵심 키워드</h3>
              </div>
              <div className="flex flex-wrap gap-2 p-0 max-md:gap-1.5">
                {investmentPoints.map((point, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-[18px] py-[9px] bg-gradient-to-br from-[rgba(30,58,95,0.06)] to-[rgba(30,58,95,0.1)] border-[1.5px] border-[rgba(30,58,95,0.18)] rounded-full text-[13px] font-bold text-text-primary whitespace-nowrap transition-all duration-fast shadow-[0_2px_4px_rgba(30,58,95,0.04)] hover:bg-gradient-to-br hover:from-[rgba(30,58,95,0.1)] hover:to-[rgba(30,58,95,0.14)] hover:border-[rgba(30,58,95,0.28)] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(30,58,95,0.08)] max-md:px-3.5 max-md:py-[7px] max-md:text-xs max-md:gap-[5px] [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-[13px] max-md:[&>svg]:h-[13px]">
                    <point.icon size={14} />
                    <span>{point.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 투자전략 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
              <Target size={18} />
              <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">투자전략</h3>
            </div>
            <p className="text-sm font-medium text-text-secondary leading-relaxed m-0 p-md bg-[rgba(250,251,252,0.6)] rounded-md border-l-[3px] border-l-primary max-md:text-[13px] max-md:p-sm max-md:leading-normal">
              {etf.investmentStrategy}
            </p>
          </Card>

          {/* 기본 정보 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
              <Info size={18} />
              <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">기본 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-md">
              {[
                { label: '운용사', value: etf.issuer },
                { label: '상장일', value: formatDate(etf.inceptionDate) },
                { label: '기초자산', value: etf.category },
                { label: '추적지수', value: etf.trackingIndex },
                { label: '시가총액', value: formatLargeNumberByMarket(etf.marketCap, etfMarket) },
                { label: '순자산(AUM)', value: formatLargeNumberByMarket(etf.marketCap * 1.005, etfMarket) },
                { label: '상장주식수', value: `${formatLargeNumber(sharesOutstanding)}주` },
                { label: '구성종목수', value: `${holdings.length}종목` },
                { label: '레버리지', value: etf.leverage && etf.leverage !== 1 ? (etf.leverage > 0 ? `${etf.leverage}배` : '인버스') : '1배' },
                { label: '거래소', value: etf.listingExchange },
                { label: 'NAV', value: `${formatPriceByMarket(etf.nav, etfMarket)}` },
                { label: 'NAV 괴리율', value: navPremium, isChange: true },
                { label: '거래량', value: formatLargeNumber(etf.volume) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-sm border-b border-border-light [&:nth-last-child(-n+2)]:border-b-0">
                  <span className="text-sm text-text-tertiary">{item.label}</span>
                  <span className={`text-sm font-semibold text-right ${item.isChange ? getChangeClass(item.value as number) : 'text-text-primary'}`}>
                    {item.isChange ? `${(item.value as number) >= 0 ? '+' : ''}${(item.value as number).toFixed(2)}%` : item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 비용 & 세금 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
              <Calculator size={18} />
              <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">비용 & 세금</h3>
            </div>
            <div className="grid grid-cols-2 gap-md">
              {costAnalysis && (
                <>
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">총보수율</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{(costAnalysis.ter * 0.9).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">TER</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{costAnalysis.ter}%</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">실부담비용률</span>
                    <span className="text-sm font-bold text-primary text-right">{costAnalysis.totalCost}%</span>
                  </div>
                </>
              )}
              {taxInfo && (
                <>
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">증권거래세</span>
                    <span className="text-sm font-semibold text-text-primary text-right">비과세</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light [&:nth-last-child(-n+2)]:border-b-0">
                    <span className="text-sm text-text-tertiary">매매차익</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{taxInfo.capitalGainsDistribution}</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light [&:nth-last-child(-n+2)]:border-b-0">
                    <span className="text-sm text-text-tertiary">현금배당</span>
                    <span className="text-sm font-semibold text-text-primary text-right">배당소득세 {taxInfo.dividendTaxRate}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabPanel>

        {/* 구성종목 탭 */}
        <TabPanel value="holdings" className="flex flex-col gap-md p-md max-md:gap-lg">
          {/* 자산/섹터 비중 */}
          <div className="grid grid-cols-2 gap-lg max-md:grid-cols-1 max-md:gap-md">
            {/* 자산 비중 */}
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Layers size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">자산 비중</h3>
              </div>
              <div className="flex gap-md items-center">
                <div className="w-[140px] flex-shrink-0">
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
                <div className="flex-1 flex flex-col gap-sm">
                  {assetAllocation.map((asset, i) => (
                    <div key={asset.name} className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="flex-1 text-sm text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</span>
                      <span className="text-sm font-semibold text-text-primary">{asset.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 섹터 비중 */}
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <PieChartIcon size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">섹터 비중</h3>
              </div>
              <div className="flex gap-md items-center">
                <div className="w-[140px] flex-shrink-0">
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
                <div className="flex-1 flex flex-col gap-sm">
                  {sectorAllocation.slice(0, 5).map((sector, i) => (
                    <div key={sector.name} className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="flex-1 text-sm text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{sector.name}</span>
                      <span className="text-sm font-semibold text-text-primary">{sector.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 국가 비중 */}
          {countryAllocation.length > 1 && (
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Globe size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">국가 비중</h3>
              </div>
              <div className="flex flex-col gap-md">
                {countryAllocation.slice(0, 5).map((country, i) => (
                  <div key={country.code} className="flex items-center gap-sm">
                    <span className="w-[60px] text-sm text-text-secondary flex-shrink-0">{country.name}</span>
                    <div className="flex-1 h-2 bg-bg-secondary rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${country.weight}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                    <span className="w-10 text-sm font-semibold text-text-primary text-right">{country.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 상위 종목 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-xs [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <List size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">상위 종목</h3>
              </div>
              <span className="text-xs text-text-tertiary">{holdings.length}개 보유</span>
            </div>
            <div className="flex flex-col gap-0">
              {holdings.slice(0, 10).map((h, i) => (
                <div key={h.ticker} className="flex items-center justify-between py-sm bg-transparent border-b border-border-light transition-all duration-fast last:border-b-0 hover:bg-bg max-md:py-xs">
                  <span className="text-[11px] font-semibold text-text-tertiary flex-shrink-0 min-w-5 text-left max-md:text-[10px] max-md:min-w-[18px]">{i + 1}</span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 ml-xs">
                    <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-md:text-[13px]">{h.name}</span>
                    <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">{h.ticker}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary flex-shrink-0 min-w-[50px] text-right max-md:text-[13px] max-md:min-w-[45px]">{h.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>

        {/* 배당 탭 */}
        <TabPanel value="dividend" className="flex flex-col gap-md p-md max-md:gap-lg">
          {dividends.length > 0 ? (
            <>
              {/* 배당 요약 */}
              <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
                <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                  <DollarSign size={18} />
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">배당 정보</h3>
                </div>
                <div className="flex items-center justify-between p-md bg-bg rounded-md mt-md mb-xl">
                  <div className="flex flex-col">
                    <span className="font-numeric text-2xl font-bold text-primary">{etf.dividendYield}%</span>
                    <span className="text-xs text-text-tertiary">연간 배당수익률</span>
                  </div>
                  {dividendForecast && (
                    <div className="flex items-center gap-xs px-sm py-xs bg-white rounded-full text-sm font-semibold text-text-secondary">
                      <Clock size={14} />
                      <span>D-{dividendForecast.daysUntilEx}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">배당주기</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{dividendForecast?.frequency || '분기배당'}</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light">
                    <span className="text-sm text-text-tertiary">최근 배당</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{formatPriceByMarket(dividends[0]?.amount || 0, etfMarket)}</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light [&:nth-last-child(-n+2)]:border-b-0">
                    <span className="text-sm text-text-tertiary">다음 매수 마감일</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{dividendForecast?.nextExDate || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-sm border-b border-border-light [&:nth-last-child(-n+2)]:border-b-0">
                    <span className="text-sm text-text-tertiary">다음 배당 예상금액</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{formatPriceByMarket(dividendForecast?.estimatedAmount || 0, etfMarket)}</span>
                  </div>
                </div>
              </Card>

              {/* 배당 추이 */}
              {dividendChartData.length > 0 && (
                <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
                  <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                    <BarChart3 size={18} />
                    <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">배당금 추이</h3>
                  </div>
                  <div className="mx-[-8px]">
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={dividendChartData} margin={{ top: 10, right: 5, bottom: 0, left: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value: number) => [`${formatPriceByMarket(value, etfMarket)}`, '배당금']}
                          contentStyle={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '11px' }}
                        />
                        <Bar dataKey="amount" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* 배당 이력 */}
              <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
                <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                  <Clock size={18} />
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">배당 이력</h3>
                </div>
                <div className="flex flex-col gap-0">
                  {dividends.slice(0, 6).map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-md border-b border-border-light last:border-b-0">
                      <span className="text-sm text-text-secondary">{d.exDate}</span>
                      <span className="text-sm font-semibold text-text-primary">{formatPriceByMarket(d.amount, etfMarket)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="!p-xl text-center text-text-tertiary">
              <p>배당 정보가 없습니다.</p>
            </Card>
          )}
        </TabPanel>

        {/* 심층 분석 탭 */}
        <TabPanel value="deep-analysis" className="flex flex-col gap-md p-md max-md:gap-lg">
          {/* 기간별 수익률 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <TrendingUp size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">기간별 수익률</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">다양한 기간의 수익률을 비교하여 단기 및 장기 성과를 평가합니다</p>
            </div>
            <div className="grid grid-cols-5 gap-sm max-md:grid-cols-3 max-md:gap-xs">
              {[
                { label: '1개월', value: returns.month1 },
                { label: '3개월', value: returns.month3 },
                { label: '6개월', value: returns.month6 },
                { label: '1년', value: returns.year1 },
                { label: 'YTD', value: returns.ytd },
              ].map(item => (
                <div key={item.label} className="text-center p-md bg-bg rounded-md transition-all duration-200 hover:bg-[rgba(250,251,252,0.8)] hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] max-md:p-sm">
                  <span className="block text-[10px] text-text-tertiary mb-1 max-md:text-[9px] max-md:mb-0.5">{item.label}</span>
                  <span className={`text-sm font-bold max-md:text-xs ${getChangeClass(item.value)}`}>
                    {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 월별 수익률 히트맵 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Calendar size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">월별 수익률</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">월별 수익률을 한눈에 파악할 수 있습니다. 양수는 녹색, 음수는 빨간색으로 표시됩니다</p>
            </div>
            <div className="flex flex-col gap-0.5 overflow-x-auto max-md:mx-[-16px] max-md:px-md">
              <div className="grid grid-cols-[60px_repeat(12,minmax(52px,1fr))] gap-0.5 mb-0.5 max-md:grid-cols-[50px_repeat(12,minmax(48px,1fr))]">
                <div className="flex items-center justify-center p-[10px_4px] text-text-tertiary text-[10px] font-bold bg-bg rounded-sm max-md:p-[8px_3px] max-md:text-[9px]"></div>
                {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map(m => (
                  <div key={m} className="flex items-center justify-center p-[10px_4px] text-text-tertiary text-[10px] font-bold bg-bg rounded-sm max-md:p-[6px_3px] max-md:text-[9px]">{m}</div>
                ))}
              </div>
              {monthlyReturns.slice(0, 3).map((yearData) => (
                <div key={yearData.year} className="grid grid-cols-[60px_repeat(12,minmax(52px,1fr))] gap-0.5 max-md:grid-cols-[50px_repeat(12,minmax(48px,1fr))]">
                  <div className="flex items-center justify-center p-[10px_4px] text-[11px] font-bold bg-bg text-text-primary rounded-sm max-md:p-[8px_3px] max-md:text-xs">{yearData.year}</div>
                  {yearData.returns.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center p-[10px_4px] text-[11px] font-semibold rounded-sm transition-all duration-fast cursor-default border border-transparent hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.08)] hover:z-[1] max-md:p-[8px_3px] max-md:text-[10px]"
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

            <div className="grid grid-cols-4 gap-2 mt-md pt-md border-t border-border-light max-md:gap-1.5 max-md:mt-sm max-md:pt-sm">
              <div className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                <span className="block text-[10px] font-semibold text-text-tertiary mb-1 tracking-tight whitespace-nowrap">월간 최고</span>
                <span className="font-numeric text-sm font-bold text-success">
                  +{monthlyStats.max.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                <span className="block text-[10px] font-semibold text-text-tertiary mb-1 tracking-tight whitespace-nowrap">월간 최저</span>
                <span className="font-numeric text-sm font-bold text-danger">
                  {monthlyStats.min.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                <span className="block text-[10px] font-semibold text-text-tertiary mb-1 tracking-tight whitespace-nowrap">월간 평균</span>
                <span className={`font-numeric text-sm font-bold ${monthlyStats.avg >= 0 ? 'text-success' : 'text-danger'}`}>
                  {monthlyStats.avg >= 0 ? '+' : ''}{monthlyStats.avg.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                <span className="block text-[10px] font-semibold text-text-tertiary mb-1 tracking-tight whitespace-nowrap">변동성</span>
                <span className="font-numeric text-sm font-bold text-text-primary">
                  {monthlyStats.stdDev.toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          {/* 52주 가격 범위 */}
          <Card className="!p-[24px_32px] max-md:!p-md">
            <div className="flex items-start justify-between mb-lg gap-md max-md:mb-md max-md:gap-sm">
              <div className="flex-1 flex flex-col gap-1.5 max-md:gap-1">
                <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                  <Activity size={18} />
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">52주 가격 범위</h3>
                </div>
                <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">
                  현재 가격이 52주 최저가와 최고가 사이 어디에 위치하는지 보여줍니다
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0 max-md:gap-0.5 before:content-['현재_위치'] before:text-[11px] before:font-semibold before:text-text-tertiary before:uppercase before:tracking-wide max-md:before:text-[10px]">
                <span className="text-xl font-extrabold text-primary tracking-tight max-md:text-lg">{pricePosition.toFixed(0)}%</span>
              </div>
            </div>
            <div className="relative mb-md py-sm max-md:mb-sm max-md:py-2.5">
              <div
                className="relative h-3 rounded-md overflow-visible max-md:h-2.5"
                style={{
                  background: 'linear-gradient(to right, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 25%, rgba(34, 197, 94, 0.15) 50%, rgba(34, 197, 94, 0.15) 75%, rgba(245, 158, 11, 0.15) 100%)',
                  '--fill-width': `${pricePosition}%`
                } as any}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${pricePosition}%`,
                    background: 'linear-gradient(90deg, rgba(30, 58, 95, 0.15) 0%, rgba(30, 58, 95, 0.25) 100%)'
                  }}
                />
                <div
                  className="absolute top-1/2 w-5 h-5 bg-white border-[3px] border-primary rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_3px_10px_rgba(30,58,95,0.3),0_0_0_4px_rgba(30,58,95,0.1)] transition-all duration-300 z-[2] max-md:w-[18px] max-md:h-[18px] max-md:border-[2.5px] max-md:shadow-[0_2px_8px_rgba(30,58,95,0.25),0_0_0_3px_rgba(30,58,95,0.08)] before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-2 before:h-2 before:bg-primary before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 max-md:before:w-[7px] max-md:before:h-[7px]"
                  style={{ left: `${pricePosition}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs gap-sm max-md:gap-xs">
              <span className="inline-flex items-center gap-1 font-bold text-text-primary px-2.5 py-1 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-full text-[11px] whitespace-nowrap before:content-['최저'] before:text-[9px] before:text-[rgba(239,68,68,0.7)] before:font-semibold before:mr-0.5 max-md:px-2 max-md:py-[3px] max-md:text-[10px] max-md:before:text-[8px]">
                {formatPriceByMarket(etf.low52w || 0, etfMarket)}
              </span>
              <span className="inline-flex items-center justify-center px-4 py-[7px] text-sm font-extrabold text-white bg-gradient-to-br from-primary to-[#2a4a6f] rounded-full shadow-[0_3px_8px_rgba(30,58,95,0.25)] tracking-tight max-md:px-3 max-md:py-1.5 max-md:text-xs">
                {formatPriceByMarket(etf.price, etfMarket)}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-text-primary px-2.5 py-1 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-full text-[11px] whitespace-nowrap before:content-['최고'] before:text-[9px] before:text-[rgba(34,197,94,0.7)] before:font-semibold before:mr-0.5 max-md:px-2 max-md:py-[3px] max-md:text-[10px] max-md:before:text-[8px]">
                {formatPriceByMarket(etf.high52w || 0, etfMarket)}
              </span>
            </div>
          </Card>

          {/* 국면 분석 */}
          {technicals && (
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
                <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                  <Activity size={18} />
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">국면 분석</h3>
                </div>
                <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">단기, 중기, 장기 시장 국면을 종합적으로 분석합니다</p>
              </div>

              <div className="grid grid-cols-3 gap-sm max-md:grid-cols-1 max-md:gap-sm">
                {/* 단기 국면 */}
                <div className="flex flex-col p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                  <div className="flex items-center justify-between pb-xs mb-sm border-b border-border-light">
                    <span className="text-base font-bold text-text-primary max-md:text-sm">단기</span>
                    <span className="text-[10px] font-semibold text-text-tertiary max-md:text-[9px]">5-20일</span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">국면</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        technicals.rsi >= 70 ? 'text-success' :
                        technicals.rsi <= 30 ? 'text-danger' : ''
                      }`}>
                        {technicals.rsi >= 70 ? '과열' : technicals.rsi <= 30 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">추세</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        etf.price > technicals.movingAverages.ma20 ? 'text-success' : 'text-danger'
                      }`}>
                        {etf.price > technicals.movingAverages.ma20 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 mt-1 border-t border-border-light max-md:py-1.5">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide max-md:text-[10px]">RSI</span>
                      <span className="text-sm font-bold text-text-primary max-md:text-[13px]">{technicals.rsi}</span>
                    </div>
                  </div>
                </div>

                {/* 중기 국면 */}
                <div className="flex flex-col p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                  <div className="flex items-center justify-between pb-xs mb-sm border-b border-border-light">
                    <span className="text-base font-bold text-text-primary max-md:text-sm">중기</span>
                    <span className="text-[10px] font-semibold text-text-tertiary max-md:text-[9px]">20-50일</span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">국면</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        parseFloat(technicals.macd.value) > 0 ? 'text-success' :
                        parseFloat(technicals.macd.value) < -50 ? 'text-danger' : ''
                      }`}>
                        {parseFloat(technicals.macd.value) > 0 ? '과열' : parseFloat(technicals.macd.value) < -50 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">추세</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        etf.price > technicals.movingAverages.ma50 ? 'text-success' : 'text-danger'
                      }`}>
                        {etf.price > technicals.movingAverages.ma50 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 mt-1 border-t border-border-light max-md:py-1.5">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide max-md:text-[10px]">MACD</span>
                      <span className="text-sm font-bold text-text-primary max-md:text-[13px]">{parseFloat(technicals.macd.value).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* 장기 국면 */}
                <div className="flex flex-col p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                  <div className="flex items-center justify-between pb-xs mb-sm border-b border-border-light">
                    <span className="text-base font-bold text-text-primary max-md:text-sm">장기</span>
                    <span className="text-[10px] font-semibold text-text-tertiary max-md:text-[9px]">50-200일</span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">국면</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        etf.price > technicals.movingAverages.ma200 * 1.2 ? 'text-success' :
                        etf.price < technicals.movingAverages.ma200 * 0.8 ? 'text-danger' : ''
                      }`}>
                        {etf.price > technicals.movingAverages.ma200 * 1.2 ? '과열' :
                         etf.price < technicals.movingAverages.ma200 * 0.8 ? '공포' : '중립'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">추세</span>
                      <span className={`text-sm font-semibold text-text-secondary max-md:text-[13px] ${
                        etf.price > technicals.movingAverages.ma200 ? 'text-success' : 'text-danger'
                      }`}>
                        {etf.price > technicals.movingAverages.ma200 ? '상승' : '하락'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 mt-1 border-t border-border-light max-md:py-1.5">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide max-md:text-[10px]">괴리율</span>
                      <span className={`text-sm font-bold max-md:text-[13px] ${
                        etf.price > technicals.movingAverages.ma200 ? 'text-success' : 'text-danger'
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
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Shield size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">위험 분석</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">변동성, 샤프비율, 베타, MDD 등 핵심 위험 지표를 평가합니다</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
              {[
                { label: '변동성', value: riskMetrics.volatility.toFixed(1), unit: '%', status: riskMetrics.volatility < 15 ? 'good' : riskMetrics.volatility < 25 ? 'mid' : 'bad', statusText: riskMetrics.volatility < 15 ? '낮음' : riskMetrics.volatility < 25 ? '보통' : '높음' },
                { label: '샤프비율', value: riskMetrics.sharpeRatio.toFixed(2), unit: '', status: riskMetrics.sharpeRatio >= 1 ? 'good' : riskMetrics.sharpeRatio >= 0.5 ? 'mid' : 'bad', statusText: riskMetrics.sharpeRatio >= 1 ? '양호' : riskMetrics.sharpeRatio >= 0.5 ? '보통' : '낮음' },
                { label: '베타', value: riskMetrics.beta.toFixed(2), unit: '', status: riskMetrics.beta <= 0.8 ? 'good' : riskMetrics.beta <= 1.2 ? 'mid' : 'bad', statusText: riskMetrics.beta <= 0.8 ? '방어적' : riskMetrics.beta <= 1.2 ? '중립' : '공격적' },
                { label: 'MDD', value: riskMetrics.maxDrawdown.toFixed(1), unit: '%', status: Math.abs(riskMetrics.maxDrawdown) < 15 ? 'good' : Math.abs(riskMetrics.maxDrawdown) < 30 ? 'mid' : 'bad', statusText: Math.abs(riskMetrics.maxDrawdown) < 15 ? '양호' : Math.abs(riskMetrics.maxDrawdown) < 30 ? '보통' : '주의' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-200 hover:bg-bg-secondary hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] max-md:p-sm">
                  <span className="block text-[10px] font-semibold text-text-tertiary mb-1 whitespace-nowrap">{item.label}</span>
                  <span className="inline-block text-sm font-bold text-text-primary mr-1">{item.value}{item.unit}</span>
                  <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap max-md:text-[8px] max-md:px-[5px] max-md:py-px ${
                    item.status === 'good' ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E]' :
                    item.status === 'mid' ? 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]' :
                    'bg-[rgba(239,68,68,0.1)] text-[#EF4444]'
                  }`}>
                    {item.statusText}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 시장 캡처 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <TrendingUp size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">시장 캡처</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">상승장과 하락장에서 시장 대비 수익률 민감도를 보여줍니다</p>
            </div>
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-xs text-sm text-text-secondary">
                  <TrendingUp size={14} />
                  <span>상승장 캡처</span>
                </div>
                <div className="h-2 bg-bg-secondary rounded overflow-hidden">
                  <div className="h-full bg-primary rounded" style={{ width: `${Math.min(Number(extendedRiskMetrics.upCapture), 100)}%` }} />
                </div>
                <span className="text-sm font-bold text-text-primary">{extendedRiskMetrics.upCapture}%</span>
              </div>
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-xs text-sm text-text-secondary">
                  <TrendingDown size={14} />
                  <span>하락장 캡처</span>
                </div>
                <div className="h-2 bg-bg-secondary rounded overflow-hidden">
                  <div className="h-full bg-text-tertiary rounded" style={{ width: `${Math.min(Number(extendedRiskMetrics.downCapture), 100)}%` }} />
                </div>
                <span className="text-sm font-bold text-text-primary">{extendedRiskMetrics.downCapture}%</span>
              </div>
            </div>
          </Card>

          {/* 고급 지표 */}
          <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
            <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Zap size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">고급 지표</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">알파, R², 소르티노, VaR 등 전문적인 투자 지표를 제공합니다</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-sm">
              {[
                { label: '알파', value: extendedRiskMetrics.alpha, isChange: true, suffix: '%' },
                { label: 'R²', value: extendedRiskMetrics.r2, isChange: false, suffix: '' },
                { label: '소르티노', value: extendedRiskMetrics.sortino, isChange: false, suffix: '' },
                { label: '트레이너', value: extendedRiskMetrics.treynorRatio, isChange: false, suffix: '' },
                { label: 'VaR 95%', value: extendedRiskMetrics.var95, isNegative: true, suffix: '%' },
                { label: 'CVaR 95%', value: extendedRiskMetrics.cvar95, isNegative: true, suffix: '%' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-md bg-bg rounded-md transition-all duration-fast hover:bg-bg-secondary hover:-translate-y-px max-md:p-sm">
                  <span className="block text-[10px] font-semibold text-text-tertiary mb-1">{item.label}</span>
                  <span className={`text-sm font-bold ${
                    item.isChange ? (Number(item.value) >= 0 ? 'text-success' : 'text-danger') :
                    item.isNegative ? 'text-danger' : 'text-text-primary'
                  }`}>
                    {item.isChange && Number(item.value) >= 0 ? '+' : ''}{item.isNegative ? '-' : ''}{item.value}{item.suffix}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 연관도 */}
          {(correlatedETFs.positive.length > 0 || correlatedETFs.negative.length > 0) && (
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex flex-col gap-1.5 mb-lg max-md:gap-0 max-md:mb-md">
                <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                  <Activity size={18} />
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">연관도</h3>
                </div>
                <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">이 ETF와 같거나 반대 방향으로 움직이는 ETF를 분석합니다</p>
              </div>

              {correlatedETFs.positive.length > 0 && (
                <div className="mb-lg p-md rounded-md border border-border-light bg-white border-[rgba(16,185,129,0.15)] last:mb-0 max-md:p-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#059669] mb-sm pb-xs border-b border-[rgba(16,185,129,0.2)] max-md:text-[13px] max-md:gap-1.5">
                    <TrendingUp size={16} />
                    같은 방향 (양의 상관관계)
                  </h4>
                  <div className="flex flex-col gap-0">
                    {correlatedETFs.positive.slice(0, 5).map((r: any) => (
                      <button key={r.id} className="flex items-center justify-between p-[8px_4px] mx-[-4px] bg-transparent border-0 border-b border-border-light rounded-sm text-left w-[calc(100%+8px)] transition-all duration-fast cursor-pointer last:border-b-0 hover:bg-[rgba(16,185,129,0.06)] max-md:p-[4px_0]" onClick={() => navigate(`/etf/${r.id}`)}>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-md:text-[13px]">{r.name}</span>
                          <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">{r.ticker}</span>
                        </div>
                        <div className="flex items-center gap-sm flex-shrink-0 max-md:gap-xs">
                          <span className="text-[11px] font-bold text-[#059669] min-w-[50px] text-right before:content-['상관도_'] before:text-[10px] before:font-medium before:opacity-70 max-md:text-[10px] max-md:min-w-8 max-md:before:hidden">
                            {(r.correlation * 100).toFixed(0)}%
                          </span>
                          <span className="text-sm font-semibold text-text-primary min-w-[70px] text-right max-md:text-[13px] max-md:min-w-[60px]">{formatPriceByMarket(r.price, etfMarket)}</span>
                          <span className={`text-xs font-semibold min-w-[50px] text-right max-md:text-[11px] max-md:min-w-[45px] ${getChangeClass(r.changePercent)}`}>{formatPercent(r.changePercent)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {correlatedETFs.negative.length > 0 && (
                <div className="mb-lg p-md rounded-md border border-border-light bg-white border-[rgba(59,130,246,0.15)] last:mb-0 max-md:p-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#2563eb] mb-sm pb-xs border-b border-[rgba(59,130,246,0.2)] max-md:text-[13px] max-md:gap-1.5">
                    <TrendingDown size={16} />
                    반대 방향 (음의 상관관계)
                  </h4>
                  <div className="flex flex-col gap-0">
                    {correlatedETFs.negative.slice(0, 5).map((r: any) => (
                      <button key={r.id} className="flex items-center justify-between p-[8px_4px] mx-[-4px] bg-transparent border-0 border-b border-border-light rounded-sm text-left w-[calc(100%+8px)] transition-all duration-fast cursor-pointer last:border-b-0 hover:bg-[rgba(59,130,246,0.06)] max-md:p-[4px_0]" onClick={() => navigate(`/etf/${r.id}`)}>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-md:text-[13px]">{r.name}</span>
                          <span className="text-xs font-medium text-text-tertiary max-md:text-[11px]">{r.ticker}</span>
                        </div>
                        <div className="flex items-center gap-sm flex-shrink-0 max-md:gap-xs">
                          <span className="text-[11px] font-bold text-[#2563eb] min-w-[50px] text-right before:content-['상관도_'] before:text-[10px] before:font-medium before:opacity-70 max-md:text-[10px] max-md:min-w-8 max-md:before:hidden">
                            {(r.correlation * 100).toFixed(0)}%
                          </span>
                          <span className="text-sm font-semibold text-text-primary min-w-[70px] text-right max-md:text-[13px] max-md:min-w-[60px]">{formatPriceByMarket(r.price, etfMarket)}</span>
                          <span className={`text-xs font-semibold min-w-[50px] text-right max-md:text-[11px] max-md:min-w-[45px] ${getChangeClass(r.changePercent)}`}>{formatPercent(r.changePercent)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-md p-[8px_16px] bg-bg rounded-sm text-xs text-text-secondary leading-normal border-l-[3px] border-l-primary">
                <strong>상관도란?</strong> 두 ETF의 가격이 얼마나 비슷하게 움직이는지를 나타내는 지표입니다.
                100%에 가까울수록 같은 방향으로 움직이고, -100%에 가까울수록 반대 방향으로 움직입니다.
                포트폴리오 분산 투자 시 상관도가 낮은 ETF를 함께 보유하면 리스크를 줄일 수 있습니다.
              </div>
            </Card>
          )}
        </TabPanel>

        {/* 뉴스 탭 */}
        <TabPanel value="news" className="flex flex-col gap-md p-md max-md:gap-lg">
          {relatedNews.length > 0 ? (
            <Card className="!p-[24px_32px] max-w-full overflow-x-hidden mb-lg max-md:!p-md">
              <div className="flex items-center gap-xs mb-0 max-md:gap-1.5 max-md:mb-0 [&>svg]:text-primary [&>svg]:flex-shrink-0 max-md:[&>svg]:w-4 max-md:[&>svg]:h-4">
                <Newspaper size={18} />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-sm">관련 뉴스</h3>
              </div>
              <div className="flex flex-col gap-md">
                {relatedNews.map((news) => (
                  <a key={news.id} href={news.url} className="flex flex-col gap-1 p-sm bg-bg rounded-md transition-colors duration-fast hover:bg-bg-secondary" target="_blank" rel="noopener noreferrer">
                    <span className="text-sm font-medium text-text-primary leading-relaxed line-clamp-2">{news.title}</span>
                    <span className="text-xs text-text-tertiary">{news.source} · {news.date}</span>
                  </a>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="!p-xl text-center text-text-tertiary">
              <p>최근 뉴스가 없습니다.</p>
            </Card>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
