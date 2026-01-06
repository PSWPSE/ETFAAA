import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, ChevronDown, BarChart3, Coins, Building2, ArrowDownToLine, SortDesc, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardHeader, Button } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, getReturns } from '../data/etfs';
import { formatPrice, formatPercent, formatLargeNumber } from '../utils/format';
import styles from './RankingPage.module.css';

type Period = '1d' | '1m' | '3m' | '6m' | '1y';
type RankingType = 'top' | 'bottom';
type RankingCategory = 'return' | 'dividend' | 'aum' | 'flow';

const PERIOD_OPTIONS = [
  { value: '1d' as Period, label: '1일', shortLabel: '1D' },
  { value: '1m' as Period, label: '1개월', shortLabel: '1M' },
  { value: '3m' as Period, label: '3개월', shortLabel: '3M' },
  { value: '6m' as Period, label: '6개월', shortLabel: '6M' },
  { value: '1y' as Period, label: '1년', shortLabel: '1Y' },
];

const RANKING_CATEGORIES = [
  { value: 'return' as RankingCategory, label: '수익률 랭킹', icon: BarChart3 },
  { value: 'dividend' as RankingCategory, label: '배당 랭킹', icon: Coins },
  { value: 'aum' as RankingCategory, label: '운용규모 랭킹', icon: Building2 },
  { value: 'flow' as RankingCategory, label: '자금유입 랭킹', icon: ArrowDownToLine },
];

// 스크리너 필터 옵션
const investRegions = ['한국', '미국', '중국(홍콩포함)', '일본', '영국', '프랑스', '독일', '베트남', '인도', '글로벌', '유럽', '선진국', '신흥국', '라틴아메리카', '기타'];
const assetTypes = ['주식', '채권', '원자재', '혼합', '대체', '머니마켓', '부동산', '멀티에셋', '통화', '변동성', '가상자산'];
const leverageTypes = ['+1배', '+1.25~1.75배', '+2배', '+3배'];
const inverseTypes = ['-1배', '-1.25~-1.75배', '-2배', '-3배'];
const pensionTypes = ['개인연금', '퇴직연금'];
const sectors = ['기술', '금융', '헬스케어', '에너지', '산업재', '필수소비재', '임의소비재', '통신', '유틸리티', '부동산', '소재'];

type FilterCategory = 'region' | 'asset' | 'leverage' | 'pension' | 'sector' | null;

const FILTER_CATEGORIES = [
  { value: 'region' as FilterCategory, label: '투자지역', options: ['전체', ...investRegions] },
  { value: 'asset' as FilterCategory, label: '기초자산', options: ['전체', ...assetTypes] },
  { value: 'leverage' as FilterCategory, label: '레버리지/인버스', options: ['전체', ...leverageTypes, ...inverseTypes] },
  { value: 'pension' as FilterCategory, label: '연금', options: ['전체', ...pensionTypes] },
  { value: 'sector' as FilterCategory, label: '섹터', options: ['전체', ...sectors] },
];

export default function RankingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedMarket, setSelectedMarket } = useETFStore();
  const [rankingCategory, setRankingCategory] = useState<RankingCategory>('return');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1y');
  const [rankingType, setRankingType] = useState<RankingType>('top');
  
  // URL 파라미터로부터 초기 상태 설정
  useEffect(() => {
    const category = searchParams.get('category') as RankingCategory;
    const period = searchParams.get('period') as Period;
    
    if (category && ['return', 'dividend', 'aum', 'flow'].includes(category)) {
      setRankingCategory(category);
    }
    
    if (period && ['1d', '1m', '3m', '6m', '1y'].includes(period)) {
      setSelectedPeriod(period);
    }
  }, [searchParams]);
  
  // 필터 상태
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<FilterCategory>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    region: string[];
    asset: string[];
    leverage: string[];
    pension: string[];
    sector: string[];
  }>({
    region: [],
    asset: [],
    leverage: [],
    pension: [],
    sector: [],
  });
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  
  // 필터 토글 헬퍼
  const toggleFilter = (category: FilterCategory, value: string) => {
    if (!category) return;
    setSelectedFilters(prev => {
      const currentValues = prev[category];
      
      // '전체' 클릭 시
      if (value === '전체') {
        return {
          ...prev,
          [category]: currentValues.includes('전체') ? [] : ['전체'],
        };
      }
      
      // 다른 옵션 클릭 시
      let newValues: string[];
      if (currentValues.includes(value)) {
        // 이미 선택된 경우 해제
        newValues = currentValues.filter(v => v !== value);
      } else {
        // 새로 선택하는 경우 '전체' 제거하고 추가
        newValues = [...currentValues.filter(v => v !== '전체'), value];
      }
      
      // 아무것도 선택되지 않으면 '전체'로 돌아감
      return {
        ...prev,
        [category]: newValues.length === 0 ? ['전체'] : newValues,
      };
    });
  };
  
  // 활성 필터 개수 ('전체' 제외)
  const activeFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.filter(v => v !== '전체').length, 0);
  
  // ETF별 랭킹 값 계산
  const etfsWithRankingValue = useMemo(() => {
    return etfs.map(etf => {
      let rankingValue = 0;
      
      switch (rankingCategory) {
        case 'return': {
          const returns = getReturns(etf.id);
          switch (selectedPeriod) {
            case '1d':
              rankingValue = etf.changePercent;
              break;
            case '1m':
              rankingValue = returns.month1;
              break;
            case '3m':
              rankingValue = returns.month3;
              break;
            case '6m':
              rankingValue = returns.month6;
              break;
            case '1y':
              rankingValue = returns.year1;
              break;
          }
          break;
        }
        case 'dividend':
          rankingValue = etf.dividendYield;
          break;
        case 'aum':
          rankingValue = etf.marketCap;
          break;
        case 'flow': {
          // 자금유입은 기간별 시가총액 변동으로 계산 (실제로는 별도 데이터 필요)
          const returns = getReturns(etf.id);
          let flowMultiplier = 0;
          switch (selectedPeriod) {
            case '1d':
              flowMultiplier = etf.changePercent / 100;
              break;
            case '1m':
              flowMultiplier = returns.month1 / 100;
              break;
            case '3m':
              flowMultiplier = returns.month3 / 100;
              break;
            case '6m':
              flowMultiplier = returns.month6 / 100;
              break;
            case '1y':
              flowMultiplier = returns.year1 / 100;
              break;
          }
          rankingValue = etf.marketCap * flowMultiplier;
          break;
        }
      }
      
      return {
        ...etf,
        rankingValue,
      };
    });
  }, [etfs, rankingCategory, selectedPeriod]);
  
  // 필터링 및 정렬
  const rankedETFs = useMemo(() => {
    let filtered = [...etfsWithRankingValue];
    
    // 투자지역 필터 ('전체'가 아닌 경우에만 적용)
    const regionFilters = selectedFilters.region.filter(v => v !== '전체');
    if (regionFilters.length > 0) {
      filtered = filtered.filter(etf => 
        regionFilters.some(region => 
          etf.themes.includes(region) || etf.name.includes(region)
        )
      );
    }
    
    // 기초자산 필터 ('전체'가 아닌 경우에만 적용)
    const assetFilters = selectedFilters.asset.filter(v => v !== '전체');
    if (assetFilters.length > 0) {
      filtered = filtered.filter(etf => 
        assetFilters.some(type => 
          etf.category.includes(type) || etf.themes.includes(type)
        )
      );
    }
    
    // 레버리지/인버스 필터 ('전체'가 아닌 경우에만 적용)
    const leverageFilters = selectedFilters.leverage.filter(v => v !== '전체');
    if (leverageFilters.length > 0) {
      filtered = filtered.filter(etf => 
        leverageFilters.some(type => 
          etf.category.includes('레버리지') || 
          etf.category.includes('인버스') ||
          etf.name.includes('레버리지') ||
          etf.name.includes('인버스')
        )
      );
    }
    
    // 연금 필터 ('전체'가 아닌 경우에만 적용)
    const pensionFilters = selectedFilters.pension.filter(v => v !== '전체');
    if (pensionFilters.length > 0) {
      filtered = filtered.filter(etf => 
        pensionFilters.some(type => 
          etf.themes.includes(type.replace('연금', ''))
        )
      );
    }
    
    // 섹터 필터 ('전체'가 아닌 경우에만 적용)
    const sectorFilters = selectedFilters.sector.filter(v => v !== '전체');
    if (sectorFilters.length > 0) {
      filtered = filtered.filter(etf => 
        sectorFilters.some(sector => 
          etf.themes.includes(sector) || etf.name.includes(sector)
        )
      );
    }
    
    // 정렬
    filtered.sort((a, b) => 
      rankingType === 'top' 
        ? b.rankingValue - a.rankingValue 
        : a.rankingValue - b.rankingValue
    );
    
    return filtered.slice(0, 50); // 상위/하위 50개
  }, [
    etfsWithRankingValue, 
    selectedFilters, 
    rankingType
  ]);
  
  const periodLabel = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label || '1년';
  const categoryLabel = RANKING_CATEGORIES.find(c => c.value === rankingCategory)?.label.replace(' 랭킹', '') || '수익률';
  
  // 값 포맷 함수
  const formatRankingValue = (value: number) => {
    switch (rankingCategory) {
      case 'return':
        return formatPercent(value);
      case 'dividend':
        return `${value.toFixed(2)}%`;
      case 'aum':
        return formatLargeNumber(value);
      case 'flow':
        return formatLargeNumber(Math.abs(value));
      default:
        return value.toFixed(2);
    }
  };
  
  return (
    <PageContainer 
      title="ETF 랭킹" 
      subtitle="다양한 기준으로 ETF 랭킹을 확인하세요"
      showMarketSelector={true}
    >
      
      {/* 랭킹 기준 선택 */}
      <div className={styles.rankingMethodSection}>
        <div className={styles.rankingTypeTabs}>
          {RANKING_CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.value}
                className={`${styles.rankingTypeTab} ${rankingCategory === category.value ? styles.active : ''}`}
                onClick={() => setRankingCategory(category.value)}
              >
                <Icon size={20} className={styles.categoryIcon} />
                <span className={styles.tabLabel}>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      
      {/* 랭킹 리스트 */}
      <div className={styles.rankingSection}>
          <div className={styles.rankingHeader}>
            <h3 className={styles.rankingTitle}>
              랭킹 목록 <span className={styles.rankingCount}>{rankedETFs.length}개</span>
            </h3>
            <div className={styles.sortWrapper}>
              <button 
                className={`${styles.filterButton} ${showFilters || activeFilterCount > 0 ? styles.active : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              {(rankingCategory === 'return' || rankingCategory === 'flow') && (
                <div className={styles.periodDropdown}>
                  <select
                    className={styles.periodSelect}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as Period)}
                  >
                    {PERIOD_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.sortDropdown}>
                <SortDesc size={14} />
                <select
                  className={styles.sortSelect}
                  value={rankingType}
                  onChange={(e) => setRankingType(e.target.value as RankingType)}
                >
                  <option value="top">상위</option>
                  <option value="bottom">하위</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 필터 섹션 */}
          {showFilters && (
            <Card padding="md" className={styles.filterCard}>
              {/* 필터 카테고리 드롭다운 */}
              <div className={styles.filterCategoryDropdown}>
                <div className={styles.dropdownWrapper}>
                  <select
                    className={styles.categorySelect}
                    value={activeFilterCategory || ''}
                    onChange={(e) => setActiveFilterCategory(e.target.value as FilterCategory || null)}
                  >
                    <option value="">카테고리 선택</option>
                    {FILTER_CATEGORIES.map(cat => {
                      const count = selectedFilters[cat.value as keyof typeof selectedFilters].filter(v => v !== '전체').length;
                      return (
                        <option key={cat.value} value={cat.value}>
                          {cat.label} {count > 0 ? `(${count})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={16} className={styles.dropdownIcon} />
                </div>
              </div>
              
              {/* 필터 옵션 버튼 (선택된 카테고리) */}
              {activeFilterCategory && (
                <div className={styles.filterOptionsSection}>
                  <div className={styles.filterOptionsHeader}>
                    <span className={styles.filterOptionsTitle}>
                      {FILTER_CATEGORIES.find(c => c.value === activeFilterCategory)?.label} 선택
                    </span>
                    <button
                      className={styles.clearCategoryButton}
                      onClick={() => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          [activeFilterCategory]: [],
                        }));
                      }}
                    >
                      선택 해제
                    </button>
                  </div>
                  <div className={styles.filterOptions}>
                    {FILTER_CATEGORIES.find(c => c.value === activeFilterCategory)?.options.map(option => (
                      <button
                        key={option}
                        className={`${styles.filterOption} ${selectedFilters[activeFilterCategory].includes(option) ? styles.active : ''}`}
                        onClick={() => toggleFilter(activeFilterCategory, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 선택된 필터 표시 */}
              {activeFilterCount > 0 && (
                <div className={styles.activeFiltersSection}>
                  <div className={styles.activeFiltersHeader}>
                    <span className={styles.activeFiltersTitle}>선택된 필터</span>
                    <button
                      className={styles.clearAllButton}
                      onClick={() => {
                        setSelectedFilters({
                          region: [],
                          asset: [],
                          leverage: [],
                          pension: [],
                          sector: [],
                        });
                        setActiveFilterCategory(null);
                      }}
                    >
                      전체 초기화
                    </button>
                  </div>
                  <div className={styles.activeFiltersList}>
                    {Object.entries(selectedFilters).map(([key, values]) => 
                      values.length > 0 && (
                        <div key={key} className={styles.activeFilterGroup}>
                          <span className={styles.activeFilterGroupLabel}>
                            {FILTER_CATEGORIES.find(c => c.value === key)?.label}:
                          </span>
                          {values.map(value => (
                            <span key={value} className={styles.activeFilterTag}>
                              {value}
                              <button
                                className={styles.removeFilterButton}
                                onClick={() => toggleFilter(key as FilterCategory, value)}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {rankedETFs.length > 0 ? (
            <div className={styles.etfList}>
              {rankedETFs.map((etf, index) => (
              <div 
                key={etf.id}
                className={styles.etfCard}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                {/* 순위 배지 */}
                <span className={styles.rankBadge}>
                  {index + 1}
                </span>
                
                <div className={styles.etfContent}>
                  {/* Primary Info */}
                  <div className={styles.primaryInfo}>
                    <div className={styles.nameBlock}>
                      <h3 className={styles.name}>{etf.name}</h3>
                      <span className={styles.code}>{etf.ticker}</span>
                    </div>
                    <div className={styles.priceBlock}>
                      {rankingCategory === 'return' && (
                        <>
                          <div className={styles.priceMain}>{formatPrice(etf.price)}원</div>
                          <div className={`${styles.changeMain} ${etf.changePercent >= 0 ? 'number-up' : 'number-down'}`}>
                            {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                          </div>
                        </>
                      )}
                      {rankingCategory === 'dividend' && (
                        <>
                          <div className={styles.priceMain}>{formatPercent(etf.dividendYield)}</div>
                          <div className={styles.changeMain}>{formatPrice(etf.dividendPerShare)}원</div>
                        </>
                      )}
                      {rankingCategory === 'aum' && (
                        <div className={styles.priceMain}>{formatLargeNumber(etf.aum)}</div>
                      )}
                      {rankingCategory === 'flow' && (
                        <div className={styles.priceMain}>{formatLargeNumber(etf.rankingValue)}</div>
                      )}
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
                        {(rankingCategory === 'return' || rankingCategory === 'flow') ? (
                          <>
                            <span className={styles.metaLabel}>
                              {categoryLabel} ({periodLabel})
                            </span>
                            <span className={`${styles.metaValue} ${etf.rankingValue >= 0 ? 'number-up' : 'number-down'}`}>
                              {formatRankingValue(etf.rankingValue)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={styles.metaLabel}>수익률 (1년)</span>
                            <span className={`${styles.metaValue} ${getReturns(etf.id).year1 >= 0 ? 'number-up' : 'number-down'}`}>
                              {formatPercent(getReturns(etf.id).year1)}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <Card padding="md" className={styles.emptyState}>
              <p className={styles.emptyText}>해당 조건의 ETF가 없습니다.</p>
            </Card>
          )}
        </div>
    </PageContainer>
  );
}

