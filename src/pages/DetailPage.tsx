import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Share2, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, Button, Badge } from '../components/common';
import { Tabs, TabList, Tab, TabPanel } from '../components/common';
import { getETFById, generatePriceHistory, getReturns, getHoldings, getDividends, getRiskMetrics } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, formatLargeNumber, formatDate, getChangeClass } from '../utils/format';
import styles from './DetailPage.module.css';

const CHART_COLORS = ['#1E3A5F', '#4A90A4', '#E8A838', '#22C55E', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useETFStore();
  
  const etf = getETFById(id || '');
  
  if (!etf) {
    return (
      <div className={styles.notFound}>
        <p>ETF를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/search')}>목록으로</Button>
      </div>
    );
  }
  
  const priceHistory = generatePriceHistory(etf.price, 365);
  const returns = getReturns(etf.id);
  const holdings = getHoldings(etf.id);
  const dividends = getDividends(etf.id);
  const riskMetrics = getRiskMetrics(etf.id);
  
  const chartData = priceHistory.slice(-90).map(p => ({
    date: p.date,
    price: p.close,
  }));
  
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
      
      {/* Price Chart */}
      <Card padding="md">
        <CardHeader title="가격 차트" subtitle="최근 3개월" />
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(v) => v.slice(5)}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
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
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#1E3A5F" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
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
            <Card padding="md">
              <h3 className={styles.cardTitle}>수익률</h3>
              <div className={styles.returnsList}>
                {[
                  { label: '1일', value: returns.day1 },
                  { label: '1주', value: returns.week1 },
                  { label: '1개월', value: returns.month1 },
                  { label: '3개월', value: returns.month3 },
                  { label: '6개월', value: returns.month6 },
                  { label: '1년', value: returns.year1 },
                  { label: 'YTD', value: returns.ytd },
                ].map((item) => (
                  <div key={item.label} className={styles.returnItem}>
                    <span className={styles.returnLabel}>{item.label}</span>
                    <span className={`${styles.returnValue} ${getChangeClass(item.value)}`}>
                      {formatPercent(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card padding="md">
              <h3 className={styles.cardTitle}>기본 정보</h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>시가총액</span>
                  <span className={styles.infoValue}>{formatLargeNumber(etf.marketCap)}</span>
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
                  <span className={styles.infoLabel}>설정일</span>
                  <span className={styles.infoValue}>{formatDate(etf.inceptionDate)}</span>
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
                <span className={styles.riskLabel}>변동성</span>
                <span className={styles.riskValue}>{riskMetrics.volatility.toFixed(1)}%</span>
                <div className={styles.riskBar}>
                  <div 
                    className={styles.riskBarFill} 
                    style={{ width: `${Math.min(riskMetrics.volatility * 2, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>샤프 비율</span>
                <span className={styles.riskValue}>{riskMetrics.sharpeRatio.toFixed(2)}</span>
                <span className={styles.riskDesc}>
                  {riskMetrics.sharpeRatio >= 1 ? '양호' : riskMetrics.sharpeRatio >= 0.5 ? '보통' : '낮음'}
                </span>
              </div>
              
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>베타</span>
                <span className={styles.riskValue}>{riskMetrics.beta.toFixed(2)}</span>
                <span className={styles.riskDesc}>
                  {riskMetrics.beta > 1 ? '시장 대비 변동성 높음' : '시장 대비 변동성 낮음'}
                </span>
              </div>
              
              <div className={styles.riskItem}>
                <span className={styles.riskLabel}>최대 낙폭</span>
                <span className={`${styles.riskValue} number-down`}>{riskMetrics.maxDrawdown.toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}

