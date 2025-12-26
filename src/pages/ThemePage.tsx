import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, SortDesc, Search, X, LayoutGrid, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, Button, MarketSelector } from '../components/common';
import { koreanThemes, usThemes, koreanETFs, usETFs, getReturns } from '../data/etfs';
import { useETFStore } from '../store/etfStore';
import { formatPercent, formatLargeNumber } from '../utils/format';
import type { ThemeCategory } from '../types/etf';
import styles from './ThemePage.module.css';

type ViewMode = 'list' | 'map';

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
  
  // 정렬 토글
  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  // 테마 데이터 처리
  const processedThemes = useMemo(() => {
    // 기간별 수익률 적용
    let result = themes.map(theme => ({
      ...theme,
      periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
    }));
    
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
      top: allWithReturn.slice(0, 8).map(t => ({ name: t.name, return: t.periodReturn })),
      bottom: allWithReturn.slice(-8).reverse().map(t => ({ name: t.name, return: t.periodReturn })),
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
        .map(theme => ({
          ...theme,
          periodReturn: getReturnByPeriod(theme.avgReturn, selectedPeriod),
        }))
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
  }, [themes, selectedPeriod]);
  
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
  
  // 테마 선택 안됨 -> 테마 목록
  if (!themeId) {
    return (
      <div className={styles.page}>
        {/* Market Selector */}
        <div className={styles.marketSelectorWrapper}>
          <MarketSelector />
        </div>
        
        {/* 검색 바 */}
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="테마 검색 (예: 반도체, AI, 배당...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
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
                    <Bar dataKey="return" radius={[0, 4, 4, 0]}>
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
                    <Bar dataKey="return" radius={[0, 4, 4, 0]}>
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
        
        {/* 테마 필터 & 정렬 통합 */}
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
          <div className={styles.filterBarBottom}>
            <span className={styles.resultCount}>
              <strong>{processedThemes.length}개</strong> 테마
            </span>
            {viewMode === 'list' && (
              <div className={styles.sortDropdown}>
                <SortDesc size={14} />
                <select 
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className={styles.sortSelect}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button className={styles.sortOrderButton} onClick={toggleSort}>
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            )}
          </div>
        </div>
        
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
                <div className={styles.heatmapGrid}>
                  {processedThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={styles.heatmapItem}
                      style={{
                        backgroundColor: getHeatmapColor(theme.periodReturn),
                        color: getHeatmapTextColor(theme.periodReturn),
                      }}
                      onClick={() => navigate(`/theme/${theme.id}`)}
                    >
                      <span className={styles.heatmapName}>{theme.name}</span>
                      <span className={styles.heatmapReturn}>
                        {theme.periodReturn >= 0 ? '+' : ''}{theme.periodReturn.toFixed(1)}%
                      </span>
                      <span className={styles.heatmapEtfCount}>{theme.etfCount}개 ETF</span>
                    </div>
                  ))}
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
                  <div className={styles.heatmapGrid}>
                    {categoryData.themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={styles.heatmapItem}
                        style={{
                          backgroundColor: getHeatmapColor(theme.periodReturn),
                          color: getHeatmapTextColor(theme.periodReturn),
                        }}
                        onClick={() => navigate(`/theme/${theme.id}`)}
                      >
                        <span className={styles.heatmapName}>{theme.name}</span>
                        <span className={styles.heatmapReturn}>
                          {theme.periodReturn >= 0 ? '+' : ''}{theme.periodReturn.toFixed(1)}%
                        </span>
                        <span className={styles.heatmapEtfCount}>{theme.etfCount}개 ETF</span>
                      </div>
                    ))}
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
      </div>
    );
  }
  
  // 특정 테마 선택됨 -> 테마 상세
  const theme = themes.find(t => t.id === themeId);
  
  if (!theme) {
    return (
      <div className={styles.notFound}>
        <p>테마를 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/theme')}>테마 목록</Button>
      </div>
    );
  }
  
  const themeETFs = getETFsByTheme(themeId);
  
  // ETF별 1년 수익률
  const etfReturns = themeETFs.map(etf => {
    const returns = getReturns(etf.id);
    return {
      ...etf,
      return1y: returns.year1,
    };
  }).sort((a, b) => b.return1y - a.return1y);
  
  return (
    <div className={styles.page}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate('/theme')}>
        <ArrowLeft size={20} />
        <span>테마 목록</span>
      </button>
      
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
            <span className={styles.detailReturnLabel}>평균 수익률 (1Y)</span>
            <span className={`${styles.detailReturnValue} ${theme.avgReturn >= 0 ? styles.up : styles.down}`}>
              {theme.avgReturn >= 0 ? '+' : ''}{theme.avgReturn.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
      
      {/* ETF List */}
      <Card padding="md">
        <CardHeader title="테마 ETF 목록" subtitle={`수익률 높은 순`} />
        <div className={styles.etfList}>
          {etfReturns.map((etf) => (
            <div 
              key={etf.id}
              className={styles.etfItem}
              onClick={() => navigate(`/detail/${etf.id}`)}
            >
              <div className={styles.etfInfo}>
                <span className={styles.etfName}>{etf.name}</span>
                <span className={styles.etfMeta}>{etf.ticker} · {etf.issuer}</span>
              </div>
              <div className={styles.etfStats}>
                <div className={styles.etfStat}>
                  <span className={styles.statLabel}>현재가</span>
                  <span className={styles.statValue}>{formatLargeNumber(etf.price)}원</span>
                </div>
                <div className={styles.etfStat}>
                  <span className={styles.statLabel}>1년 수익률</span>
                  <span className={`${styles.statValue} ${etf.return1y >= 0 ? styles.up : styles.down}`}>
                    {formatPercent(etf.return1y)}
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className={styles.etfArrow} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
