import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { Card, Badge } from '../components/common';
import { koreanETFs, usETFs, getDividends, getReturns } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent } from '../utils/format';
import styles from './CalendarPage.module.css';

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
  const { selectedMarket, setSelectedMarket } = useETFStore();
  
  // 배당 정보 섹션 ref
  const eventsRef = useRef<HTMLDivElement>(null);
  
  // 시장별 ETF 선택
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
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
      return <span className={styles.sortIconInactive}>⇅</span>;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className={styles.sortIcon} />
      : <ChevronDown size={14} className={styles.sortIcon} />;
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
  
  // 이번 달 예정 배당 합계
  const monthlyDividends = useMemo(() => {
    let exCount = 0;
    let payCount = 0;
    
    calendarDays.forEach(day => {
      if (day.isCurrentMonth) {
        day.events.forEach(event => {
          if (event.type === 'ex') exCount++;
          else payCount++;
        });
      }
    });
    
    return { exCount, payCount };
  }, [calendarDays]);
  
  return (
    <div className={styles.page}>
      {/* 국가 선택 섹션 */}
      <section className={styles.marketSelector}>
        <div className={styles.marketSelectorHeader}>
          <h3 className={styles.marketSelectorTitle}>홈 화면에서 보여줄 ETF 국가 선택</h3>
        </div>
        <div className={styles.marketOptions}>
          <button
            className={`${styles.marketOption} ${selectedMarket === 'korea' ? styles.active : ''}`}
            onClick={() => setSelectedMarket('korea')}
          >
            <span className={styles.marketFlag}>🇰🇷</span>
            <span className={styles.marketName}>한국</span>
          </button>
          <button
            className={`${styles.marketOption} ${selectedMarket === 'us' ? styles.active : ''}`}
            onClick={() => setSelectedMarket('us')}
          >
            <span className={styles.marketFlag}>🇺🇸</span>
            <span className={styles.marketName}>미국</span>
          </button>
        </div>
      </section>
      
      {/* Calendar Card */}
      <Card padding="md">
        {/* Calendar Header */}
        <div className={styles.calendarHeader}>
          <div className={styles.navGroup}>
            <button className={styles.navButton} onClick={goToPrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div className={styles.monthTitle}>
              <span className={styles.year}>{year}년</span>
              <span className={styles.month}>{month + 1}월</span>
            </div>
            <button className={styles.navButton} onClick={goToNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Weekday Labels */}
        <div className={styles.weekdays}>
          {weekDays.map((day, i) => (
            <div 
              key={day} 
              className={`${styles.weekday} ${i === 0 ? styles.sunday : ''} ${i === 6 ? styles.saturday : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const exCount = day.events.filter(e => e.type === 'ex').length;
            const payCount = day.events.filter(e => e.type === 'pay').length;
            const dayOfWeek = index % 7;
            
            return (
              <button
                key={index}
                className={`
                  ${styles.calendarDay}
                  ${!day.isCurrentMonth ? styles.otherMonth : ''}
                  ${day.date === selectedDate ? styles.selected : ''}
                  ${day.events.length > 0 ? styles.hasEvents : ''}
                  ${dayOfWeek === 0 ? styles.sunday : ''}
                  ${dayOfWeek === 6 ? styles.saturday : ''}
                `}
                onClick={() => handleDateClick(day.date)}
              >
                <span className={styles.dayNumber}>{day.day}</span>
                {(exCount > 0 || payCount > 0) && (
                  <div className={styles.eventTags}>
                    {exCount > 0 && (
                      <span className={styles.tagEx}>기준 {exCount}건</span>
                    )}
                    {payCount > 0 && (
                      <span className={styles.tagPay}>지급 {payCount}건</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Legend & Range Selection */}
        <div className={styles.calendarFooter}>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.exDot}`} />
              <span>기준일</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.payDot}`} />
              <span>지급일</span>
            </div>
          </div>
          
          {/* Range Selection */}
          <div className={styles.rangeSection}>
            <div className={styles.rangeGroup}>
              <span className={styles.rangeLabel}>최근</span>
              <div className={styles.rangeButtons}>
                <button 
                  className={`${styles.rangeButton} ${viewMode === 'range' && rangePreset === 'today' ? styles.active : ''}`}
                  onClick={goToToday}
                >
                  오늘
                </button>
                {pastPresets.map(preset => (
                  <button
                    key={preset.value}
                    className={`${styles.rangeButton} ${viewMode === 'range' && rangePreset === preset.value ? styles.active : ''}`}
                    onClick={() => handleRangePreset(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.rangeGroup}>
              <span className={styles.rangeLabel}>향후</span>
              <div className={styles.rangeButtons}>
                {futurePresets.map(preset => (
                  <button
                    key={preset.value}
                    className={`${styles.rangeButton} ${viewMode === 'range' && rangePreset === preset.value ? styles.active : ''}`}
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
        <div className={styles.customRange}>
          <div className={styles.dateInputGroup}>
            <Calendar size={14} />
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <span className={styles.dateSeparator}>~</span>
          <div className={styles.dateInputGroup}>
            <Calendar size={14} />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button 
            className={styles.applyButton}
            onClick={applyCustomRange}
            disabled={!customStartDate || !customEndDate}
          >
            조회
          </button>
        </div>
      </Card>
      
      {/* Events Section */}
      <div ref={eventsRef} className={styles.eventsSection}>
        {(selectedDate || viewMode === 'range') && (
          <Card padding="md">
          <div className={styles.eventsHeader}>
            <h3 className={styles.eventsTitle}>
              <CalendarDays size={18} />
              {viewMode === 'calendar' 
                ? `${selectedDate} 배당 정보` 
                : `${customStartDate} ~ ${customEndDate} 배당 정보`}
            </h3>
            <span className={styles.eventsCount}>
              총 {sortedEvents.length}건
            </span>
          </div>
          
          {sortedEvents.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.eventsTable}>
                <thead>
                  <tr>
                    <th>
                      <button className={styles.sortHeader} onClick={() => handleSort('etfName')}>
                        종목 {renderSortIcon('etfName')}
                      </button>
                    </th>
                    {/* 기간 조회 시에만 날짜 컬럼 표시 */}
                    {viewMode === 'range' && (
                      <th className={styles.textCenter}>
                        <button className={`${styles.sortHeader} ${styles.sortHeaderCenter}`} onClick={() => handleSort('eventDate')}>
                          날짜 {renderSortIcon('eventDate')}
                        </button>
                      </th>
                    )}
                    <th className={styles.textCenter}>
                      <button className={`${styles.sortHeader} ${styles.sortHeaderCenter}`} onClick={() => handleSort('type')}>
                        구분 {renderSortIcon('type')}
                      </button>
                    </th>
                    <th className={styles.textRight}>
                      <button className={`${styles.sortHeader} ${styles.sortHeaderRight}`} onClick={() => handleSort('amount')}>
                        배당금 {renderSortIcon('amount')}
                      </button>
                    </th>
                    <th className={styles.textRight}>
                      <button className={`${styles.sortHeader} ${styles.sortHeaderRight}`} onClick={() => handleSort('dividendYield')}>
                        배당수익률 {renderSortIcon('dividendYield')}
                      </button>
                    </th>
                    <th className={styles.textRight}>
                      <button className={`${styles.sortHeader} ${styles.sortHeaderRight}`} onClick={() => handleSort('price')}>
                        현재주가 {renderSortIcon('price')}
                      </button>
                    </th>
                    <th className={styles.textRight}>
                      <button className={`${styles.sortHeader} ${styles.sortHeaderRight}`} onClick={() => handleSort('return1m')}>
                        1개월 수익률 {renderSortIcon('return1m')}
                      </button>
                    </th>
                    {/* 단일 날짜 조회 시에만 관련일자 컬럼 표시 */}
                    {viewMode === 'calendar' && (
                      <th className={styles.textRight}>관련일자</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event, index) => (
                    <tr 
                      key={index}
                      onClick={() => navigate(`/etf/${event.etfId}`)}
                      className={styles.clickableRow}
                    >
                      <td>
                        <div className={styles.cellEtf}>
                          <span className={styles.cellName}>{event.etfName}</span>
                          <span className={styles.cellTicker}>{event.ticker}</span>
                        </div>
                      </td>
                      {/* 기간 조회 시에만 날짜 컬럼 표시 */}
                      {viewMode === 'range' && (
                        <td className={styles.textCenter}>
                          <span className={styles.cellDate}>{event.eventDate?.replace(/-/g, '.')}</span>
                        </td>
                      )}
                      <td className={styles.textCenter}>
                        <Badge 
                          variant={event.type === 'ex' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {event.type === 'ex' ? '기준일' : '지급일'}
                        </Badge>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.cellAmount}>{formatPrice(event.amount)}원</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.cellYield}>{event.dividendYield}%</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.cellPrice}>{formatPrice(event.price)}</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={`${styles.cellReturn} ${event.return1m >= 0 ? styles.textUp : styles.textDown}`}>
                          {formatPercent(event.return1m)}
                        </span>
                      </td>
                      {/* 단일 날짜 조회 시에만 관련일자 컬럼 표시 */}
                      {viewMode === 'calendar' && (
                        <td className={styles.textRight}>
                          <div className={styles.cellDates}>
                            <span className={styles.dateLabel}>{event.type === 'ex' ? '지급예정' : '기준일'}</span>
                            <span className={styles.dateValue}>{event.type === 'ex' ? event.payDate : event.exDate}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.noEvents}>
              {viewMode === 'calendar' 
                ? '선택한 날짜에 배당 일정이 없습니다.' 
                : '선택한 기간에 배당 일정이 없습니다.'}
            </p>
          )}
        </Card>
        )}
      </div>
    </div>
  );
}
