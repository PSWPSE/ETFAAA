import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal, Package, ArrowRight, Send, FileText, ChevronDown, X } from 'lucide-react';
import { Card, CardHeader, Button, SelectedFilters } from '../components/common';
import type { FilterChip } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, filterOptions, getReturns } from '../data/etfs';
import { formatPrice, formatPercent, formatLargeNumber, getChangeClass } from '../utils/format';
import styles from './SearchPage.module.css';

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
  
  // 선택된 필터 개수 계산
  const activeFiltersCount = selectedFilterChips.length;
  
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
  
  const toggleArrayItem = (items: string[], setItems: (items: string[]) => void, item: string) => {
    if (items.includes(item)) {
      setItems(items.filter(i => i !== item));
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
      setSelectedIssuers(prev => prev.filter(item => item !== value));
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
      <div className={styles.searchMethodSection}>
        <div className={styles.searchTypeTabs}>
          {searchTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`${styles.searchTypeTab} ${searchType === tab.id ? styles.active : ''}`}
                onClick={() => { setSearchType(tab.id); resetSearch(); }}>
                <Icon size={20} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <Card padding="md" className={`${styles.searchCard} ${(searchType === 'name' && !nameQuery.trim()) || (searchType === 'holdings' && !holdingsQuery.trim()) ? styles.required : ''}`}>
        {searchType === 'ai' && (
          <div className={styles.chatInterface}>
            <div className={styles.chatHeader}>
              <h3 className={styles.sectionTitle}>AI 비서와 대화하며 ETF를 찾아보세요</h3>
              {chatMessages.length > 0 && (
                <button className={styles.clearChatButton} onClick={() => setChatMessages([])}>
                  대화 초기화
                </button>
              )}
            </div>
            
            {/* Chat Messages */}
            <div className={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <div className={styles.chatEmpty}>
                  <Sparkles size={48} className={styles.chatEmptyIcon} />
                  <p className={styles.chatEmptyText}>이렇게 질문해 볼까요?</p>
                  <div className={styles.chatExamples}>
                    <button className={styles.exampleChip} onClick={() => setAiQuery('배당 높은 미국 기술주 ETF')}>
                      배당 높은 미국 기술주 ETF
                    </button>
                    <button className={styles.exampleChip} onClick={() => setAiQuery('월배당 부동산 ETF')}>
                      월배당 부동산 ETF
                    </button>
                    <button className={styles.exampleChip} onClick={() => setAiQuery('저변동성 ESG ETF')}>
                      저변동성 ESG ETF
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map(message => (
                    <div key={message.id} className={`${styles.chatMessage} ${styles[message.role]}`}>
                      <div className={styles.messageContent}>
                        <p className={styles.messageText}>{message.content}</p>
                        {message.results && message.results.length > 0 && (
                          <div className={styles.messageResults}>
                            {message.results.slice(0, 5).map(etf => (
                              <div key={etf.id} className={styles.resultItem} onClick={() => navigate(`/etf/${etf.id}`)}>
                                <div className={styles.resultHeader}>
                                  <span className={styles.resultName}>{etf.name}</span>
                                  <span className={`${styles.resultChange} ${getChangeClass(etf.changePercent)}`}>
                                    {formatPercent(etf.changePercent)}
                                  </span>
                                </div>
                                <div className={styles.resultMeta}>
                                  <span>{etf.ticker}</span>
                                  <span>·</span>
                                  <span>{formatPrice(etf.price)}원</span>
                                  <span>·</span>
                                  <span>배당수익률 {etf.dividendYield.toFixed(2)}%</span>
                                </div>
                              </div>
                            ))}
                            {message.results.length > 5 && (
                              <button className={styles.showMoreButton}>
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
            <div className={`${styles.chatInputWrapper} ${styles.required}`}>
              <input type="text" className={styles.chatInput} placeholder="AI와 대화를 시작해보세요."
                value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAIChat()} />
              <button className={styles.sendButton} onClick={handleAIChat} disabled={!aiQuery.trim()}>
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
        
        {searchType === 'screener' && (
          <div className={styles.searchInterface}>
            <h3 className={styles.sectionTitle}>원하는 조건으로 ETF를 찾아보세요</h3>
            
            {/* 필터 카테고리 탭 */}
            <div className={styles.filterCategoryTabs}>
              {filterCategories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.filterCategoryTab} ${activeFilterTab === category.id ? styles.active : ''}`}
                  onClick={() => setActiveFilterTab(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            
            {/* 선택된 카테고리의 필터 옵션 */}
            <div className={`${styles.filterOptions} ${styles.required}`}>
              <div className={styles.filterOptionsHeader}>
                원하는 항목을 선택하세요
              </div>
              
              {/* 상장국가 */}
              {activeFilterTab === 'listing' && (
                <div className={styles.filterChips}>
                  {listingCountries.map(country => (
                    <button key={country} className={`${styles.filterChip} ${selectedListingCountries.includes(country) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedListingCountries, setSelectedListingCountries, country)}>{country}</button>
                  ))}
                </div>
              )}
              
              {/* 투자지역 */}
              {activeFilterTab === 'region' && (
                <div className={styles.filterChips}>
                  {investRegions.map(region => (
                    <button key={region} className={`${styles.filterChip} ${selectedInvestRegions.includes(region) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedInvestRegions, setSelectedInvestRegions, region)}>{region}</button>
                  ))}
                </div>
              )}
              
              {/* 기초자산 */}
              {activeFilterTab === 'asset' && (
                <div className={styles.filterChips}>
                  {assetTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedAssetTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedAssetTypes, setSelectedAssetTypes, type)}>{type}</button>
                  ))}
                </div>
              )}
              
              {/* 자산규모 */}
              {activeFilterTab === 'aum' && (
                  <>
                    <div className={styles.filterSubSection}>
                      <span className={styles.filterSubtitle}>국내 ETF</span>
                      <div className={styles.filterChips}>
                        {domesticAUM.map(aum => (
                          <button key={aum} className={`${styles.filterChip} ${selectedDomesticAUM.includes(aum) ? styles.selected : ''}`}
                            onClick={() => toggleArrayItem(selectedDomesticAUM, setSelectedDomesticAUM, aum)}>{aum}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.filterSubSection}>
                      <span className={styles.filterSubtitle}>해외 ETF</span>
                      <div className={styles.filterChips}>
                        {foreignAUM.map(aum => (
                          <button key={aum} className={`${styles.filterChip} ${selectedForeignAUM.includes(aum) ? styles.selected : ''}`}
                            onClick={() => toggleArrayItem(selectedForeignAUM, setSelectedForeignAUM, aum)}>{aum}</button>
                        ))}
                      </div>
                    </div>
                  </>
              )}
              
              {/* 레버리지 */}
              {activeFilterTab === 'leverage' && (
                <div className={styles.filterChips}>
                  {leverageTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedLeverageTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedLeverageTypes, setSelectedLeverageTypes, type)}>{type}</button>
                  ))}
                </div>
              )}
              
              {/* 인버스 */}
              {activeFilterTab === 'inverse' && (
                <div className={styles.filterChips}>
                  {inverseTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedInverseTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedInverseTypes, setSelectedInverseTypes, type)}>{type}</button>
                  ))}
                </div>
              )}
              
              {/* 배당 */}
              {activeFilterTab === 'dividend' && (
                <>
                  <div className={styles.filterSubSection}>
                    <span className={styles.filterSubtitle}>배당 수익률</span>
                    <div className={styles.rangeInputs}>
                      <input type="text" className={styles.rangeInput} placeholder="배당률 입력" value={dividendMin} 
                        onChange={(e) => setDividendMin(e.target.value)} />
                      <span className={styles.rangeSeparator}>~</span>
                      <input type="text" className={styles.rangeInput} placeholder="배당률 입력" value={dividendMax}
                        onChange={(e) => setDividendMax(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.filterSubSection}>
                    <span className={styles.filterSubtitle}>배당 주기</span>
                    <div className={styles.filterChips}>
                      {dividendFrequencies.map(freq => (
                        <button key={freq} className={`${styles.filterChip} ${selectedDividendFreq.includes(freq) ? styles.selected : ''}`}
                          onClick={() => toggleArrayItem(selectedDividendFreq, setSelectedDividendFreq, freq)}>{freq}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* 수익률 */}
              {activeFilterTab === 'return' && (
                <>
                  <div className={styles.filterSubSection}>
                    <span className={styles.filterSubtitle}>수익기간</span>
                    <div className={styles.filterChips}>
                      {returnPeriods.map(period => (
                        <button key={period} className={`${styles.filterChip} ${selectedReturnPeriod === period ? styles.selected : ''}`}
                          onClick={() => setSelectedReturnPeriod(selectedReturnPeriod === period ? null : period)}>{period}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.filterSubSection}>
                    <span className={styles.filterSubtitle}>수익률 범위</span>
                    <div className={styles.rangeInputs}>
                      <input type="text" className={styles.rangeInput} placeholder="수익률 입력" value={returnMin} 
                        onChange={(e) => setReturnMin(e.target.value)} />
                      <span className={styles.rangeSeparator}>~</span>
                      <input type="text" className={styles.rangeInput} placeholder="수익률 입력" value={returnMax}
                        onChange={(e) => setReturnMax(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
              
              {/* 운용사 */}
              {activeFilterTab === 'issuer' && (
                <div className={styles.filterSubSection}>
                  <div className={styles.issuerToggle}>
                    <button 
                      className={`${styles.toggleButton} ${issuerMarket === 'korea' ? styles.active : ''}`}
                      onClick={() => setIssuerMarket('korea')}>
                      한국 운용사
                    </button>
                    <button 
                      className={`${styles.toggleButton} ${issuerMarket === 'us' ? styles.active : ''}`}
                      onClick={() => setIssuerMarket('us')}>
                      미국 운용사
                    </button>
                  </div>
                  <div className={styles.filterChips}>
                    {(issuerMarket === 'korea' ? filterOptions.koreanIssuers : filterOptions.usIssuers).map(issuer => (
                      <button key={issuer} className={`${styles.filterChip} ${selectedIssuers.includes(issuer) ? styles.selected : ''}`}
                        onClick={() => toggleIssuer(issuer)}>{issuer}</button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 연금 */}
              {activeFilterTab === 'pension' && (
                <div className={styles.filterChips}>
                  {pensionTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedPensionTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedPensionTypes, setSelectedPensionTypes, type)}>{type}</button>
                  ))}
                </div>
              )}
              
              {/* 섹터 */}
              {activeFilterTab === 'sector' && (
                <div className={styles.filterChips}>
                  {sectors.map(sector => (
                    <button key={sector} className={`${styles.filterChip} ${selectedSectors.includes(sector) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedSectors, setSelectedSectors, sector)}>{sector}</button>
                  ))}
                </div>
              )}
              
              {/* 거래량 */}
              {activeFilterTab === 'volume' && (
                <div className={styles.filterChips}>
                  {tradingVolumes.map(volume => (
                    <button key={volume} className={`${styles.filterChip} ${selectedTradingVolumes.includes(volume) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedTradingVolumes, setSelectedTradingVolumes, volume)}>{volume}</button>
                  ))}
                </div>
              )}
              
              {/* 총보수 */}
              {activeFilterTab === 'expense' && (
                <div className={styles.filterChips}>
                  {expenseRatios.map(ratio => (
                    <button key={ratio} className={`${styles.filterChip} ${selectedExpenseRatios.includes(ratio) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedExpenseRatios, setSelectedExpenseRatios, ratio)}>{ratio}</button>
                  ))}
                </div>
              )}
              
              {/* 상장기간 */}
              {activeFilterTab === 'listingPeriod' && (
                <div className={styles.filterChips}>
                  {listingPeriods.map(period => (
                    <button key={period} className={`${styles.filterChip} ${selectedListingPeriods.includes(period) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedListingPeriods, setSelectedListingPeriods, period)}>{period}</button>
                  ))}
                </div>
              )}
              
              {/* 환헤지 */}
              {activeFilterTab === 'hedge' && (
                <div className={styles.filterChips}>
                  {hedgeTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedHedgeTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedHedgeTypes, setSelectedHedgeTypes, type)}>{type}</button>
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
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchInputIcon} size={18} />
              <input type="text" className={styles.searchInput} placeholder="ETF 이름 또는 종목코드 검색..."
                value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
          </>
        )}
        
        {searchType === 'holdings' && (
          <>
            <CardHeader 
              title="ETF 검색"
              subtitle="보유종목으로 ETF를 검색하세요"
            />
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchInputIcon} size={18} />
              <input type="text" className={styles.searchInput} placeholder="ETF 이름 또는 종목코드 검색..."
                value={holdingsQuery} onChange={(e) => setHoldingsQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
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
          className={styles.searchButton}
        >
          <Search size={20} />
          검색하기
          <ArrowRight size={20} />
        </Button>
      )}
      
      {hasSearched && searchType !== 'ai' && (
        <div ref={resultsSectionRef} className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>검색 결과 <span className={styles.resultsCount}>{searchResults.length}개</span></h3>
            <div className={styles.sortWrapper}>
              {/* 기간 선택 (등락률순일 때만 표시) */}
              {sortBy === 'change' && searchType !== 'holdings' && (
                <div className={styles.periodDropdown}>
                  <select
                    className={styles.periodSelect}
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
                <select className={styles.sortSelect} value={holdingSortBy} onChange={(e) => setHoldingSortBy(e.target.value as HoldingSortOption)}>
                  <option value="weight">보유비중순</option>
                  <option value="change">등락률순</option>
                </select>
              ) : (
                <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                  <option value="marketCap">시가총액순</option>
                  <option value="dividend">배당수익률순</option>
                  <option value="change">등락률순</option>
                </select>
              )}
            </div>
          </div>
          {searchResults.length === 0 ? (
            <Card padding="md" className={styles.emptyResults}>
              <div className={styles.emptyIcon}>🔍</div>
              <h4 className={styles.emptyTitle}>검색 결과가 없습니다</h4>
              <p className={styles.emptyDesc}>다른 조건으로 다시 검색해보세요</p>
            </Card>
          ) : (
            <div className={styles.etfList}>
              {sortedResults.map((etf) => {
                // 보유종목 검색 시 매칭되는 종목 찾기
                const matchingHolding = searchType === 'holdings' && holdingsQuery && etf.holdings
                  ? etf.holdings.find(h => 
                      h.name.toLowerCase().includes(holdingsQuery.toLowerCase()) || 
                      h.ticker.toLowerCase().includes(holdingsQuery.toLowerCase())
                    )
                  : null;
                
                return (
                  <div key={etf.id} className={styles.etfCard} onClick={() => navigate(`/etf/${etf.id}`)}>
                    {searchType === 'holdings' && matchingHolding ? (
                      /* Holdings Search Result Layout */
                      <>
                        {/* Primary Info - Same as Screener */}
                        <div className={styles.primaryInfo}>
                          <div className={styles.nameBlock}>
                            <h3 className={styles.name}>{etf.name}</h3>
                            <span className={styles.code}>{etf.ticker}</span>
                          </div>
                          <div className={styles.priceBlock}>
                            <div className={styles.priceMain}>{formatPrice(etf.price)}원</div>
                            <div className={`${styles.changeMain} ${getChangeClass(etf.changePercent)}`}>
                              {etf.changePercent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(etf.changePercent))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Holding Weight Visualization */}
                        <div className={styles.holdingsMiddleRow}>
                          <span className={styles.holdingLabel}>보유비중</span>
                          <div className={styles.holdingVisualization}>
                            <div className={styles.holdingBar}>
                              <div className={styles.holdingFill} style={{ width: `${matchingHolding.weight}%` }}></div>
                            </div>
                            <div className={styles.holdingWeight}>{matchingHolding.weight.toFixed(1)}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Screener Search Result Layout */
                      <>
                        {/* Primary Info */}
                        <div className={styles.primaryInfo}>
                          <div className={styles.nameBlock}>
                            <h3 className={styles.name}>{etf.name}</h3>
                            <span className={styles.code}>{etf.ticker}</span>
                          </div>
                          <div className={styles.priceBlock}>
                            <div className={styles.priceMain}>{formatPrice(etf.price)}원</div>
                            <div className={`${styles.changeMain} ${getChangeClass(etf.changePercent)}`}>
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
                              <span className={styles.metaLabel}>배당수익률</span>
                              <span className={styles.metaValue}>{etf.dividendYield.toFixed(2)}%</span>
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
