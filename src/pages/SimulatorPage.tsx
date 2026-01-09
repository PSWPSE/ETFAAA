import { useState, useCallback, useRef } from 'react';
import { Calendar, Play, RotateCcw, TrendingUp, Zap, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Card, CardHeader, Button, Input, ETFSearchCard } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, generatePriceHistory } from '../data';
import { formatPrice, formatPriceByMarket, formatPercent, getChangeClass } from '../utils/format';

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

    // 비교 분석 결과 초기화
    setComparisonResult(null);

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
        <div className="bg-white/95 border border-border rounded-lg shadow-lg backdrop-blur-sm p-2.5 min-w-[140px]">
          <p className="text-[11px] text-text-tertiary mb-1.5 font-medium">{label}</p>
          <div className="flex items-center gap-2 mb-0.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
            <span className="text-text-secondary flex-1">평가금액</span>
            <span className="text-text-primary font-semibold tabular-nums">{formatPriceByMarket(payload[0].value, selectedMarket)}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2 mb-0.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
              <span className="text-text-secondary flex-1">투자금</span>
              <span className="text-text-primary font-semibold tabular-nums">{formatPriceByMarket(payload[1].value, selectedMarket)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer
      title="투자 시뮬레이터"
      subtitle="과거 데이터로 투자 성과를 시뮬레이션하세요"
      showMarketSelector={true}
    >
      {/* ETF Selection */}
      <ETFSearchCard
        title="ETF 검색"
        subtitle="실험할 ETF를 검색하세요"
        selectedETFId={selectedETFId}
        onSelect={(id) => {
          setSelectedETFId(id);
        }}
        placeholder="ETF 이름 또는 종목코드 검색..."
        required={true}
      />

      {/* Input Section */}
      <Card padding="md">
        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm p-1 bg-[rgba(250,251,252,0.8)] rounded-lg border border-[rgba(229,231,235,0.6)]">
          <button
            className={`flex items-center justify-center gap-1.5 py-3 px-4 text-[13px] font-semibold rounded-md cursor-pointer transition-all duration-200 ${
              investmentType === 'lump'
                ? 'text-primary bg-white shadow-sm'
                : 'text-text-secondary bg-transparent hover:text-text-primary hover:bg-white/60'
            }`}
            onClick={() => setInvestmentType('lump')}
          >
            <TrendingUp size={16} className="flex-shrink-0" />
            <span>거치식 투자</span>
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 py-3 px-4 text-[13px] font-semibold rounded-md cursor-pointer transition-all duration-200 ${
              investmentType === 'dca'
                ? 'text-primary bg-white shadow-sm'
                : 'text-text-secondary bg-transparent hover:text-text-primary hover:bg-white/60'
            }`}
            onClick={() => setInvestmentType('dca')}
          >
            <Calendar size={16} className="flex-shrink-0" />
            <span>적립식 투자</span>
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 py-3 px-4 text-[13px] font-semibold rounded-md cursor-pointer transition-all duration-200 ${
              investmentType === 'compare'
                ? 'text-primary bg-white shadow-sm'
                : 'text-text-secondary bg-transparent hover:text-text-primary hover:bg-white/60'
            }`}
            onClick={() => setInvestmentType('compare')}
          >
            <Zap size={16} className="flex-shrink-0" />
            <span>거치식 vs 적립식</span>
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="pt-md animate-[tabFadeIn_0.3s_ease-out]">
          {investmentType === 'lump' && (
            <div className="flex items-end gap-sm mb-0 sm:mb-xs md:mb-md">
              <Input
                label="투자 원금"
                type="text"
                inputMode="numeric"
                value={principal}
                onChange={handlePrincipalChange}
                fullWidth
              />
              <span className="text-sm text-text-secondary pb-3">원</span>
            </div>
          )}

          {investmentType === 'dca' && (
            <div className="flex items-end gap-sm mb-0 sm:mb-xs md:mb-md">
              <Input
                label="월 적립금"
                type="text"
                inputMode="numeric"
                value={monthlyAmount}
                onChange={handleMonthlyChange}
                fullWidth
              />
              <span className="text-sm text-text-secondary pb-3">원</span>
            </div>
          )}

          {investmentType === 'compare' && (
            <div className="flex flex-col gap-3 mt-sm sm:gap-4 md:flex-row md:items-start md:gap-xl">
              <div className="flex flex-col gap-2 sm:gap-2.5 md:flex-1 md:gap-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary tracking-tight pl-0.5 sm:text-[13px] md:text-sm">
                  <TrendingUp size={14} className="text-primary w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>거치식 투자</span>
                </div>
                <div className="flex items-end gap-sm mb-0 sm:mb-xs md:mb-md">
                  <Input
                    label="투자 원금"
                    type="text"
                    inputMode="numeric"
                    value={comparePrincipal}
                    onChange={handleComparePrincipalChange}
                    fullWidth
                  />
                  <span className="text-sm text-text-secondary pb-3">원</span>
                </div>
              </div>

              <div className="flex items-center justify-center text-base font-extrabold text-primary py-2 relative opacity-60 sm:text-xl sm:py-3 md:flex-shrink-0 md:p-0 md:mt-10 md:text-2xl md:opacity-100 before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-[40%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent md:before:hidden after:content-[''] after:absolute after:top-1/2 after:right-0 after:w-[40%] after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent md:after:hidden">vs</div>

              <div className="flex flex-col gap-2 sm:gap-2.5 md:flex-1 md:gap-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary tracking-tight pl-0.5 sm:text-[13px] md:text-sm">
                  <Calendar size={14} className="text-primary w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>적립식 투자</span>
                </div>
                <div className="flex items-end gap-sm mb-0 sm:mb-xs md:mb-md">
                  <Input
                    label="월 적립금"
                    type="text"
                    inputMode="numeric"
                    value={compareMonthlyAmount}
                    onChange={handleCompareMonthlyChange}
                    fullWidth
                  />
                  <span className="text-sm text-text-secondary pb-3">원</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Period Selection */}
        <div className="mt-md pt-md border-t border-border-light">
          <label className="block text-sm font-medium text-text-secondary mb-sm">투자 기간</label>

          <div className="flex gap-xs mb-md flex-wrap">
            {periodPresets.map(preset => (
              <button
                key={preset.value}
                className={`py-xs px-md min-h-[36px] rounded-md text-sm font-medium transition-all duration-fast ${
                  selectedPreset === preset.value
                    ? 'bg-primary text-white'
                    : 'text-text-secondary bg-bg-secondary hover:bg-bg hover:text-text-primary'
                }`}
                onClick={() => handlePresetChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-sm">
            <div className="flex-1 flex items-center gap-sm py-sm px-md bg-white border border-border rounded-md text-text-tertiary">
              <Calendar size={16} />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="flex-1 border-none outline-none text-sm text-text-primary bg-transparent min-h-[24px]"
              />
            </div>
            <span className="text-sm text-text-tertiary">~</span>
            <div className="flex-1 flex items-center gap-sm py-sm px-md bg-white border border-border rounded-md text-text-tertiary">
              <Calendar size={16} />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="flex-1 border-none outline-none text-sm text-text-primary bg-transparent min-h-[24px]"
              />
            </div>
          </div>
        </div>

        {/* Dividend Option */}
        <div className="mt-md pt-md border-t border-border-light">
          <div className="flex items-center justify-between mb-xs">
            <label className="block text-sm font-medium text-text-secondary mb-0">배당금 처리</label>
            <div className="inline-flex bg-bg-secondary p-[3px] rounded-md gap-0.5">
              {dividendOptions.map(option => (
                <button
                  key={option.value}
                  className={`py-xs px-md text-sm font-medium rounded-sm transition-all duration-fast cursor-pointer min-w-[60px] ${
                    dividendOption === option.value
                      ? 'bg-white text-primary shadow-sm font-semibold'
                      : 'text-text-tertiary bg-transparent hover:text-text-secondary'
                  }`}
                  onClick={() => setDividendOption(option.value)}
                >
                  {option.label.replace('배당금 ', '')}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-tertiary m-0 text-right">
            {dividendOption === 'reinvest'
              ? '배당금을 재투자하여 복리 효과를 극대화합니다.'
              : '배당금을 현금으로 인출하여 수익으로 확정합니다.'}
          </p>
        </div>

        {/* 시뮬레이션 실행 버튼 */}
        <div className="mt-lg pt-md border-t border-border-light">
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
            <p className="mt-sm text-xs text-text-tertiary text-center">ETF를 먼저 선택해주세요</p>
          )}
        </div>
      </Card>

      {/* Comparison Result Section */}
      {isSimulated && comparisonResult ? (
        <div ref={resultRef} className="flex flex-col gap-lg pt-8 border-t border-border-light mt-6 max-w-full overflow-x-hidden animate-[slideInUp_0.6s_ease-out_0.2s_backwards]">
          {/* 결과 헤더 */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-text-primary tracking-tight m-0 md:text-xl">거치식 vs 적립식 비교 분석</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSimulation}
              className="hover:bg-bg-secondary hover:text-text-primary"
              leftIcon={<RotateCcw size={16} />}
            >
              다시 설정
            </Button>
          </div>

          {/* 비교 정보 칩 */}
          <div className="flex flex-wrap gap-md items-center">
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-[rgba(250,251,252,0.8)] border border-[rgba(229,231,235,0.6)] rounded-full text-[13px] font-semibold text-text-primary transition-all duration-200 hover:bg-white hover:shadow-sm">
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#3B82F6]"></span>
              <span className="font-semibold">거치식</span>
            </div>
            <div className="inline-flex items-center gap-2 py-2 px-4 bg-[rgba(250,251,252,0.8)] border border-[rgba(229,231,235,0.6)] rounded-full text-[13px] font-semibold text-text-primary transition-all duration-200 hover:bg-white hover:shadow-sm">
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#10B981]"></span>
              <span className="font-semibold">적립식</span>
            </div>
            <div className="text-xs text-text-tertiary font-medium sm:text-[13px]">
              {comparisonResult.lumpSum.etfName} · {comparisonResult.lumpSum.dividendOption === 'reinvest' ? '배당 재투자' : '배당 인출'} · {comparisonResult.lumpSum.startDate} ~ {comparisonResult.lumpSum.endDate}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex flex-col gap-lg mt-md animate-[fadeIn_0.3s_ease-out] max-w-full overflow-x-hidden">
            {/* 평가금액 추이 비교 차트 */}
            <Card padding="md" className="animate-[slideInUp_0.6s_ease-out_0.2s_backwards] overflow-hidden max-w-full pb-sm">
              <CardHeader title="평가금액 추이 비교" subtitle="거치식과 적립식 투자의 자산 가치 변화" />
              <div className="h-[280px] ml-0 mb-0 overflow-visible relative mt-sm w-full max-w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={comparisonResult.combinedData.filter((_, i) =>
                      i % Math.max(1, Math.floor(comparisonResult.combinedData.length / 30)) === 0 ||
                      i === comparisonResult.combinedData.length - 1
                    )}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
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
                        `${formatPriceByMarket(value, selectedMarket)}`,
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
                      wrapperStyle={{ paddingTop: '5px' }}
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
            <Card padding="none" className="animate-[slideInUp_0.6s_ease-out_0.2s_backwards] overflow-hidden max-w-full">
              <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch]">
                <div className="border-b border-border">
                  <div className="text-xs font-bold text-text-primary py-3 px-2.5 bg-[rgba(250,251,252,0.8)] border-b border-border tracking-tight sm:text-[13px] sm:py-3.5 sm:px-4">투자 결과 비교</div>

                  <div className="flex border-b border-border-light transition-all duration-fast bg-bg-secondary hover:bg-bg-secondary">
                    <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 first:text-left first:justify-start first:text-text-secondary first:font-semibold first:bg-white first:sticky first:left-0 first:z-[1] first:font-sans font-bold">항목</div>
                    <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 font-bold">거치식</div>
                    <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 font-bold">적립식</div>
                  </div>

                  {[
                    { label: '총 투자금', lump: formatPrice(comparisonResult.lumpSum.totalInvestment), dca: formatPrice(comparisonResult.dca.totalInvestment), lumpBest: comparisonResult.lumpSum.totalInvestment < comparisonResult.dca.totalInvestment, dcaBest: comparisonResult.dca.totalInvestment < comparisonResult.lumpSum.totalInvestment },
                    { label: '최종 평가금액', lump: formatPrice(comparisonResult.lumpSum.finalValue), dca: formatPrice(comparisonResult.dca.finalValue), lumpBest: comparisonResult.lumpSum.finalValue > comparisonResult.dca.finalValue, dcaBest: comparisonResult.dca.finalValue > comparisonResult.lumpSum.finalValue, lumpWorst: comparisonResult.lumpSum.finalValue < comparisonResult.dca.finalValue, dcaWorst: comparisonResult.dca.finalValue < comparisonResult.lumpSum.finalValue },
                    { label: '총 수익', lump: `${comparisonResult.lumpSum.totalReturn >= 0 ? '+' : ''}${formatPrice(comparisonResult.lumpSum.totalReturn)}`, dca: `${comparisonResult.dca.totalReturn >= 0 ? '+' : ''}${formatPrice(comparisonResult.dca.totalReturn)}`, lumpClass: getChangeClass(comparisonResult.lumpSum.totalReturnPercent), dcaClass: getChangeClass(comparisonResult.dca.totalReturnPercent), lumpBest: comparisonResult.lumpSum.totalReturn > comparisonResult.dca.totalReturn, dcaBest: comparisonResult.dca.totalReturn > comparisonResult.lumpSum.totalReturn, lumpWorst: comparisonResult.lumpSum.totalReturn < comparisonResult.dca.totalReturn, dcaWorst: comparisonResult.dca.totalReturn < comparisonResult.lumpSum.totalReturn },
                    { label: '수익률', lump: formatPercent(comparisonResult.lumpSum.totalReturnPercent), dca: formatPercent(comparisonResult.dca.totalReturnPercent), lumpClass: getChangeClass(comparisonResult.lumpSum.totalReturnPercent), dcaClass: getChangeClass(comparisonResult.dca.totalReturnPercent), lumpBest: comparisonResult.lumpSum.totalReturnPercent > comparisonResult.dca.totalReturnPercent, dcaBest: comparisonResult.dca.totalReturnPercent > comparisonResult.lumpSum.totalReturnPercent, lumpWorst: comparisonResult.lumpSum.totalReturnPercent < comparisonResult.dca.totalReturnPercent, dcaWorst: comparisonResult.dca.totalReturnPercent < comparisonResult.lumpSum.totalReturnPercent },
                    { label: '연평균 수익률 (CAGR)', lump: formatPercent(comparisonResult.lumpSum.cagr), dca: formatPercent(comparisonResult.dca.cagr), lumpClass: getChangeClass(comparisonResult.lumpSum.cagr), dcaClass: getChangeClass(comparisonResult.dca.cagr), lumpBest: comparisonResult.lumpSum.cagr > comparisonResult.dca.cagr, dcaBest: comparisonResult.dca.cagr > comparisonResult.lumpSum.cagr, lumpWorst: comparisonResult.lumpSum.cagr < comparisonResult.dca.cagr, dcaWorst: comparisonResult.dca.cagr < comparisonResult.lumpSum.cagr },
                    { label: '누적 배당금', lump: formatPrice(comparisonResult.lumpSum.totalDividend), dca: formatPrice(comparisonResult.dca.totalDividend), lumpBest: comparisonResult.lumpSum.totalDividend > comparisonResult.dca.totalDividend, dcaBest: comparisonResult.dca.totalDividend > comparisonResult.lumpSum.totalDividend, lumpWorst: comparisonResult.lumpSum.totalDividend < comparisonResult.dca.totalDividend, dcaWorst: comparisonResult.dca.totalDividend < comparisonResult.lumpSum.totalDividend },
                  ].map((row, idx) => (
                    <div key={idx} className="flex border-b border-border-light transition-all duration-fast hover:bg-bg-secondary last:border-b-0">
                      <div className="flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 text-left justify-start text-text-secondary font-semibold bg-white sticky left-0 z-[1] font-sans">{row.label}</div>
                      <div className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 ${row.lumpClass || ''} ${row.lumpBest ? 'relative bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(34,197,94,0.04)] font-semibold pl-5 sm:pl-6 before:content-["✓"] before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#22C55E] before:font-bold before:opacity-80 sm:before:left-2' : ''} ${row.lumpWorst ? 'relative bg-gradient-to-br from-[rgba(239,68,68,0.08)] to-[rgba(239,68,68,0.04)] font-semibold pl-5 sm:pl-6 before:content-["!"] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#EF4444] before:font-bold before:opacity-80' : ''}`}>
                        {row.lump}원
                      </div>
                      <div className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium text-text-primary text-center font-numeric flex items-center justify-center break-keep sm:min-w-[100px] sm:py-md sm:text-sm md:min-w-[120px] md:py-4 ${row.dcaClass || ''} ${row.dcaBest ? 'relative bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(34,197,94,0.04)] font-semibold pl-5 sm:pl-6 before:content-["✓"] before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#22C55E] before:font-bold before:opacity-80 sm:before:left-2' : ''} ${row.dcaWorst ? 'relative bg-gradient-to-br from-[rgba(239,68,68,0.08)] to-[rgba(239,68,68,0.04)] font-semibold pl-5 sm:pl-6 before:content-["!"] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:text-[#EF4444] before:font-bold before:opacity-80' : ''}`}>
                        {row.dca}원
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Result Section */}
      {isSimulated && result ? (
        <Card ref={resultRef} className="!p-xl animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)] scroll-mt-[calc(var(--header-height)+var(--spacing-md))] max-md:!p-md md:!py-xl md:!px-2xl">
          {/* 헤더 섹션 */}
          <div className="flex justify-between items-start gap-md mb-xl pb-lg border-b border-border-light max-md:flex-col max-md:gap-sm md:flex-row md:items-start">
            <div className="flex-1 flex flex-col gap-xs">
              <div className="flex items-center gap-xs mb-0">
                <TrendingUp size={20} className="text-primary flex-shrink-0 max-md:w-4 max-md:h-4" />
                <h2 className="text-lg font-bold text-text-primary m-0 tracking-tight max-md:text-lg md:text-2xl">투자 실험 결과</h2>
              </div>
              <div className="flex items-center gap-sm flex-wrap">
                <span className="text-base font-semibold text-text-secondary max-md:text-sm">{result.etfName}</span>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="py-1 px-2.5 rounded-full text-[11px] font-semibold bg-bg text-text-secondary border border-border-light tracking-tight max-md:text-[10px] max-md:py-[3px] max-md:px-2">{result.investmentType === 'lump' ? '거치식' : '적립식'}</span>
                  <span className="py-1 px-2.5 rounded-full text-[11px] font-semibold bg-bg text-text-secondary border border-border-light tracking-tight max-md:text-[10px] max-md:py-[3px] max-md:px-2">{result.dividendOption === 'reinvest' ? '배당 재투자' : '배당 인출'}</span>
                </div>
              </div>
              <span className="text-xs font-medium text-text-tertiary tabular-nums">{result.startDate} ~ {result.endDate}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              leftIcon={<RotateCcw size={16} />}
            >
              다시 설정
            </Button>
          </div>

          {/* 주요 메트릭 */}
          <div className="p-lg bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(30,58,95,0.01)] border border-border-light rounded-lg mb-lg max-md:p-md">
            <div className="flex flex-col gap-xs">
              <span className="text-sm font-semibold text-text-secondary tracking-tight">최종 평가금액</span>
              <div className="flex flex-col gap-1.5">
                <span className="font-numeric text-[2rem] font-bold text-primary tracking-tight tabular-nums leading-tight max-md:text-[1.75rem] md:text-[2.5rem]">
                  {formatPriceByMarket(result.finalValue, selectedMarket)}
                </span>
                <span className={`font-numeric text-base font-semibold tabular-nums ${result.totalReturn >= 0 ? 'number-up' : 'number-down'}`}>
                  {result.totalReturn >= 0 ? '+' : ''}{formatPrice(result.totalReturn)} ({formatPercent(result.totalReturnPercent)})
                </span>
              </div>
            </div>
          </div>

          {/* 세부 메트릭 그리드 */}
          <div className="grid grid-cols-4 gap-sm mb-xl max-md:grid-cols-2 max-md:gap-xs">
            <div className="flex flex-col items-center text-center gap-1.5 p-md bg-bg border border-border-light rounded-md transition-all duration-fast hover:bg-bg-secondary hover:border-border hover:-translate-y-0.5 max-md:p-sm md:py-md md:px-sm">
              <span className="text-[11px] font-semibold text-text-tertiary tracking-wide leading-tight max-md:text-[10px] md:text-[10px]">총 투자금</span>
              <span className="font-numeric text-base font-bold text-text-primary tabular-nums leading-tight max-md:text-[14px] md:text-[17px]">{formatPriceByMarket(result.totalInvestment, selectedMarket)}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-md bg-bg border border-border-light rounded-md transition-all duration-fast hover:bg-bg-secondary hover:border-border hover:-translate-y-0.5 max-md:p-sm md:py-md md:px-sm">
              <span className="text-[11px] font-semibold text-text-tertiary tracking-wide leading-tight max-md:text-[10px] md:text-[10px]">누적 배당금</span>
              <span className="font-numeric text-base font-bold text-success tabular-nums leading-tight max-md:text-[14px] md:text-[17px]">
                {formatPriceByMarket(result.totalDividend, selectedMarket)}
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-md bg-bg border border-border-light rounded-md transition-all duration-fast hover:bg-bg-secondary hover:border-border hover:-translate-y-0.5 max-md:p-sm md:py-md md:px-sm">
              <span className="text-[11px] font-semibold text-text-tertiary tracking-wide leading-tight max-md:text-[10px] md:text-[10px]">연평균 수익률</span>
              <span className={`font-numeric text-base font-bold tabular-nums leading-tight max-md:text-[14px] md:text-[17px] ${result.cagr >= 0 ? 'number-up' : 'number-down'}`}>
                {formatPercent(result.cagr)}
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-md bg-bg border border-border-light rounded-md transition-all duration-fast hover:bg-bg-secondary hover:border-border hover:-translate-y-0.5 max-md:p-sm md:py-md md:px-sm">
              <span className="text-[11px] font-semibold text-text-tertiary tracking-wide leading-tight max-md:text-[10px] md:text-[10px]">투자 기간</span>
              <span className="font-numeric text-base font-bold text-text-primary tabular-nums leading-tight max-md:text-[14px] md:text-[17px]">
                {Math.floor(result.periodDays / 365)}년 {Math.floor((result.periodDays % 365) / 30)}개월
              </span>
            </div>
          </div>

          {/* 차트 섹션 */}
          <div className="pt-xl pb-0 border-t border-border-light md:border-t-0 md:mt-0 md:pt-0">
            <div className="flex flex-col gap-1.5 mb-lg">
              <div className="flex items-center gap-xs mb-0">
                <Activity size={18} className="text-primary flex-shrink-0 max-md:w-4 max-md:h-4" />
                <h3 className="text-base font-extrabold text-text-primary tracking-tight m-0 max-md:text-[14px]">자산 추이</h3>
              </div>
              <p className="text-xs font-medium text-text-tertiary m-0 leading-relaxed max-md:text-[11px]">투자기간 동안의 평가금액과 투자금 변화를 확인할 수 있습니다</p>
            </div>
            <div className="h-[280px] ml-0 mb-0 overflow-visible relative sm:h-[280px] md:h-[320px] lg:h-[350px]">
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
                    dy={5}
                    height={30}
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
        </Card>
      ) : null}

      {/* Disclaimer */}
      <p className="mt-lg py-4 px-5 text-xs leading-relaxed text-text-secondary bg-[rgba(250,251,252,0.6)] border border-[rgba(229,231,235,0.6)] rounded-md text-left font-medium tracking-tight relative pl-12 sm:text-[13px] sm:py-[18px] sm:px-6 sm:pl-[52px] md:text-center md:py-5 md:px-7 md:pl-7 before:content-['ℹ️'] before:absolute before:left-[18px] before:top-1/2 before:-translate-y-1/2 before:text-lg sm:before:left-5 sm:before:text-xl md:before:static md:before:transform-none md:before:mr-3 md:before:inline">
        * 본 백테스트는 과거 데이터 기반 시뮬레이션이며, 미래 수익을 보장하지 않습니다.
        실제 투자 시 수수료, 세금 등이 추가로 발생할 수 있습니다.
      </p>
    </PageContainer>
  );
}
