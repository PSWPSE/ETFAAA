// 필터 옵션 및 상관관계 데이터
import type { Correlation } from '../../types/etf';
import { themes } from '../themes';

// 상관관계 데이터
export const correlations: Correlation[] = [
  { etf1: 'kr-1', etf2: 'kr-2', value: 0.98 },
  { etf1: 'kr-1', etf2: 'kr-5', value: 0.85 },
  { etf1: 'kr-5', etf2: 'us-7', value: 0.72 },
  { etf1: 'us-1', etf2: 'us-4', value: 0.88 },
  { etf1: 'kr-1', etf2: 'kr-3', value: 0.75 },
  { etf1: 'kr-5', etf2: 'kr-6', value: 0.95 },
  { etf1: 'us-1', etf2: 'us-2', value: 0.92 },
  { etf1: 'kr-7', etf2: 'kr-8', value: 0.89 },
];

// 필터 옵션
export const filterOptions = {
  issuers: ['삼성자산운용', '미래에셋자산운용', 'KB자산운용', '한화자산운용'],
  koreanIssuers: [
    '삼성자산운용',
    '미래에셋자산운용',
    'KB자산운용',
    '한화자산운용',
    '키움투자자산운용',
    'NH-Amundi자산운용',
    '신한자산운용',
    'KBSTAR자산운용',
    '타임폴리오자산운용',
    'SOL자산운용',
  ],
  usIssuers: [
    'Vanguard',
    'BlackRock',
    'State Street',
    'Invesco',
    'Charles Schwab',
    'Fidelity',
    'First Trust',
    'ProShares',
    'iShares',
    'SPDR',
  ],
  categories: ['국내주식', '해외주식', '채권', '원자재', '부동산', '통화'],
  themes: themes.map(t => t.name),
};

// 테마로 ETF 필터링
export const getETFsByThemeFilter = (themeId: string, etfList: any[]): any[] => {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return [];

  return etfList.filter(etf =>
    etf.themes.some((t: string) => t.toLowerCase().includes(theme.name.toLowerCase().slice(0, 2)))
  );
};
