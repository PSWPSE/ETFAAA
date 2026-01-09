import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, BarChart3, Coins, Building2, ArrowDownToLine, SortDesc, SlidersHorizontal } from 'lucide-react';
import { Card, SelectedFilters } from '../components/common';
import type { FilterChip } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, getReturns } from '../data';
import { formatPercent, formatPriceByMarket, formatLargeNumberByMarket } from '../utils/format';

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
  const { selectedMarket } = useETFStore();
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

  // 선택된 필터를 FilterChip 배열로 변환
  const selectedFilterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    Object.entries(selectedFilters).forEach(([key, values]) => {
      const categoryLabel = FILTER_CATEGORIES.find(c => c.value === key)?.label || key;
      values.filter(v => v !== '전체').forEach(value => {
        chips.push({
          id: `${key}-${value}`,
          label: `${categoryLabel}: ${value}`,
          value: value
        });
      });
    });

    return chips;
  }, [selectedFilters]);

  // 선택된 필터 제거 함수
  const handleRemoveFilter = (id: string) => {
    const [category, ...valueParts] = id.split('-');
    const value = valueParts.join('-');
    toggleFilter(category as FilterCategory, value);
  };

  // 모든 필터 초기화 함수
  const handleClearAllFilters = () => {
    setSelectedFilters({
      region: [],
      asset: [],
      leverage: [],
      pension: [],
      sector: [],
    });
    setActiveFilterCategory(null);
  };

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
        leverageFilters.some(_type =>
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
        return formatLargeNumberByMarket(value, selectedMarket);
      case 'flow':
        return formatLargeNumberByMarket(Math.abs(value), selectedMarket);
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
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-sm md:grid-cols-4 md:gap-md">
          {RANKING_CATEGORIES.map(category => {
            const Icon = category.icon;
            const isSelected = rankingCategory === category.value;
            return (
              <button
                key={category.value}
                className={`flex flex-col items-center justify-center gap-xs p-md border rounded-md cursor-pointer transition-all duration-150 text-sm font-semibold min-h-[85px] max-md:py-2.5 max-md:px-2 max-md:text-xs max-md:min-h-[75px] hover:border-primary hover:shadow-[0_2px_8px_rgba(30,58,95,0.08)] hover:-translate-y-0.5 ${isSelected ? 'bg-primary border-primary text-white shadow-[0_4px_12px_rgba(30,58,95,0.15)]' : 'bg-white border-border text-text-secondary hover:text-primary'}`}
                onClick={() => setRankingCategory(category.value)}
              >
                <Icon size={20} className={`flex-shrink-0 transition-all duration-150 ${isSelected ? 'scale-110 text-white' : ''}`} />
                <span className={`font-bold text-center leading-[1.3] ${isSelected ? 'text-white' : ''}`}>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* 랭킹 리스트 */}
      <div className="flex flex-col gap-md">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary m-0 flex items-center gap-2">
              랭킹 목록 <span className="text-sm font-medium text-text-tertiary">{rankedETFs.length}개</span>
            </h3>
            <div className="flex items-center gap-sm max-md:flex-wrap max-md:gap-xs">
              <button
                className={`flex items-center justify-center gap-1.5 min-w-[85px] py-2 px-3 bg-layer-1 border border-border rounded-md text-sm font-semibold text-text-primary cursor-pointer transition-all duration-150 max-md:text-xs max-md:py-1.5 max-md:px-2.5 hover:bg-white hover:border-primary ${showFilters || activeFilterCount > 0 ? 'bg-primary border-primary text-white hover:bg-primary/90 hover:border-primary/90' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              {(rankingCategory === 'return' || rankingCategory === 'flow') && (
                <div className="flex items-center py-2 px-3 bg-layer-1 border border-border rounded-md transition-all duration-150 animate-[slideIn_0.2s_ease-out] max-md:py-1.5 max-md:px-2.5 hover:bg-white hover:border-primary">
                  <select
                    className="bg-transparent border-none text-sm font-semibold text-primary cursor-pointer p-0 pr-1 max-md:text-xs focus:outline-none"
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
              <div className="flex items-center gap-1.5 py-2 px-3 bg-layer-1 border border-border rounded-md text-sm text-text-secondary transition-all duration-150 max-md:text-xs max-md:py-1.5 max-md:px-2.5 hover:bg-white hover:border-primary">
                <SortDesc size={14} />
                <select
                  className="bg-transparent border-none text-sm font-semibold text-text-primary cursor-pointer pr-1 max-md:text-xs focus:outline-none"
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
            <Card padding="md" className="relative z-10 overflow-visible transition-all duration-300 my-md max-md:!p-3">
              {/* 필터 카테고리 드롭다운 */}
              <div className="flex flex-col gap-xs">
                <div className="relative flex-1">
                  <select
                    className="w-full py-3 px-4 pr-10 bg-white border border-border rounded-md text-base font-medium text-text-primary cursor-pointer transition-all duration-150 appearance-none max-md:py-2.5 max-md:px-3 max-md:text-xs lg:py-3.5 lg:px-[18px] lg:text-sm hover:border-primary hover:bg-layer-1 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    value={activeFilterCategory || ''}
                    onChange={(e) => setActiveFilterCategory(e.target.value as FilterCategory || null)}
                  >
                    <option value="">카테고리 선택</option>
                    {FILTER_CATEGORIES.map(cat => {
                      const count = cat.value ? selectedFilters[cat.value as keyof typeof selectedFilters].filter(v => v !== '전체').length : 0;
                      return (
                        <option key={cat.value ?? 'null'} value={cat.value ?? ''}>
                          {cat.label} {count > 0 ? `(${count})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                </div>
              </div>

              {/* 필터 옵션 버튼 (선택된 카테고리) */}
              {activeFilterCategory && (
                <div className="mt-md p-md bg-layer-1 border border-border/50 rounded-md animate-[slideDown_0.2s_ease] max-md:p-3 lg:p-5">
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-sm font-bold text-text-primary max-md:text-xs">
                      {FILTER_CATEGORIES.find(c => c.value === activeFilterCategory)?.label} 선택
                    </span>
                    <button
                      className="py-1 px-2.5 bg-transparent border border-border rounded-full text-xs font-semibold text-text-secondary cursor-pointer transition-all duration-150 hover:border-primary hover:text-primary hover:bg-primary/5"
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
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_CATEGORIES.find(c => c.value === activeFilterCategory)?.options.map(option => (
                      <button
                        key={option}
                        className={`py-[7px] px-3.5 bg-white border border-border rounded-[20px] text-xs font-medium text-text-secondary cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] hover:border-text-secondary hover:bg-layer-1 hover:-translate-y-px ${selectedFilters[activeFilterCategory].includes(option) ? 'bg-primary text-white border-primary font-semibold shadow-[0_2px_4px_rgba(30,58,95,0.15)]' : ''}`}
                        onClick={() => toggleFilter(activeFilterCategory, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 필터 표시 */}
              <SelectedFilters
                filters={selectedFilterChips}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            </Card>
          )}

          {rankedETFs.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {rankedETFs.map((etf, index) => (
              <div
                key={etf.id}
                className="flex items-start gap-md bg-layer-1 border border-border rounded-md p-md cursor-pointer transition-all duration-200 max-md:p-md max-md:gap-sm hover:bg-white hover:border-primary hover:shadow-[0_4px_12px_rgba(30,58,95,0.1)] hover:translate-x-1"
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                {/* 순위 배지 */}
                <span className={`w-7 text-base font-bold text-text-tertiary text-center flex-shrink-0 font-mono pt-0.5 max-md:w-5 max-md:text-sm ${index < 3 ? 'text-primary' : ''}`}>
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Primary Info */}
                  <div className="flex justify-between items-center gap-md mb-sm max-md:flex-col max-md:items-start max-md:gap-sm max-md:mb-md">
                    <div className="flex items-baseline gap-2 flex-1 min-w-0 max-md:w-full max-md:mb-0.5">
                      <h3 className="text-base font-bold text-text-primary m-0 leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap max-md:text-base max-md:leading-[1.5] max-md:mb-0.5">{etf.name}</h3>
                      <span className="text-xs font-semibold text-text-secondary font-mono flex-shrink-0 max-md:text-[11px]">{etf.ticker}</span>
                    </div>
                    <div className="flex items-baseline gap-2 flex-shrink-0 max-md:w-auto max-md:justify-start">
                      {rankingCategory === 'return' && (
                        <>
                          <div className="text-base font-bold text-text-primary tracking-[-0.01em] font-mono max-md:text-base">{formatPriceByMarket(etf.price, selectedMarket)}</div>
                          <div className={`text-xs font-bold font-mono max-md:text-sm ${etf.changePercent >= 0 ? 'number-up' : 'number-down'}`}>
                            {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                          </div>
                        </>
                      )}
                      {rankingCategory === 'dividend' && (
                        <>
                          <div className="text-base font-bold text-text-primary tracking-[-0.01em] font-mono max-md:text-base">{formatPercent(etf.dividendYield)}</div>
                          <div className="text-xs font-bold font-mono max-md:text-sm">{formatPriceByMarket(Math.round(etf.price * etf.dividendYield / 100), selectedMarket)}</div>
                        </>
                      )}
                      {rankingCategory === 'aum' && (
                        <div className="text-base font-bold text-text-primary tracking-[-0.01em] font-mono max-md:text-base">{formatLargeNumberByMarket(etf.aum, selectedMarket)}</div>
                      )}
                      {rankingCategory === 'flow' && (
                        <div className="text-base font-bold text-text-primary tracking-[-0.01em] font-mono max-md:text-base">{formatLargeNumberByMarket(etf.rankingValue, selectedMarket)}</div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Info */}
                  <div className="grid grid-cols-[auto_1fr] items-center gap-md pt-sm border-t border-border/50 max-md:grid-cols-1 max-md:gap-md max-md:pt-sm">
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-start items-center max-md:justify-start max-md:gap-1">
                      <span className="py-1 px-2 bg-primary text-white rounded-sm text-[10px] font-bold tracking-[0.02em] whitespace-nowrap leading-[1.4] max-md:text-[9px] max-md:py-[3px] max-md:px-1.5">{etf.category}</span>
                      {etf.themes.slice(0, 2).map(theme => (
                        <span key={theme} className="py-1 px-2 bg-layer-2 whitespace-nowrap leading-[1.4] text-text-secondary rounded-sm text-[10px] font-semibold max-md:text-[9px] max-md:py-[3px] max-md:px-1.5">{theme}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-md flex-wrap justify-end min-w-0 max-md:grid max-md:grid-cols-2 max-md:gap-sm max-md:justify-start">
                      <span className="flex items-center gap-1.5 whitespace-nowrap max-md:flex-col max-md:gap-[3px] max-md:items-start">
                        <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-[0.02em] max-md:text-[10px] max-md:min-w-auto max-md:normal-case">시가총액</span>
                        <span className="text-xs font-bold text-primary font-mono max-md:text-sm max-md:p-0">{formatLargeNumberByMarket(etf.marketCap, selectedMarket)}</span>
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap max-md:flex-col max-md:gap-[3px] max-md:items-start">
                        {(rankingCategory === 'return' || rankingCategory === 'flow') ? (
                          <>
                            <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-[0.02em] max-md:text-[10px] max-md:min-w-auto max-md:normal-case">
                              {categoryLabel} ({periodLabel})
                            </span>
                            <span className={`text-xs font-bold font-mono max-md:text-sm max-md:p-0 ${etf.rankingValue >= 0 ? 'number-up' : 'number-down'}`}>
                              {formatRankingValue(etf.rankingValue)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-[0.02em] max-md:text-[10px] max-md:min-w-auto max-md:normal-case">수익률 (1년)</span>
                            <span className={`text-xs font-bold font-mono max-md:text-sm max-md:p-0 ${getReturns(etf.id).year1 >= 0 ? 'number-up' : 'number-down'}`}>
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
            <Card padding="md" className="text-center p-2xl">
              <p className="text-base text-text-tertiary m-0">해당 조건의 ETF가 없습니다.</p>
            </Card>
          )}
        </div>
    </PageContainer>
  );
}
