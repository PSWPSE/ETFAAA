import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X, LayoutGrid, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Treemap } from 'recharts';
import { Card, Button } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanThemes, usThemes, koreanETFs, usETFs, getReturns } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPercent, formatLargeNumber, formatPriceByMarket, formatLargeNumberByMarket } from '../utils/format';
import type { ThemeCategory } from '../types/etf';

type ViewMode = 'list' | 'map';

// Treemap 커스텀 컨텐츠 컴포넌트
interface CustomTreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  return?: number;
  etfCount?: number;
  id?: string;
  onClick?: (id: string) => void;
}

const CustomTreemapContent: React.FC<CustomTreemapContentProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = '',
  return: returnValue = 0,
  etfCount = 0,
  id = '',
  onClick,
}) => {
  if (width < 40 || height < 40) return null; // 너무 작은 셀은 렌더링하지 않음

  const getHeatmapColor = (ret: number) => {
    if (ret >= 30) return '#15803d'; // 진한 초록
    if (ret >= 20) return '#16a34a'; // 초록
    if (ret >= 10) return '#22c55e'; // 연한 초록
    if (ret >= 5) return '#4ade80';  // 밝은 초록
    if (ret >= 0) return '#86efac';  // 매우 밝은 초록
    if (ret >= -5) return '#fca5a5'; // 밝은 빨강
    if (ret >= -10) return '#f87171'; // 연한 빨강
    if (ret >= -20) return '#ef4444'; // 빨강
    return '#dc2626'; // 진한 빨강
  };

  const getHeatmapTextColor = (ret: number) => {
    return Math.abs(ret) >= 5 ? '#ffffff' : '#1f2937';
  };

  const fontSize = width > 150 ? 14 : width > 100 ? 12 : 10;
  const showEtfCount = height > 60;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getHeatmapColor(returnValue),
          cursor: 'pointer',
        }}
        onClick={() => onClick && onClick(id)}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - (showEtfCount ? 10 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: getHeatmapTextColor(returnValue),
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          pointerEvents: 'none',
        }}
      >
        {name.length > 15 ? `${name.slice(0, 13)}...` : name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + (showEtfCount ? 8 : 12)}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: getHeatmapTextColor(returnValue),
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          pointerEvents: 'none',
        }}
      >
        {returnValue >= 0 ? '+' : ''}{returnValue.toFixed(1)}%
      </text>
      {showEtfCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 24}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: getHeatmapTextColor(returnValue),
            fontSize: `${fontSize - 2}px`,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {etfCount}개 ETF
        </text>
      )}
    </g>
  );
};

// 기간 선택 옵션
const PERIOD_OPTIONS = [
  { value: '1m', label: '1개월', shortLabel: '1M' },
  { value: '3m', label: '3개월', shortLabel: '3M' },
  { value: '6m', label: '6개월', shortLabel: '6M' },
  { value: '1y', label: '1년', shortLabel: '1Y' },
];

// 카테고리 옵션
const CATEGORY_OPTIONS: { value: ThemeCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'index', label: '국가/지수' },
  { value: 'sector', label: '산업/섹터' },
  { value: 'strategy', label: '투자전략' },
  { value: 'asset', label: '투자자산' },
  { value: 'single', label: '단일종목' },
  { value: 'leverage', label: '레버리지/인버스' },
];

// 정렬 옵션
type SortField = 'return' | 'etfCount' | 'name';

type EtfSortOption = 'return' | 'marketCap' | 'dividend';

export default function ThemePage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');
  const [sortField] = useState<SortField>('return');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [etfSortBy, setEtfSortBy] = useState<EtfSortOption>('return');
  const [rotatingPeriod, setRotatingPeriod] = useState<'1d' | '1m' | '3m' | '1y'>('1y');
  const [displayMetric, setDisplayMetric] = useState<'return' | 'etfCount'>('return');

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 시장별 데이터 선택
  const themes = selectedMarket === 'korea' ? koreanThemes : usThemes;
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;

  // 테마로 ETF 필터링
  const getETFsByTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return [];
    return etfs.filter(etf =>
      etf.themes.some(t => t.toLowerCase().includes(theme.name.toLowerCase().slice(0, 2)))
    );
  };

  // 기간에 따른 수익률 계산
  const getReturnByPeriod = (baseReturn: number, period: string) => {
    const multipliers: Record<string, number> = {
      '1m': 0.1,
      '3m': 0.3,
      '6m': 0.6,
      '1y': 1.0,
    };
    return baseReturn * (multipliers[period] || 1);
  };

  const selectedPeriodLabel = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label || '1년';

  // 자동완성 목록 (최대 10개)
  const autocompleteResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return themes
      .filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label.toLowerCase().includes(query)
      )
      .slice(0, 10)
      .map(theme => ({
        ...theme,
        periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
      }));
  }, [themes, searchQuery, selectedPeriod]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          const selectedTheme = autocompleteResults[selectedIndex];
          navigate(`/theme/${selectedTheme.id}`);
          setShowAutocomplete(false);
          setSearchQuery('');
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 테마 선택 핸들러
  const handleSelectTheme = (themeId: string) => {
    navigate(`/theme/${themeId}`);
    setShowAutocomplete(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  // 정렬 토글
  // 테마 데이터 처리
  const processedThemes = useMemo(() => {
    // 기간별 수익률 적용 및 AUM 합산
    let result = themes.map(theme => {
      const themeETFs = getETFsByTheme(theme.id);
      const totalAUM = themeETFs.reduce((sum, etf) => sum + etf.marketCap, 0);

      return {
        ...theme,
        periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
        totalAUM,
      };
    });

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        // 카테고리 라벨도 검색
        CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label.toLowerCase().includes(query)
      );
    }

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      result = result.filter(theme => theme.category === selectedCategory);
    }

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'return':
          comparison = a.periodReturn - b.periodReturn;
          break;
        case 'etfCount':
          comparison = a.etfCount - b.etfCount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [themes, selectedPeriod, selectedCategory, sortField, sortOrder, searchQuery]);

  // 차트용 상위/하위 10개
  const chartData = useMemo(() => {
    const allWithReturn = themes.map(theme => ({
      ...theme,
      periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
    })).sort((a, b) => b.periodReturn - a.periodReturn);

    return {
      top: allWithReturn.slice(0, 8).map(t => ({ id: t.id, name: t.name, return: t.periodReturn })),
      bottom: allWithReturn.slice(-8).reverse().map(t => ({ id: t.id, name: t.name, return: t.periodReturn })),
    };
  }, [themes, selectedPeriod]);

  // 카테고리별 통계
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; avgReturn: number }> = {};
    themes.forEach(theme => {
      const ret = getReturnByPeriod(theme.avgReturn, selectedPeriod);
      if (!stats[theme.category]) {
        stats[theme.category] = { count: 0, avgReturn: 0 };
      }
      stats[theme.category].count += 1;
      stats[theme.category].avgReturn += ret;
    });
    Object.keys(stats).forEach(key => {
      stats[key].avgReturn = stats[key].avgReturn / stats[key].count;
    });
    return stats;
  }, [themes, selectedPeriod]);

  // 히트맵용 카테고리별 테마 데이터
  const heatmapData = useMemo(() => {
    const categoryOrder: (ThemeCategory | 'all')[] = ['index', 'sector', 'strategy', 'asset', 'single', 'leverage'];

    return categoryOrder.map(cat => {
      if (cat === 'all') return null;
      const categoryThemes = themes
        .filter(t => t.category === cat)
        .map(theme => {
          const themeETFs = getETFsByTheme(theme.id);
          const totalAUM = themeETFs.reduce((sum, etf) => sum + etf.marketCap, 0);

          return {
            ...theme,
            periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
            totalAUM,
          };
        })
        .sort((a, b) => b.periodReturn - a.periodReturn);

      return {
        category: cat,
        label: CATEGORY_OPTIONS.find(c => c.value === cat)?.label || cat,
        themes: categoryThemes,
        avgReturn: categoryThemes.length > 0
          ? categoryThemes.reduce((sum, t) => sum + t.periodReturn, 0) / categoryThemes.length
          : 0,
      };
    }).filter(Boolean) as { category: ThemeCategory; label: string; themes: typeof processedThemes; avgReturn: number }[];
  }, [themes, selectedPeriod, etfs]);

  // 테마 상세용 데이터 (모든 Hook은 조건문 전에 선언)
  const theme = themes.find(t => t.id === themeId);
  const themeETFs = themeId ? getETFsByTheme(themeId) : [];

  // ETF별 수익률 계산
  const etfReturns = useMemo(() => {
    if (!themeId || themeETFs.length === 0) return [];

    const etfsWithReturn = themeETFs.map(etf => {
      const returns = getReturns(etf.id);
      return {
        ...etf,
        return1d: etf.changePercent,
        return1m: returns.month1,
        return3m: returns.month3,
        return1y: returns.year1,
      };
    });

    // 정렬
    return [...etfsWithReturn].sort((a, b) => {
      switch (etfSortBy) {
        case 'return':
          return b.return1y - a.return1y;
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'dividend':
          return b.dividendYield - a.dividendYield;
        default:
          return 0;
      }
    });
  }, [themeId, themeETFs, etfSortBy]);

  // 기간별 평균 수익률 계산
  const avgReturns = useMemo(() => {
    if (etfReturns.length === 0) return { '1d': 0, '1m': 0, '3m': 0, '1y': 0 };

    return {
      '1d': etfReturns.reduce((sum, etf) => sum + etf.return1d, 0) / etfReturns.length,
      '1m': etfReturns.reduce((sum, etf) => sum + etf.return1m, 0) / etfReturns.length,
      '3m': etfReturns.reduce((sum, etf) => sum + etf.return3m, 0) / etfReturns.length,
      '1y': etfReturns.reduce((sum, etf) => sum + etf.return1y, 0) / etfReturns.length,
    };
  }, [etfReturns]);

  // 현재 표시할 수익률 정보
  const currentReturnInfo = useMemo(() => {
    const labels = {
      '1d': '오늘 수익률',
      '1m': '1개월 수익률',
      '3m': '3개월 수익률',
      '1y': '1년 수익률',
    };

    return {
      label: labels[rotatingPeriod],
      value: avgReturns[rotatingPeriod],
    };
  }, [rotatingPeriod, avgReturns]);

  // 수익률 로테이션 효과 (테마 상세에서만 작동)
  useEffect(() => {
    if (!themeId) return; // 테마 목록에서는 실행하지 않음

    const periods: ('1d' | '1m' | '3m' | '1y')[] = ['1d', '1m', '3m', '1y'];
    let currentIndex = periods.indexOf(rotatingPeriod);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % periods.length;
      setRotatingPeriod(periods[currentIndex]);
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval);
  }, [themeId, rotatingPeriod]);

  // 테마 선택 안됨 -> 테마 목록
  if (!themeId) {
    return (
      <PageContainer
        title="테마별 ETF"
        subtitle="투자 테마로 ETF를 찾아보세요"
        showMarketSelector={true}
      >
        {/* 수익률 차트 - 상위/하위 */}
        <Card padding="md" className="bg-white">
          <div className="flex flex-col gap-sm mb-md md:flex-row md:justify-between md:items-center">
            <div className="flex items-baseline gap-sm">
              <h3 className="text-base font-semibold text-text-primary m-0 md:text-lg">Top10 테마</h3>
              <span className="text-xs text-text-tertiary">최근 {selectedPeriodLabel} 수익률 기준</span>
            </div>
            <div className="flex bg-layer-1 rounded-md p-[3px] gap-[2px] shrink-0">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`px-sm py-xs min-w-[40px] min-h-[32px] rounded-sm text-xs font-semibold transition-all ${
                    selectedPeriod === option.value
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-text-secondary bg-transparent hover:text-text-primary'
                  }`}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {/* 상위 */}
            <div className="bg-layer-1 rounded-lg p-sm overflow-hidden">
              <div className="px-sm py-xs mb-xs">
                <span className="inline-flex items-center px-[10px] py-[4px] rounded-sm text-[11px] font-bold tracking-[0.5px] bg-[rgba(16,185,129,0.1)] text-[#059669]">TOP 8</span>
              </div>
              <div className="bg-white rounded-md p-xs overflow-hidden">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData.top} layout="vertical" margin={{ left: 5, right: 25 }}>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '수익률']}
                      contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="return"
                      radius={[0, 4, 4, 0]}
                      onClick={(data: any) => navigate(`/theme/${data.id}`)}
                      cursor="pointer"
                    >
                      {chartData.top.map((_, i) => (
                        <Cell key={i} fill={`hsl(142, ${70 - i * 5}%, ${45 + i * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 하위 */}
            <div className="bg-layer-1 rounded-lg p-sm overflow-hidden">
              <div className="px-sm py-xs mb-xs">
                <span className="inline-flex items-center px-[10px] py-[4px] rounded-sm text-[11px] font-bold tracking-[0.5px] bg-[rgba(239,68,68,0.1)] text-[#DC2626]">BOTTOM 8</span>
              </div>
              <div className="bg-white rounded-md p-xs overflow-hidden">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData.bottom} layout="vertical" margin={{ left: 5, right: 25 }}>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '수익률']}
                      contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="return"
                      radius={[0, 4, 4, 0]}
                      onClick={(data: any) => navigate(`/theme/${data.id}`)}
                      cursor="pointer"
                    >
                      {chartData.bottom.map((entry, i) => (
                        <Cell key={i} fill={entry.return >= 0 ? '#10B981' : `hsl(0, ${60 + i * 4}%, ${55 - i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        {/* 테마 검색 */}
        <Card padding="md" className="bg-white">
          <div className="mb-md">
            <h3 className="text-base font-semibold text-text-primary m-0 md:text-lg">테마 검색</h3>
          </div>

          <div className="relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-[14px] text-text-tertiary pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                className="w-full h-12 px-11 bg-white border border-border rounded-lg text-base text-text-primary transition-all placeholder:text-text-tertiary focus:outline-none"
                placeholder="테마 검색 (예: 반도체, AI, 배당...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAutocomplete(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowAutocomplete(true);
                  }
                }}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 flex items-center justify-center w-7 h-7 rounded-full text-text-tertiary transition-all hover:bg-layer-1 hover:text-text-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setShowAutocomplete(false);
                    setSelectedIndex(-1);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 자동완성 드롭다운 */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-[1000] animate-[fadeInDown_0.2s_ease-out]">
                {autocompleteResults.map((theme, index) => (
                  <button
                    key={theme.id}
                    className={`flex items-center justify-between w-full px-md py-sm bg-transparent border-none border-b border-border/50 cursor-pointer transition-all text-left last:border-b-0 ${
                      index === selectedIndex ? 'bg-layer-1' : 'hover:bg-layer-1'
                    }`}
                    onClick={() => handleSelectTheme(theme.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span className="text-sm font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{theme.name}</span>
                      <div className="flex items-center gap-xs text-xs text-text-tertiary">
                        <span className="px-1.5 py-0.5 bg-layer-1 rounded-sm text-[10px] font-medium">
                          {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
                        </span>
                        <span className="text-xs">
                          {theme.etfCount}개 ETF
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm shrink-0">
                      <span className={`text-sm font-bold tabular-nums ${theme.periodReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {theme.periodReturn >= 0 ? '+' : ''}{theme.periodReturn.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 테마 전체보기 */}
        <Card padding="md" className="bg-white">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-base font-semibold text-text-primary m-0 md:text-lg">테마 전체보기</h3>
            <div className="flex bg-layer-1 rounded-md p-[3px] gap-[2px] shrink-0">
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-sm transition-all ${
                  viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
                }`}
                onClick={() => setViewMode('list')}
                title="리스트로 보기"
              >
                <List size={16} />
              </button>
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-sm transition-all ${
                  viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
                }`}
                onClick={() => setViewMode('map')}
                title="맵으로 보기"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-sm bg-white border border-border/50 rounded-lg p-md">
          <div className="flex items-center gap-md pb-sm border-b border-border/50 max-md:flex-col max-md:items-stretch max-md:gap-sm">
            <div className="flex gap-xs overflow-x-auto flex-1 scrollbar-none max-md:flex-wrap max-md:overflow-x-visible">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  className={`flex items-center gap-1.5 px-sm py-xs border border-transparent rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 min-h-[36px] max-md:text-xs max-md:px-[10px] max-md:py-1.5 max-md:min-h-[32px] ${
                    selectedCategory === cat.value
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-layer-1 text-text-secondary hover:bg-border'
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span className="font-medium">{cat.label}</span>
                  {cat.value !== 'all' && categoryStats[cat.value] && (
                    <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[10px] font-semibold ${
                      selectedCategory === cat.value ? 'bg-primary text-white' : 'bg-black/[0.08]'
                    }`}>{categoryStats[cat.value].count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-sm max-md:flex-wrap max-md:gap-xs">
            <span className="text-sm text-text-tertiary">
              <strong className="text-primary font-semibold">{processedThemes.length}개</strong> 테마
            </span>
            {viewMode === 'list' && (
              <div className="flex items-center gap-xs max-md:flex-wrap max-md:gap-xs">
                {/* 수익률 선택 시 기간 선택 드롭다운 표시 */}
                {sortField === 'return' && (
                  <div className="flex items-center px-3 py-2 bg-layer-0 border border-border rounded-md transition-all hover:bg-white hover:border-primary animate-[slideIn_0.2s_ease-out] max-md:text-xs max-md:px-[10px] max-md:py-1.5">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="bg-transparent border-none text-sm font-semibold text-primary cursor-pointer px-1 focus:outline-none max-md:text-xs"
                    >
                      {PERIOD_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 표시 항목 선택 드롭다운 */}
                <div className="flex items-center px-3 py-2 bg-layer-0 border border-border rounded-md transition-all hover:bg-white hover:border-primary max-md:text-xs max-md:px-[10px] max-md:py-1.5">
                  <select
                    value={displayMetric}
                    onChange={(e) => setDisplayMetric(e.target.value as 'return' | 'etfCount')}
                    className="bg-transparent border-none text-sm font-semibold text-primary cursor-pointer px-1 focus:outline-none max-md:text-xs"
                  >
                    <option value="return">수익률</option>
                    <option value="etfCount">ETF 수</option>
                  </select>
                </div>

                <div className="flex items-center px-3 py-2 bg-layer-0 border border-border rounded-md transition-all hover:bg-white hover:border-primary max-md:text-xs max-md:px-[10px] max-md:py-1.5">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="bg-transparent border-none text-sm font-semibold text-primary cursor-pointer px-1 focus:outline-none max-md:text-xs"
                  >
                    <option value="desc">높은순</option>
                    <option value="asc">낮은순</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          </div>
        </Card>

        {/* 리스트 뷰 */}
        {viewMode === 'list' && (
          <>
            {processedThemes.length > 0 ? (
              <div className="grid grid-cols-1 gap-sm -mt-[calc(theme(spacing.2xl)*0.5)] sm:grid-cols-2 lg:grid-cols-3">
                {processedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between gap-md bg-white border border-border/50 rounded-lg p-md cursor-pointer transition-all min-h-[100px] hover:border-primary hover:shadow-[0_4px_12px_rgba(30,58,95,0.08)]"
                    onClick={() => navigate(`/theme/${theme.id}`)}
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center">
                        <span className="text-[10px] font-medium px-2 py-[3px] rounded-sm tracking-[0.2px] bg-layer-1 text-text-tertiary">
                          {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-text-primary m-0 whitespace-nowrap overflow-hidden text-ellipsis">{theme.name}</h3>
                      <p className="text-xs text-text-tertiary m-0 line-clamp-1">{theme.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] font-medium text-text-tertiary">{theme.etfCount}개 ETF</span>
                      <span className={`text-base font-bold tabular-nums ${theme.periodReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {theme.periodReturn >= 0 ? '+' : ''}{theme.periodReturn.toFixed(1)}%
                      </span>
                      <ArrowRight size={16} className="text-text-tertiary shrink-0 group-hover:text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-sm py-2xl px-md text-center text-text-tertiary bg-white border border-dashed border-border rounded-lg min-h-[200px]">
                <Search size={48} strokeWidth={1} />
                <p className="text-lg font-semibold text-text-secondary mt-sm mb-0">검색 결과가 없습니다</p>
                <p className="text-sm text-text-tertiary leading-relaxed m-0">
                  "{searchQuery}" 와 일치하는 테마를 찾을 수 없습니다.
                  <br />
                  다른 키워드로 검색해 보세요.
                </p>
                <button
                  className="mt-sm px-md py-sm bg-primary text-white rounded-full text-sm font-medium transition-all hover:bg-primary/90"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  필터 초기화
                </button>
              </div>
            )}
          </>
        )}

        {/* 맵 뷰 (히트맵) */}
        {viewMode === 'map' && (
          <div className="flex flex-col gap-md">
            {/* 전체 선택 시 카테고리 구분 없이 하나의 히트맵 */}
            {selectedCategory === 'all' ? (() => {
              const avgReturn = processedThemes.length > 0
                ? processedThemes.reduce((sum, t) => sum + t.periodReturn, 0) / processedThemes.length
                : 0;
              return (
              <div className="bg-white border border-border/50 rounded-lg p-md">
                <div className="flex items-center justify-between mb-sm pb-sm border-b border-border/50">
                  <h4 className="text-base font-semibold text-text-primary m-0">전체 테마</h4>
                  <span className={`text-sm font-semibold tabular-nums ${avgReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    평균 {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full min-h-[600px] bg-layer-0 rounded-md overflow-hidden">
                  <ResponsiveContainer width="100%" height={600}>
                    <Treemap
                      data={processedThemes.map(theme => ({
                        name: theme.name,
                        size: theme.totalAUM,
                        return: theme.periodReturn,
                        etfCount: theme.etfCount,
                        id: theme.id,
                      }))}
                      dataKey="size"
                      stroke="#fff"
                      content={<CustomTreemapContent onClick={(id: string) => navigate(`/theme/${id}`)} />}
                    />
                  </ResponsiveContainer>
                </div>
              </div>
              );
            })() : (
              /* 특정 카테고리 선택 시 해당 카테고리만 표시 */
              heatmapData.filter(h => h.category === selectedCategory).map((categoryData) => (
                <div key={categoryData.category} className="bg-white border border-border/50 rounded-lg p-md">
                  <div className="flex items-center justify-between mb-sm pb-sm border-b border-border/50">
                    <h4 className="text-base font-semibold text-text-primary m-0">{categoryData.label}</h4>
                    <span className={`text-sm font-semibold tabular-nums ${categoryData.avgReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      평균 {categoryData.avgReturn >= 0 ? '+' : ''}{categoryData.avgReturn.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full min-h-[600px] bg-layer-0 rounded-md overflow-hidden">
                    <ResponsiveContainer width="100%" height={600}>
                      <Treemap
                        data={categoryData.themes.map(theme => ({
                          name: theme.name,
                          size: theme.totalAUM,
                          return: theme.periodReturn,
                          etfCount: theme.etfCount,
                          id: theme.id,
                        }))}
                        dataKey="size"
                        stroke="#fff"
                        content={<CustomTreemapContent onClick={(id: string) => navigate(`/theme/${id}`)} />}
                      />
                    </ResponsiveContainer>
                  </div>
                </div>
              ))
            )}

            {/* 히트맵 범례 */}
            <div className="flex items-center justify-center gap-sm p-md bg-white border border-border/50 rounded-lg">
              <span className="text-xs font-medium text-text-tertiary">-20%</span>
              <div className="flex gap-[2px]">
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#dc2626' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#ef4444' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#f87171' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#fca5a5' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#e5e7eb' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#86efac' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#4ade80' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#22c55e' }} />
                <span className="w-5 h-3.5 rounded-[2px]" style={{ background: '#166534' }} />
              </div>
              <span className="text-xs font-medium text-text-tertiary">+30%</span>
            </div>
          </div>
        )}
      </PageContainer>
    );
  }

  // 특정 테마 선택됨 -> 테마 상세
  if (!theme) {
    return (
      <div className="flex flex-col items-center justify-center gap-md p-2xl text-center text-text-tertiary">
        <p>테마를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/theme')}>테마 목록</Button>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Theme Header */}
      <Card padding="lg" className="bg-gradient-to-br from-layer-1 to-white max-sm:!p-md max-[767px]:min-[641px]:!p-lg">
        <div className="flex flex-row items-start gap-sm justify-between md:items-center md:gap-md max-sm:gap-xs max-sm:items-center max-[767px]:min-[641px]:items-center">
          <div className="flex-1 max-sm:min-w-0">
            <div className="flex items-center gap-sm mb-xs max-sm:gap-1 max-sm:mb-1.5 max-sm:flex-wrap max-[767px]:min-[641px]:mb-2">
              <span className="px-2 py-1 bg-primary text-white rounded-sm text-[10px] font-bold tracking-[0.02em] whitespace-nowrap leading-[1.4] max-sm:text-[9px] max-sm:px-1.5 max-sm:py-[3px]">
                {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
              </span>
              <span className="px-2 py-1 bg-layer-1 text-text-secondary rounded-sm text-[10px] font-semibold whitespace-nowrap leading-[1.4] max-sm:text-[9px] max-sm:px-1.5 max-sm:py-[3px]">{themeETFs.length}개 ETF</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary m-0 mb-xs max-sm:text-base max-sm:leading-[1.5] max-sm:mb-1 max-[767px]:min-[641px]:text-lg max-[767px]:min-[641px]:leading-[1.5] max-[767px]:min-[641px]:mb-1.5">{theme.name}</h1>
            <p className="text-sm text-text-secondary m-0 max-sm:text-[11px] max-sm:leading-[1.5] max-[767px]:min-[641px]:text-sm max-[767px]:min-[641px]:leading-[1.5]">{theme.description}</p>
          </div>
          <div className="flex flex-col items-end gap-[2px] max-sm:shrink-0 max-sm:items-end max-sm:min-w-[85px] max-sm:self-center max-[767px]:min-[641px]:self-center">
            <span className="text-xs text-text-tertiary animate-[fadeInUp_0.5s_ease-out] max-sm:text-[9px] max-sm:whitespace-nowrap max-[767px]:min-[641px]:text-[10px]" key={rotatingPeriod}>
              {currentReturnInfo.label}
            </span>
            <span
              className={`text-2xl font-bold tabular-nums animate-[fadeInUp_0.5s_ease-out] max-sm:text-lg max-[767px]:min-[641px]:text-xl ${currentReturnInfo.value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
              key={`${rotatingPeriod}-value`}
            >
              {currentReturnInfo.value >= 0 ? '+' : ''}{currentReturnInfo.value.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* ETF List */}
      <Card padding="md">
        <div className="flex justify-between items-center pb-md border-b border-border/50 flex-wrap gap-sm mb-md max-sm:flex-nowrap max-sm:gap-xs">
          <h3 className="text-lg font-bold text-text-primary m-0 flex items-center gap-2 tracking-[-0.01em] max-sm:text-base max-sm:flex-1 max-sm:min-w-0 max-[767px]:min-[641px]:text-lg">
            테마 ETF 목록 <span className="text-sm font-medium text-text-tertiary max-sm:text-[11px]">{etfReturns.length}개</span>
          </h3>
          <div className="flex items-center gap-2 max-sm:shrink-0">
            <select
              className="px-3 py-2 bg-layer-0 border border-border rounded-md text-sm font-semibold text-text-primary cursor-pointer transition-all outline-none hover:border-primary hover:bg-white focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] max-sm:text-xs max-sm:px-[10px] max-sm:py-1.5 max-sm:whitespace-nowrap max-[767px]:min-[641px]:text-sm"
              value={etfSortBy}
              onChange={(e) => setEtfSortBy(e.target.value as EtfSortOption)}
            >
              <option value="return">수익률순</option>
              <option value="marketCap">시가총액순</option>
              <option value="dividend">배당수익률순</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-sm">
          {etfReturns.map((etf) => (
            <div
              key={etf.id}
              className="bg-layer-0 border border-border rounded-md p-md cursor-pointer transition-all hover:bg-white hover:border-primary hover:shadow-[0_4px_12px_rgba(30,58,95,0.1)] hover:translate-x-1"
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              {/* Primary Info */}
              <div className="flex justify-between items-center gap-md mb-sm max-sm:flex-col max-sm:items-start max-sm:gap-sm max-sm:mb-md max-[767px]:min-[641px]:flex-row max-[767px]:min-[641px]:justify-between max-[767px]:min-[641px]:items-center max-[767px]:min-[641px]:gap-md max-[767px]:min-[641px]:mb-sm">
                <div className="flex items-baseline gap-2 flex-1 min-w-0 max-sm:w-full max-sm:mb-[2px] max-[767px]:min-[641px]:flex-1 max-[767px]:min-[641px]:min-w-0 max-[767px]:min-[641px]:mb-0">
                  <h3 className="text-base font-bold text-text-primary m-0 leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap max-sm:leading-[1.5] max-sm:mb-[2px]">{etf.name}</h3>
                  <span className="text-xs font-semibold text-text-secondary font-mono shrink-0 max-sm:text-[11px]">{etf.ticker}</span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0 max-sm:w-auto max-sm:justify-start max-[767px]:min-[641px]:shrink-0 max-[767px]:min-[641px]:w-auto max-[767px]:min-[641px]:justify-end">
                  <div className="text-base font-bold text-text-primary tracking-[-0.01em] font-mono">{formatPriceByMarket(etf.price, selectedMarket)}</div>
                  <div className={`text-xs font-bold font-mono max-sm:text-sm ${etf.changePercent >= 0 ? 'number-up' : 'number-down'}`}>
                    {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                  </div>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="grid grid-cols-[auto_1fr] items-center gap-md pt-sm border-t border-border/50 max-sm:grid-cols-1 max-sm:gap-md max-[767px]:min-[641px]:grid-cols-[auto_1fr] max-[767px]:min-[641px]:gap-md">
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-start items-center max-sm:gap-1">
                  <span className="px-2 py-1 bg-primary text-white rounded-sm text-[10px] font-bold tracking-[0.02em] whitespace-nowrap leading-[1.4] max-sm:text-[9px] max-sm:px-1.5 max-sm:py-[3px]">{etf.category}</span>
                  {etf.themes.slice(0, 2).map(theme => (
                    <span key={theme} className="px-2 py-1 bg-layer-1 text-text-secondary rounded-sm text-[10px] font-semibold whitespace-nowrap leading-[1.4] max-sm:text-[9px] max-sm:px-1.5 max-sm:py-[3px]">{theme}</span>
                  ))}
                </div>
                <div className="flex items-center gap-md flex-wrap justify-end min-w-0 max-sm:grid max-sm:grid-cols-2 max-sm:gap-sm max-sm:justify-start max-[767px]:min-[641px]:flex max-[767px]:min-[641px]:flex-row max-[767px]:min-[641px]:justify-end max-[767px]:min-[641px]:gap-md">
                  <span className="flex items-center gap-1.5 whitespace-nowrap max-sm:flex-col max-sm:gap-[3px] max-sm:items-start max-[767px]:min-[641px]:flex-row max-[767px]:min-[641px]:gap-1.5 max-[767px]:min-[641px]:items-center">
                    <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-[0.02em] max-sm:min-w-auto max-sm:normal-case">시가총액</span>
                    <span className="text-xs font-bold text-primary font-mono bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(59,130,246,0.04)] px-1.5 py-0.5 rounded transition-all hover:from-[rgba(59,130,246,0.12)] hover:to-[rgba(59,130,246,0.06)] hover:-translate-y-px max-sm:text-sm max-sm:px-1 max-sm:py-0.5">{formatLargeNumberByMarket(etf.marketCap, selectedMarket)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap max-sm:flex-col max-sm:gap-[3px] max-sm:items-start max-[767px]:min-[641px]:flex-row max-[767px]:min-[641px]:gap-1.5 max-[767px]:min-[641px]:items-center">
                    <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-[0.02em] max-sm:min-w-auto max-sm:normal-case">1년 수익률</span>
                    <span className={`text-xs font-bold font-mono bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(59,130,246,0.04)] px-1.5 py-0.5 rounded transition-all hover:from-[rgba(59,130,246,0.12)] hover:to-[rgba(59,130,246,0.06)] hover:-translate-y-px max-sm:text-sm max-sm:px-1 max-sm:py-0.5 ${etf.return1y >= 0 ? 'number-up' : 'number-down'}`}>
                      {formatPercent(etf.return1y)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
