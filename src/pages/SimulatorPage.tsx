import { useState, useCallback, useRef } from 'react';
import { Calendar, Search, Play, RotateCcw, ArrowLeft, TrendingUp, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell } from 'recharts';
import { Card, CardHeader, Button, Input, Select } from '../components/common';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, generatePriceHistory } from '../data/etfs';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';
import styles from './SimulatorPage.module.css';

// 기간 프리셋 옵션
const periodPresets = [
  { value: '1y', label: '1년', months: 12 },
  { value: '3y', label: '3년', months: 36 },
  { value: '5y', label: '5년', months: 60 },
  { value: '10y', label: '10년', months: 120 },
  { value: '20y', label: '20년', months: 240 },
];

// 숫자에 콤마 추가
const formatWithComma = (value: string): string => {
  const num = value.replace(/[^\d]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('ko-KR');
};

// 콤마 제거하여 순수 숫자 반환
const removeComma = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

// 날짜 포맷팅 (YYYY-MM-DD)
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 기간 프리셋에 따른 시작/종료일 계산
const getDatesByPreset = (preset: string): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  
  const found = periodPresets.find(p => p.value === preset);
  if (found) {
    startDate.setMonth(startDate.getMonth() - found.months);
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

// 배당금 옵션
const dividendOptions = [
  { value: 'reinvest', label: '배당금 재투자' },
  { value: 'withdraw', label: '배당금 인출' },
];

// 결과 타입 정의
interface SimulationResult {
  data: { date: string; investment: number; value: number; shares: number; dividend: number }[];
  totalInvestment: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  cagr: number;
  periodDays: number;
  etfName: string;
  etfTicker: string;
  startDate: string;
  endDate: string;
  investmentType: string;
  dividendOption: string;
  totalDividend: number;
  dividendYield: number;
}

// 비교 결과 타입 정의
interface ComparisonResult {
  lumpSum: SimulationResult;
  dca: SimulationResult;
  combinedData: { 
    date: string; 
    lumpSum: number; 
    dca: number;
    lumpSumInvestment: number;
    dcaInvestment: number;
  }[];
}

export default function SimulatorPage() {
  const { selectedMarket } = useETFStore();
  const [investmentType, setInvestmentType] = useState('lump');
  const [principal, setPrincipal] = useState('10,000,000');
  const [monthlyAmount, setMonthlyAmount] = useState('500,000');
  const [selectedPreset, setSelectedPreset] = useState('5y');
  const [startDate, setStartDate] = useState(() => getDatesByPreset('5y').startDate);
  const [endDate, setEndDate] = useState(() => getDatesByPreset('5y').endDate);
  const [selectedETFId, setSelectedETFId] = useState('');
  const [showETFDropdown, setShowETFDropdown] = useState(false);
  const [etfSearchQuery, setETFSearchQuery] = useState('');
  const [dividendOption, setDividendOption] = useState('reinvest');
  
  // 비교용 추가 상태
  const [comparePrincipal, setComparePrincipal] = useState('10,000,000');
  const [compareMonthlyAmount, setCompareMonthlyAmount] = useState('500,000');
  
  // 시뮬레이션 결과 상태
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  
  // 결과 섹션 ref
  const resultRef = useRef<HTMLDivElement>(null);
  
  // 시장별 ETF 목록
  const etfList = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const selectedETF = etfList.find(e => e.id === selectedETFId);
  
  // ETF 검색 필터링
  const filteredETFs = etfList.filter(etf => 
    etf.name.toLowerCase().includes(etfSearchQuery.toLowerCase()) ||
    etf.ticker.toLowerCase().includes(etfSearchQuery.toLowerCase())
  );
  
  // 입력값 변경 핸들러
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrincipal(formatWithComma(e.target.value));
  };
  
  const handleMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyAmount(formatWithComma(e.target.value));
  };
  
  const handleComparePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComparePrincipal(formatWithComma(e.target.value));
  };
  
  const handleCompareMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompareMonthlyAmount(formatWithComma(e.target.value));
  };
  
  // 기간 프리셋 선택 핸들러
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const { startDate, endDate } = getDatesByPreset(preset);
    setStartDate(startDate);
    setEndDate(endDate);
  };
  
  // 날짜 직접 입력 시 프리셋 해제
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setSelectedPreset('');
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setSelectedPreset('');
  };
  
  // ETF 선택 핸들러
  const handleETFSelect = (etfId: string) => {
    setSelectedETFId(etfId);
    setShowETFDropdown(false);
    setETFSearchQuery('');
  };
  
  // 시뮬레이션 실행 가능 여부
  const canRunSimulation = selectedETF && startDate && endDate && (
    investmentType === 'lump' ? parseInt(removeComma(principal)) > 0 :
    investmentType === 'dca' ? parseInt(removeComma(monthlyAmount)) > 0 :
    (parseInt(removeComma(comparePrincipal)) > 0 && parseInt(removeComma(compareMonthlyAmount)) > 0)
  );
  
  // 백테스트 실행
  const runSimulation = useCallback(() => {
    if (!selectedETF) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return;
    
    // 가격 히스토리 생성 (실제로는 API에서 가져와야 함)
    const priceHistory = generatePriceHistory(selectedETF.price, daysDiff);
    
    // 배당 수익률 (연간, ETF의 dividendYield 사용)
    const annualDividendYield = selectedETF.dividendYield / 100;
    const quarterlyDividendYield = annualDividendYield / 4; // 분기 배당 가정
    
    const data: { date: string; investment: number; value: number; shares: number; dividend: number }[] = [];
    let totalDividendReceived = 0;
    
    if (investmentType === 'lump') {
      // 거치식 투자 백테스트
      const p = parseInt(removeComma(principal)) || 0;
      const initialPrice = priceHistory[0].close;
      let shares = p / initialPrice;
      let lastQuarter = -1;
      let accumulatedDividend = 0;
      
      priceHistory.forEach((price) => {
        const currentDate = new Date(price.date);
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        
        // 분기마다 배당금 지급
        if (currentQuarter !== lastQuarter && lastQuarter !== -1) {
          const dividendAmount = Math.round(shares * price.close * quarterlyDividendYield);
          totalDividendReceived += dividendAmount;
          
          if (dividendOption === 'reinvest') {
            // 배당금 재투자: 추가 주식 매수
            shares += dividendAmount / price.close;
          } else {
            // 배당금 인출: 누적 배당금으로 기록
            accumulatedDividend += dividendAmount;
          }
        }
        lastQuarter = currentQuarter;
        
        const value = Math.round(shares * price.close) + (dividendOption === 'withdraw' ? accumulatedDividend : 0);
        data.push({
          date: price.date,
          investment: p,
          value,
          shares,
          dividend: totalDividendReceived,
        });
      });
    } else {
      // 적립식 투자 백테스트
      const monthly = parseInt(removeComma(monthlyAmount)) || 0;
      let totalInvestment = 0;
      let totalShares = 0;
      let lastMonth = -1;
      let lastQuarter = -1;
      let accumulatedDividend = 0;
      
      priceHistory.forEach((price) => {
        const currentDate = new Date(price.date);
        const currentMonth = currentDate.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        
        // 매월 적립
        if (currentMonth !== lastMonth) {
          totalInvestment += monthly;
          totalShares += monthly / price.close;
          lastMonth = currentMonth;
        }
        
        // 분기마다 배당금 지급
        if (currentQuarter !== lastQuarter && lastQuarter !== -1 && totalShares > 0) {
          const dividendAmount = Math.round(totalShares * price.close * quarterlyDividendYield);
          totalDividendReceived += dividendAmount;
          
          if (dividendOption === 'reinvest') {
            // 배당금 재투자: 추가 주식 매수
            totalShares += dividendAmount / price.close;
          } else {
            // 배당금 인출: 누적 배당금으로 기록
            accumulatedDividend += dividendAmount;
          }
        }
        lastQuarter = currentQuarter;
        
        const value = Math.round(totalShares * price.close) + (dividendOption === 'withdraw' ? accumulatedDividend : 0);
        data.push({
          date: price.date,
          investment: totalInvestment,
          value,
          shares: totalShares,
          dividend: totalDividendReceived,
        });
      });
    }
    
    const finalData = data[data.length - 1];
    const totalReturn = finalData.value - finalData.investment;
    const totalReturnPercent = (totalReturn / finalData.investment) * 100;
    
    // 연환산 수익률 (CAGR)
    const years = daysDiff / 365;
    const cagr = (Math.pow(finalData.value / finalData.investment, 1 / years) - 1) * 100;
    
    setResult({
      data,
      totalInvestment: finalData.investment,
      finalValue: finalData.value,
      totalReturn,
      totalReturnPercent,
      cagr,
      periodDays: daysDiff,
      etfName: selectedETF.name,
      etfTicker: selectedETF.ticker,
      startDate,
      endDate,
      investmentType,
      dividendOption,
      totalDividend: totalDividendReceived,
      dividendYield: selectedETF.dividendYield,
    });
    setIsSimulated(true);
    
    // 결과 섹션으로 스크롤 (섹션 헤더가 보이도록 start 위치)
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }, [investmentType, principal, monthlyAmount, startDate, endDate, selectedETF, dividendOption]);
  
  // 비교 시뮬레이션 실행
  const runComparison = useCallback(() => {
    if (!selectedETF) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return;
    
    // 가격 히스토리 생성
    const priceHistory = generatePriceHistory(selectedETF.price, daysDiff);
    const annualDividendYield = selectedETF.dividendYield / 100;
    const quarterlyDividendYield = annualDividendYield / 4;
    
    // 거치식 시뮬레이션
    const lumpSumData: { date: string; investment: number; value: number; shares: number; dividend: number }[] = [];
    const lumpP = parseInt(removeComma(comparePrincipal)) || 0;
    const lumpInitialPrice = priceHistory[0].close;
    let lumpShares = lumpP / lumpInitialPrice;
    let lumpLastQuarter = -1;
    let lumpAccumulatedDividend = 0;
    let lumpTotalDividend = 0;
    
    priceHistory.forEach((price) => {
      const currentDate = new Date(price.date);
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      
      if (currentQuarter !== lumpLastQuarter && lumpLastQuarter !== -1) {
        const dividendAmount = Math.round(lumpShares * price.close * quarterlyDividendYield);
        lumpTotalDividend += dividendAmount;
        
        if (dividendOption === 'reinvest') {
          lumpShares += dividendAmount / price.close;
        } else {
          lumpAccumulatedDividend += dividendAmount;
        }
      }
      lumpLastQuarter = currentQuarter;
      
      const lumpValue = Math.round(lumpShares * price.close) + (dividendOption === 'withdraw' ? lumpAccumulatedDividend : 0);
      lumpSumData.push({
        date: price.date,
        investment: lumpP,
        value: lumpValue,
        shares: lumpShares,
        dividend: lumpTotalDividend,
      });
    });
    
    // 적립식 시뮬레이션
    const dcaData: { date: string; investment: number; value: number; shares: number; dividend: number }[] = [];
    const dcaMonthly = parseInt(removeComma(compareMonthlyAmount)) || 0;
    let dcaTotalInvestment = 0;
    let dcaTotalShares = 0;
    let dcaLastMonth = -1;
    let dcaLastQuarter = -1;
    let dcaAccumulatedDividend = 0;
    let dcaTotalDividend = 0;
    
    priceHistory.forEach((price) => {
      const currentDate = new Date(price.date);
      const currentMonth = currentDate.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3);
      
      if (currentMonth !== dcaLastMonth) {
        dcaTotalInvestment += dcaMonthly;
        dcaTotalShares += dcaMonthly / price.close;
        dcaLastMonth = currentMonth;
      }
      
      if (currentQuarter !== dcaLastQuarter && dcaLastQuarter !== -1 && dcaTotalShares > 0) {
        const dividendAmount = Math.round(dcaTotalShares * price.close * quarterlyDividendYield);
        dcaTotalDividend += dividendAmount;
        
        if (dividendOption === 'reinvest') {
          dcaTotalShares += dividendAmount / price.close;
        } else {
          dcaAccumulatedDividend += dividendAmount;
        }
      }
      dcaLastQuarter = currentQuarter;
      
      const dcaValue = Math.round(dcaTotalShares * price.close) + (dividendOption === 'withdraw' ? dcaAccumulatedDividend : 0);
      dcaData.push({
        date: price.date,
        investment: dcaTotalInvestment,
        value: dcaValue,
        shares: dcaTotalShares,
        dividend: dcaTotalDividend,
      });
    });
    
    // 거치식 결과
    const lumpFinal = lumpSumData[lumpSumData.length - 1];
    const lumpReturn = lumpFinal.value - lumpFinal.investment;
    const lumpReturnPercent = (lumpReturn / lumpFinal.investment) * 100;
    const years = daysDiff / 365;
    const lumpCAGR = (Math.pow(lumpFinal.value / lumpFinal.investment, 1 / years) - 1) * 100;
    
    const lumpSumResult: SimulationResult = {
      data: lumpSumData,
      totalInvestment: lumpFinal.investment,
      finalValue: lumpFinal.value,
      totalReturn: lumpReturn,
      totalReturnPercent: lumpReturnPercent,
      cagr: lumpCAGR,
      periodDays: daysDiff,
      etfName: selectedETF.name,
      etfTicker: selectedETF.ticker,
      startDate,
      endDate,
      investmentType: 'lump',
      dividendOption,
      totalDividend: lumpTotalDividend,
      dividendYield: selectedETF.dividendYield,
    };
    
    // 적립식 결과
    const dcaFinal = dcaData[dcaData.length - 1];
    const dcaReturn = dcaFinal.value - dcaFinal.investment;
    const dcaReturnPercent = (dcaReturn / dcaFinal.investment) * 100;
    const dcaCAGR = (Math.pow(dcaFinal.value / dcaFinal.investment, 1 / years) - 1) * 100;
    
    const dcaResult: SimulationResult = {
      data: dcaData,
      totalInvestment: dcaFinal.investment,
      finalValue: dcaFinal.value,
      totalReturn: dcaReturn,
      totalReturnPercent: dcaReturnPercent,
      cagr: dcaCAGR,
      periodDays: daysDiff,
      etfName: selectedETF.name,
      etfTicker: selectedETF.ticker,
      startDate,
      endDate,
      investmentType: 'dca',
      dividendOption,
      totalDividend: dcaTotalDividend,
      dividendYield: selectedETF.dividendYield,
    };
    
    // 합친 데이터
    const combinedData = lumpSumData.map((lump, i) => ({
      date: lump.date,
      lumpSum: lump.value,
      dca: dcaData[i].value,
      lumpSumInvestment: lump.investment,
      dcaInvestment: dcaData[i].investment,
    }));
    
    setComparisonResult({
      lumpSum: lumpSumResult,
      dca: dcaResult,
      combinedData,
    });
    setResult(null);
    setIsSimulated(true);
    
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  }, [comparePrincipal, compareMonthlyAmount, startDate, endDate, selectedETF, dividendOption]);
  
  // 시뮬레이션 초기화
  const resetSimulation = () => {
    setResult(null);
    setComparisonResult(null);
    setIsSimulated(false);
  };
  
  // 차트 데이터 샘플링
  const chartData = result?.data.filter((_, i) => 
    i % Math.max(1, Math.floor(result.data.length / 30)) === 0 || i === result.data.length - 1
  ) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{label}</p>
          <div className={styles.tooltipItem}>
            <span className={styles.tooltipDot} style={{ background: '#3B82F6' }}></span>
            <span className={styles.tooltipLabel}>평가금액</span>
            <span className={styles.tooltipValue}>{formatPrice(payload[0].value)}원</span>
          </div>
          {payload[1] && (
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipDot} style={{ background: '#9CA3AF' }}></span>
              <span className={styles.tooltipLabel}>투자금</span>
              <span className={styles.tooltipValue}>{formatPrice(payload[1].value)}원</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={styles.page}>
      {/* ETF Selection */}
      <Card padding="md" className={`${styles.etfCard} ${!selectedETF ? styles.required : ''}`}>
        {!selectedETF && (
          <CardHeader 
            title="ETF 검색"
            subtitle="실험할 ETF를 검색하세요"
          />
        )}
        <div className={styles.etfSelector}>
          {selectedETF ? (
            /* 선택된 ETF 표시 */
            <div className={styles.selectedETFCard}>
              <div className={styles.selectedETFInfo}>
                <span className={styles.selectedETFName}>{selectedETF.name}</span>
                <span className={styles.selectedETFMeta}>
                  {selectedETF.ticker} · {selectedETF.issuer} · {selectedETF.category}
                </span>
              </div>
              <button 
                className={styles.changeETFButton}
                onClick={() => {
                  setSelectedETFId('');
                  setETFSearchQuery('');
                }}
              >
                <ArrowLeft size={16} />
                다른 ETF 선택
              </button>
            </div>
          ) : (
            /* 검색 입력 */
            <>
              <div className={styles.etfSearchBox}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="ETF 이름 또는 종목코드 검색..."
                  value={etfSearchQuery}
                  onChange={(e) => {
                    setETFSearchQuery(e.target.value);
                    setShowETFDropdown(true);
                  }}
                  onFocus={() => setShowETFDropdown(true)}
                  className={styles.etfSearchInput}
                />
              </div>
              
              {/* 검색 결과 */}
              {showETFDropdown && etfSearchQuery && (
                <div className={styles.etfDropdown}>
                  {filteredETFs.length > 0 ? (
                    <div className={styles.etfList}>
                      {filteredETFs.slice(0, 10).map(etf => (
                        <button
                          key={etf.id}
                          className={styles.etfItem}
                          onClick={() => handleETFSelect(etf.id)}
                        >
                          <div className={styles.etfItemInfo}>
                            <span className={styles.etfItemName}>{etf.name}</span>
                            <span className={styles.etfItemMeta}>{etf.issuer} · {etf.category}</span>
                          </div>
                          <span className={styles.etfItemTicker}>{etf.ticker}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noResults}>
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
      
      {/* Input Section */}
      <Card padding="md">
        {/* 탭 네비게이션 */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${investmentType === 'lump' ? styles.active : ''}`}
            onClick={() => setInvestmentType('lump')}
          >
            <TrendingUp size={16} />
            <span>거치식 투자</span>
          </button>
          <button
            className={`${styles.tabButton} ${investmentType === 'dca' ? styles.active : ''}`}
            onClick={() => setInvestmentType('dca')}
          >
            <Calendar size={16} />
            <span>적립식 투자</span>
          </button>
          <button
            className={`${styles.tabButton} ${investmentType === 'compare' ? styles.active : ''}`}
            onClick={() => setInvestmentType('compare')}
          >
            <Zap size={16} />
            <span>거치식 vs 적립식</span>
          </button>
        </div>
        
        {/* 탭 컨텐츠 */}
        <div className={styles.tabPanelContent}>
          {investmentType === 'lump' && (
            <div className={styles.inputGroup}>
              <Input
                label="투자 원금"
                type="text"
                inputMode="numeric"
                value={principal}
                onChange={handlePrincipalChange}
                fullWidth
              />
              <span className={styles.inputUnit}>원</span>
            </div>
          )}
          
          {investmentType === 'dca' && (
            <div className={styles.inputGroup}>
              <Input
                label="월 적립금"
                type="text"
                inputMode="numeric"
                value={monthlyAmount}
                onChange={handleMonthlyChange}
                fullWidth
              />
              <span className={styles.inputUnit}>원</span>
            </div>
          )}
          
          {investmentType === 'compare' && (
            <div className={styles.compareInputSection}>
              <div className={styles.compareInputGroup}>
                <div className={styles.compareLabel}>
                  <TrendingUp size={16} className={styles.compareLabelIcon} />
                  <span>거치식 투자</span>
                </div>
                <div className={styles.inputGroup}>
                  <Input
                    label="투자 원금"
                    type="text"
                    inputMode="numeric"
                    value={comparePrincipal}
                    onChange={handleComparePrincipalChange}
                    fullWidth
                  />
                  <span className={styles.inputUnit}>원</span>
                </div>
              </div>
              
              <div className={styles.compareDivider}>vs</div>
              
              <div className={styles.compareInputGroup}>
                <div className={styles.compareLabel}>
                  <Calendar size={16} className={styles.compareLabelIcon} />
                  <span>적립식 투자</span>
                </div>
                <div className={styles.inputGroup}>
                  <Input
                    label="월 적립금"
                    type="text"
                    inputMode="numeric"
                    value={compareMonthlyAmount}
                    onChange={handleCompareMonthlyChange}
                    fullWidth
                  />
                  <span className={styles.inputUnit}>원</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Period Selection */}
        <div className={styles.periodSection}>
          <label className={styles.sectionLabel}>투자 기간</label>
          
          <div className={styles.periodPresets}>
            {periodPresets.map(preset => (
              <button
                key={preset.value}
                className={`${styles.presetButton} ${selectedPreset === preset.value ? styles.active : ''}`}
                onClick={() => handlePresetChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className={styles.dateRange}>
            <div className={styles.dateInputWrapper}>
              <Calendar size={16} />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className={styles.dateInput}
              />
            </div>
            <span className={styles.dateSeparator}>~</span>
            <div className={styles.dateInputWrapper}>
              <Calendar size={16} />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className={styles.dateInput}
              />
            </div>
          </div>
        </div>
        
        {/* Dividend Option */}
        <div className={styles.dividendSection}>
          <div className={styles.dividendRow}>
            <label className={styles.sectionLabel}>배당금 처리</label>
            <div className={styles.segmentedControl}>
              {dividendOptions.map(option => (
                <button
                  key={option.value}
                  className={`${styles.segmentButton} ${dividendOption === option.value ? styles.active : ''}`}
                  onClick={() => setDividendOption(option.value)}
                >
                  {option.label.replace('배당금 ', '')}
                </button>
              ))}
            </div>
          </div>
          <p className={styles.dividendHint}>
            {dividendOption === 'reinvest' 
              ? '배당금을 재투자하여 복리 효과를 극대화합니다.' 
              : '배당금을 현금으로 인출하여 수익으로 확정합니다.'}
          </p>
        </div>
        
        {/* 시뮬레이션 실행 버튼 */}
        <div className={styles.actionSection}>
          <Button
            onClick={investmentType === 'compare' ? runComparison : runSimulation}
            disabled={!canRunSimulation}
            size="lg"
            fullWidth
            leftIcon={<Play size={20} />}
          >
            {investmentType === 'compare' ? '비교 분석 실행' : '시뮬레이션 실행'}
          </Button>
          {!selectedETF && (
            <p className={styles.actionHint}>ETF를 먼저 선택해주세요</p>
          )}
        </div>
      </Card>
      
      {/* Comparison Result Section */}
      {isSimulated && comparisonResult ? (
        <div ref={resultRef} className={styles.resultsSection}>
          {/* 결과 헤더 */}
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>거치식 vs 적립식 비교 분석</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSimulation}
              className={styles.resetButton}
              leftIcon={<RotateCcw size={16} />}
            >
              다시 설정
            </Button>
          </div>

          {/* 비교 정보 칩 */}
          <div className={styles.compareChips}>
            <div className={styles.compareChip}>
              <span className={styles.chipDot} style={{ backgroundColor: '#3B82F6' }}></span>
              <span className={styles.chipName}>거치식</span>
            </div>
            <div className={styles.compareChip}>
              <span className={styles.chipDot} style={{ backgroundColor: '#10B981' }}></span>
              <span className={styles.chipName}>적립식</span>
            </div>
            <div className={styles.compareInfo}>
              {comparisonResult.lumpSum.etfName} · {comparisonResult.lumpSum.dividendOption === 'reinvest' ? '배당 재투자' : '배당 인출'} · {comparisonResult.lumpSum.startDate} ~ {comparisonResult.lumpSum.endDate}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className={styles.tabContent}>
            {/* 평가금액 추이 비교 차트 */}
            <Card padding="md" className={styles.chartCard}>
              <CardHeader title="평가금액 추이 비교" subtitle="거치식과 적립식 투자의 자산 가치 변화" />
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart 
                    data={comparisonResult.combinedData.filter((_, i) => 
                      i % Math.max(1, Math.floor(comparisonResult.combinedData.length / 30)) === 0 || 
                      i === comparisonResult.combinedData.length - 1
                    )}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => v.slice(2, 7)}
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
                      tickFormatter={(v) => v >= 100000000 ? `${(v / 100000000).toFixed(1)}억` : `${(v / 10000).toFixed(0)}만`}
                      width={50}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${formatPrice(value)}원`,
                        name === 'lumpSum' ? '거치식' : '적립식'
                      ]}
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
                    <Line 
                      type="monotone" 
                      dataKey="lumpSum" 
                      name="거치식"
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dca" 
                      name="적립식"
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 비교 테이블 */}
            <Card padding="none" className={styles.infoCard}>
              <div className={styles.compareTable}>
                <div className={styles.tableSection}>
                  <div className={styles.tableSectionTitle}>투자 결과 비교</div>
                  
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>항목</div>
                    <div className={styles.tableCell}>거치식</div>
                    <div className={styles.tableCell}>적립식</div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>총 투자금</div>
                    <div className={`${styles.tableCell} ${comparisonResult.lumpSum.totalInvestment < comparisonResult.dca.totalInvestment ? styles.bestValue : ''}`}>
                      {formatPrice(comparisonResult.lumpSum.totalInvestment)}원
                    </div>
                    <div className={`${styles.tableCell} ${comparisonResult.dca.totalInvestment < comparisonResult.lumpSum.totalInvestment ? styles.bestValue : ''}`}>
                      {formatPrice(comparisonResult.dca.totalInvestment)}원
                    </div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>최종 평가금액</div>
                    <div className={`${styles.tableCell} ${comparisonResult.lumpSum.finalValue > comparisonResult.dca.finalValue ? styles.bestValue : comparisonResult.lumpSum.finalValue < comparisonResult.dca.finalValue ? styles.worstValue : ''}`}>
                      {formatPrice(comparisonResult.lumpSum.finalValue)}원
                    </div>
                    <div className={`${styles.tableCell} ${comparisonResult.dca.finalValue > comparisonResult.lumpSum.finalValue ? styles.bestValue : comparisonResult.dca.finalValue < comparisonResult.lumpSum.finalValue ? styles.worstValue : ''}`}>
                      {formatPrice(comparisonResult.dca.finalValue)}원
                    </div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>총 수익</div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.lumpSum.totalReturnPercent)} ${comparisonResult.lumpSum.totalReturn > comparisonResult.dca.totalReturn ? styles.bestValue : comparisonResult.lumpSum.totalReturn < comparisonResult.dca.totalReturn ? styles.worstValue : ''}`}>
                      {comparisonResult.lumpSum.totalReturn >= 0 ? '+' : ''}{formatPrice(comparisonResult.lumpSum.totalReturn)}원
                    </div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.dca.totalReturnPercent)} ${comparisonResult.dca.totalReturn > comparisonResult.lumpSum.totalReturn ? styles.bestValue : comparisonResult.dca.totalReturn < comparisonResult.lumpSum.totalReturn ? styles.worstValue : ''}`}>
                      {comparisonResult.dca.totalReturn >= 0 ? '+' : ''}{formatPrice(comparisonResult.dca.totalReturn)}원
                    </div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>수익률</div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.lumpSum.totalReturnPercent)} ${comparisonResult.lumpSum.totalReturnPercent > comparisonResult.dca.totalReturnPercent ? styles.bestValue : comparisonResult.lumpSum.totalReturnPercent < comparisonResult.dca.totalReturnPercent ? styles.worstValue : ''}`}>
                      {formatPercent(comparisonResult.lumpSum.totalReturnPercent)}
                    </div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.dca.totalReturnPercent)} ${comparisonResult.dca.totalReturnPercent > comparisonResult.lumpSum.totalReturnPercent ? styles.bestValue : comparisonResult.dca.totalReturnPercent < comparisonResult.lumpSum.totalReturnPercent ? styles.worstValue : ''}`}>
                      {formatPercent(comparisonResult.dca.totalReturnPercent)}
                    </div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>연평균 수익률 (CAGR)</div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.lumpSum.cagr)} ${comparisonResult.lumpSum.cagr > comparisonResult.dca.cagr ? styles.bestValue : comparisonResult.lumpSum.cagr < comparisonResult.dca.cagr ? styles.worstValue : ''}`}>
                      {formatPercent(comparisonResult.lumpSum.cagr)}
                    </div>
                    <div className={`${styles.tableCell} ${getChangeClass(comparisonResult.dca.cagr)} ${comparisonResult.dca.cagr > comparisonResult.lumpSum.cagr ? styles.bestValue : comparisonResult.dca.cagr < comparisonResult.lumpSum.cagr ? styles.worstValue : ''}`}>
                      {formatPercent(comparisonResult.dca.cagr)}
                    </div>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>누적 배당금</div>
                    <div className={`${styles.tableCell} ${comparisonResult.lumpSum.totalDividend > comparisonResult.dca.totalDividend ? styles.bestValue : comparisonResult.lumpSum.totalDividend < comparisonResult.dca.totalDividend ? styles.worstValue : ''}`}>
                      {formatPrice(comparisonResult.lumpSum.totalDividend)}원
                    </div>
                    <div className={`${styles.tableCell} ${comparisonResult.dca.totalDividend > comparisonResult.lumpSum.totalDividend ? styles.bestValue : comparisonResult.dca.totalDividend < comparisonResult.lumpSum.totalDividend ? styles.worstValue : ''}`}>
                      {formatPrice(comparisonResult.dca.totalDividend)}원
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
      
      {/* Result Section */}
      {isSimulated && result ? (
        <div ref={resultRef} className={styles.resultContainer}>
          <div className={styles.resultHeaderRow}>
            <div className={styles.resultTitleGroup}>
              <span className={styles.resultLabel}>BACKTEST REPORT</span>
              <h2 className={styles.resultETFName}>{result.etfName}</h2>
              <div className={styles.resultBadges}>
                <span className={styles.badge}>{result.investmentType === 'lump' ? '거치식' : '적립식'}</span>
                <span className={styles.badge}>{result.dividendOption === 'reinvest' ? '배당 재투자' : '배당 인출'}</span>
                <span className={styles.badge}>{result.startDate} ~ {result.endDate}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSimulation}
              className={styles.resetButton}
              leftIcon={<RotateCcw size={16} />}
            >
              다시 설정
            </Button>
          </div>

          <div className={styles.metricsWrapper}>
            <div className={styles.primaryMetric}>
              <span className={styles.metricLabel}>최종 평가금액</span>
              <span className={styles.metricValueLarge}>
                {formatPrice(result.finalValue)}<small>원</small>
              </span>
              <div className={styles.profitChip}>
                <span className={result.totalReturn >= 0 ? styles.textUp : styles.textDown}>
                  {result.totalReturn >= 0 ? '+' : ''}{formatPrice(result.totalReturn)} ({formatPercent(result.totalReturnPercent)})
                </span>
              </div>
            </div>

            <div className={styles.secondaryMetrics}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>총 투자금</span>
                <span className={styles.metricValue}>{formatPrice(result.totalInvestment)}원</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>누적 배당금</span>
                <span className={`${styles.metricValue} ${styles.textDividend}`}>
                  {formatPrice(result.totalDividend)}원
                </span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>연평균 수익률 (CAGR)</span>
                <span className={`${styles.metricValue} ${result.cagr >= 0 ? styles.textUp : styles.textDown}`}>
                  {formatPercent(result.cagr)}
                </span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>투자 기간</span>
                <span className={styles.metricValue}>
                  {Math.floor(result.periodDays / 365)}년 {Math.floor((result.periodDays % 365) / 30)}개월
                </span>
              </div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h3>자산 추이</h3>
              <div className={styles.legend}>
                <span className={styles.legendItem}><span className={styles.dotValue}></span>평가금액</span>
                <span className={styles.legendItem}><span className={styles.dotInvest}></span>투자금</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => v.slice(2, 7)}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                    height={40}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 100000000 ? `${(v / 100000000).toFixed(1)}억` : `${(v / 10000).toFixed(0)}만`}
                    width={50}
                    dx={-5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#9CA3AF" 
                    strokeDasharray="5 5"
                    fill="transparent"
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    fill="url(#gradientValue)"
                    strokeWidth={2.5}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        * 본 백테스트는 과거 데이터 기반 시뮬레이션이며, 미래 수익을 보장하지 않습니다.
        실제 투자 시 수수료, 세금 등이 추가로 발생할 수 있습니다.
      </p>
    </div>
  );
}
