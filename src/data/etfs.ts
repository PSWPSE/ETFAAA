import type { ETF, Theme, PriceHistory, Dividend, Returns, RiskMetrics, Holding, PhaseAnalysis, Correlation } from '../types/etf';

// 한국 ETF 데이터
export const koreanETFs: ETF[] = [
  // 시장 대표
  {
    id: 'kr-1',
    name: 'KODEX 200',
    ticker: '069500',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['시장대표', 'KOSPI200'],
    price: 35820,
    change: 450,
    changePercent: 1.27,
    volume: 2845000,
    marketCap: 8500000000000,
    expenseRatio: 0.15,
    dividendYield: 1.82,
    inceptionDate: '2002-10-14',
    nav: 35850,
    aum: 8500000000000,
    personalPension: true,
    retirementPension: true,
    holdings: [
      { ticker: '005930', name: '삼성전자', weight: 28.5 },
      { ticker: '000660', name: 'SK하이닉스', weight: 5.2 },
      { ticker: '035420', name: 'NAVER', weight: 3.8 },
      { ticker: '051910', name: 'LG화학', weight: 2.9 },
      { ticker: '005380', name: '현대차', weight: 2.1 },
    ],
  },
  {
    id: 'kr-2',
    name: 'TIGER 200',
    ticker: '102110',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['시장대표', 'KOSPI200'],
    price: 35750,
    change: 420,
    changePercent: 1.19,
    volume: 1856000,
    marketCap: 4200000000000,
    expenseRatio: 0.05,
    dividendYield: 1.85,
    inceptionDate: '2008-04-03',
    nav: 35780,
    aum: 4200000000000,
    personalPension: true,
    retirementPension: false,
    holdings: [
      { ticker: '005930', name: '삼성전자', weight: 29.1 },
      { ticker: '000660', name: 'SK하이닉스', weight: 5.4 },
      { ticker: '035420', name: 'NAVER', weight: 3.7 },
      { ticker: '051910', name: 'LG화학', weight: 3.0 },
      { ticker: '005380', name: '현대차', weight: 2.2 },
    ],
  },
  {
    id: 'kr-3',
    name: 'KODEX 코스닥150',
    ticker: '229200',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['시장대표', 'KOSDAQ150'],
    price: 12850,
    change: 380,
    changePercent: 3.05,
    volume: 1856000,
    marketCap: 1200000000000,
    expenseRatio: 0.25,
    dividendYield: 0.35,
    inceptionDate: '2015-10-30',
    nav: 12880,
    aum: 1200000000000,
    holdings: [
      { ticker: '247540', name: '에코프로비엠', weight: 8.3 },
      { ticker: '086520', name: '에코프로', weight: 7.1 },
      { ticker: '066970', name: '엘앤에프', weight: 5.9 },
      { ticker: '005930', name: '삼성전자', weight: 4.2 },
      { ticker: '035720', name: '카카오', weight: 3.8 },
    ],
  },
  {
    id: 'kr-4',
    name: 'KBSTAR 200',
    ticker: '148020',
    issuer: 'KB자산운용',
    category: '국내주식',
    themes: ['시장대표', 'KOSPI200'],
    price: 35650,
    change: 420,
    changePercent: 1.19,
    volume: 1256000,
    marketCap: 2300000000000,
    expenseRatio: 0.017,
    dividendYield: 1.85,
    inceptionDate: '2011-07-15',
    nav: 35680,
    aum: 2300000000000,
    holdings: [
      { ticker: '005930', name: '삼성전자', weight: 27.9 },
      { ticker: '000660', name: 'SK하이닉스', weight: 5.3 },
      { ticker: '035420', name: 'NAVER', weight: 3.9 },
      { ticker: '051910', name: 'LG화학', weight: 2.8 },
    ],
  },
  // 반도체
  {
    id: 'kr-5',
    name: 'KODEX 반도체',
    ticker: '091160',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['반도체', '섹터'],
    price: 42650,
    change: 1850,
    changePercent: 4.53,
    volume: 3256000,
    marketCap: 2800000000000,
    expenseRatio: 0.45,
    dividendYield: 0.45,
    inceptionDate: '2006-06-27',
    nav: 42700,
    aum: 2800000000000,
    holdings: [
      { ticker: '005930', name: '삼성전자', weight: 45.8 },
      { ticker: '000660', name: 'SK하이닉스', weight: 32.5 },
      { ticker: '042700', name: '한미반도체', weight: 4.2 },
      { ticker: '039030', name: '이오테크닉스', weight: 3.1 },
    ],
  },
  {
    id: 'kr-6',
    name: 'TIGER 반도체',
    ticker: '091230',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['반도체', '섹터'],
    price: 38520,
    change: 1620,
    changePercent: 4.39,
    volume: 2156000,
    marketCap: 1800000000000,
    expenseRatio: 0.40,
    dividendYield: 0.52,
    inceptionDate: '2006-06-27',
    nav: 38560,
    aum: 1800000000000,
    holdings: [
      { ticker: '005930', name: '삼성전자', weight: 43.2 },
      { ticker: '000660', name: 'SK하이닉스', weight: 35.1 },
      { ticker: '042700', name: '한미반도체', weight: 4.8 },
    ],
  },
  // 2차전지
  {
    id: 'kr-7',
    name: 'TIGER 2차전지테마',
    ticker: '305540',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['2차전지', '테마'],
    price: 18920,
    change: -580,
    changePercent: -2.97,
    volume: 4125000,
    marketCap: 3100000000000,
    expenseRatio: 0.50,
    dividendYield: 0.28,
    inceptionDate: '2018-09-10',
    nav: 18900,
    aum: 3100000000000,
  },
  {
    id: 'kr-8',
    name: 'KODEX 2차전지산업',
    ticker: '305720',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['2차전지', '테마'],
    price: 15250,
    change: -485,
    changePercent: -3.08,
    volume: 2856000,
    marketCap: 1500000000000,
    expenseRatio: 0.45,
    dividendYield: 0.32,
    inceptionDate: '2018-09-11',
    nav: 15220,
    aum: 1500000000000,
  },
  // 바이오/헬스케어
  {
    id: 'kr-9',
    name: 'KODEX 바이오',
    ticker: '244580',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['바이오', '헬스케어'],
    price: 78520,
    change: 2150,
    changePercent: 2.82,
    volume: 856000,
    marketCap: 650000000000,
    expenseRatio: 0.45,
    dividendYield: 0.15,
    inceptionDate: '2016-06-30',
    nav: 78600,
    aum: 650000000000,
  },
  {
    id: 'kr-10',
    name: 'TIGER 헬스케어',
    ticker: '143860',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['바이오', '헬스케어'],
    price: 28520,
    change: 850,
    changePercent: 3.07,
    volume: 623000,
    marketCap: 380000000000,
    expenseRatio: 0.40,
    dividendYield: 0.45,
    inceptionDate: '2011-07-29',
    nav: 28580,
    aum: 380000000000,
  },
  // 배당
  {
    id: 'kr-11',
    name: 'ARIRANG 고배당주',
    ticker: '161510',
    issuer: '한화자산운용',
    category: '국내주식',
    themes: ['배당', '가치주'],
    price: 12450,
    change: 85,
    changePercent: 0.69,
    volume: 856000,
    marketCap: 1200000000000,
    expenseRatio: 0.23,
    dividendYield: 5.82,
    inceptionDate: '2012-08-29',
    nav: 12470,
    aum: 1200000000000,
  },
  {
    id: 'kr-12',
    name: 'KODEX 고배당',
    ticker: '279530',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['배당', '가치주'],
    price: 11850,
    change: 95,
    changePercent: 0.81,
    volume: 523000,
    marketCap: 850000000000,
    expenseRatio: 0.25,
    dividendYield: 5.25,
    inceptionDate: '2017-08-31',
    nav: 11880,
    aum: 850000000000,
  },
  // IT/기술
  {
    id: 'kr-13',
    name: 'TIGER 200IT',
    ticker: '139260',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['IT', '섹터'],
    price: 28950,
    change: 1250,
    changePercent: 4.51,
    volume: 1856000,
    marketCap: 890000000000,
    expenseRatio: 0.40,
    dividendYield: 0.52,
    inceptionDate: '2011-01-26',
    nav: 28980,
    aum: 890000000000,
  },
  // 자동차
  {
    id: 'kr-14',
    name: 'KODEX 자동차',
    ticker: '091180',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['자동차', '섹터'],
    price: 18250,
    change: 520,
    changePercent: 2.93,
    volume: 756000,
    marketCap: 420000000000,
    expenseRatio: 0.45,
    dividendYield: 1.25,
    inceptionDate: '2006-06-27',
    nav: 18280,
    aum: 420000000000,
  },
  // 금융
  {
    id: 'kr-15',
    name: 'TIGER 은행',
    ticker: '091220',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['금융', '은행', '섹터'],
    price: 8250,
    change: 125,
    changePercent: 1.54,
    volume: 1523000,
    marketCap: 650000000000,
    expenseRatio: 0.40,
    dividendYield: 4.25,
    inceptionDate: '2006-06-27',
    nav: 8270,
    aum: 650000000000,
  },
  {
    id: 'kr-16',
    name: 'KODEX 보험',
    ticker: '140710',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['금융', '보험', '섹터'],
    price: 5850,
    change: 85,
    changePercent: 1.47,
    volume: 423000,
    marketCap: 280000000000,
    expenseRatio: 0.45,
    dividendYield: 3.85,
    inceptionDate: '2011-04-21',
    nav: 5870,
    aum: 280000000000,
  },
  // 철강/소재
  {
    id: 'kr-17',
    name: 'KODEX 철강',
    ticker: '117700',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['철강', '소재', '섹터'],
    price: 8520,
    change: 125,
    changePercent: 1.49,
    volume: 423000,
    marketCap: 180000000000,
    expenseRatio: 0.45,
    dividendYield: 3.25,
    inceptionDate: '2009-10-28',
    nav: 8540,
    aum: 180000000000,
  },
  // 에너지/화학
  {
    id: 'kr-18',
    name: 'TIGER 200에너지화학',
    ticker: '117680',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['에너지', '화학', '섹터'],
    price: 14250,
    change: -125,
    changePercent: -0.87,
    volume: 523000,
    marketCap: 380000000000,
    expenseRatio: 0.40,
    dividendYield: 2.85,
    inceptionDate: '2009-10-28',
    nav: 14220,
    aum: 380000000000,
  },
  // AI
  {
    id: 'kr-19',
    name: 'KODEX AI반도체핵심장비',
    ticker: '475720',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['AI', '반도체', '테마'],
    price: 12850,
    change: 580,
    changePercent: 4.73,
    volume: 2856000,
    marketCap: 920000000000,
    expenseRatio: 0.45,
    dividendYield: 0.18,
    inceptionDate: '2023-10-17',
    nav: 12880,
    aum: 920000000000,
    personalPension: true,
    retirementPension: true,
  },
  // ESG
  {
    id: 'kr-20',
    name: 'KODEX MSCI Korea ESG리더스',
    ticker: '289040',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['ESG', '테마'],
    price: 13250,
    change: 165,
    changePercent: 1.26,
    volume: 323000,
    marketCap: 220000000000,
    expenseRatio: 0.20,
    dividendYield: 1.85,
    inceptionDate: '2018-01-25',
    nav: 13280,
    aum: 220000000000,
  },
  // 신재생에너지
  {
    id: 'kr-21',
    name: 'KODEX K-신재생에너지액티브',
    ticker: '385510',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['신재생에너지', 'ESG', '테마'],
    price: 6250,
    change: -185,
    changePercent: -2.88,
    volume: 856000,
    marketCap: 320000000000,
    expenseRatio: 0.50,
    dividendYield: 0.25,
    inceptionDate: '2021-06-03',
    nav: 6230,
    aum: 320000000000,
  },
  // 수소
  {
    id: 'kr-22',
    name: 'TIGER 수소경제테마',
    ticker: '396520',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['수소경제', '테마'],
    price: 7520,
    change: -185,
    changePercent: -2.40,
    volume: 623000,
    marketCap: 280000000000,
    expenseRatio: 0.50,
    dividendYield: 0.15,
    inceptionDate: '2021-09-02',
    nav: 7500,
    aum: 280000000000,
  },
  // 게임
  {
    id: 'kr-23',
    name: 'TIGER 게임',
    ticker: '272670',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['게임', '미디어', '테마'],
    price: 8520,
    change: 285,
    changePercent: 3.46,
    volume: 856000,
    marketCap: 380000000000,
    expenseRatio: 0.40,
    dividendYield: 0.35,
    inceptionDate: '2017-04-14',
    nav: 8550,
    aum: 380000000000,
  },
  // 메타버스
  {
    id: 'kr-24',
    name: 'KODEX K-메타버스액티브',
    ticker: '411860',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['메타버스', '테마'],
    price: 6850,
    change: 185,
    changePercent: 2.77,
    volume: 523000,
    marketCap: 220000000000,
    expenseRatio: 0.50,
    dividendYield: 0.18,
    inceptionDate: '2022-01-11',
    nav: 6880,
    aum: 220000000000,
  },
  // 로봇
  {
    id: 'kr-25',
    name: 'TIGER 로보틱스&AI',
    ticker: '371160',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['로봇', 'AI', '테마'],
    price: 9520,
    change: 385,
    changePercent: 4.21,
    volume: 756000,
    marketCap: 420000000000,
    expenseRatio: 0.45,
    dividendYield: 0.22,
    inceptionDate: '2021-01-19',
    nav: 9550,
    aum: 420000000000,
  },
  // 레버리지
  {
    id: 'kr-26',
    name: 'KODEX 레버리지',
    ticker: '122630',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['레버리지', 'KOSPI'],
    price: 18520,
    change: 580,
    changePercent: 3.23,
    volume: 8562000,
    marketCap: 2100000000000,
    expenseRatio: 0.64,
    dividendYield: 0.0,
    inceptionDate: '2010-02-22',
    nav: 18550,
    aum: 2100000000000,
  },
  // 인버스
  {
    id: 'kr-27',
    name: 'KODEX 인버스',
    ticker: '114800',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['인버스', 'KOSPI'],
    price: 4250,
    change: -85,
    changePercent: -1.96,
    volume: 12562000,
    marketCap: 1500000000000,
    expenseRatio: 0.64,
    dividendYield: 0.0,
    inceptionDate: '2009-09-25',
    nav: 4240,
    aum: 1500000000000,
  },
  {
    id: 'kr-28',
    name: 'KODEX 200선물인버스2X',
    ticker: '252670',
    issuer: '삼성자산운용',
    category: '국내주식',
    themes: ['인버스', '레버리지', 'KOSPI'],
    price: 2350,
    change: -125,
    changePercent: -5.05,
    volume: 18562000,
    marketCap: 850000000000,
    expenseRatio: 0.64,
    dividendYield: 0.0,
    inceptionDate: '2016-09-22',
    nav: 2340,
    aum: 850000000000,
  },
  // 채권
  {
    id: 'kr-29',
    name: 'KODEX 국고채10년',
    ticker: '148070',
    issuer: '삼성자산운용',
    category: '채권',
    themes: ['국채', '장기채'],
    price: 105250,
    change: -150,
    changePercent: -0.14,
    volume: 523000,
    marketCap: 1500000000000,
    expenseRatio: 0.05,
    dividendYield: 3.25,
    inceptionDate: '2011-07-18',
    nav: 105280,
    aum: 1500000000000,
  },
  {
    id: 'kr-30',
    name: 'KODEX 단기채권PLUS',
    ticker: '214980',
    issuer: '삼성자산운용',
    category: '채권',
    themes: ['단기채', '안전자산'],
    price: 102850,
    change: 20,
    changePercent: 0.02,
    volume: 856000,
    marketCap: 3200000000000,
    expenseRatio: 0.05,
    dividendYield: 3.85,
    inceptionDate: '2015-07-23',
    nav: 102860,
    aum: 3200000000000,
  },
  // 원자재
  {
    id: 'kr-31',
    name: 'KODEX 골드선물(H)',
    ticker: '132030',
    issuer: '삼성자산운용',
    category: '원자재',
    themes: ['금', '안전자산'],
    price: 15820,
    change: 180,
    changePercent: 1.15,
    volume: 956000,
    marketCap: 720000000000,
    expenseRatio: 0.68,
    dividendYield: 0.0,
    inceptionDate: '2010-09-27',
    nav: 15850,
    aum: 720000000000,
  },
  {
    id: 'kr-32',
    name: 'KODEX WTI원유선물(H)',
    ticker: '261220',
    issuer: '삼성자산운용',
    category: '원자재',
    themes: ['원유', '원자재'],
    price: 8520,
    change: 185,
    changePercent: 2.22,
    volume: 1523000,
    marketCap: 420000000000,
    expenseRatio: 0.55,
    dividendYield: 0.0,
    inceptionDate: '2016-12-13',
    nav: 8540,
    aum: 420000000000,
  },
  // 부동산/리츠
  {
    id: 'kr-33',
    name: 'TIGER 리츠부동산인프라',
    ticker: '329200',
    issuer: '미래에셋자산운용',
    category: '부동산',
    themes: ['리츠', '배당', '부동산'],
    price: 5250,
    change: 45,
    changePercent: 0.86,
    volume: 2356000,
    marketCap: 420000000000,
    expenseRatio: 0.29,
    dividendYield: 6.52,
    inceptionDate: '2019-07-19',
    nav: 5270,
    aum: 420000000000,
  },
  // 통화
  {
    id: 'kr-34',
    name: 'KODEX 미국달러선물',
    ticker: '261240',
    issuer: '삼성자산운용',
    category: '통화',
    themes: ['달러', '환율'],
    price: 11250,
    change: 85,
    changePercent: 0.76,
    volume: 856000,
    marketCap: 680000000000,
    expenseRatio: 0.25,
    dividendYield: 0.0,
    inceptionDate: '2016-12-13',
    nav: 11260,
    aum: 680000000000,
  },
  // 커버드콜
  {
    id: 'kr-35',
    name: 'TIGER 200커버드콜ATM',
    ticker: '289480',
    issuer: '미래에셋자산운용',
    category: '국내주식',
    themes: ['커버드콜', '배당'],
    price: 11250,
    change: 85,
    changePercent: 0.76,
    volume: 523000,
    marketCap: 320000000000,
    expenseRatio: 0.38,
    dividendYield: 8.25,
    inceptionDate: '2018-01-30',
    nav: 11270,
    aum: 320000000000,
  },
];

// 미국 ETF 데이터
export const usETFs: ETF[] = [
  // S&P 500
  {
    id: 'us-1',
    name: 'TIGER 미국S&P500',
    ticker: '360750',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['S&P500', '대형주'],
    price: 17250,
    change: -120,
    changePercent: -0.69,
    volume: 1523000,
    marketCap: 5200000000000,
    expenseRatio: 0.07,
    dividendYield: 1.35,
    inceptionDate: '2020-08-07',
    nav: 17230,
    aum: 5200000000000,
  },
  {
    id: 'us-2',
    name: 'KODEX 미국S&P500TR',
    ticker: '360200',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['S&P500', '배당재투자'],
    price: 15250,
    change: 175,
    changePercent: 1.16,
    volume: 1523000,
    marketCap: 1800000000000,
    expenseRatio: 0.05,
    dividendYield: 0.0,
    inceptionDate: '2020-08-03',
    nav: 15280,
    aum: 1800000000000,
  },
  {
    id: 'us-3',
    name: 'KBSTAR 미국S&P500',
    ticker: '379800',
    issuer: 'KB자산운용',
    category: '해외주식',
    themes: ['S&P500', '대형주'],
    price: 16850,
    change: 195,
    changePercent: 1.17,
    volume: 1256000,
    marketCap: 1100000000000,
    expenseRatio: 0.07,
    dividendYield: 1.28,
    inceptionDate: '2021-04-09',
    nav: 16880,
    aum: 1100000000000,
  },
  // 나스닥
  {
    id: 'us-4',
    name: 'KODEX 미국나스닥100',
    ticker: '379810',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['나스닥100', '기술주'],
    price: 21350,
    change: 280,
    changePercent: 1.33,
    volume: 2156000,
    marketCap: 4500000000000,
    expenseRatio: 0.07,
    dividendYield: 0.65,
    inceptionDate: '2021-04-09',
    nav: 21380,
    aum: 4500000000000,
  },
  {
    id: 'us-5',
    name: 'TIGER 미국나스닥100',
    ticker: '133690',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['나스닥100', '기술주'],
    price: 98520,
    change: 1250,
    changePercent: 1.29,
    volume: 856000,
    marketCap: 3200000000000,
    expenseRatio: 0.07,
    dividendYield: 0.58,
    inceptionDate: '2010-10-18',
    nav: 98600,
    aum: 3200000000000,
  },
  {
    id: 'us-6',
    name: 'KBSTAR 미국나스닥100',
    ticker: '368590',
    issuer: 'KB자산운용',
    category: '해외주식',
    themes: ['나스닥100', '기술주'],
    price: 16520,
    change: 220,
    changePercent: 1.35,
    volume: 1256000,
    marketCap: 1200000000000,
    expenseRatio: 0.07,
    dividendYield: 0.58,
    inceptionDate: '2020-11-06',
    nav: 16550,
    aum: 1200000000000,
  },
  // 반도체
  {
    id: 'us-7',
    name: 'TIGER 미국필라델피아반도체나스닥',
    ticker: '381180',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['반도체', 'AI'],
    price: 15680,
    change: 920,
    changePercent: 6.23,
    volume: 5623000,
    marketCap: 1800000000000,
    expenseRatio: 0.49,
    dividendYield: 0.12,
    inceptionDate: '2021-04-29',
    nav: 15700,
    aum: 1800000000000,
  },
  {
    id: 'us-8',
    name: 'KODEX 미국반도체MV',
    ticker: '449170',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['반도체', 'AI'],
    price: 14250,
    change: 720,
    changePercent: 5.32,
    volume: 3256000,
    marketCap: 1200000000000,
    expenseRatio: 0.45,
    dividendYield: 0.18,
    inceptionDate: '2023-04-11',
    nav: 14280,
    aum: 1200000000000,
  },
  // 빅테크
  {
    id: 'us-9',
    name: 'TIGER 미국테크TOP10 INDXX',
    ticker: '381180',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['빅테크', '기술주'],
    price: 19250,
    change: 450,
    changePercent: 2.39,
    volume: 3256000,
    marketCap: 2500000000000,
    expenseRatio: 0.49,
    dividendYield: 0.35,
    inceptionDate: '2021-04-29',
    nav: 19280,
    aum: 2500000000000,
  },
  {
    id: 'us-10',
    name: 'KODEX 미국빅테크10(H)',
    ticker: '409820',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['빅테크', '환헤지'],
    price: 12850,
    change: 385,
    changePercent: 3.09,
    volume: 2156000,
    marketCap: 920000000000,
    expenseRatio: 0.30,
    dividendYield: 0.25,
    inceptionDate: '2022-05-03',
    nav: 12880,
    aum: 920000000000,
  },
  // AI
  {
    id: 'us-11',
    name: 'TIGER 미국AI빅테크10',
    ticker: '473040',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['AI', '빅테크'],
    price: 13520,
    change: 580,
    changePercent: 4.48,
    volume: 2856000,
    marketCap: 1500000000000,
    expenseRatio: 0.45,
    dividendYield: 0.15,
    inceptionDate: '2023-09-26',
    nav: 13550,
    aum: 1500000000000,
  },
  // 배당
  {
    id: 'us-12',
    name: 'TIGER 미국배당다우존스',
    ticker: '458730',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['배당', '다우존스'],
    price: 11520,
    change: 95,
    changePercent: 0.83,
    volume: 1523000,
    marketCap: 980000000000,
    expenseRatio: 0.15,
    dividendYield: 3.85,
    inceptionDate: '2023-06-20',
    nav: 11540,
    aum: 980000000000,
  },
  {
    id: 'us-13',
    name: 'KODEX 미국배당프리미엄액티브',
    ticker: '441640',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['배당', '커버드콜'],
    price: 10250,
    change: 85,
    changePercent: 0.84,
    volume: 856000,
    marketCap: 620000000000,
    expenseRatio: 0.35,
    dividendYield: 8.52,
    inceptionDate: '2023-02-14',
    nav: 10270,
    aum: 620000000000,
  },
  // 커버드콜
  {
    id: 'us-14',
    name: 'TIGER 미국나스닥100커버드콜(합성)',
    ticker: '441680',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['커버드콜', '나스닥100', '배당'],
    price: 10850,
    change: 120,
    changePercent: 1.12,
    volume: 2156000,
    marketCap: 1500000000000,
    expenseRatio: 0.37,
    dividendYield: 12.5,
    inceptionDate: '2023-02-21',
    nav: 10870,
    aum: 1500000000000,
  },
  {
    id: 'us-15',
    name: 'KODEX 미국S&P500배당귀족커버드콜(합성H)',
    ticker: '475090',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['커버드콜', 'S&P500', '배당'],
    price: 9850,
    change: 75,
    changePercent: 0.77,
    volume: 623000,
    marketCap: 380000000000,
    expenseRatio: 0.35,
    dividendYield: 10.25,
    inceptionDate: '2023-10-10',
    nav: 9870,
    aum: 380000000000,
  },
  // 바이오/헬스케어
  {
    id: 'us-16',
    name: 'TIGER 미국나스닥바이오',
    ticker: '203780',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['바이오', '헬스케어'],
    price: 8520,
    change: 185,
    changePercent: 2.22,
    volume: 623000,
    marketCap: 280000000000,
    expenseRatio: 0.49,
    dividendYield: 0.0,
    inceptionDate: '2015-05-06',
    nav: 8540,
    aum: 280000000000,
  },
  {
    id: 'us-17',
    name: 'KODEX 미국헬스케어',
    ticker: '453810',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['헬스케어', '섹터'],
    price: 11250,
    change: 185,
    changePercent: 1.67,
    volume: 423000,
    marketCap: 220000000000,
    expenseRatio: 0.35,
    dividendYield: 1.25,
    inceptionDate: '2023-05-16',
    nav: 11280,
    aum: 220000000000,
  },
  // 클린에너지
  {
    id: 'us-18',
    name: 'TIGER 미국클린에너지INDXX',
    ticker: '381170',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['클린에너지', 'ESG'],
    price: 5850,
    change: -125,
    changePercent: -2.09,
    volume: 523000,
    marketCap: 180000000000,
    expenseRatio: 0.49,
    dividendYield: 0.85,
    inceptionDate: '2021-04-29',
    nav: 5820,
    aum: 180000000000,
  },
  // 다우존스
  {
    id: 'us-19',
    name: 'TIGER 미국다우존스30',
    ticker: '245340',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['다우존스', '대형주'],
    price: 48520,
    change: 520,
    changePercent: 1.08,
    volume: 323000,
    marketCap: 280000000000,
    expenseRatio: 0.35,
    dividendYield: 1.85,
    inceptionDate: '2016-06-14',
    nav: 48580,
    aum: 280000000000,
  },
  // 리츠
  {
    id: 'us-20',
    name: 'TIGER 미국MSCI리츠(합성 H)',
    ticker: '182480',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['리츠', '부동산', '배당'],
    price: 8250,
    change: 65,
    changePercent: 0.79,
    volume: 423000,
    marketCap: 180000000000,
    expenseRatio: 0.25,
    dividendYield: 4.25,
    inceptionDate: '2013-06-18',
    nav: 8270,
    aum: 180000000000,
  },
  // 중국
  {
    id: 'us-21',
    name: 'TIGER 차이나CSI300',
    ticker: '192090',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['중국', 'CSI300'],
    price: 9850,
    change: -285,
    changePercent: -2.81,
    volume: 1256000,
    marketCap: 580000000000,
    expenseRatio: 0.35,
    dividendYield: 1.85,
    inceptionDate: '2014-05-27',
    nav: 9820,
    aum: 580000000000,
  },
  {
    id: 'us-22',
    name: 'TIGER 차이나전기차SOLACTIVE',
    ticker: '371460',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['중국', '전기차', '2차전지'],
    price: 8520,
    change: -320,
    changePercent: -3.62,
    volume: 2856000,
    marketCap: 980000000000,
    expenseRatio: 0.49,
    dividendYield: 0.85,
    inceptionDate: '2021-01-21',
    nav: 8500,
    aum: 980000000000,
  },
  // 일본
  {
    id: 'us-23',
    name: 'TIGER 일본니케이225',
    ticker: '241180',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['일본', '니케이225'],
    price: 18520,
    change: 285,
    changePercent: 1.56,
    volume: 956000,
    marketCap: 720000000000,
    expenseRatio: 0.20,
    dividendYield: 1.52,
    inceptionDate: '2016-04-07',
    nav: 18550,
    aum: 720000000000,
  },
  {
    id: 'us-24',
    name: 'KODEX 일본TOPIX100',
    ticker: '101280',
    issuer: '삼성자산운용',
    category: '해외주식',
    themes: ['일본', 'TOPIX'],
    price: 12850,
    change: 185,
    changePercent: 1.46,
    volume: 323000,
    marketCap: 220000000000,
    expenseRatio: 0.25,
    dividendYield: 1.85,
    inceptionDate: '2007-03-26',
    nav: 12880,
    aum: 220000000000,
  },
  // 유럽
  {
    id: 'us-25',
    name: 'TIGER 유로스탁스50(합성 H)',
    ticker: '195930',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['유럽', '유로스탁스50'],
    price: 12850,
    change: 165,
    changePercent: 1.30,
    volume: 323000,
    marketCap: 220000000000,
    expenseRatio: 0.25,
    dividendYield: 2.85,
    inceptionDate: '2014-08-25',
    nav: 12880,
    aum: 220000000000,
  },
  // 인도
  {
    id: 'us-26',
    name: 'TIGER 인도니프티50',
    ticker: '453080',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['인도', 'NIFTY50'],
    price: 14250,
    change: 285,
    changePercent: 2.04,
    volume: 856000,
    marketCap: 520000000000,
    expenseRatio: 0.35,
    dividendYield: 0.85,
    inceptionDate: '2023-05-09',
    nav: 14280,
    aum: 520000000000,
  },
  // 베트남
  {
    id: 'us-27',
    name: 'TIGER 베트남VN30',
    ticker: '245710',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['베트남', 'VN30'],
    price: 8520,
    change: -125,
    changePercent: -1.45,
    volume: 623000,
    marketCap: 380000000000,
    expenseRatio: 0.50,
    dividendYield: 1.25,
    inceptionDate: '2016-06-30',
    nav: 8500,
    aum: 380000000000,
  },
  // 미국 채권
  {
    id: 'us-28',
    name: 'TIGER 미국채10년선물',
    ticker: '305080',
    issuer: '미래에셋자산운용',
    category: '채권',
    themes: ['미국채', '장기채'],
    price: 8250,
    change: -45,
    changePercent: -0.54,
    volume: 856000,
    marketCap: 420000000000,
    expenseRatio: 0.15,
    dividendYield: 0.0,
    inceptionDate: '2018-09-03',
    nav: 8230,
    aum: 420000000000,
  },
  {
    id: 'us-29',
    name: 'KODEX 미국채울트라30년선물(H)',
    ticker: '304660',
    issuer: '삼성자산운용',
    category: '채권',
    themes: ['미국채', '초장기채'],
    price: 6850,
    change: -85,
    changePercent: -1.23,
    volume: 1523000,
    marketCap: 580000000000,
    expenseRatio: 0.25,
    dividendYield: 0.0,
    inceptionDate: '2018-08-30',
    nav: 6820,
    aum: 580000000000,
  },
  // 레버리지
  {
    id: 'us-30',
    name: 'TIGER 미국나스닥100레버리지(합성)',
    ticker: '409810',
    issuer: '미래에셋자산운용',
    category: '해외주식',
    themes: ['레버리지', '나스닥100'],
    price: 18520,
    change: 850,
    changePercent: 4.81,
    volume: 3256000,
    marketCap: 850000000000,
    expenseRatio: 0.60,
    dividendYield: 0.0,
    inceptionDate: '2022-05-02',
    nav: 18580,
    aum: 850000000000,
  },
];

// 전체 ETF 배열 (레거시 호환)
export const etfs: ETF[] = [...koreanETFs, ...usETFs];

// 한국 ETF 테마 (ETFCheck KRX 기반)
export const koreanThemes: Theme[] = [
  // 투자국가/지역/대표지수
  { id: 'kr-kospi200', name: 'KOSPI200', description: 'KOSPI200 지수 추종', etfCount: 15, avgReturn: 12.5, category: 'index' },
  { id: 'kr-kosdaq150', name: 'KOSDAQ150', description: 'KOSDAQ150 지수 추종', etfCount: 8, avgReturn: 18.2, category: 'index' },
  { id: 'kr-krx300', name: 'KRX300', description: 'KRX300 지수 추종', etfCount: 5, avgReturn: 14.5, category: 'index' },
  // 산업/업종/섹터
  { id: 'kr-semiconductor', name: '반도체', description: '반도체 관련 기업에 투자', etfCount: 12, avgReturn: 35.2, category: 'sector' },
  { id: 'kr-battery', name: '2차전지', description: '배터리 및 전기차 관련 기업', etfCount: 10, avgReturn: -12.5, category: 'sector' },
  { id: 'kr-bio', name: '바이오/헬스케어', description: '바이오 및 헬스케어 기업', etfCount: 8, avgReturn: 8.5, category: 'sector' },
  { id: 'kr-it', name: 'IT/기술', description: 'IT 및 기술 기업', etfCount: 6, avgReturn: 22.5, category: 'sector' },
  { id: 'kr-auto', name: '자동차', description: '자동차 관련 기업', etfCount: 5, avgReturn: 15.8, category: 'sector' },
  { id: 'kr-finance', name: '금융', description: '은행, 보험 등 금융 기업', etfCount: 8, avgReturn: 8.2, category: 'sector' },
  { id: 'kr-steel', name: '철강/소재', description: '철강 및 소재 기업', etfCount: 4, avgReturn: 5.5, category: 'sector' },
  { id: 'kr-energy', name: '에너지/화학', description: '에너지 및 화학 기업', etfCount: 5, avgReturn: -2.5, category: 'sector' },
  { id: 'kr-ai', name: 'AI/인공지능', description: 'AI 관련 기업에 투자', etfCount: 15, avgReturn: 45.2, category: 'sector' },
  { id: 'kr-esg', name: 'ESG', description: '환경·사회·지배구조 우수 기업', etfCount: 10, avgReturn: 8.5, category: 'sector' },
  { id: 'kr-renewable', name: '신재생에너지', description: '신재생에너지 관련 기업', etfCount: 6, avgReturn: -15.2, category: 'sector' },
  { id: 'kr-hydrogen', name: '수소경제', description: '수소 관련 기업', etfCount: 4, avgReturn: -18.5, category: 'sector' },
  { id: 'kr-game', name: '게임/미디어', description: '게임 및 미디어 기업', etfCount: 5, avgReturn: 12.5, category: 'sector' },
  { id: 'kr-metaverse', name: '메타버스', description: '메타버스 관련 기업', etfCount: 4, avgReturn: 5.2, category: 'sector' },
  { id: 'kr-robot', name: '로봇/자동화', description: '로봇 및 자동화 기업', etfCount: 5, avgReturn: 22.5, category: 'sector' },
  // 투자전략
  { id: 'kr-dividend', name: '배당주', description: '고배당 기업에 투자', etfCount: 12, avgReturn: 8.5, category: 'strategy' },
  { id: 'kr-coveredcall', name: '커버드콜', description: '커버드콜 전략', etfCount: 6, avgReturn: 5.2, category: 'strategy' },
  { id: 'kr-growth', name: '성장주', description: '고성장 기업에 투자', etfCount: 8, avgReturn: 18.5, category: 'strategy' },
  { id: 'kr-value', name: '가치주', description: '저평가 우량 기업', etfCount: 6, avgReturn: 12.2, category: 'strategy' },
  // 투자자산
  { id: 'kr-bond', name: '채권', description: '국채 및 회사채', etfCount: 20, avgReturn: 2.5, category: 'asset' },
  { id: 'kr-gold', name: '금', description: '금 가격 추종', etfCount: 4, avgReturn: 15.2, category: 'asset' },
  { id: 'kr-oil', name: '원유', description: '원유 가격 추종', etfCount: 3, avgReturn: 8.5, category: 'asset' },
  { id: 'kr-reit', name: '리츠/부동산', description: '부동산 투자', etfCount: 6, avgReturn: 2.5, category: 'asset' },
  { id: 'kr-currency', name: '통화', description: '환율 추종', etfCount: 4, avgReturn: 5.2, category: 'asset' },
  // 단일종목
  { id: 'kr-samsung', name: '삼성전자', description: '삼성전자 관련', etfCount: 3, avgReturn: 8.5, category: 'single' },
  { id: 'kr-skhynix', name: 'SK하이닉스', description: 'SK하이닉스 관련', etfCount: 2, avgReturn: 35.2, category: 'single' },
  // 레버리지/인버스
  { id: 'kr-leverage', name: '레버리지', description: '2배 수익 추구', etfCount: 8, avgReturn: 25.5, category: 'leverage' },
  { id: 'kr-inverse', name: '인버스', description: '하락장 수익 추구', etfCount: 10, avgReturn: -15.2, category: 'leverage' },
];

// 미국/글로벌 ETF 테마 (ETFCheck Global 기반)
export const usThemes: Theme[] = [
  // 투자국가/지역/대표지수
  { id: 'us-sp500', name: 'S&P500', description: '미국 대표 500개 기업', etfCount: 15, avgReturn: 22.5, category: 'index' },
  { id: 'us-nasdaq100', name: '나스닥100', description: '나스닥 상위 100개 기업', etfCount: 12, avgReturn: 28.5, category: 'index' },
  { id: 'us-dow', name: '다우존스30', description: '미국 대표 30개 기업', etfCount: 5, avgReturn: 15.2, category: 'index' },
  { id: 'us-china', name: '중국', description: '중국 시장 투자', etfCount: 10, avgReturn: -12.5, category: 'index' },
  { id: 'us-japan', name: '일본', description: '일본 시장 투자', etfCount: 6, avgReturn: 18.5, category: 'index' },
  { id: 'us-europe', name: '유럽', description: '유럽 시장 투자', etfCount: 5, avgReturn: 12.5, category: 'index' },
  { id: 'us-india', name: '인도', description: '인도 시장 투자', etfCount: 4, avgReturn: 25.5, category: 'index' },
  { id: 'us-vietnam', name: '베트남', description: '베트남 시장 투자', etfCount: 3, avgReturn: -5.2, category: 'index' },
  // 산업/업종/섹터
  { id: 'us-semiconductor', name: '미국반도체', description: '미국 반도체 기업', etfCount: 8, avgReturn: 65.2, category: 'sector' },
  { id: 'us-bigtech', name: '빅테크', description: '미국 대형 기술주', etfCount: 10, avgReturn: 35.5, category: 'sector' },
  { id: 'us-ai', name: '미국AI', description: '미국 AI 관련 기업', etfCount: 12, avgReturn: 55.2, category: 'sector' },
  { id: 'us-bio', name: '미국바이오', description: '미국 바이오/헬스케어', etfCount: 6, avgReturn: 8.5, category: 'sector' },
  { id: 'us-healthcare', name: '미국헬스케어', description: '미국 헬스케어 섹터', etfCount: 5, avgReturn: 12.5, category: 'sector' },
  { id: 'us-clean', name: '클린에너지', description: '미국 클린에너지', etfCount: 4, avgReturn: -18.5, category: 'sector' },
  // 투자전략
  { id: 'us-dividend', name: '미국배당', description: '미국 고배당주', etfCount: 10, avgReturn: 12.5, category: 'strategy' },
  { id: 'us-coveredcall', name: '미국커버드콜', description: '미국 커버드콜 전략', etfCount: 8, avgReturn: 8.5, category: 'strategy' },
  // 투자자산
  { id: 'us-bond', name: '미국채권', description: '미국 국채 투자', etfCount: 8, avgReturn: -2.5, category: 'asset' },
  { id: 'us-reit', name: '미국리츠', description: '미국 부동산 투자', etfCount: 5, avgReturn: 5.2, category: 'asset' },
  // 단일종목
  { id: 'us-tesla', name: '테슬라', description: '테슬라 관련', etfCount: 3, avgReturn: 25.5, category: 'single' },
  { id: 'us-nvidia', name: '엔비디아', description: '엔비디아 관련', etfCount: 2, avgReturn: 85.2, category: 'single' },
  // 레버리지/인버스
  { id: 'us-leverage', name: '미국레버리지', description: '미국 지수 레버리지', etfCount: 6, avgReturn: 45.2, category: 'leverage' },
  { id: 'us-inverse', name: '미국인버스', description: '미국 지수 인버스', etfCount: 4, avgReturn: -22.5, category: 'leverage' },
];

// 전체 테마 (레거시 호환)
export const themes: Theme[] = [...koreanThemes, ...usThemes];

// 가격 히스토리 생성 함수
export const generatePriceHistory = (basePrice: number, days: number = 365): PriceHistory[] => {
  const history: PriceHistory[] = [];
  let price = basePrice * 0.85;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const volatility = 0.02;
    const change = (Math.random() - 0.48) * volatility;
    price = price * (1 + change);
    
    const high = price * (1 + Math.random() * 0.01);
    const low = price * (1 - Math.random() * 0.01);
    const open = low + Math.random() * (high - low);
    
    history.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(price),
      volume: Math.floor(Math.random() * 3000000) + 500000,
    });
  }
  
  return history;
};

// ETF별 수익률
export const getReturns = (etfId: string): Returns => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) {
    return { day1: 0, week1: 0, month1: 0, month3: 0, month6: 0, year1: 0, ytd: 0 };
  }
  
  return { 
    day1: etf.changePercent, 
    week1: etf.changePercent * 3, 
    month1: etf.changePercent * 8, 
    month3: etf.changePercent * 15, 
    month6: etf.changePercent * 25, 
    year1: etf.changePercent * 40, 
    ytd: etf.changePercent * 35 
  };
};

// ETF별 구성종목
export const getHoldings = (etfId: string): Holding[] => {
  const holdingsMap: Record<string, Holding[]> = {
    'kr-1': [
      { name: '삼성전자', ticker: '005930', weight: 28.5, sector: '전자' },
      { name: 'SK하이닉스', ticker: '000660', weight: 8.2, sector: '반도체' },
      { name: 'LG에너지솔루션', ticker: '373220', weight: 5.5, sector: '2차전지' },
      { name: '삼성바이오로직스', ticker: '207940', weight: 4.2, sector: '바이오' },
      { name: '현대차', ticker: '005380', weight: 3.8, sector: '자동차' },
    ],
    'us-7': [
      { name: 'NVIDIA', ticker: 'NVDA', weight: 22.5, sector: '반도체' },
      { name: 'ASML', ticker: 'ASML', weight: 15.8, sector: '반도체장비' },
      { name: 'AMD', ticker: 'AMD', weight: 10.2, sector: '반도체' },
      { name: 'Broadcom', ticker: 'AVGO', weight: 8.5, sector: '반도체' },
      { name: 'TSMC', ticker: 'TSM', weight: 7.2, sector: '반도체' },
    ],
  };
  
  return holdingsMap[etfId] || [
    { name: '기타 종목 1', ticker: '000001', weight: 15.0, sector: '기타' },
    { name: '기타 종목 2', ticker: '000002', weight: 12.0, sector: '기타' },
    { name: '기타 종목 3', ticker: '000003', weight: 10.0, sector: '기타' },
  ];
};

// 배당 정보
export const getDividends = (etfId: string): Dividend[] => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf || etf.dividendYield === 0) return [];
  
  const dividends: Dividend[] = [];
  const baseAmount = etf.price * (etf.dividendYield / 100 / 4);
  
  for (let i = 0; i < 8; i++) {
    const exDate = new Date();
    exDate.setMonth(exDate.getMonth() - (i * 3));
    exDate.setDate(15);
    
    const payDate = new Date(exDate);
    payDate.setDate(payDate.getDate() + 15);
    
    dividends.push({
      exDate: exDate.toISOString().split('T')[0],
      payDate: payDate.toISOString().split('T')[0],
      amount: Math.round(baseAmount * (0.9 + Math.random() * 0.2)),
      frequency: 'quarterly',
    });
  }
  
  return dividends;
};

// 위험 지표
export const getRiskMetrics = (etfId: string): RiskMetrics => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return { volatility: 20.0, sharpeRatio: 0.75, beta: 1.0, maxDrawdown: -30.0 };
  
  const volatility = Math.abs(etf.changePercent) * 8 + 10;
  const sharpeRatio = etf.changePercent > 0 ? 0.5 + etf.changePercent / 10 : -0.2;
  
  return { 
    volatility, 
    sharpeRatio: Math.round(sharpeRatio * 100) / 100, 
    beta: 1.0 + (Math.random() - 0.5) * 0.5, 
    maxDrawdown: -20 - Math.random() * 30 
  };
};

// 국면 분석
export const getPhaseAnalysis = (etfId: string): PhaseAnalysis => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return { rsi: 50, macd: 0, signal: 0, histogram: 0, status: 'neutral', deviation: 0 };
  
  const rsi = 50 + etf.changePercent * 5;
  const status = rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral';
  
  return { 
    rsi: Math.max(0, Math.min(100, rsi)), 
    macd: etf.changePercent * 100, 
    signal: etf.changePercent * 80, 
    histogram: etf.changePercent * 20, 
    status: status as 'overbought' | 'neutral' | 'oversold', 
    deviation: etf.changePercent * 2 
  };
};

// 상관관계 데이터
export const correlations: Correlation[] = [
  { etf1: 'kr-1', etf2: 'kr-2', value: 0.98 },
  { etf1: 'kr-1', etf2: 'kr-5', value: 0.85 },
  { etf1: 'kr-5', etf2: 'us-7', value: 0.72 },
  { etf1: 'us-1', etf2: 'us-4', value: 0.88 },
];

// 필터 옵션
export const filterOptions = {
  issuers: ['삼성자산운용', '미래에셋자산운용', 'KB자산운용', '한화자산운용'],
  koreanIssuers: ['삼성자산운용', '미래에셋자산운용', 'KB자산운용', '한화자산운용', '키움투자자산운용', 'NH-Amundi자산운용', '신한자산운용', 'KBSTAR자산운용', '타임폴리오자산운용', 'SOL자산운용'],
  usIssuers: ['Vanguard', 'BlackRock', 'State Street', 'Invesco', 'Charles Schwab', 'Fidelity', 'First Trust', 'ProShares', 'iShares', 'SPDR'],
  categories: ['국내주식', '해외주식', '채권', '원자재', '부동산', '통화'],
  themes: themes.map(t => t.name),
};

// ID로 ETF 찾기
export const getETFById = (id: string): ETF | undefined => {
  return etfs.find(etf => etf.id === id);
};

// 시장별 ETF 가져오기
export const getETFsByMarket = (market: 'korea' | 'us'): ETF[] => {
  return market === 'korea' ? koreanETFs : usETFs;
};

// 시장별 테마 가져오기
export const getThemesByMarket = (market: 'korea' | 'us'): Theme[] => {
  return market === 'korea' ? koreanThemes : usThemes;
};

// 테마로 ETF 필터링
export const getETFsByTheme = (themeId: string, market?: 'korea' | 'us'): ETF[] => {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return [];
  
  const etfList = market ? getETFsByMarket(market) : etfs;
  return etfList.filter(etf => 
    etf.themes.some(t => t.toLowerCase().includes(theme.name.toLowerCase().slice(0, 2)))
  );
};

// 확장된 ETF 정보 (52주 고가/저가 등)
export const getExtendedETFInfo = (etf: ETF) => {
  // 52주 고가/저가 생성 (현재가 기준 ±30% 범위)
  const high52w = Math.round(etf.price * (1 + 0.15 + Math.random() * 0.15));
  const low52w = Math.round(etf.price * (1 - 0.15 - Math.random() * 0.15));
  
  // 당일 고가/저가
  const dayHigh = Math.round(etf.price * (1 + Math.random() * 0.03));
  const dayLow = Math.round(etf.price * (1 - Math.random() * 0.03));
  
  // 전일 종가
  const prevClose = etf.price - etf.change;
  
  // 거래대금 (거래량 * 가격)
  const turnover = etf.volume * etf.price;
  
  // 추적지수 결정
  const trackingIndexMap: Record<string, string> = {
    'KOSPI200': 'KOSPI 200',
    'KOSDAQ150': 'KOSDAQ 150',
    'KRX300': 'KRX 300',
    '반도체': 'KRX 반도체',
    'AI': 'KRX AI',
    'S&P500': 'S&P 500',
    'NASDAQ': 'NASDAQ 100',
    '배당': 'Dow Jones Select Dividend',
  };
  
  let trackingIndex = '기초지수';
  for (const [key, value] of Object.entries(trackingIndexMap)) {
    if (etf.themes.some(t => t.includes(key)) || etf.name.includes(key)) {
      trackingIndex = value;
      break;
    }
  }
  
  // 추적오차 (0.01% ~ 0.5%)
  const trackingError = 0.01 + Math.random() * 0.49;
  
  // 레버리지 배수
  let leverage = 1;
  if (etf.name.includes('2X') || etf.name.includes('레버리지')) leverage = 2;
  if (etf.name.includes('3X')) leverage = 3;
  if (etf.name.includes('인버스')) leverage = -1;
  if (etf.name.includes('인버스2X')) leverage = -2;
  
  // 상장거래소
  const listingExchange = etf.id.startsWith('kr') ? 'KRX' : 'NYSE/NASDAQ';
  
  return {
    ...etf,
    high52w,
    low52w,
    dayHigh,
    dayLow,
    prevClose,
    turnover,
    trackingIndex,
    trackingError,
    leverage: leverage !== 1 ? leverage : undefined,
    listingExchange,
  };
};

// 유사 ETF 찾기
export const getSimilarETFs = (etfId: string, limit: number = 5): ETF[] => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  // 같은 카테고리 또는 테마의 ETF 찾기
  const similar = etfs
    .filter(e => 
      e.id !== etfId && 
      (e.category === etf.category || 
       e.themes.some(t => etf.themes.includes(t)))
    )
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
  
  return similar;
};

// 상관관계 ETF 가져오기 (양의 상관관계, 음의 상관관계)
export const getCorrelatedETFs = (etfId: string, limit: number = 5) => {
  const etf = getETFById(etfId);
  if (!etf) return { positive: [], negative: [] };
  
  // 모의 상관관계 계산
  // 실제로는 가격 데이터를 기반으로 상관계수를 계산해야 함
  const allOtherETFs = etfs.filter(e => e.id !== etfId);
  
  const correlations = allOtherETFs.map(other => {
    // 같은 카테고리/테마면 양의 상관관계 (0.7~0.95)
    const sameCategory = other.category === etf.category;
    const commonThemes = other.themes.filter(t => etf.themes.includes(t)).length;
    
    let correlation: number;
    
    if (sameCategory && commonThemes > 0) {
      // 매우 유사: 높은 양의 상관관계
      correlation = 0.85 + Math.random() * 0.1;
    } else if (sameCategory || commonThemes > 0) {
      // 약간 유사: 중간 양의 상관관계
      correlation = 0.6 + Math.random() * 0.2;
    } else if (
      // 반대 성격 (인버스, 레버리지 등)
      (etf.name.includes('인버스') && !other.name.includes('인버스')) ||
      (!etf.name.includes('인버스') && other.name.includes('인버스')) ||
      (etf.category === '국내주식' && other.category === '채권') ||
      (etf.category === '채권' && other.category === '국내주식')
    ) {
      // 음의 상관관계
      correlation = -0.5 - Math.random() * 0.4;
    } else {
      // 무관: 약한 상관관계
      correlation = -0.2 + Math.random() * 0.4;
    }
    
    return {
      etf: other,
      correlation: Math.max(-1, Math.min(1, correlation)), // -1 ~ 1 범위로 제한
    };
  });
  
  // 양의 상관관계 (높은 순)
  const positive = correlations
    .filter(c => c.correlation > 0.5)
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit)
    .map(c => ({ ...c.etf, correlation: c.correlation }));
  
  // 음의 상관관계 (낮은 순)
  const negative = correlations
    .filter(c => c.correlation < -0.3)
    .sort((a, b) => a.correlation - b.correlation)
    .slice(0, limit)
    .map(c => ({ ...c.etf, correlation: c.correlation }));
  
  return { positive, negative };
};

// 섹터별 비중 (구성종목 탭용)
export const getSectorAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  // 카테고리에 따른 섹터 비중 생성
  const sectorTemplates: Record<string, { name: string; weight: number }[]> = {
    '반도체': [
      { name: '반도체', weight: 45 },
      { name: '전자장비', weight: 25 },
      { name: 'IT서비스', weight: 15 },
      { name: '소프트웨어', weight: 10 },
      { name: '기타', weight: 5 },
    ],
    '국내주식': [
      { name: '금융', weight: 20 },
      { name: '제조업', weight: 25 },
      { name: 'IT', weight: 20 },
      { name: '에너지', weight: 15 },
      { name: '소비재', weight: 12 },
      { name: '기타', weight: 8 },
    ],
    '해외주식': [
      { name: 'IT', weight: 30 },
      { name: '헬스케어', weight: 15 },
      { name: '금융', weight: 15 },
      { name: '소비재', weight: 15 },
      { name: '산업재', weight: 12 },
      { name: '기타', weight: 13 },
    ],
  };
  
  const template = sectorTemplates[etf.category] || sectorTemplates['국내주식'];
  return template.map(s => ({
    ...s,
    weight: s.weight + (Math.random() * 4 - 2), // 약간의 변동
  }));
};

// 자산 비중 (구성종목 탭용)
export const getAssetAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  // 카테고리에 따른 자산 비중 생성
  const assetTemplates: Record<string, { name: string; weight: number }[]> = {
    '반도체': [
      { name: '주식', weight: 98 },
      { name: '현금', weight: 2 },
    ],
    '국내주식': [
      { name: '주식', weight: 97 },
      { name: '현금', weight: 3 },
    ],
    '해외주식': [
      { name: '주식', weight: 96 },
      { name: '현금', weight: 4 },
    ],
    '채권': [
      { name: '채권', weight: 95 },
      { name: '현금', weight: 5 },
    ],
    '원자재': [
      { name: '원자재', weight: 85 },
      { name: '선물', weight: 10 },
      { name: '현금', weight: 5 },
    ],
  };
  
  const template = assetTemplates[etf.category] || assetTemplates['국내주식'];
  return template.map(a => ({
    ...a,
    weight: a.weight + (Math.random() * 2 - 1), // 약간의 변동
  }));
};

// 국가별 비중 (구성종목 탭용)
export const getCountryAllocation = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  if (etf.id.startsWith('kr')) {
    return [{ name: '한국', weight: 100, code: 'KR' }];
  }
  
  // 미국 ETF의 경우
  if (etf.themes.some(t => t.includes('S&P') || t.includes('NASDAQ'))) {
    return [{ name: '미국', weight: 100, code: 'US' }];
  }
  
  // 글로벌 ETF
  return [
    { name: '미국', weight: 60, code: 'US' },
    { name: '일본', weight: 10, code: 'JP' },
    { name: '영국', weight: 8, code: 'GB' },
    { name: '프랑스', weight: 6, code: 'FR' },
    { name: '독일', weight: 5, code: 'DE' },
    { name: '기타', weight: 11, code: 'OTHER' },
  ];
};

// 배당 차트 데이터 (배당 탭용)
export const getDividendChartData = (etfId: string) => {
  const dividends = getDividends(etfId);
  if (dividends.length === 0) return [];
  
  // 최근 8분기 배당 데이터
  return dividends.slice(0, 8).reverse().map(d => ({
    date: d.payDate.slice(0, 7), // YYYY-MM
    amount: d.amount,
  }));
};

// 배당 예측 정보 (배당 탭용)
export const getDividendForecast = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  const today = new Date();
  
  // etfId 해시로 일부 ETF에 7일 이내 배당락일 할당 (시연용)
  const hash = etfId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isNearDividend = hash % 5 === 0; // 약 20% ETF가 7일 이내
  
  let daysUntilEx: number;
  if (isNearDividend && etf.dividendYield > 0) {
    daysUntilEx = (hash % 6) + 1; // 1~6일
  } else {
    const nextQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 15);
    daysUntilEx = Math.ceil((nextQuarter.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  }
  
  const exDate = new Date(today.getTime() + daysUntilEx * 24 * 60 * 60 * 1000);
  
  return {
    nextExDate: exDate.toISOString().slice(0, 10),
    nextPayDate: new Date(exDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estimatedAmount: Math.round(etf.price * (etf.dividendYield / 100 / 4)),
    frequency: etf.dividendYield > 3 ? '월배당' : '분기배당',
    daysUntilEx,
  };
};

// 확장된 위험 지표 (위험지표 탭용)
export const getExtendedRiskMetrics = (etfId: string) => {
  const baseMetrics = getRiskMetrics(etfId);
  
  return {
    ...baseMetrics,
    // 추가 지표
    alpha: (Math.random() * 4 - 2).toFixed(2), // -2% ~ 2%
    r2: (0.85 + Math.random() * 0.14).toFixed(2), // 0.85 ~ 0.99
    treynorRatio: (Math.random() * 0.3).toFixed(2), // 0 ~ 0.3
    informationRatio: (Math.random() * 1 - 0.5).toFixed(2), // -0.5 ~ 0.5
    sortino: (Math.random() * 2).toFixed(2), // 0 ~ 2
    calmarRatio: (Math.random() * 1.5).toFixed(2), // 0 ~ 1.5
    var95: (Math.random() * 5 + 2).toFixed(2), // 2% ~ 7%
    cvar95: (Math.random() * 3 + 3).toFixed(2), // 3% ~ 6%
    upCapture: (90 + Math.random() * 20).toFixed(1), // 90% ~ 110%
    downCapture: (85 + Math.random() * 25).toFixed(1), // 85% ~ 110%
  };
};

// 월별 수익률 히트맵 데이터
export const getMonthlyReturns = (etfId: string) => {
  const years = [2022, 2023, 2024];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  return years.map(year => ({
    year,
    returns: months.map((month, idx) => ({
      month,
      value: Math.random() * 20 - 10, // -10% ~ +10%
    })),
  }));
};

// 운용 현황
export const getFundOperationInfo = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  return {
    fundManager: etf.issuer,
    custodian: etf.issuer === '삼성자산운용' ? '삼성증권' : 
               etf.issuer === '미래에셋자산운용' ? '미래에셋증권' : '한국예탁결제원',
    ap: ['NH투자증권', '삼성증권', 'KB증권', '미래에셋증권'].slice(0, 2 + Math.floor(Math.random() * 2)),
    creationUnit: Math.floor(50000 + Math.random() * 50000),
    managementFee: (etf.expenseRatio * 0.7).toFixed(3),
    otherFee: (etf.expenseRatio * 0.3).toFixed(3),
    rebalanceFrequency: '분기',
    indexProvider: etf.id.startsWith('kr') ? 'KRX' : 'S&P Dow Jones',
  };
};

// ETF 등급 시스템 (etf.com 스타일)
export const getETFGrades = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  // 효율성 점수 (비용 기반)
  let efficiencyScore = 0;
  if (etf.expenseRatio <= 0.1) efficiencyScore = 95;
  else if (etf.expenseRatio <= 0.2) efficiencyScore = 85;
  else if (etf.expenseRatio <= 0.3) efficiencyScore = 75;
  else if (etf.expenseRatio <= 0.5) efficiencyScore = 65;
  else efficiencyScore = 55;
  
  // 거래용이성 점수 (거래량 기반)
  let tradabilityScore = 0;
  if (etf.volume >= 5000000) tradabilityScore = 95;
  else if (etf.volume >= 1000000) tradabilityScore = 85;
  else if (etf.volume >= 500000) tradabilityScore = 75;
  else if (etf.volume >= 100000) tradabilityScore = 65;
  else tradabilityScore = 55;
  
  // 적합성 점수 (추적오차 기반)
  const trackingError = 0.01 + Math.random() * 0.49;
  let fitScore = 0;
  if (trackingError <= 0.1) fitScore = 95;
  else if (trackingError <= 0.2) fitScore = 85;
  else if (trackingError <= 0.3) fitScore = 75;
  else fitScore = 65;
  
  // 전체 등급
  const overallScore = Math.round((efficiencyScore + tradabilityScore + fitScore) / 3);
  
  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };
  
  return {
    overall: { score: overallScore, grade: getGrade(overallScore) },
    efficiency: { score: efficiencyScore, grade: getGrade(efficiencyScore), desc: '비용 효율성' },
    tradability: { score: tradabilityScore, grade: getGrade(tradabilityScore), desc: '거래 용이성' },
    fit: { score: fitScore, grade: getGrade(fitScore), desc: '지수 추적 정확도' },
  };
};

// 펀더멘털 지표
export const getFundamentals = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  // 주식 ETF인 경우에만 펀더멘털 제공
  if (etf.category === '채권' || etf.category === '원자재' || etf.category === '통화') {
    return null;
  }
  
  return {
    pe: (15 + Math.random() * 15).toFixed(2), // P/E 비율
    pb: (1.5 + Math.random() * 3).toFixed(2), // P/B 비율
    ps: (2 + Math.random() * 4).toFixed(2), // P/S 비율
    pcf: (10 + Math.random() * 10).toFixed(2), // P/CF 비율
    roe: (10 + Math.random() * 20).toFixed(2), // ROE
    roa: (5 + Math.random() * 10).toFixed(2), // ROA
    debtToEquity: (0.3 + Math.random() * 1.2).toFixed(2), // 부채비율
    earningsGrowth: (-5 + Math.random() * 30).toFixed(2), // 이익성장률
    revenueGrowth: (-2 + Math.random() * 20).toFixed(2), // 매출성장률
    dividendGrowth: (0 + Math.random() * 15).toFixed(2), // 배당성장률
    avgMarketCap: etf.marketCap / 1000000000, // 평균 시가총액 (십억원)
    medianMarketCap: etf.marketCap / 1500000000,
  };
};

// 기술적 지표
export const getTechnicalIndicators = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  const price = etf.price;
  const change = etf.changePercent;
  
  // RSI 계산 (모의)
  const rsi = Math.max(20, Math.min(80, 50 + change * 5));
  
  // MACD
  const macd = change * 100;
  const signal = macd * 0.8;
  const histogram = macd - signal;
  
  // 이동평균
  const ma5 = price * (1 + (Math.random() - 0.5) * 0.02);
  const ma10 = price * (1 + (Math.random() - 0.5) * 0.03);
  const ma20 = price * (1 + (Math.random() - 0.5) * 0.05);
  const ma50 = price * (1 + (Math.random() - 0.5) * 0.08);
  const ma200 = price * (1 + (Math.random() - 0.5) * 0.15);
  
  // 추세 판단
  const shortTermTrend = price > ma20 ? 'bullish' : 'bearish';
  const longTermTrend = price > ma200 ? 'bullish' : 'bearish';
  
  // 지지/저항선
  const support1 = Math.round(price * 0.95);
  const support2 = Math.round(price * 0.90);
  const resistance1 = Math.round(price * 1.05);
  const resistance2 = Math.round(price * 1.10);
  
  // 볼린저 밴드
  const bbUpper = Math.round(ma20 * 1.04);
  const bbLower = Math.round(ma20 * 0.96);
  const bbWidth = ((bbUpper - bbLower) / ma20 * 100).toFixed(2);
  
  // 모멘텀 지표
  const momentum = (Math.random() * 40 - 20).toFixed(2);
  const stochastic = Math.round(Math.random() * 100);
  const williams = Math.round(-Math.random() * 100);
  
  return {
    rsi: Math.round(rsi),
    rsiStatus: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
    macd: {
      value: macd.toFixed(2),
      signal: signal.toFixed(2),
      histogram: histogram.toFixed(2),
      trend: histogram > 0 ? 'bullish' : 'bearish',
    },
    movingAverages: {
      ma5: Math.round(ma5),
      ma10: Math.round(ma10),
      ma20: Math.round(ma20),
      ma50: Math.round(ma50),
      ma200: Math.round(ma200),
    },
    trend: {
      shortTerm: shortTermTrend,
      longTerm: longTermTrend,
    },
    supportResistance: {
      support1,
      support2,
      resistance1,
      resistance2,
    },
    bollingerBands: {
      upper: bbUpper,
      middle: Math.round(ma20),
      lower: bbLower,
      width: bbWidth,
    },
    momentum: {
      value: momentum,
      stochastic,
      williams,
    },
  };
};

// $10,000 성장 시뮬레이션 데이터
export const getGrowthSimulation = (etfId: string, years: number = 5) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  const returns = getReturns(etfId);
  const annualReturn = returns.year1 / 100 || 0.08; // 연평균 수익률
  
  const data = [];
  const startValue = 10000000; // 1000만원 (한국 기준)
  let value = startValue;
  
  const today = new Date();
  
  for (let i = years * 12; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    // 월별 변동 (연간 수익률 기반 + 랜덤 변동)
    const monthlyReturn = annualReturn / 12;
    const volatility = (Math.random() - 0.5) * 0.04;
    value = value * (1 + monthlyReturn + volatility);
    
    data.push({
      date: date.toISOString().slice(0, 7),
      value: Math.round(value),
      benchmark: Math.round(startValue * Math.pow(1 + (annualReturn * 0.8) / 12, (years * 12) - i)),
    });
  }
  
  return data;
};

// 자금 흐름 데이터
export const getFundFlows = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  // 월별 자금 흐름 데이터
  const monthlyFlows = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    monthlyFlows.push({
      date: date.toISOString().slice(0, 7),
      inflow: Math.round(Math.random() * etf.aum * 0.01),
      outflow: Math.round(Math.random() * etf.aum * 0.008),
      net: 0, // 계산됨
    });
    monthlyFlows[monthlyFlows.length - 1].net = 
      monthlyFlows[monthlyFlows.length - 1].inflow - monthlyFlows[monthlyFlows.length - 1].outflow;
  }
  
  // 기간별 순유입
  const week1 = Math.round((Math.random() - 0.4) * etf.aum * 0.002);
  const month1 = Math.round((Math.random() - 0.4) * etf.aum * 0.01);
  const month3 = Math.round((Math.random() - 0.4) * etf.aum * 0.03);
  const ytd = Math.round((Math.random() - 0.4) * etf.aum * 0.08);
  const year1 = Math.round((Math.random() - 0.4) * etf.aum * 0.1);
  
  return {
    monthly: monthlyFlows,
    summary: {
      week1,
      month1,
      month3,
      ytd,
      year1,
    },
    cumulativeAUM: etf.aum,
    rank: Math.floor(Math.random() * 100) + 1, // 카테고리 내 순위
  };
};

// 세금 정보
export const getTaxInfo = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  const isKorean = etf.id.startsWith('kr');
  
  return {
    taxEfficiency: Math.round(85 + Math.random() * 15), // 85-100%
    capitalGainsDistribution: isKorean ? '비과세' : '15.4% (배당소득세)',
    dividendTaxRate: '15.4%',
    foreignTaxWithheld: isKorean ? 'N/A' : '15%',
    taxLossHarvesting: isKorean ? '가능' : '가능 (환율 주의)',
    notes: isKorean 
      ? '국내 상장 ETF는 거래차익 비과세, 배당금 15.4% 원천징수'
      : '해외 ETF는 양도차익 22% (250만원 초과분), 배당금 15.4%',
    structureType: etf.name.includes('합성') ? '합성(Synthetic)' : '실물(Physical)',
    replicationMethod: etf.name.includes('합성') ? '스왑 기반' : '실물 복제',
  };
};

// 경쟁 ETF 비교 데이터
export const getCompetingETFs = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  const similarETFs = getSimilarETFs(etfId, 5);
  
  return similarETFs.map(similar => {
    const similarReturns = getReturns(similar.id);
    return {
      id: similar.id,
      name: similar.name,
      ticker: similar.ticker,
      issuer: similar.issuer,
      price: similar.price,
      changePercent: similar.changePercent,
      aum: similar.aum,
      expenseRatio: similar.expenseRatio,
      dividendYield: similar.dividendYield,
      volume: similar.volume,
      returns: {
        month1: similarReturns.month1,
        month3: similarReturns.month3,
        year1: similarReturns.year1,
        ytd: similarReturns.ytd,
      },
    };
  });
};

// 관련 뉴스 (모의 데이터)
export const getRelatedNews = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];
  
  const themes = etf.themes;
  const now = new Date();
  
  const newsTemplates = [
    { title: `${etf.name}, 최근 한 달 ${etf.changePercent > 0 ? '상승세' : '조정 국면'}`, source: '연합인포맥스' },
    { title: `${themes[0] || '시장'} 관련 ETF 투자 전략`, source: '한국경제' },
    { title: `${etf.issuer}, 신규 ETF 상품 라인업 확대`, source: '이데일리' },
    { title: `글로벌 ${themes[0] || '시장'} 동향과 ETF 투자`, source: '매일경제' },
    { title: `ETF 수익률 TOP10에 ${themes[0] || etf.category} 상품 다수`, source: '서울경제' },
  ];
  
  return newsTemplates.slice(0, 5).map((news, idx) => ({
    id: `news-${idx}`,
    title: news.title,
    source: news.source,
    date: new Date(now.getTime() - idx * 24 * 60 * 60 * 1000 * (1 + Math.random() * 3)).toISOString().slice(0, 10),
    url: '#',
    summary: `${etf.name}에 대한 시장 분석 및 투자 전망...`,
  }));
};

// 비용 분석 데이터 (실부담비용)
export const getCostAnalysis = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;
  
  const ter = etf.expenseRatio;
  const tradingCost = 0.05 + Math.random() * 0.1; // 매매중개수수료
  const otherCost = 0.02 + Math.random() * 0.05; // 기타비용
  const totalCost = ter + tradingCost + otherCost;
  
  return {
    ter, // Total Expense Ratio
    tradingCost: Number(tradingCost.toFixed(3)),
    otherCost: Number(otherCost.toFixed(3)),
    totalCost: Number(totalCost.toFixed(3)),
    historicalCost: [
      { year: '2022', cost: totalCost + (Math.random() - 0.5) * 0.1 },
      { year: '2023', cost: totalCost + (Math.random() - 0.5) * 0.05 },
      { year: '2024', cost: totalCost },
    ],
  };
};
