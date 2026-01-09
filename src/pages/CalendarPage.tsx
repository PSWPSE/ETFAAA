import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { Card, Badge } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanETFs, usETFs, getDividends, getReturns } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPriceByMarket, formatPercent } from '../utils/format';

interface DividendEvent {
  etfId: string;
  etfName: string;
  ticker: string;
  amount: number;
  type: 'ex' | 'pay';
  price: number;
  dividendYield: number;
  return1m: number;
  exDate: string;
  payDate: string;
  eventDate?: string; // 기간 조회 시 해당 이벤트 날짜
}

type SortField = 'etfName' | 'type' | 'amount' | 'dividendYield' | 'price' | 'return1m' | 'eventDate';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'calendar' | 'range';

// 기간 프리셋
const rangePresets = [
  // 최근 (과거)
  { value: 'past-1w', label: '1주일', days: 7, direction: 'past' },
  { value: 'past-1m', label: '1개월', days: 30, direction: 'past' },
  { value: 'past-3m', label: '3개월', days: 90, direction: 'past' },
  // 향후 (미래)
  { value: 'future-1w', label: '1주일', days: 7, direction: 'future' },
  { value: 'future-1m', label: '1개월', days: 30, direction: 'future' },
  { value: 'future-3m', label: '3개월', days: 90, direction: 'future' },
];

const pastPresets = rangePresets.filter(p => p.direction === 'past');
const futurePresets = rangePresets.filter(p => p.direction === 'future');

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('etfName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [rangePreset, setRangePreset] = useState('1m');
  // 기본값을 오늘 날짜로 설정
  const today = new Date().toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);
  const { selectedMarket } = useETFStore();

  // 배당 정보 섹션 ref
  const eventsRef = useRef<HTMLDivElement>(null);

  // 시장별 ETF 선택
  const etfs = selectedMarket === 'korea'
    ? koreanETFs
    : selectedMarket === 'us'
      ? usETFs
      : [...koreanETFs, ...usETFs];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 배당 이벤트 수집
  const dividendEvents = useMemo(() => {
    const events: Record<string, DividendEvent[]> = {};

    etfs.forEach(etf => {
      const dividends = getDividends(etf.id);
      const returns = getReturns(etf.id);

      dividends.forEach(div => {
        const commonData = {
          etfId: etf.id,
          etfName: etf.name,
          ticker: etf.ticker,
          amount: div.amount,
          price: etf.price,
          dividendYield: etf.dividendYield,
          return1m: returns.month1,
          exDate: div.exDate,
          payDate: div.payDate,
        };

        // 배당락일 (기준일)
        if (!events[div.exDate]) events[div.exDate] = [];
        events[div.exDate].push({
          ...commonData,
          type: 'ex',
        });

        // 지급일
        if (!events[div.payDate]) events[div.payDate] = [];
        events[div.payDate].push({
          ...commonData,
          type: 'pay',
        });
      });
    });

    return events;
  }, [etfs]);

  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean; events: DividendEvent[] }[] = [];

    // 이전 달의 날짜들
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: false,
        events: dividendEvents[dateStr] || [],
      });
    }

    // 현재 달의 날짜들
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        events: dividendEvents[dateStr] || [],
      });
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length;
    for (let d = 1; d <= remainingDays; d++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: false,
        events: dividendEvents[dateStr] || [],
      });
    }

    return days;
  }, [year, month, dividendEvents]);

  // 기간별 이벤트 필터링 (sortedEvents보다 먼저 정의해야 함)
  const rangeEvents = useMemo(() => {
    if (viewMode !== 'range' || !customStartDate || !customEndDate) return [];

    const events: DividendEvent[] = [];
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    Object.entries(dividendEvents).forEach(([dateStr, dayEvents]) => {
      const date = new Date(dateStr);
      if (date >= start && date <= end) {
        // 각 이벤트에 해당 날짜 추가
        dayEvents.forEach(event => {
          events.push({ ...event, eventDate: dateStr });
        });
      }
    });

    return events;
  }, [viewMode, customStartDate, customEndDate, dividendEvents]);

  // 정렬된 이벤트 (단일 날짜 또는 기간)
  const sortedEvents = useMemo(() => {
    let events: DividendEvent[] = [];

    if (viewMode === 'calendar' && selectedDate) {
      events = dividendEvents[selectedDate] || [];
    } else if (viewMode === 'range') {
      events = rangeEvents;
    }

    return [...events].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'etfName':
          comparison = a.etfName.localeCompare(b.etfName);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'dividendYield':
          comparison = a.dividendYield - b.dividendYield;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'return1m':
          comparison = a.return1m - b.return1m;
          break;
        case 'eventDate':
          comparison = (a.eventDate || '').localeCompare(b.eventDate || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [viewMode, selectedDate, rangeEvents, dividendEvents, sortField, sortDirection]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // 새 필드는 내림차순으로 시작
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-[10px] text-text-tertiary opacity-50 flex-shrink-0">&#8645;</span>;
    }
    return sortDirection === 'asc'
      ? <ChevronUp size={14} className="text-primary flex-shrink-0" />
      : <ChevronDown size={14} className="text-primary flex-shrink-0" />;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    setCurrentDate(new Date());
    setSelectedDate(null);
    setViewMode('range');
    setRangePreset('today');
    setCustomStartDate(todayDate);
    setCustomEndDate(todayDate);

    setTimeout(() => {
      eventsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // 날짜 클릭 핸들러 (스크롤 포함)
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setViewMode('calendar');

    // 배당 정보 섹션으로 스크롤
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // 기간 선택 핸들러
  const handleRangePreset = (preset: string) => {
    setRangePreset(preset);
    setSelectedDate(null);
    setViewMode('range');

    const found = rangePresets.find(p => p.value === preset);
    if (found) {
      const today = new Date();
      let start: Date, end: Date;

      if (found.direction === 'past') {
        // 최근: 과거 ~ 오늘
        end = new Date(today);
        start = new Date(today);
        start.setDate(start.getDate() - found.days);
      } else {
        // 향후: 오늘 ~ 미래
        start = new Date(today);
        end = new Date(today);
        end.setDate(end.getDate() + found.days);
      }

      setCustomStartDate(start.toISOString().split('T')[0]);
      setCustomEndDate(end.toISOString().split('T')[0]);
    }

    setTimeout(() => {
      eventsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // 커스텀 기간 적용
  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setRangePreset('');
      setSelectedDate(null);
      setViewMode('range');

      setTimeout(() => {
        eventsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <PageContainer
      title="배당 캘린더"
      subtitle="ETF 배당 일정을 한눈에 확인하세요"
      showMarketSelector={true}
    >

      {/* Calendar Card */}
      <Card padding="md">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-sm">
          <div className="flex items-center gap-0.5">
            <button className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary transition-all duration-150 hover:bg-layer-1 hover:text-text-primary" onClick={goToPrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-baseline gap-1 px-sm">
              <span className="text-sm text-text-tertiary">{year}년</span>
              <span className="text-lg font-bold text-text-primary">{month + 1}월</span>
            </div>
            <button className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary transition-all duration-150 hover:bg-layer-1 hover:text-text-primary" onClick={goToNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`py-2 px-1 text-center text-[11px] font-semibold text-text-tertiary uppercase ${i === 0 ? 'text-danger' : ''} ${i === 6 ? 'text-info' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border/50 rounded-md overflow-hidden">
          {calendarDays.map((day, index) => {
            const exCount = day.events.filter(e => e.type === 'ex').length;
            const payCount = day.events.filter(e => e.type === 'pay').length;
            const dayOfWeek = index % 7;

            return (
              <button
                key={index}
                className={`
                  relative flex flex-col items-center justify-start gap-1 py-1.5 px-0.5 bg-white transition-all duration-150 min-h-[70px] md:py-2 md:px-1 md:min-h-[80px]
                  hover:bg-layer-1
                  ${!day.isCurrentMonth ? 'bg-layer-1' : ''}
                  ${day.date === selectedDate ? 'bg-primary' : ''}
                  ${day.events.length > 0 ? 'font-semibold' : ''}
                `}
                onClick={() => handleDateClick(day.date)}
              >
                <span className={`
                  text-[13px] font-semibold leading-none mb-0.5 md:text-sm
                  ${!day.isCurrentMonth ? 'text-text-tertiary opacity-40' : day.date === selectedDate ? 'text-white' : dayOfWeek === 0 ? 'text-danger' : dayOfWeek === 6 ? 'text-info' : 'text-text-primary'}
                `}>{day.day}</span>
                {(exCount > 0 || payCount > 0) && (
                  <div className={`flex flex-col items-center gap-0.5 w-full px-px md:gap-[3px] ${!day.isCurrentMonth ? 'opacity-50' : ''} ${day.date === selectedDate ? 'opacity-95' : ''}`}>
                    {exCount > 0 && (
                      <span className="flex items-center justify-center w-full max-w-[54px] py-0.5 px-1 rounded bg-[#FEF3C7] text-[#92400E] text-[9px] font-semibold leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis md:text-[10px] md:py-[3px] md:px-1.5 md:max-w-16">기준 {exCount}건</span>
                    )}
                    {payCount > 0 && (
                      <span className="flex items-center justify-center w-full max-w-[54px] py-0.5 px-1 rounded bg-[#D1FAE5] text-[#065F46] text-[9px] font-semibold leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis md:text-[10px] md:py-[3px] md:px-1.5 md:max-w-16">지급 {payCount}건</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend & Range Selection */}
        <div className="flex flex-col gap-md mt-md pt-md border-t border-border/50 md:flex-row md:justify-between md:items-center">
          <div className="flex justify-start gap-md md:justify-center md:gap-lg">
            <div className="flex items-center gap-1 text-[11px] text-text-secondary md:gap-1.5 md:text-xs">
              <span className="inline-flex items-center justify-center py-0.5 px-1.5 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-semibold after:content-['기준']" />
              <span>기준일</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text-secondary md:gap-1.5 md:text-xs">
              <span className="inline-flex items-center justify-center py-0.5 px-1.5 rounded bg-[#D1FAE5] text-[#065F46] text-[10px] font-semibold after:content-['지급']" />
              <span>지급일</span>
            </div>
          </div>

          {/* Range Selection */}
          <div className="flex flex-col items-start gap-sm w-full md:flex-row md:items-center md:gap-md md:w-auto">
            <div className="flex items-center gap-xs">
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap min-w-7 md:text-xs">최근</span>
              <div className="flex bg-layer-2 rounded-md p-0.5 gap-0.5">
                <button
                  className={`py-[5px] px-2 text-[11px] font-medium text-text-tertiary bg-transparent rounded-sm transition-all duration-150 whitespace-nowrap md:py-1.5 md:px-3 md:text-xs hover:text-text-secondary ${viewMode === 'range' && rangePreset === 'today' ? 'bg-white text-primary shadow-sm' : ''}`}
                  onClick={goToToday}
                >
                  오늘
                </button>
                {pastPresets.map(preset => (
                  <button
                    key={preset.value}
                    className={`py-[5px] px-2 text-[11px] font-medium text-text-tertiary bg-transparent rounded-sm transition-all duration-150 whitespace-nowrap md:py-1.5 md:px-3 md:text-xs hover:text-text-secondary ${viewMode === 'range' && rangePreset === preset.value ? 'bg-white text-primary shadow-sm' : ''}`}
                    onClick={() => handleRangePreset(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-xs">
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap min-w-7 md:text-xs">향후</span>
              <div className="flex bg-layer-2 rounded-md p-0.5 gap-0.5">
                {futurePresets.map(preset => (
                  <button
                    key={preset.value}
                    className={`py-[5px] px-2 text-[11px] font-medium text-text-tertiary bg-transparent rounded-sm transition-all duration-150 whitespace-nowrap md:py-1.5 md:px-3 md:text-xs hover:text-text-secondary ${viewMode === 'range' && rangePreset === preset.value ? 'bg-white text-primary shadow-sm' : ''}`}
                    onClick={() => handleRangePreset(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-sm mt-sm pt-sm border-t border-border/50 flex-wrap">
          <div className="flex items-center gap-1.5 py-1.5 px-2.5 bg-white border border-border rounded-md text-text-tertiary flex-1 min-w-[130px]">
            <Calendar size={14} />
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border-none outline-none text-[13px] text-text-primary bg-transparent w-full min-h-5"
            />
          </div>
          <span className="text-sm text-text-tertiary flex-shrink-0">~</span>
          <div className="flex items-center gap-1.5 py-1.5 px-2.5 bg-white border border-border rounded-md text-text-tertiary flex-1 min-w-[130px]">
            <Calendar size={14} />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border-none outline-none text-[13px] text-text-primary bg-transparent w-full min-h-5"
            />
          </div>
          <button
            className="py-2 px-4 text-[13px] font-semibold text-white bg-primary rounded-md transition-all duration-150 whitespace-nowrap flex-shrink-0 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={applyCustomRange}
            disabled={!customStartDate || !customEndDate}
          >
            조회
          </button>
        </div>
      </Card>

      {/* Events Section */}
      <div ref={eventsRef} className="scroll-mt-[calc(var(--header-height)+var(--spacing-md))]">
        {(selectedDate || viewMode === 'range') && (
          <Card padding="md">
          <div className="flex items-center justify-between mb-md">
            <h3 className="flex items-center gap-sm text-[15px] font-semibold text-text-primary m-0">
              <CalendarDays size={18} />
              {viewMode === 'calendar'
                ? `${selectedDate} 배당 정보`
                : `${customStartDate} ~ ${customEndDate} 배당 정보`}
            </h3>
            <span className="text-[13px] font-semibold text-primary bg-primary/10 py-1 px-2.5 rounded-full">
              총 {sortedEvents.length}건
            </span>
          </div>

          {sortedEvents.length > 0 ? (
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] mx-[-16px] px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse border-spacing-0 text-[13px] min-w-[600px] md:min-w-0">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap hover:text-text-primary" onClick={() => handleSort('etfName')}>
                        종목 {renderSortIcon('etfName')}
                      </button>
                    </th>
                    {/* 기간 조회 시에만 날짜 컬럼 표시 */}
                    {viewMode === 'range' && (
                      <th className="text-center py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                        <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-center w-full hover:text-text-primary" onClick={() => handleSort('eventDate')}>
                          날짜 {renderSortIcon('eventDate')}
                        </button>
                      </th>
                    )}
                    <th className="text-center py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-center w-full hover:text-text-primary" onClick={() => handleSort('type')}>
                        구분 {renderSortIcon('type')}
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-end w-full hover:text-text-primary" onClick={() => handleSort('amount')}>
                        배당금 {renderSortIcon('amount')}
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-end w-full hover:text-text-primary" onClick={() => handleSort('dividendYield')}>
                        배당수익률 {renderSortIcon('dividendYield')}
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-end w-full hover:text-text-primary" onClick={() => handleSort('price')}>
                        현재주가 {renderSortIcon('price')}
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 p-0 bg-none border-none text-xs font-medium text-text-tertiary cursor-pointer transition-colors duration-150 whitespace-nowrap justify-end w-full hover:text-text-primary" onClick={() => handleSort('return1m')}>
                        1개월 수익률 {renderSortIcon('return1m')}
                      </button>
                    </th>
                    {/* 단일 날짜 조회 시에만 관련일자 컬럼 표시 */}
                    {viewMode === 'calendar' && (
                      <th className="text-right py-3 px-2 font-medium text-text-tertiary border-b border-border/50 text-xs whitespace-nowrap">관련일자</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event, index) => (
                    <tr
                      key={index}
                      onClick={() => navigate(`/etf/${event.etfId}`)}
                      className="cursor-pointer transition-all duration-200 hover:bg-[linear-gradient(90deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0.04)_50%,rgba(59,130,246,0.02)_100%)] active:bg-[linear-gradient(90deg,rgba(59,130,246,0.04)_0%,rgba(59,130,246,0.06)_50%,rgba(59,130,246,0.04)_100%)] last:[&>td]:border-b-0"
                    >
                      <td className="py-3 px-2 border-b border-border/50 text-text-primary">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-text-primary">{event.etfName}</span>
                          <span className="text-[11px] text-text-tertiary">{event.ticker}</span>
                        </div>
                      </td>
                      {/* 기간 조회 시에만 날짜 컬럼 표시 */}
                      {viewMode === 'range' && (
                        <td className="text-center py-3 px-2 border-b border-border/50 text-text-primary">
                          <span className="text-[13px] font-medium text-text-secondary tabular-nums">{event.eventDate?.replace(/-/g, '.')}</span>
                        </td>
                      )}
                      <td className="text-center py-3 px-2 border-b border-border/50 text-text-primary">
                        <Badge
                          variant={event.type === 'ex' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {event.type === 'ex' ? '기준일' : '지급일'}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-2 border-b border-border/50 text-text-primary">
                        <span className="font-semibold">{formatPriceByMarket(event.amount, selectedMarket)}</span>
                      </td>
                      <td className="text-right py-3 px-2 border-b border-border/50 text-text-primary">
                        <span className="text-text-secondary">{event.dividendYield}%</span>
                      </td>
                      <td className="text-right py-3 px-2 border-b border-border/50 text-text-primary">
                        <span className="text-text-secondary font-mono">{formatPriceByMarket(event.price, selectedMarket)}</span>
                      </td>
                      <td className="text-right py-3 px-2 border-b border-border/50 text-text-primary">
                        <span className={`font-medium ${event.return1m >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatPercent(event.return1m)}
                        </span>
                      </td>
                      {/* 단일 날짜 조회 시에만 관련일자 컬럼 표시 */}
                      {viewMode === 'calendar' && (
                        <td className="text-right py-3 px-2 border-b border-border/50 text-text-primary">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-text-tertiary">{event.type === 'ex' ? '지급예정' : '기준일'}</span>
                            <span className="text-xs text-text-secondary">{event.type === 'ex' ? event.payDate : event.exDate}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-text-tertiary text-sm p-lg m-0">
              {viewMode === 'calendar'
                ? '선택한 날짜에 배당 일정이 없습니다.'
                : '선택한 기간에 배당 일정이 없습니다.'}
            </p>
          )}
        </Card>
        )}
      </div>
    </PageContainer>
  );
}
