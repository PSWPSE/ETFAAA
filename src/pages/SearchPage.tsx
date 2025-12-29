import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal, Package, ArrowRight, Send } from 'lucide-react';
import { Card, Button } from '../components/common';
import { useETFStore } from '../store/etfStore';
import { koreanETFs, usETFs, filterOptions } from '../data/etfs';
import { formatPrice, formatPercent, formatLargeNumber, getChangeClass } from '../utils/format';
import styles from './SearchPage.module.css';

type SearchType = 'ai' | 'screener' | 'holdings';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: typeof koreanETFs;
}

const investRegions = ['한국', '미국', '중국(홍콩포함)', '일본', '영국', '프랑스', '독일', '베트남', '인도', '글로벌', '유럽', '선진국', '신흥국', '라틴아메리카', '기타'];
const assetTypes = ['주식', '채권', '원자재', '혼합', '대체', '머니마켓'];
const listingCountries = ['한국 상장', '미국 상장', '중국 상장', '홍콩 상장', '일본 상장'];
const leverageTypes = ['+1배', '+1.25~1.75배', '+2배', '+3배'];
const inverseTypes = ['-1배', '-1.25~-1.75배', '-2배', '-3배'];
const domesticAUM = ['500억 미만', '5백억~1천억 미만', '1천억~5천억 미만', '5천억 이상'];
const foreignAUM = ['1천만 달러 미만', '1천만~1억 달러 미만', '1억~10억 달러 미만', '10억~100억 달러 미만', '100억 달러 이상'];
const dividendFrequencies = ['월', '분기', '반기', '연간', '비정기'];
const returnPeriods = ['1개월', '3개월', '6개월', '1년', '3년'];

type SortOption = 'marketCap' | 'dividend' | 'change';
type HoldingSortOption = 'weight' | 'change';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<SearchType>('ai');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [holdingSortBy, setHoldingSortBy] = useState<HoldingSortOption>('weight');
  
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
  
  const store = useETFStore();
  const { selectedMarket, selectedIssuers, setSelectedIssuers } = store;
  
  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const [searchResults, setSearchResults] = useState(etfs);
  
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
          return b.changePercent - a.changePercent;
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

  const handleSearch = () => {
    setHasSearched(true);
    let filtered = [...etfs];
    
    if (searchType === 'ai') {
      handleAIChat();
      return;
    } else if (searchType === 'screener') {
      if (selectedIssuers.length > 0) filtered = filtered.filter(etf => selectedIssuers.includes(etf.issuer));
      const divMin = dividendMin ? parseFloat(dividendMin) : 0;
      const divMax = dividendMax ? parseFloat(dividendMax) : 100;
      if (dividendMin || dividendMax) filtered = filtered.filter(etf => etf.dividendYield >= divMin && etf.dividendYield <= divMax);
    } else {
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
  };
  
  const searchTabs = [
    { id: 'ai' as SearchType, label: 'AI비서', icon: Sparkles, desc: '대화하며 ETF 찾기' },
    { id: 'screener' as SearchType, label: '스크리너', icon: SlidersHorizontal, desc: '상세 조건으로 필터링' },
    { id: 'holdings' as SearchType, label: '보유종목', icon: Package, desc: '종목명으로 ETF 찾기' },
  ];
  
  return (
    <div className={styles.page}>
      {/* Search Method Selector */}
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
      
      <Card padding="lg" className={styles.searchCard}>
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
                  <p className={styles.chatEmptyText}>AI 비서에게 원하는 ETF를 물어보세요</p>
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
                                  <span>배당 {etf.dividendYield.toFixed(2)}%</span>
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
            <div className={styles.chatInputWrapper}>
              <input type="text" className={styles.chatInput} placeholder="ETF에 대해 물어보세요..."
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
            <div className={styles.screenerFilters}>
              
              {/* 투자지역 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>투자지역</h4>
                <div className={styles.filterChips}>
                  {investRegions.map(region => (
                    <button key={region} className={`${styles.filterChip} ${selectedInvestRegions.includes(region) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedInvestRegions, setSelectedInvestRegions, region)}>{region}</button>
                  ))}
                </div>
              </div>
              
              {/* 기초자산 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>기초자산</h4>
                <div className={styles.filterChips}>
                  {assetTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedAssetTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedAssetTypes, setSelectedAssetTypes, type)}>{type}</button>
                  ))}
                </div>
              </div>
              
              {/* 상장국가 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>상장국가</h4>
                <div className={styles.filterChips}>
                  {listingCountries.map(country => (
                    <button key={country} className={`${styles.filterChip} ${selectedListingCountries.includes(country) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedListingCountries, setSelectedListingCountries, country)}>{country}</button>
                  ))}
                </div>
              </div>
              
              {/* 자산규모 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>자산규모</h4>
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
              </div>
              
              {/* 레버리지 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>레버리지</h4>
                <div className={styles.filterChips}>
                  {leverageTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedLeverageTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedLeverageTypes, setSelectedLeverageTypes, type)}>{type}</button>
                  ))}
                </div>
              </div>
              
              {/* 인버스 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>인버스</h4>
                <div className={styles.filterChips}>
                  {inverseTypes.map(type => (
                    <button key={type} className={`${styles.filterChip} ${selectedInverseTypes.includes(type) ? styles.selected : ''}`}
                      onClick={() => toggleArrayItem(selectedInverseTypes, setSelectedInverseTypes, type)}>{type}</button>
                  ))}
                </div>
              </div>
              
              {/* 배당 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>배당</h4>
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
              </div>
              
              {/* 수익률 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>수익률</h4>
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
              </div>
              
              {/* 운용사 */}
              <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>운용사</h4>
                <div className={styles.filterChips}>
                  {filterOptions.issuers.map(issuer => (
                    <button key={issuer} className={`${styles.filterChip} ${selectedIssuers.includes(issuer) ? styles.selected : ''}`}
                      onClick={() => toggleIssuer(issuer)}>{issuer}</button>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        )}
        
        {searchType === 'holdings' && (
          <div className={styles.searchInterface}>
            <h3 className={styles.sectionTitle}>이 종목이 담긴 ETF를 찾아보세요</h3>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchInputIcon} size={20} />
              <input type="text" className={styles.searchInput} placeholder="예: 삼성전자, AAPL, NVDA"
                value={holdingsQuery} onChange={(e) => setHoldingsQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
          </div>
        )}
        
        {searchType !== 'ai' && (
          <div className={styles.searchButtonWrapper}>
            <Button variant="primary" size="lg" onClick={handleSearch}
              disabled={(searchType === 'holdings' && !holdingsQuery.trim())}
              className={styles.searchButton}>
              <Search size={20} />검색하기<ArrowRight size={20} />
            </Button>
            {hasSearched && <button className={styles.resetButton} onClick={resetSearch}>초기화</button>}
          </div>
        )}
      </Card>
      
      {hasSearched && searchType !== 'ai' && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>검색 결과 <span className={styles.resultsCount}>{searchResults.length}개</span></h3>
            <div className={styles.sortWrapper}>
              {searchType === 'holdings' ? (
                <select className={styles.sortSelect} value={holdingSortBy} onChange={(e) => setHoldingSortBy(e.target.value as HoldingSortOption)}>
                  <option value="weight">보유비중순</option>
                  <option value="change">등락률순</option>
                </select>
              ) : (
                <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                  <option value="marketCap">시가총액순</option>
                  <option value="dividend">배당률순</option>
                  <option value="change">등락률순</option>
                </select>
              )}
            </div>
          </div>
          {searchResults.length === 0 ? (
            <Card padding="lg" className={styles.emptyResults}>
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
                        {/* Top Row: Name + Code + Price + Change */}
                        <div className={styles.holdingsTopRow}>
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
                        
                        {/* Middle Row: Holding Weight Visualization */}
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
                          <div className={styles.metaGroup}>
                            <span className={styles.metaItem}>
                              <span className={styles.metaLabel}>시총</span>
                              <span className={styles.metaValue}>{formatLargeNumber(etf.marketCap)}</span>
                            </span>
                            <span className={styles.metaItem}>
                              <span className={styles.metaLabel}>배당</span>
                              <span className={styles.metaValue}>{etf.dividendYield.toFixed(2)}%</span>
                            </span>
                          </div>
                          <div className={styles.tagGroup}>
                            <span className={styles.primaryTag}>{etf.category}</span>
                            {etf.themes.slice(0, 2).map(theme => (
                              <span key={theme} className={styles.secondaryTag}>{theme}</span>
                            ))}
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
    </div>
  );
}
