// 테마 데이터 통합 export
import type { Theme } from '../../types/etf';
import { koreanThemes } from './korean-themes';
import { usThemes } from './us-themes';

// 개별 export
export { koreanThemes } from './korean-themes';
export { usThemes } from './us-themes';

// 전체 테마 배열 (레거시 호환)
export const themes: Theme[] = [...koreanThemes, ...usThemes];

// ID로 테마 찾기
export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

// 카테고리별 테마 가져오기
export const getThemesByCategory = (category: string): Theme[] => {
  return themes.filter(theme => theme.category === category);
};

// 시장별 테마 가져오기
export const getThemesByMarket = (market: 'korea' | 'us'): Theme[] => {
  if (market === 'korea') {
    return koreanThemes;
  }
  return usThemes;
};

// 평균 수익률 상위 테마
export const getTopPerformingThemes = (limit: number = 10): Theme[] => {
  return [...themes]
    .sort((a, b) => b.avgReturn - a.avgReturn)
    .slice(0, limit);
};

// 평균 수익률 하위 테마
export const getWorstPerformingThemes = (limit: number = 10): Theme[] => {
  return [...themes]
    .sort((a, b) => a.avgReturn - b.avgReturn)
    .slice(0, limit);
};

// ETF 수 상위 테마
export const getMostPopularThemes = (limit: number = 10): Theme[] => {
  return [...themes]
    .sort((a, b) => b.etfCount - a.etfCount)
    .slice(0, limit);
};

// 테마 검색
export const searchThemes = (keyword: string): Theme[] => {
  const lowerKeyword = keyword.toLowerCase();
  return themes.filter(theme =>
    theme.name.toLowerCase().includes(lowerKeyword) ||
    theme.description.toLowerCase().includes(lowerKeyword)
  );
};

// 카테고리 목록
export const getThemeCategories = (): string[] => {
  return [...new Set(themes.map(theme => theme.category))];
};
