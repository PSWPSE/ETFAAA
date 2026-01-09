import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal, Package, ArrowRight, Send, FileText } from 'lucide-react';
import { Card, CardHeader, Button, SelectedFilters } from '../components/common';
import type { FilterChip } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, filterOptions, getReturns } from '../data';
import { formatPercent, formatLargeNumber, getChangeClass, formatPriceByMarket, formatLargeNumberByMarket } from '../utils/format';

type SearchType = 'name' | 'ai' | 'screener' | 'holdings';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: typeof koreanETFs;
}

const investRegions = ['한국', '미국', '중국(홍콩포함)', '일본', '영국', '프랑스', '독일', '베트남', '인도', '글로벌', '유럽', '선진국', '신흥국', '라틴아메리카', '기타'];
const assetTypes = ['주식', '채권', '원자재', '혼합', '대체', '머니마켓'];
const listingCountries = ['한국 상장 ETF', '미국 상장 ETF'];
const leverageTypes = ['+1배', '+1.25~1.75배', '+2배', '+3배'];
const inverseTypes = ['-1배', '-1.25~-1.75배', '-2배', '-3배'];
const domesticAUM = ['500억 미만', '5백억~1천억 미만', '1천억~5천억 미만', '5천억 이상'];
const foreignAUM = ['1천만 달러 미만', '1천만~1억 달러 미만', '1억~10억 달러 미만', '10억~100억 달러 미만', '100억 달러 이상'];
const dividendFrequencies = ['월', '분기', '반기', '연간', '비정기'];
const returnPeriods = ['1개월', '3개월', '6개월', '1년', '3년'];
const sectors = ['기술', '금융', '헬스케어', '에너지', '산업재', '필수소비재', '임의소비재', '통신', '유틸리티', '부동산', '소재'];
const tradingVolumes = ['1만주 미만', '1만~10만주', '10만~50만주', '50만~100만주', '100만주 이상'];
const expenseRatios = ['0.1% 미만', '0.1~0.3%', '0.3~0.5%', '0.5~0.7%', '0.7% 이상'];
const listingPeriods = ['1년 미만', '1~3년', '3~5년', '5~10년', '10년 이상'];
const hedgeTypes = ['환헤지', '환노출', '혼합'];
const pensionTypes = ['전체', '개인연금', '퇴직연금'];

type SortOption = 'marketCap' | 'dividend' | 'change';
type HoldingSortOption = 'weight' | 'change';

type ResultPeriod = '1d' | '1m' | '3m' | '6m' | '1y';

const RESULT_PERIOD_OPTIONS = [
  { value: '1d' as ResultPeriod, label: '1일' },
  { value: '1m' as ResultPeriod, label: '1개월' },
  { value: '3m' as ResultPeriod, label: '3개월' },
  { value: '6m' as ResultPeriod, label: '6개월' },
  { value: '1y' as ResultPeriod, label: '1년' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<SearchType>('name');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('change');
  const [holdingSortBy, setHoldingSortBy] = useState<HoldingSortOption>('weight');
  const [resultPeriod, setResultPeriod] = useState<ResultPeriod>('1d');

  const [nameQuery, setNameQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [holdingsQuery, setHoldingsQuery] = useState('');

  // Screener filters
  const [selectedInvestRegions, setSelectedInvestRegions] = useState<string[]>([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);
  const [selectedListingCountries, setSelectedListingCountries] = useState<string[]>([]);
  const [selectedLeverageTypes, setSelectedLeverageTypes] = useState<string[]>([]);
  const [selectedInverseTypes, setSelectedInverseTypes] = useState<string[]>([]);
  const [selectedDomesticAUM, setSelectedDomesticAUM] = useState<string[]>([]);
  const [selectedForeignAUM, setSelectedForeignAUM] = useState<string[]>([]);
  const [selectedDividendFreq, setSelectedDividendFreq] = useState<string[]>([]);
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState<string | null>(null);
  const [dividendMin, setDividendMin] = useState('');
  const [dividendMax, setDividendMax] = useState('');
  const [returnMin, setReturnMin] = useState('');
  const [returnMax, setReturnMax] = useState('');

  // 추가 필터
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTradingVolumes, setSelectedTradingVolumes] = useState<string[]>([]);
  const [selectedExpenseRatios, setSelectedExpenseRatios] = useState<string[]>([]);
  const [selectedListingPeriods, setSelectedListingPeriods] = useState<string[]>([]);
  const [selectedHedgeTypes, setSelectedHedgeTypes] = useState<string[]>([]);
  const [issuerMarket, setIssuerMarket] = useState<'korea' | 'us'>('korea');
  const [selectedPensionTypes, setSelectedPensionTypes] = useState<string[]>([]);

  // 활성 필터 탭
  const [activeFilterTab, setActiveFilterTab] = useState<string>('listing');

  // 필터 카테고리 정의
  const filterCategories = [
    { id: 'listing', label: '상장국가' },
    { id: 'region', label: '투자지역' },
    { id: 'asset', label: '기초자산' },
    { id: 'aum', label: '자산규모' },
    { id: 'leverage', label: '레버리지' },
    { id: 'inverse', label: '인버스' },
    { id: 'dividend', label: '배당' },
    { id: 'return', label: '수익률' },
    { id: 'issuer', label: '운용사' },
    { id: 'pension', label: '연금' },
    { id: 'sector', label: '섹터' },
    { id: 'volume', label: '거래량' },
    { id: 'expense', label: '총보수' },
    { id: 'listingPeriod', label: '상장기간' },
    { id: 'hedge', label: '환헤지' },
  ];

  const store = useETFStore();
  const { selectedMarket, selectedIssuers, setSelectedIssuers } = store;

  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const [searchResults, setSearchResults] = useState(etfs);

  // 선택된 필터를 FilterChip 배열로 변환
  const selectedFilterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    selectedListingCountries.forEach(item =>
      chips.push({ id: `listing-${item}`, label: item, value: item })
    );
    selectedInvestRegions.forEach(item =>
      chips.push({ id: `region-${item}`, label: item, value: item })
    );
    selectedAssetTypes.forEach(item =>
      chips.push({ id: `asset-${item}`, label: item, value: item })
    );
    selectedDomesticAUM.forEach(item =>
      chips.push({ id: `aum-domestic-${item}`, label: `국내: ${item}`, value: item })
    );
    selectedForeignAUM.forEach(item =>
      chips.push({ id: `aum-foreign-${item}`, label: `해외: ${item}`, value: item })
    );
    selectedLeverageTypes.forEach(item =>
      chips.push({ id: `leverage-${item}`, label: `레버리지: ${item}`, value: item })
    );
    selectedInverseTypes.forEach(item =>
      chips.push({ id: `inverse-${item}`, label: `인버스: ${item}`, value: item })
    );
    selectedDividendFreq.forEach(item =>
      chips.push({ id: `dividend-freq-${item}`, label: `배당: ${item}`, value: item })
    );
    if (dividendMin || dividendMax) {
      chips.push({
        id: 'dividend-range',
        label: `배당률: ${dividendMin || '0'}% ~ ${dividendMax || '∞'}%`,
        value: 'dividend-range'
      });
    }
    if (selectedReturnPeriod) {
      chips.push({
        id: 'return-period',
        label: `수익기간: ${selectedReturnPeriod}`,
        value: selectedReturnPeriod
      });
    }
    if (returnMin || returnMax) {
      chips.push({
        id: 'return-range',
        label: `수익률: ${returnMin || '-∞'}% ~ ${returnMax || '∞'}%`,
        value: 'return-range'
      });
    }
    selectedIssuers.forEach(item =>
      chips.push({ id: `issuer-${item}`, label: `운용사: ${item}`, value: item })
    );
    selectedPensionTypes.forEach(item =>
      chips.push({ id: `pension-${item}`, label: item, value: item })
    );
    selectedSectors.forEach(item =>
      chips.push({ id: `sector-${item}`, label: item, value: item })
    );
    selectedTradingVolumes.forEach(item =>
      chips.push({ id: `volume-${item}`, label: `거래량: ${item}`, value: item })
    );
    selectedExpenseRatios.forEach(item =>
      chips.push({ id: `expense-${item}`, label: `총보수: ${item}`, value: item })
    );
    selectedListingPeriods.forEach(item =>
      chips.push({ id: `listing-period-${item}`, label: `상장: ${item}`, value: item })
    );
    selectedHedgeTypes.forEach(item =>
      chips.push({ id: `hedge-${item}`, label: item, value: item })
    );

    return chips;
  }, [
    selectedListingCountries, selectedInvestRegions, selectedAssetTypes,
    selectedDomesticAUM, selectedForeignAUM, selectedLeverageTypes, selectedInverseTypes,
    selectedDividendFreq, dividendMin, dividendMax, selectedReturnPeriod, returnMin, returnMax,
    selectedIssuers, selectedPensionTypes, selectedSectors, selectedTradingVolumes,
    selectedExpenseRatios, selectedListingPeriods, selectedHedgeTypes
  ]);

  const sortedResults = [...searchResults].sort((a, b) => {
    if (searchType === 'holdings' && holdingsQuery) {
      // 보유종목 검색 시 정렬
      const getMaxWeight = (etf: typeof a) => {
        if (!etf.holdings) return 0;
        const query = holdingsQuery.toLowerCase();
        const matchingHoldings = etf.holdings.filter(h =>
          h.name.toLowerCase().includes(query) || h.ticker.toLowerCase().includes(query)
        );
        return matchingHoldings.length > 0 ? Math.max(...matchingHoldings.map(h => h.weight)) : 0;
      };

      switch (holdingSortBy) {
        case 'weight':
          return getMaxWeight(b) - getMaxWeight(a);
        case 'change':
          return b.changePercent - a.changePercent;
        default:
          return 0;
      }
    } else {
      // 스크리너 검색 시 정렬
      switch (sortBy) {
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'dividend':
          return b.dividendYield - a.dividendYield;
        case 'change':
          // 기간별 수익률 계산
          const getReturnByPeriod = (etf: typeof a) => {
            const returns = getReturns(etf.id);
            switch (resultPeriod) {
              case '1d':
                return etf.changePercent;
              case '1m':
                return returns.month1;
              case '3m':
                return returns.month3;
              case '6m':
                return returns.month6;
              case '1y':
                return returns.year1;
              default:
                return etf.changePercent;
            }
          };
          return getReturnByPeriod(b) - getReturnByPeriod(a);
        default:
          return 0;
      }
    }
  });

  const toggleArrayItem = (items: string[], setItems: (newItems: string[]) => void, item: string) => {
    if (items.includes(item)) {
      setItems(items.filter((i: string) => i !== item));
    } else {
      setItems([...items, item]);
    }
  };

  // 선택된 필터 제거 함수
  const handleRemoveFilter = (id: string) => {
    if (id.startsWith('listing-')) {
      const value = id.replace('listing-', '');
      setSelectedListingCountries(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('region-')) {
      const value = id.replace('region-', '');
      setSelectedInvestRegions(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('asset-')) {
      const value = id.replace('asset-', '');
      setSelectedAssetTypes(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('aum-domestic-')) {
      const value = id.replace('aum-domestic-', '');
      setSelectedDomesticAUM(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('aum-foreign-')) {
      const value = id.replace('aum-foreign-', '');
      setSelectedForeignAUM(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('leverage-')) {
      const value = id.replace('leverage-', '');
      setSelectedLeverageTypes(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('inverse-')) {
      const value = id.replace('inverse-', '');
      setSelectedInverseTypes(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('dividend-freq-')) {
      const value = id.replace('dividend-freq-', '');
      setSelectedDividendFreq(prev => prev.filter(item => item !== value));
    } else if (id === 'dividend-range') {
      setDividendMin('');
      setDividendMax('');
    } else if (id === 'return-period') {
      setSelectedReturnPeriod(null);
    } else if (id === 'return-range') {
      setReturnMin('');
      setReturnMax('');
    } else if (id.startsWith('issuer-')) {
      const value = id.replace('issuer-', '');
      setSelectedIssuers(selectedIssuers.filter((item: string) => item !== value));
    } else if (id.startsWith('pension-')) {
      const value = id.replace('pension-', '');
      setSelectedPensionTypes(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('sector-')) {
      const value = id.replace('sector-', '');
      setSelectedSectors(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('volume-')) {
      const value = id.replace('volume-', '');
      setSelectedTradingVolumes(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('expense-')) {
      const value = id.replace('expense-', '');
      setSelectedExpenseRatios(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('listing-period-')) {
      const value = id.replace('listing-period-', '');
      setSelectedListingPeriods(prev => prev.filter(item => item !== value));
    } else if (id.startsWith('hedge-')) {
      const value = id.replace('hedge-', '');
      setSelectedHedgeTypes(prev => prev.filter(item => item !== value));
    }
  };

  // 모든 필터 초기화 함수
  const handleClearAllFilters = () => {
    setSelectedListingCountries([]);
    setSelectedInvestRegions([]);
    setSelectedAssetTypes([]);
    setSelectedDomesticAUM([]);
    setSelectedForeignAUM([]);
    setSelectedLeverageTypes([]);
    setSelectedInverseTypes([]);
    setSelectedDividendFreq([]);
    setDividendMin('');
    setDividendMax('');
    setSelectedReturnPeriod(null);
    setReturnMin('');
    setReturnMax('');
    setSelectedIssuers([]);
    setSelectedPensionTypes([]);
    setSelectedSectors([]);
    setSelectedTradingVolumes([]);
    setSelectedExpenseRatios([]);
    setSelectedListingPeriods([]);
    setSelectedHedgeTypes([]);
  };

  const toggleIssuer = (issuer: string) => toggleArrayItem(selectedIssuers, setSelectedIssuers, issuer);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAIChat = () => {
    if (!aiQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: aiQuery,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);

    // AI 응답 시뮬레이션
    const query = aiQuery.toLowerCase();
    const filtered = etfs.filter(etf =>
      etf.name.toLowerCase().includes(query) ||
      etf.category.toLowerCase().includes(query) ||
      etf.themes.some(theme => theme.toLowerCase().includes(query))
    );

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: filtered.length > 0
          ? `"${aiQuery}"에 대한 검색 결과 ${filtered.length}개의 ETF를 찾았습니다.`
          : `"${aiQuery}"와 관련된 ETF를 찾지 못했습니다. 다른 키워드로 시도해보세요.`,
        timestamp: new Date(),
        results: filtered.length > 0 ? filtered : undefined,
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 500);

    setAiQuery('');
  };

  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    setHasSearched(true);
    let filtered = [...etfs];

    // 검색 실행 후 결과 섹션으로 스크롤 (섹션 전체가 보이도록)
    setTimeout(() => {
      if (resultsSectionRef.current) {
        const yOffset = -80; // 헤더 높이 고려
        const element = resultsSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150);

    if (searchType === 'ai') {
      handleAIChat();
      return;
    } else if (searchType === 'name') {
      const query = nameQuery.toLowerCase();
      filtered = etfs.filter(etf =>
        etf.name.toLowerCase().includes(query) ||
        etf.ticker.toLowerCase().includes(query)
      );
    } else if (searchType === 'screener') {
      if (selectedIssuers.length > 0) filtered = filtered.filter(etf => selectedIssuers.includes(etf.issuer));
      const divMin = dividendMin ? parseFloat(dividendMin) : 0;
      const divMax = dividendMax ? parseFloat(dividendMax) : 100;
      if (dividendMin || dividendMax) filtered = filtered.filter(etf => etf.dividendYield >= divMin && etf.dividendYield <= divMax);
    } else if (searchType === 'holdings') {
      const query = holdingsQuery.toLowerCase();
      filtered = etfs.filter(etf => {
        if (!etf.holdings) return false;
        return etf.holdings.some(holding =>
          holding.name.toLowerCase().includes(query) ||
          holding.ticker.toLowerCase().includes(query)
        );
      });
    }

    setSearchResults(filtered);
  };

  const resetSearch = () => {
    setHasSearched(false);
    setNameQuery('');
    setAiQuery('');
    setChatMessages([]);
    setHoldingsQuery('');
    setSelectedInvestRegions([]);
    setSelectedAssetTypes([]);
    setSelectedListingCountries([]);
    setSelectedLeverageTypes([]);
    setSelectedInverseTypes([]);
    setSelectedDomesticAUM([]);
    setSelectedForeignAUM([]);
    setSelectedDividendFreq([]);
    setSelectedReturnPeriod(null);
    setDividendMin('');
    setDividendMax('');
    setReturnMin('');
    setReturnMax('');
    setSelectedIssuers([]);
    setSelectedSectors([]);
    setSelectedTradingVolumes([]);
    setSelectedExpenseRatios([]);
    setSelectedListingPeriods([]);
    setSelectedHedgeTypes([]);
    setIssuerMarket('korea');
    setSelectedPensionTypes([]);
  };

  const searchTabs = [
    { id: 'name' as SearchType, label: '종목명/코드', icon: FileText, desc: 'ETF 이름/코드로 찾기' },
    { id: 'ai' as SearchType, label: 'AI 검색', icon: Sparkles, desc: '대화하며 ETF 찾기' },
    { id: 'screener' as SearchType, label: '스크리너', icon: SlidersHorizontal, desc: '상세 조건으로 필터링' },
    { id: 'holdings' as SearchType, label: '보유종목', icon: Package, desc: '종목명으로 ETF 찾기' },
  ];

  return (
    <PageContainer
      title="ETF 검색"
      subtitle="원하는 조건으로 ETF를 검색하세요"
      showMarketSelector={true}
    >
      {/* Search Method Selector */}
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-2 gap-sm md:grid-cols-4 md:gap-md">
          {searchTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = searchType === tab.id;
            return (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center gap-xs p-md border rounded-md cursor-pointer transition-all duration-fast text-sm font-semibold min-h-[85px] hover:border-primary hover:shadow-md hover:-translate-y-0.5 max-md:p-[10px_8px] max-md:text-xs max-md:min-h-[75px] ${isSelected ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-border text-text-secondary'}`}
                onClick={() => { setSearchType(tab.id); resetSearch(); }}
              >
                <Icon size={20} className={`flex-shrink-0 transition-all duration-fast ${isSelected ? 'scale-110 text-white' : ''}`} />
                <span className={`font-bold text-center leading-[1.3] ${isSelected ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Card
        padding="md"
        className={`relative z-10 overflow-visible transition-all duration-300 ${(searchType === 'name' && !nameQuery.trim()) || (searchType === 'holdings' && !holdingsQuery.trim()) ? 'border-2 border-danger shadow-[0_0_0_4px_rgba(239,68,68,0.1),0_4px_12px_rgba(239,68,68,0.15)] animate-pulse-required' : ''} lg:p-xl`}
      >
        {searchType === 'ai' && (
          <div className="flex flex-col gap-3 h-[600px] relative max-md:h-[500px]">
            <div className="flex justify-between items-center gap-3 pb-3 border-b border-border-light">
              <h3 className="text-lg font-bold text-text-primary m-0 tracking-tight max-md:text-base">AI 비서와 대화하며 ETF를 찾아보세요</h3>
              {chatMessages.length > 0 && (
                <button
                  className="py-1.5 px-3 bg-transparent border border-border rounded-full text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-fast whitespace-nowrap hover:bg-bg hover:border-text-secondary hover:text-text-primary"
                  onClick={() => setChatMessages([])}
                >
                  대화 초기화
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-5 px-3 pb-6 bg-transparent min-h-[400px] max-md:py-4 max-md:px-2 max-md:pb-5 max-md:min-h-[300px]">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <Sparkles size={48} className="text-primary opacity-40" />
                  <p className="text-[15px] font-semibold text-text-secondary m-0">이렇게 질문해 볼까요?</p>
                  <div className="flex flex-col gap-2.5 w-full max-w-[420px] max-md:max-w-full">
                    <button
                      className="py-3 px-4 bg-bg border border-transparent rounded-xl text-[13px] font-normal text-text-secondary cursor-pointer transition-all duration-200 text-left hover:bg-white hover:border-border hover:text-text-primary hover:shadow-md"
                      onClick={() => setAiQuery('배당 높은 미국 기술주 ETF')}
                    >
                      배당 높은 미국 기술주 ETF
                    </button>
                    <button
                      className="py-3 px-4 bg-bg border border-transparent rounded-xl text-[13px] font-normal text-text-secondary cursor-pointer transition-all duration-200 text-left hover:bg-white hover:border-border hover:text-text-primary hover:shadow-md"
                      onClick={() => setAiQuery('월배당 부동산 ETF')}
                    >
                      월배당 부동산 ETF
                    </button>
                    <button
                      className="py-3 px-4 bg-bg border border-transparent rounded-xl text-[13px] font-normal text-text-secondary cursor-pointer transition-all duration-200 text-left hover:bg-white hover:border-border hover:text-text-primary hover:shadow-md"
                      onClick={() => setAiQuery('저변동성 ESG ETF')}
                    >
                      저변동성 ESG ETF
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex animate-[fadeInUp_0.4s_ease-out] ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] flex flex-col gap-2 max-md:max-w-[90%] ${
                          message.role === 'user'
                            ? 'bg-primary text-white py-2.5 px-3.5 rounded-[18px_18px_4px_18px] shadow-sm'
                            : 'bg-bg py-2.5 px-3.5 rounded-[18px_18px_18px_4px] shadow-sm'
                        }`}
                      >
                        <p className={`m-0 text-sm leading-relaxed font-normal ${message.role === 'user' ? 'text-white' : 'text-text-primary'}`}>
                          {message.content}
                        </p>
                        {message.results && message.results.length > 0 && (
                          <div className="flex flex-col gap-2 mt-3">
                            {message.results.slice(0, 5).map(etf => (
                              <div
                                key={etf.id}
                                className="py-2.5 px-3 bg-white border border-border-light rounded-[10px] cursor-pointer transition-all duration-200 hover:border-primary hover:bg-bg hover:shadow-md"
                                onClick={() => navigate(`/etf/${etf.id}`)}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-semibold text-text-primary">{etf.name}</span>
                                  <span className={`text-[13px] font-semibold ${getChangeClass(etf.changePercent)}`}>
                                    {formatPercent(etf.changePercent)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-tertiary font-normal">
                                  <span>{etf.ticker}</span>
                                  <span>·</span>
                                  <span>{formatPriceByMarket(etf.price, selectedMarket)}</span>
                                  <span>·</span>
                                  <span>배당수익률 {etf.dividendYield.toFixed(2)}%</span>
                                </div>
                              </div>
                            ))}
                            {message.results.length > 5 && (
                              <button className="py-2 px-3 bg-transparent border border-border rounded-full text-[13px] font-medium text-primary cursor-pointer transition-all duration-200 text-center mt-2 hover:bg-bg hover:border-primary">
                                +{message.results.length - 5}개 더보기
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="sticky bottom-0 flex gap-2.5 items-center py-2 px-3 bg-white border-[1.5px] border-border rounded-3xl transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_-4px_12px_rgba(0,0,0,0.08)] z-10 mt-auto">
              <input
                type="text"
                className="flex-1 border-none outline-none text-sm font-normal text-text-primary bg-transparent leading-relaxed pl-1 placeholder:text-text-tertiary placeholder:font-normal"
                placeholder="AI와 대화를 시작해보세요."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
              />
              <button
                className="flex items-center justify-center w-9 h-9 bg-primary text-white border-none rounded-full cursor-pointer transition-all duration-200 flex-shrink-0 hover:enabled:bg-[#1a3a5f] hover:enabled:scale-[1.08] disabled:bg-bg-secondary disabled:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAIChat}
                disabled={!aiQuery.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {searchType === 'screener' && (
          <div className="flex flex-col gap-sm">
            <h3 className="text-lg font-bold text-text-primary m-0 tracking-tight max-md:text-base">원하는 조건으로 ETF를 찾아보세요</h3>

            {/* 필터 카테고리 탭 */}
            <div className="flex flex-wrap gap-xs py-xs mb-md">
              {filterCategories.map((category) => (
                <button
                  key={category.id}
                  className={`flex-shrink-0 py-2 px-4 bg-bg-secondary border border-border-light rounded-full text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-fast whitespace-nowrap hover:bg-white hover:border-border hover:text-text-primary max-md:py-1.5 max-md:px-3 max-md:text-xs lg:py-2.5 lg:px-5 lg:text-sm ${activeFilterTab === category.id ? 'bg-primary border-primary text-white font-semibold' : ''}`}
                  onClick={() => setActiveFilterTab(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* 선택된 카테고리의 필터 옵션 */}
            <div className="p-md bg-[rgba(250,251,252,0.6)] rounded-md border border-[rgba(229,231,235,0.6)] min-h-[120px] max-md:p-sm max-md:min-h-[100px] lg:p-lg">
              <div className="text-[13px] font-semibold text-text-secondary mb-sm pb-xs border-b border-border-light max-md:text-xs lg:text-sm">
                원하는 항목을 선택하세요
              </div>

              {/* 상장국가 */}
              {activeFilterTab === 'listing' && (
                <div className="flex flex-wrap gap-1.5">
                  {listingCountries.map(country => (
                    <button
                      key={country}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedListingCountries.includes(country) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedListingCountries, setSelectedListingCountries, country)}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}

              {/* 투자지역 */}
              {activeFilterTab === 'region' && (
                <div className="flex flex-wrap gap-1.5">
                  {investRegions.map(region => (
                    <button
                      key={region}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedInvestRegions.includes(region) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedInvestRegions, setSelectedInvestRegions, region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              )}

              {/* 기초자산 */}
              {activeFilterTab === 'asset' && (
                <div className="flex flex-wrap gap-1.5">
                  {assetTypes.map(type => (
                    <button
                      key={type}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedAssetTypes.includes(type) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedAssetTypes, setSelectedAssetTypes, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* 자산규모 */}
              {activeFilterTab === 'aum' && (
                  <>
                    <div className="flex flex-col gap-2.5 mt-1">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">국내 ETF</span>
                      <div className="flex flex-wrap gap-1.5">
                        {domesticAUM.map(aum => (
                          <button
                            key={aum}
                            className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedDomesticAUM.includes(aum) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                            onClick={() => toggleArrayItem(selectedDomesticAUM, setSelectedDomesticAUM, aum)}
                          >
                            {aum}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5 mt-1">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">해외 ETF</span>
                      <div className="flex flex-wrap gap-1.5">
                        {foreignAUM.map(aum => (
                          <button
                            key={aum}
                            className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedForeignAUM.includes(aum) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                            onClick={() => toggleArrayItem(selectedForeignAUM, setSelectedForeignAUM, aum)}
                          >
                            {aum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
              )}

              {/* 레버리지 */}
              {activeFilterTab === 'leverage' && (
                <div className="flex flex-wrap gap-1.5">
                  {leverageTypes.map(type => (
                    <button
                      key={type}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedLeverageTypes.includes(type) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedLeverageTypes, setSelectedLeverageTypes, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* 인버스 */}
              {activeFilterTab === 'inverse' && (
                <div className="flex flex-wrap gap-1.5">
                  {inverseTypes.map(type => (
                    <button
                      key={type}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedInverseTypes.includes(type) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedInverseTypes, setSelectedInverseTypes, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* 배당 */}
              {activeFilterTab === 'dividend' && (
                <>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">배당 수익률</span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        className="flex-1 h-[38px] px-3 bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary transition-all duration-200 text-center placeholder:text-text-tertiary placeholder:font-normal placeholder:text-xs hover:border-text-secondary focus:outline-none focus:border-primary max-md:h-9 max-md:text-xs lg:h-10 lg:text-sm"
                        placeholder="배당률 입력"
                        value={dividendMin}
                        onChange={(e) => setDividendMin(e.target.value)}
                      />
                      <span className="text-text-tertiary font-medium text-sm flex-shrink-0">~</span>
                      <input
                        type="text"
                        className="flex-1 h-[38px] px-3 bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary transition-all duration-200 text-center placeholder:text-text-tertiary placeholder:font-normal placeholder:text-xs hover:border-text-secondary focus:outline-none focus:border-primary max-md:h-9 max-md:text-xs lg:h-10 lg:text-sm"
                        placeholder="배당률 입력"
                        value={dividendMax}
                        onChange={(e) => setDividendMax(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">배당 주기</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dividendFrequencies.map(freq => (
                        <button
                          key={freq}
                          className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedDividendFreq.includes(freq) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                          onClick={() => toggleArrayItem(selectedDividendFreq, setSelectedDividendFreq, freq)}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 수익률 */}
              {activeFilterTab === 'return' && (
                <>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">수익기간</span>
                    <div className="flex flex-wrap gap-1.5">
                      {returnPeriods.map(period => (
                        <button
                          key={period}
                          className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedReturnPeriod === period ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                          onClick={() => setSelectedReturnPeriod(selectedReturnPeriod === period ? null : period)}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-1">
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">수익률 범위</span>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        className="flex-1 h-[38px] px-3 bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary transition-all duration-200 text-center placeholder:text-text-tertiary placeholder:font-normal placeholder:text-xs hover:border-text-secondary focus:outline-none focus:border-primary max-md:h-9 max-md:text-xs lg:h-10 lg:text-sm"
                        placeholder="수익률 입력"
                        value={returnMin}
                        onChange={(e) => setReturnMin(e.target.value)}
                      />
                      <span className="text-text-tertiary font-medium text-sm flex-shrink-0">~</span>
                      <input
                        type="text"
                        className="flex-1 h-[38px] px-3 bg-white border border-border rounded-lg text-[13px] font-medium text-text-primary transition-all duration-200 text-center placeholder:text-text-tertiary placeholder:font-normal placeholder:text-xs hover:border-text-secondary focus:outline-none focus:border-primary max-md:h-9 max-md:text-xs lg:h-10 lg:text-sm"
                        placeholder="수익률 입력"
                        value={returnMax}
                        onChange={(e) => setReturnMax(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 운용사 */}
              {activeFilterTab === 'issuer' && (
                <div className="flex flex-col gap-2.5 mt-1">
                  <div className="inline-flex gap-0 p-0 bg-transparent border border-border rounded-full mb-2 overflow-hidden">
                    <button
                      className={`flex-1 py-1.5 px-4 bg-transparent border-none rounded-none text-xs font-semibold text-text-tertiary cursor-pointer transition-all duration-200 whitespace-nowrap min-w-[100px] hover:bg-bg hover:text-text-primary lg:py-[7px] lg:px-5 lg:text-[13px] ${issuerMarket === 'korea' ? 'bg-primary text-white' : ''}`}
                      onClick={() => setIssuerMarket('korea')}
                    >
                      한국 운용사
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-4 bg-transparent border-none rounded-none text-xs font-semibold text-text-tertiary cursor-pointer transition-all duration-200 whitespace-nowrap min-w-[100px] hover:bg-bg hover:text-text-primary lg:py-[7px] lg:px-5 lg:text-[13px] ${issuerMarket === 'us' ? 'bg-primary text-white' : ''}`}
                      onClick={() => setIssuerMarket('us')}
                    >
                      미국 운용사
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(issuerMarket === 'korea' ? filterOptions.koreanIssuers : filterOptions.usIssuers).map(issuer => (
                      <button
                        key={issuer}
                        className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedIssuers.includes(issuer) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                        onClick={() => toggleIssuer(issuer)}
                      >
                        {issuer}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 연금 */}
              {activeFilterTab === 'pension' && (
                <div className="flex flex-wrap gap-1.5">
                  {pensionTypes.map(type => (
                    <button
                      key={type}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedPensionTypes.includes(type) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedPensionTypes, setSelectedPensionTypes, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* 섹터 */}
              {activeFilterTab === 'sector' && (
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map(sector => (
                    <button
                      key={sector}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedSectors.includes(sector) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedSectors, setSelectedSectors, sector)}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              )}

              {/* 거래량 */}
              {activeFilterTab === 'volume' && (
                <div className="flex flex-wrap gap-1.5">
                  {tradingVolumes.map(volume => (
                    <button
                      key={volume}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedTradingVolumes.includes(volume) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedTradingVolumes, setSelectedTradingVolumes, volume)}
                    >
                      {volume}
                    </button>
                  ))}
                </div>
              )}

              {/* 총보수 */}
              {activeFilterTab === 'expense' && (
                <div className="flex flex-wrap gap-1.5">
                  {expenseRatios.map(ratio => (
                    <button
                      key={ratio}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedExpenseRatios.includes(ratio) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedExpenseRatios, setSelectedExpenseRatios, ratio)}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              )}

              {/* 상장기간 */}
              {activeFilterTab === 'listingPeriod' && (
                <div className="flex flex-wrap gap-1.5">
                  {listingPeriods.map(period => (
                    <button
                      key={period}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedListingPeriods.includes(period) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedListingPeriods, setSelectedListingPeriods, period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}

              {/* 환헤지 */}
              {activeFilterTab === 'hedge' && (
                <div className="flex flex-wrap gap-1.5">
                  {hedgeTypes.map(type => (
                    <button
                      key={type}
                      className={`py-[7px] px-3.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap leading-[1.4] max-md:py-1.5 max-md:px-3 max-md:text-[11px] lg:py-2 lg:px-4 lg:text-[13px] ${selectedHedgeTypes.includes(type) ? 'bg-primary text-white border-primary font-semibold shadow-md' : 'bg-white border-border text-text-secondary hover:border-text-secondary hover:bg-bg hover:-translate-y-px'}`}
                      onClick={() => toggleArrayItem(selectedHedgeTypes, setSelectedHedgeTypes, type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* 선택된 필터 표시 */}
            <SelectedFilters
              filters={selectedFilterChips}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
        )}

        {searchType === 'name' && (
          <>
            <CardHeader
              title="ETF 검색"
              subtitle="찾고자 하는 ETF를 검색하세요"
            />
            <div className="relative flex items-center mt-sm">
              <Search className="absolute left-3.5 text-text-tertiary pointer-events-none max-md:left-3" size={18} />
              <input
                type="text"
                className="w-full h-12 py-0 px-11 bg-white border border-border rounded-lg text-base text-text-primary transition-all duration-fast focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-text-tertiary max-md:h-11 max-md:text-sm max-md:pl-10"
                placeholder="ETF 이름 또는 종목코드 검색..."
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </>
        )}

        {searchType === 'holdings' && (
          <>
            <CardHeader
              title="ETF 검색"
              subtitle="보유종목으로 ETF를 검색하세요"
            />
            <div className="relative flex items-center mt-sm">
              <Search className="absolute left-3.5 text-text-tertiary pointer-events-none max-md:left-3" size={18} />
              <input
                type="text"
                className="w-full h-12 py-0 px-11 bg-white border border-border rounded-lg text-base text-text-primary transition-all duration-fast focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-text-tertiary max-md:h-11 max-md:text-sm max-md:pl-10"
                placeholder="ETF 이름 또는 종목코드 검색..."
                value={holdingsQuery}
                onChange={(e) => setHoldingsQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </>
        )}
      </Card>

      {searchType !== 'ai' && (
        <Button
          variant="primary"
          size="lg"
          onClick={handleSearch}
          disabled={(searchType === 'name' && !nameQuery.trim()) || (searchType === 'holdings' && !holdingsQuery.trim())}
          className="w-full mt-[2px] flex items-center justify-center gap-sm max-md:h-[46px] max-md:text-[13px]"
        >
          <Search size={20} />
          검색하기
          <ArrowRight size={20} />
        </Button>
      )}

      {hasSearched && searchType !== 'ai' && (
        <div
          ref={resultsSectionRef}
          className="flex flex-col gap-lg w-full max-w-full bg-white border border-border rounded-lg p-lg shadow-card mt-md max-md:p-md"
        >
          <div className="flex justify-between items-center pb-md border-b border-border-light flex-wrap gap-sm">
            <h3 className="text-lg font-bold text-text-primary m-0 flex items-center gap-2 tracking-tight before:content-['📋'] before:text-xl max-md:text-base max-md:before:text-lg">
              검색 결과 <span className="text-primary font-bold">{searchResults.length}개</span>
            </h3>
            <div className="flex items-center gap-xs">
              {/* 기간 선택 (등락률순일 때만 표시) */}
              {sortBy === 'change' && searchType !== 'holdings' && (
                <div className="flex items-center">
                  <select
                    className="py-2 px-3 bg-bg border border-border rounded-md text-sm font-semibold text-text-primary cursor-pointer transition-all duration-fast outline-none hover:bg-white hover:border-primary max-md:text-xs max-md:py-1.5 max-md:px-2.5"
                    value={resultPeriod}
                    onChange={(e) => setResultPeriod(e.target.value as ResultPeriod)}
                  >
                    {RESULT_PERIOD_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 정렬 선택 */}
              {searchType === 'holdings' ? (
                <select
                  className="py-2 px-3 bg-bg border border-border rounded-md text-sm font-semibold text-text-primary cursor-pointer transition-all duration-fast outline-none hover:bg-white hover:border-primary"
                  value={holdingSortBy}
                  onChange={(e) => setHoldingSortBy(e.target.value as HoldingSortOption)}
                >
                  <option value="weight">보유비중순</option>
                  <option value="change">등락률순</option>
                </select>
              ) : (
                <select
                  className="py-2 px-3 bg-bg border border-border rounded-md text-sm font-semibold text-text-primary cursor-pointer transition-all duration-fast outline-none hover:bg-white hover:border-primary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="marketCap">시가총액순</option>
                  <option value="dividend">배당수익률순</option>
                  <option value="change">등락률순</option>
                </select>
              )}
            </div>
          </div>
          {searchResults.length === 0 ? (
            <Card padding="md" className="flex flex-col items-center text-center !bg-bg !border-dashed !border-border !rounded-md !p-2xl">
              <div className="text-5xl mb-md opacity-40">🔍</div>
              <h4 className="text-lg font-bold text-text-primary mb-xs">검색 결과가 없습니다</h4>
              <p className="text-sm text-text-tertiary font-medium">다른 조건으로 다시 검색해보세요</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-sm max-md:gap-2">
              {sortedResults.map((etf) => {
                // 보유종목 검색 시 매칭되는 종목 찾기
                const matchingHolding = searchType === 'holdings' && holdingsQuery && etf.holdings
                  ? etf.holdings.find(h =>
                      h.name.toLowerCase().includes(holdingsQuery.toLowerCase()) ||
                      h.ticker.toLowerCase().includes(holdingsQuery.toLowerCase())
                    )
                  : null;

                return (
                  <div
                    key={etf.id}
                    className="bg-bg border border-border rounded-md p-md cursor-pointer transition-all duration-200 hover:bg-white hover:border-primary hover:shadow-lg hover:translate-x-1 max-md:p-3"
                    onClick={() => navigate(`/etf/${etf.id}`)}
                  >
                    {searchType === 'holdings' && matchingHolding ? (
                      /* Holdings Search Result Layout */
                      <>
                        {/* Primary Info - Same as Screener */}
                        <div className="flex justify-between items-center gap-md mb-sm max-md:gap-sm max-md:mb-2">
                          <div className="flex items-baseline gap-2 flex-1 min-w-0">
                            <h3 className="text-base font-bold text-text-primary m-0 leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap tracking-tight max-md:text-sm">{etf.name}</h3>
                            <span className="text-xs font-semibold text-text-secondary font-numeric flex-shrink-0 max-md:text-[11px]">{etf.ticker}</span>
                          </div>
                          <div className="flex items-baseline gap-2 flex-shrink-0">
                            <div className="text-base font-bold text-text-primary tracking-tight font-numeric max-md:text-sm">{formatPriceByMarket(etf.price, selectedMarket)}</div>
                            <div className={`text-sm font-bold tracking-tight font-numeric max-md:text-xs ${getChangeClass(etf.changePercent)}`}>
                              {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                            </div>
                          </div>
                        </div>

                        {/* Holding Weight Visualization */}
                        <div className="flex flex-col gap-2 pt-sm border-t border-border-light mt-sm">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">보유비중</span>
                          <div className="flex items-center gap-sm">
                            <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden relative max-md:h-1.5">
                              <div
                                className="h-full bg-primary rounded-full transition-[width] duration-500"
                                style={{ width: `${matchingHolding.weight}%` }}
                              ></div>
                            </div>
                            <div className="text-lg font-bold text-primary tracking-tight min-w-[55px] text-right flex-shrink-0 font-numeric max-md:text-base max-md:min-w-[50px]">
                              {matchingHolding.weight.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Screener Search Result Layout */
                      <>
                        {/* Primary Info */}
                        <div className="flex justify-between items-center gap-md mb-sm max-md:gap-sm max-md:mb-2">
                          <div className="flex items-baseline gap-2 flex-1 min-w-0">
                            <h3 className="text-base font-bold text-text-primary m-0 leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap tracking-tight max-md:text-sm">{etf.name}</h3>
                            <span className="text-xs font-semibold text-text-secondary font-numeric flex-shrink-0 max-md:text-[11px]">{etf.ticker}</span>
                          </div>
                          <div className="flex items-baseline gap-2 flex-shrink-0">
                            <div className="text-base font-bold text-text-primary tracking-tight font-numeric max-md:text-sm">{formatPriceByMarket(etf.price, selectedMarket)}</div>
                            <div className={`text-sm font-bold tracking-tight font-numeric max-md:text-xs ${getChangeClass(etf.changePercent)}`}>
                              {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                            </div>
                          </div>
                        </div>

                        {/* Secondary Info */}
                        <div className="grid grid-cols-[auto_1fr] items-center gap-md pt-sm border-t border-border-light max-md:gap-2 max-md:items-start md:grid-cols-[auto_1fr]">
                          <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-start items-center max-md:gap-1">
                            <span className="py-1 px-2 bg-primary text-white rounded-sm text-[10px] font-bold uppercase tracking-wide whitespace-nowrap leading-[1.4] max-md:text-[9px] max-md:py-0.5 max-md:px-1.5">{etf.category}</span>
                            {etf.themes.slice(0, 2).map(theme => (
                              <span key={theme} className="py-1 px-2 bg-bg-secondary whitespace-nowrap leading-[1.4] text-text-secondary rounded-sm text-[10px] font-semibold max-md:text-[9px] max-md:py-0.5 max-md:px-1.5">{theme}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-md flex-wrap justify-end min-w-0 max-md:gap-2 max-md:flex-nowrap">
                            <span className="flex items-center gap-1.5 whitespace-nowrap max-md:gap-0.5">
                              <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-wide max-md:text-[8px] max-md:min-w-10 lg:text-[11px] lg:min-w-[56px]">시가총액</span>
                              <span className="text-xs font-bold text-primary font-numeric max-md:text-[10px] max-md:py-px max-md:px-0.5 lg:text-sm lg:py-0.5 lg:px-2">{formatLargeNumberByMarket(etf.marketCap, selectedMarket)}</span>
                            </span>
                            <span className="flex items-center gap-1.5 whitespace-nowrap max-md:gap-0.5">
                              <span className="text-[10px] font-semibold text-text-tertiary min-w-[52px] inline-block uppercase tracking-wide max-md:text-[8px] max-md:min-w-10 lg:text-[11px] lg:min-w-[56px]">배당수익률</span>
                              <span className="text-xs font-bold text-primary font-numeric max-md:text-[10px] max-md:py-px max-md:px-0.5 lg:text-sm lg:py-0.5 lg:px-2">{etf.dividendYield.toFixed(2)}%</span>
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
