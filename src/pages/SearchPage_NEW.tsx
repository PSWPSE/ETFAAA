import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SortDesc, Plus, Check, X, BarChart3, Trash2 } from 'lucide-react';
import { Card, Button, Badge, MarketSelector } from '../components/common';
import { useETFStore, filterETFs } from '../store/etfStore';
import { koreanETFs, usETFs, filterOptions } from '../data/etfs';
import { formatPrice, formatPercent, formatLargeNumber, getChangeClass } from '../utils/format';
import type { SortField } from '../types/etf';
import styles from './SearchPage.module.css';

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'marketCap', label: '시가총액' },
  { value: 'volume', label: '거래량' },
  { value: 'change', label: '등락률' },
  { value: 'dividendYield', label: '배당수익률' },
  { value: 'name', label: '이름' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  
  const store = useETFStore();
  const {
    selectedMarket,
    searchQuery,
    setSearchQuery,
    selectedIssuers,
    setSelectedIssuers,
    selectedCategories,
    setSelectedCategories,
    sortField,
    sortOrder,
    toggleSort,
    addToCompare,
    removeFromCompare,
    isInCompare,
    compareList,
    clearCompare,
    resetFilters,
  } = store;
  
  // 비교 목록에 있는 ETF 정보 가져오기
  const getCompareETFs = () => {
    const allETFs = [...koreanETFs, ...usETFs];
    return compareList.map(id => allETFs.find(e => e.id === id)).filter(Boolean);
  };
  
  const compareETFs = getCompareETFs();
  
  // 시장별 ETF 선택
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  const filteredETFs = useMemo(() => {
    return filterETFs(etfs, { ...store, searchQuery: localSearch || searchQuery });
  }, [store, etfs, localSearch, searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };
  
  const toggleIssuer = (issuer: string) => {
    if (selectedIssuers.includes(issuer)) {
      setSelectedIssuers(selectedIssuers.filter(i => i !== issuer));
    } else {
      setSelectedIssuers([...selectedIssuers, issuer]);
    }
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const hasFilters = selectedIssuers.length > 0 || selectedCategories.length > 0;
  
  return (
    <div className={styles.page}>
      {/* Market Selector */}
      <div className={styles.marketSelectorWrapper}>
        <MarketSelector />
      </div>

      {/* Search Bar */}
      <form className={styles.searchBar} onSubmit={handleSearch}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ETF 이름 또는 종목코드 검색"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button 
              type="button"
              className={styles.clearButton}
              onClick={() => setLocalSearch('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>
      
      {/* Filter & Sort Bar */}
      <div className={styles.controlBar}>
        <button 
          className={`${styles.controlButton} ${showFilter ? styles.active : ''} ${hasFilters ? styles.hasFilter : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter size={16} />
          필터
          {hasFilters && <span className={styles.filterCount}>{selectedIssuers.length + selectedCategories.length}</span>}
        </button>
        
        <div className={styles.sortDropdown}>
          <SortDesc size={16} />
          <select 
            value={sortField}
            onChange={(e) => toggleSort(e.target.value as SortField)}
            className={styles.sortSelect}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className={styles.sortOrderButton}
            onClick={() => toggleSort(sortField)}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilter && (
        <Card padding="md" className={styles.filterPanel}>
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>운용사</h4>
            <div className={styles.filterChips}>
              {filterOptions.issuers.map(issuer => (
                <button
                  key={issuer}
                  className={`${styles.filterChip} ${selectedIssuers.includes(issuer) ? styles.selected : ''}`}
                  onClick={() => toggleIssuer(issuer)}
                >
                  {issuer}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>자산유형</h4>
            <div className={styles.filterChips}>
              {filterOptions.categories.map(category => (
                <button
                  key={category}
                  className={`${styles.filterChip} ${selectedCategories.includes(category) ? styles.selected : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className={styles.resetButton}
            >
              필터 초기화
            </Button>
          )}
        </Card>
      )}
      
      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <span>검색결과 {filteredETFs.length}개</span>
      </div>
      
      {/* ETF List */}
      <div className={styles.etfList}>
        {filteredETFs.map((etf) => (
          <Card 
            key={etf.id} 
            padding="none" 
            className={styles.etfCard}
          >
            <div 
              className={styles.etfCardContent}
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              <div className={styles.etfMain}>
                <div className={styles.etfHeader}>
                  <span className={styles.etfName}>{etf.name}</span>
                  <span className={`${styles.etfChange} ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
                <div className={styles.etfMeta}>
                  <span className={styles.etfTicker}>{etf.ticker}</span>
                  <span className={styles.etfDivider}>·</span>
                  <span className={styles.etfIssuer}>{etf.issuer}</span>
                </div>
                <div className={styles.etfStats}>
                  <div className={styles.etfStat}>
                    <span className={styles.statLabel}>현재가</span>
                    <span className={styles.statValue}>{formatPrice(etf.price)}원</span>
                  </div>
                  <div className={styles.etfStat}>
                    <span className={styles.statLabel}>시총</span>
                    <span className={styles.statValue}>{formatLargeNumber(etf.marketCap)}</span>
                  </div>
                  <div className={styles.etfStat}>
                    <span className={styles.statLabel}>배당</span>
                    <span className={styles.statValue}>{etf.dividendYield.toFixed(2)}%</span>
                  </div>
                </div>
                <div className={styles.etfTags}>
                  <Badge variant="default" size="sm">{etf.category}</Badge>
                  {etf.themes.slice(0, 2).map(theme => (
                    <Badge key={theme} variant="primary" size="sm">{theme}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <button
              className={`${styles.compareButton} ${isInCompare(etf.id) ? styles.added : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isInCompare(etf.id)) {
                  removeFromCompare(etf.id);
                } else {
                  addToCompare(etf.id);
                }
              }}
              disabled={!isInCompare(etf.id) && compareList.length >= 4}
            >
              {isInCompare(etf.id) ? (
                <>
                  <Check size={14} />
                  <span>추가됨</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>비교</span>
                </>
              )}
            </button>
          </Card>
        ))}
      </div>
      
      {filteredETFs.length === 0 && (
        <div className={styles.emptyState}>
          <p>검색 결과가 없습니다.</p>
          <Button variant="ghost" onClick={resetFilters}>
            필터 초기화
          </Button>
        </div>
      )}
      
      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className={styles.floatingCompareBar}>
          <div className={styles.compareBarContent}>
            <div className={styles.compareBarInfo}>
              <div className={styles.compareBarIcon}>
                <BarChart3 size={20} />
              </div>
              <div className={styles.compareBarText}>
                <span className={styles.compareBarTitle}>
                  비교 목록 ({compareList.length}/4)
                </span>
                <span className={styles.compareBarNames}>
                  {compareETFs.map(e => e!.name).join(', ')}
                </span>
              </div>
            </div>
            <div className={styles.compareBarActions}>
              <button 
                className={styles.compareBarClear}
                onClick={clearCompare}
                title="비교 목록 초기화"
              >
                <Trash2 size={18} />
              </button>
              <button 
                className={styles.compareBarButton}
                onClick={() => navigate('/compare')}
              >
                비교 분석하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
