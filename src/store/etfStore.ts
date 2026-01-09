import { create } from 'zustand';
import type { ETF, SortField, SortOrder } from '../types/etf';

export type Market = 'korea' | 'us' | 'all';

interface ETFStore {
  // 시장 선택
  selectedMarket: Market;
  
  // 검색 & 필터
  searchQuery: string;
  selectedIssuers: string[];
  selectedCategories: string[];
  selectedThemes: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  
  // 비교
  compareList: string[];
  
  // Actions
  setSelectedMarket: (market: Market) => void;
  setSearchQuery: (query: string) => void;
  setSelectedIssuers: (issuers: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedThemes: (themes: string[]) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSort: (field: SortField) => void;
  
  // Compare Actions
  addToCompare: (etfId: string) => void;
  removeFromCompare: (etfId: string) => void;
  clearCompare: () => void;
  isInCompare: (etfId: string) => boolean;
  
  // Reset
  resetFilters: () => void;
}

export const useETFStore = create<ETFStore>((set, get) => ({
  // Initial State
  selectedMarket: 'korea',
  searchQuery: '',
  selectedIssuers: [],
  selectedCategories: [],
  selectedThemes: [],
  sortField: 'marketCap',
  sortOrder: 'desc',
  compareList: [],
  
  // Setters
  setSelectedMarket: (market) => set({ 
    selectedMarket: market,
    // 시장 변경 시 필터 초기화
    selectedIssuers: [],
    selectedCategories: [],
    selectedThemes: [],
    searchQuery: '',
  }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedIssuers: (issuers) => set({ selectedIssuers: issuers }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setSelectedThemes: (themes) => set({ selectedThemes: themes }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  
  toggleSort: (field) => {
    const { sortField, sortOrder } = get();
    if (sortField === field) {
      set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortOrder: 'desc' });
    }
  },
  
  // Compare Actions
  addToCompare: (etfId) => {
    const { compareList } = get();
    if (compareList.length < 4 && !compareList.includes(etfId)) {
      set({ compareList: [...compareList, etfId] });
    }
  },
  
  removeFromCompare: (etfId) => {
    const { compareList } = get();
    set({ compareList: compareList.filter(id => id !== etfId) });
  },
  
  clearCompare: () => set({ compareList: [] }),
  
  isInCompare: (etfId) => get().compareList.includes(etfId),
  
  // Reset
  resetFilters: () => set({
    searchQuery: '',
    selectedIssuers: [],
    selectedCategories: [],
    selectedThemes: [],
    sortField: 'marketCap',
    sortOrder: 'desc',
  }),
}));

// Selector for filtered ETFs
export const filterETFs = (etfs: ETF[], store: ETFStore): ETF[] => {
  let filtered = [...etfs];
  
  // Search
  if (store.searchQuery) {
    const query = store.searchQuery.toLowerCase();
    filtered = filtered.filter(etf => 
      etf.name.toLowerCase().includes(query) ||
      etf.ticker.toLowerCase().includes(query)
    );
  }
  
  // Filter by issuer
  if (store.selectedIssuers.length > 0) {
    filtered = filtered.filter(etf => 
      store.selectedIssuers.includes(etf.issuer)
    );
  }
  
  // Filter by category
  if (store.selectedCategories.length > 0) {
    filtered = filtered.filter(etf => 
      store.selectedCategories.includes(etf.category)
    );
  }
  
  // Filter by theme
  if (store.selectedThemes.length > 0) {
    filtered = filtered.filter(etf => 
      etf.themes.some(theme => store.selectedThemes.includes(theme))
    );
  }
  
  // Sort
  filtered.sort((a, b) => {
    const aVal = a[store.sortField];
    const bVal = b[store.sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return store.sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return store.sortOrder === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });
  
  return filtered;
};
