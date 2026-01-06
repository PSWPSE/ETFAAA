import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, SortDesc, Search, X, LayoutGrid, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Treemap } from 'recharts';
import { Card, Button } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanThemes, usThemes, koreanETFs, usETFs, getReturns } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPercent, formatLargeNumber, formatPrice } from '../utils/format';
import type { ThemeCategory } from '../types/etf';
import styles from './ThemePage.module.css';

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
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'return', label: '수익률' },
  { value: 'etfCount', label: 'ETF 수' },
  { value: 'name', label: '이름' },
];

type EtfSortOption = 'return' | 'marketCap' | 'dividend';

export default function ThemePage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('return');
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
  
  // 히트맵 색상 계산
  const getHeatmapColor = (returnValue: number) => {
    if (returnValue > 30) return '#14532d';
    if (returnValue > 20) return '#166534';
    if (returnValue > 10) return '#22c55e';
    if (returnValue > 5) return '#4ade80';
    if (returnValue > 0) return '#86efac';
    if (returnValue > -5) return '#fca5a5';
    if (returnValue > -10) return '#f87171';
    if (returnValue > -20) return '#ef4444';
    return '#dc2626';
  };
  
  const getHeatmapTextColor = (returnValue: number) => {
    return Math.abs(returnValue) > 15 ? '#fff' : '#1f2937';
  };
  
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
        <Card padding="md" className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleArea}>
              <h3 className={styles.chartTitle}>Top10 테마</h3>
              <span className={styles.chartSubtitle}>최근 {selectedPeriodLabel} 수익률 기준</span>
            </div>
            <div className={styles.periodSelector}>
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.periodButton} ${selectedPeriod === option.value ? styles.active : ''}`}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.chartGrid}>
            {/* 상위 */}
            <div className={styles.chartSection}>
              <div className={styles.chartSectionHeader}>
                <span className={styles.chartSectionBadge} data-type="top">TOP 8</span>
              </div>
              <div className={styles.chartContainer}>
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
            <div className={styles.chartSection}>
              <div className={styles.chartSectionHeader}>
                <span className={styles.chartSectionBadge} data-type="bottom">BOTTOM 8</span>
              </div>
              <div className={styles.chartContainer}>
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
        <Card padding="md" className={styles.searchCard}>
          <div className={styles.searchHeader}>
            <h3 className={styles.searchTitle}>테마 검색</h3>
          </div>
          
          <div className={styles.searchBar} ref={searchRef}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
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
                  className={styles.clearButton}
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
              <div className={styles.autocompleteDropdown}>
                {autocompleteResults.map((theme, index) => (
                  <button
                    key={theme.id}
                    className={`${styles.autocompleteItem} ${index === selectedIndex ? styles.selected : ''}`}
                    onClick={() => handleSelectTheme(theme.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={styles.autocompleteLeft}>
                      <span className={styles.autocompleteName}>{theme.name}</span>
                      <div className={styles.autocompleteMeta}>
                        <span className={styles.autocompleteCategory}>
                          {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
                        </span>
                        <span className={styles.autocompleteEtfCount}>
                          {theme.etfCount}개 ETF
                        </span>
                      </div>
                    </div>
                    <div className={styles.autocompleteRight}>
                      <span className={`${styles.autocompleteReturn} ${theme.periodReturn >= 0 ? styles.up : styles.down}`}>
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
        <Card padding="md" className={styles.filterCard}>
          <div className={styles.filterHeader}>
            <h3 className={styles.filterTitle}>테마 전체보기</h3>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="리스트로 보기"
              >
                <List size={16} />
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'map' ? styles.active : ''}`}
                onClick={() => setViewMode('map')}
                title="맵으로 보기"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.filterBar}>
          <div className={styles.filterBarTop}>
            <div className={styles.categoryTabs}>
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  className={`${styles.categoryTab} ${selectedCategory === cat.value ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span className={styles.categoryLabel}>{cat.label}</span>
                  {cat.value !== 'all' && categoryStats[cat.value] && (
                    <span className={styles.categoryCount}>{categoryStats[cat.value].count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterBarBottom}>
            <span className={styles.resultCount}>
              <strong>{processedThemes.length}개</strong> 테마
            </span>
            {viewMode === 'list' && (
              <div className={styles.sortControls}>
                {/* 수익률 선택 시 기간 선택 드롭다운 표시 */}
                {sortField === 'return' && (
                  <div className={styles.periodDropdown}>
                    <select 
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className={styles.periodSelect}
                    >
                      {PERIOD_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* 표시 항목 선택 드롭다운 */}
                <div className={styles.displayDropdown}>
                  <select 
                    value={displayMetric}
                    onChange={(e) => setDisplayMetric(e.target.value as 'return' | 'etfCount')}
                    className={styles.displaySelect}
                  >
                    <option value="return">수익률</option>
                    <option value="etfCount">ETF 수</option>
                  </select>
                </div>
                
                <div className={styles.sortOrderDropdown}>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={styles.sortOrderSelect}
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
              <div className={styles.themeGrid}>
                {processedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={styles.themeCard}
                    onClick={() => navigate(`/theme/${theme.id}`)}
                  >
                    <div className={styles.themeCardLeft}>
                      <div className={styles.themeHeader}>
                        <span className={styles.themeCategoryBadge}>
                          {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
                        </span>
                      </div>
                      <h3 className={styles.themeName}>{theme.name}</h3>
                      <p className={styles.themeDesc}>{theme.description}</p>
                    </div>
                    <div className={styles.themeCardRight}>
                      <span className={styles.themeEtfCount}>{theme.etfCount}개 ETF</span>
                      <span className={`${styles.returnValue} ${theme.periodReturn >= 0 ? styles.up : styles.down}`}>
                        {theme.periodReturn >= 0 ? '+' : ''}{theme.periodReturn.toFixed(1)}%
                      </span>
                      <ArrowRight size={16} className={styles.themeArrow} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Search size={48} strokeWidth={1} />
                <p className={styles.emptyTitle}>검색 결과가 없습니다</p>
                <p className={styles.emptyDesc}>
                  "{searchQuery}" 와 일치하는 테마를 찾을 수 없습니다.
                  <br />
                  다른 키워드로 검색해 보세요.
                </p>
                <button 
                  className={styles.resetButton}
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
          <div className={styles.heatmapContainer}>
            {/* 전체 선택 시 카테고리 구분 없이 하나의 히트맵 */}
            {selectedCategory === 'all' ? (() => {
              const avgReturn = processedThemes.length > 0 
                ? processedThemes.reduce((sum, t) => sum + t.periodReturn, 0) / processedThemes.length 
                : 0;
              return (
              <div className={styles.heatmapCategory}>
                <div className={styles.heatmapCategoryHeader}>
                  <h4 className={styles.heatmapCategoryTitle}>전체 테마</h4>
                  <span className={`${styles.heatmapCategoryReturn} ${avgReturn >= 0 ? styles.up : styles.down}`}>
                    평균 {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.treemapContainer}>
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
                      strokeWidth={2}
                      content={<CustomTreemapContent onClick={(id: string) => navigate(`/theme/${id}`)} />}
                    />
                  </ResponsiveContainer>
                </div>
              </div>
              );
            })() : (
              /* 특정 카테고리 선택 시 해당 카테고리만 표시 */
              heatmapData.filter(h => h.category === selectedCategory).map((categoryData) => (
                <div key={categoryData.category} className={styles.heatmapCategory}>
                  <div className={styles.heatmapCategoryHeader}>
                    <h4 className={styles.heatmapCategoryTitle}>{categoryData.label}</h4>
                    <span className={`${styles.heatmapCategoryReturn} ${categoryData.avgReturn >= 0 ? styles.up : styles.down}`}>
                      평균 {categoryData.avgReturn >= 0 ? '+' : ''}{categoryData.avgReturn.toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.treemapContainer}>
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
                        strokeWidth={2}
                        content={<CustomTreemapContent onClick={(id: string) => navigate(`/theme/${id}`)} />}
                      />
                    </ResponsiveContainer>
                  </div>
                </div>
              ))
            )}
            
            {/* 히트맵 범례 */}
            <div className={styles.heatmapLegend}>
              <span className={styles.heatmapLegendLabel}>-20%</span>
              <div className={styles.heatmapLegendGradient}>
                <span style={{ background: '#dc2626' }} />
                <span style={{ background: '#ef4444' }} />
                <span style={{ background: '#f87171' }} />
                <span style={{ background: '#fca5a5' }} />
                <span style={{ background: '#e5e7eb' }} />
                <span style={{ background: '#86efac' }} />
                <span style={{ background: '#4ade80' }} />
                <span style={{ background: '#22c55e' }} />
                <span style={{ background: '#166534' }} />
              </div>
              <span className={styles.heatmapLegendLabel}>+30%</span>
            </div>
          </div>
        )}
      </PageContainer>
    );
  }
  
  // 특정 테마 선택됨 -> 테마 상세
  if (!theme) {
    return (
      <div className={styles.notFound}>
        <p>테마를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/theme')}>테마 목록</Button>
      </div>
    );
  }
  
  return (
    <PageContainer>
      {/* Theme Header */}
      <Card padding="lg" className={styles.themeDetailHeader}>
        <div className={styles.detailHeaderContent}>
          <div className={styles.detailInfo}>
            <div className={styles.detailBadges}>
              <span className={styles.detailCategoryBadge}>
                {CATEGORY_OPTIONS.find(c => c.value === theme.category)?.label}
              </span>
              <span className={styles.detailEtfCount}>{themeETFs.length}개 ETF</span>
            </div>
            <h1 className={styles.detailTitle}>{theme.name}</h1>
            <p className={styles.detailDesc}>{theme.description}</p>
          </div>
          <div className={styles.detailReturn}>
            <span className={styles.detailReturnLabel} key={rotatingPeriod}>
              {currentReturnInfo.label}
            </span>
            <span 
              className={`${styles.detailReturnValue} ${currentReturnInfo.value >= 0 ? styles.up : styles.down}`}
              key={`${rotatingPeriod}-value`}
            >
              {currentReturnInfo.value >= 0 ? '+' : ''}{currentReturnInfo.value.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
      
      {/* ETF List */}
      <Card padding="md">
        <div className={styles.etfListHeader}>
          <h3 className={styles.etfListTitle}>
            테마 ETF 목록 <span className={styles.etfListCount}>{etfReturns.length}개</span>
          </h3>
          <div className={styles.sortWrapper}>
            <select 
              className={styles.sortSelect} 
              value={etfSortBy} 
              onChange={(e) => setEtfSortBy(e.target.value as EtfSortOption)}
            >
              <option value="return">수익률순</option>
              <option value="marketCap">시가총액순</option>
              <option value="dividend">배당수익률순</option>
            </select>
          </div>
        </div>
        <div className={styles.etfList}>
          {etfReturns.map((etf) => (
            <div 
              key={etf.id}
              className={styles.etfCard}
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              {/* Primary Info */}
              <div className={styles.primaryInfo}>
                <div className={styles.nameBlock}>
                  <h3 className={styles.name}>{etf.name}</h3>
                  <span className={styles.code}>{etf.ticker}</span>
                </div>
                <div className={styles.priceBlock}>
                  <div className={styles.priceMain}>{formatPrice(etf.price)}원</div>
                  <div className={`${styles.changeMain} ${etf.changePercent >= 0 ? 'number-up' : 'number-down'}`}>
                    {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                  </div>
                </div>
              </div>
              
              {/* Secondary Info */}
              <div className={styles.secondaryInfo}>
                <div className={styles.tagGroup}>
                  <span className={styles.primaryTag}>{etf.category}</span>
                  {etf.themes.slice(0, 2).map(theme => (
                    <span key={theme} className={styles.secondaryTag}>{theme}</span>
                  ))}
                </div>
                <div className={styles.metaGroup}>
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>시가총액</span>
                    <span className={styles.metaValue}>{formatLargeNumber(etf.marketCap)}</span>
                  </span>
                  <span className={styles.metaItem}>
                    <span className={styles.metaLabel}>1년 수익률</span>
                    <span className={`${styles.metaValue} ${etf.return1y >= 0 ? 'number-up' : 'number-down'}`}>
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
