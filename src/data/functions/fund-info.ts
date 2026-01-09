// ETF 펀드 정보 관련 함수
import type { ETF } from '../../types/etf';
import { getETFById } from '../etf';

// 확장된 ETF 정보 (ETF 객체를 받음)
export const getExtendedETFInfo = (etf: ETF) => {

  // 52주 고가/저가 생성
  const high52w = Math.round(etf.price * (1 + 0.15 + Math.random() * 0.15));
  const low52w = Math.round(etf.price * (1 - 0.15 - Math.random() * 0.15));

  // 당일 고가/저가
  const dayHigh = Math.round(etf.price * (1 + Math.random() * 0.03));
  const dayLow = Math.round(etf.price * (1 - Math.random() * 0.03));

  // 전일 종가
  const prevClose = etf.price - etf.change;

  // 거래대금
  const turnover = etf.volume * etf.price;

  // 추적지수 결정 (한국어 + 영어 테마 매핑)
  const trackingIndexMap: Record<string, string> = {
    // === 한국 지수 ===
    'KOSPI200': 'KOSPI 200',
    'KOSDAQ150': 'KOSDAQ 150',
    'KRX300': 'KRX 300',
    'MSCI': 'MSCI Korea',

    // === 미국 지수 ===
    'S&P500': 'S&P 500',
    'NASDAQ100': 'NASDAQ 100',
    'NASDAQ': 'NASDAQ 100',
    '나스닥100': 'NASDAQ 100',
    'Dow Jones': 'Dow Jones Industrial Average',
    '다우존스': 'Dow Jones Industrial Average',
    'Russell 2000': 'Russell 2000',
    'Total Market': 'CRSP US Total Market',

    // === 섹터/테마 (한국) ===
    '반도체': 'KRX 반도체',
    '2차전지': 'KRX 2차전지 K-뉴딜',
    '바이오': 'KRX 바이오',
    '헬스케어': 'KRX 헬스케어',
    '조선': 'KRX 조선',
    '방산': 'KRX 방산',
    '빅테크': 'NYSE FANG+',
    '전기차': 'MSCI EV',
    '그룹주': 'KRX 그룹주',
    '삼성': 'KRX 삼성그룹',
    '대형주': 'KRX 대형주',
    '코리아': 'KRX Korea Value Up',

    // === 섹터/테마 (미국) ===
    'Semiconductor': 'PHLX Semiconductor',
    'Technology': 'Technology Select Sector',
    'Financial': 'Financial Select Sector',
    'Healthcare': 'Health Care Select Sector',
    'Energy': 'Energy Select Sector',
    'Utilities': 'Utilities Select Sector',
    'Consumer Discretionary': 'Consumer Discretionary Select Sector',
    'Consumer Staples': 'Consumer Staples Select Sector',
    'Industrial': 'Industrial Select Sector',
    'Cybersecurity': 'ISE Cyber Security',

    // === 배당/전략 ===
    '배당': 'Dow Jones Select Dividend',
    'Dividend': 'Dow Jones US Dividend 100',
    'Value': 'S&P 500 Value',
    'Growth': 'S&P 500 Growth',
    '커버드콜': 'CBOE S&P 500 BuyWrite',

    // === 채권 ===
    '채권': 'KIS 국고채',
    '단기채': 'KIS 단기채권',
    '미국채': 'Bloomberg US Treasury',
    '회사채': 'Bloomberg US Corporate Bond',
    'CD금리': 'CD 91일물',
    'KOFR': 'KOFR',
    'MMF': 'Money Market',
    'Bond': 'Bloomberg US Aggregate Bond',
    'Treasury': 'Bloomberg US Treasury',
    'Corporate Bond': 'Bloomberg US Corporate Bond',
    'High Yield': 'Bloomberg US High Yield',

    // === 원자재 ===
    '금': 'LBMA Gold Price',
    'Gold': 'LBMA Gold Price',
    'Silver': 'LBMA Silver Price',
    '원유': 'WTI Crude Oil',

    // === 글로벌/지역 ===
    'Developed Markets': 'FTSE Developed',
    'Emerging Markets': 'MSCI Emerging Markets',
    'EAFE': 'MSCI EAFE',
    '중국': 'CSI 300',

    // === 테마/혁신 ===
    'AI': 'Global X AI',
    'Robotics': 'ROBO Global Robotics',
    'Clean Energy': 'S&P Global Clean Energy',
    'Innovation': 'ARK Innovation',
    'REIT': 'MSCI US REIT',

    // === 기타 ===
    'TR': 'Total Return Index',
    'Index': 'Broad Market Index',
  };

  let trackingIndex = '기초지수';
  for (const [key, value] of Object.entries(trackingIndexMap)) {
    if (etf.themes.some(t => t.includes(key)) || etf.name.includes(key)) {
      trackingIndex = value;
      break;
    }
  }

  // 추적오차
  const trackingError = 0.01 + Math.random() * 0.49;

  // 레버리지 배수
  let leverage = 1;
  if (etf.name.includes('2X') || etf.name.includes('레버리지')) leverage = 2;
  if (etf.name.includes('3X')) leverage = 3;
  if (etf.name.includes('인버스')) leverage = -1;
  if (etf.name.includes('인버스2X')) leverage = -2;

  // 상장거래소
  const listingExchange = etf.id.startsWith('kr') ? 'KRX' : 'NYSE/NASDAQ';

  // 투자전략 설명 생성 (ETF 유형별 차별화)
  const investmentStrategy = generateInvestmentStrategy(etf, trackingIndex, leverage);

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
    investmentStrategy,
  };
};

// ETF 유형별 투자전략 설명 생성
const generateInvestmentStrategy = (etf: ETF, trackingIndex: string, leverage: number): string => {
  const isKorean = etf.id.startsWith('kr');
  const themes = etf.themes;

  // 레버리지/인버스 ETF
  if (leverage === 2 || leverage === 3) {
    return `본 ETF는 ${trackingIndex}의 일간 수익률을 ${Math.abs(leverage)}배로 추종하는 레버리지 상품입니다. 파생상품(선물, 스왑)을 활용하여 기초지수 변동의 ${Math.abs(leverage)}배 수익을 목표로 하며, 단기 트레이딩에 적합합니다. 복리 효과로 인해 장기 보유 시 기초지수와 괴리가 발생할 수 있으므로 주의가 필요합니다.`;
  }
  if (leverage === -1 || leverage === -2) {
    return `본 ETF는 ${trackingIndex}의 일간 수익률을 ${Math.abs(leverage)}배 역방향으로 추종하는 인버스 상품입니다. 기초지수가 하락할 때 수익을 얻을 수 있어 하락장 헷지 또는 단기 투기 목적으로 활용됩니다. 장기 보유에는 적합하지 않으며, 시장 상승 시 손실이 확대될 수 있습니다.`;
  }

  // 반도체 ETF
  if (themes.some(t => t.includes('반도체') || t.includes('Semiconductor'))) {
    return `본 ETF는 ${trackingIndex}를 추종하며, 반도체 설계, 제조, 장비 기업에 집중 투자합니다. AI, 데이터센터, 전기차 등 반도체 수요 증가의 수혜를 받을 수 있으나, 경기 사이클에 민감한 업종 특성상 변동성이 높을 수 있습니다.`;
  }

  // AI/기술 ETF
  if (themes.some(t => t.includes('AI') || t.includes('Technology') || t.includes('기술'))) {
    return `본 ETF는 ${trackingIndex}를 기초지수로 하여 인공지능, 클라우드, 소프트웨어 등 첨단 기술 기업에 투자합니다. 높은 성장 잠재력을 보유하나 밸류에이션 부담과 금리 변동에 민감할 수 있습니다. 장기 성장 테마에 베팅하는 투자자에게 적합합니다.`;
  }

  // 2차전지/전기차 ETF
  if (themes.some(t => t.includes('2차전지') || t.includes('전기차') || t.includes('Clean Energy'))) {
    return `본 ETF는 ${trackingIndex}를 추종하며, 배터리, 전기차, 신재생에너지 밸류체인 기업에 투자합니다. 글로벌 탄소중립 정책의 수혜가 기대되나, 원자재 가격 변동과 기술 경쟁 심화에 따른 리스크가 존재합니다.`;
  }

  // 배당 ETF
  if (themes.some(t => t.includes('배당') || t.includes('Dividend') || t.includes('Income'))) {
    return `본 ETF는 ${trackingIndex}를 기초지수로 하여 안정적인 배당을 지급하는 우량 기업에 투자합니다. 정기적인 배당 수익과 함께 장기적인 자본 이득을 추구하며, 은퇴 자금이나 인컴 포트폴리오 구축에 적합합니다. 배당성향, 배당 성장률 등을 고려하여 종목을 선정합니다.`;
  }

  // 채권 ETF
  if (themes.some(t => t.includes('채권') || t.includes('Bond') || t.includes('Treasury') || t.includes('Fixed Income'))) {
    return `본 ETF는 ${trackingIndex}를 추종하며, 채권 포트폴리오에 투자하여 안정적인 이자 수익을 추구합니다. 주식 대비 낮은 변동성으로 포트폴리오 안정화 역할을 하며, 금리 변동에 따라 채권 가격이 영향을 받을 수 있습니다.`;
  }

  // 단기채/MMF ETF
  if (themes.some(t => t.includes('CD금리') || t.includes('KOFR') || t.includes('MMF') || t.includes('단기'))) {
    return `본 ETF는 ${trackingIndex}를 추종하는 초단기 금융상품으로, 현금성 자산 운용에 적합합니다. 원금 손실 위험이 매우 낮고 유동성이 높아 대기 자금이나 비상 자금 운용에 활용할 수 있습니다. 시중 금리 수준의 수익을 기대할 수 있습니다.`;
  }

  // 금/원자재 ETF
  if (themes.some(t => t.includes('금') || t.includes('Gold') || t.includes('Silver') || t.includes('원유') || t.includes('Commodity'))) {
    return `본 ETF는 ${trackingIndex}를 추종하며, 실물 자산 가격 변동에 연동됩니다. 인플레이션 헷지, 달러 약세 대비, 포트폴리오 분산 효과를 기대할 수 있으며, 지정학적 리스크 발생 시 안전자산으로서 역할을 할 수 있습니다.`;
  }

  // 바이오/헬스케어 ETF
  if (themes.some(t => t.includes('바이오') || t.includes('헬스케어') || t.includes('Healthcare'))) {
    return `본 ETF는 ${trackingIndex}를 기초지수로 하여 제약, 바이오텍, 의료기기, 헬스케어 서비스 기업에 투자합니다. 고령화와 의료 수요 증가로 장기 성장이 기대되나, 신약 개발 실패나 규제 리스크에 주의가 필요합니다.`;
  }

  // 조선/방산 ETF
  if (themes.some(t => t.includes('조선') || t.includes('방산'))) {
    const sector = themes.includes('조선') ? '조선' : '방산';
    return `본 ETF는 ${trackingIndex}를 추종하며, 한국의 ${sector} 관련 핵심 기업에 집중 투자합니다. 글로벌 수주 증가와 지정학적 요인으로 성장 모멘텀이 기대되며, ${sector} 업황 사이클에 따른 실적 변동성이 있을 수 있습니다.`;
  }

  // 리츠/부동산 ETF
  if (themes.some(t => t.includes('REIT') || t.includes('Real Estate') || t.includes('리츠'))) {
    return `본 ETF는 ${trackingIndex}를 추종하며, 오피스, 물류센터, 데이터센터 등 다양한 부동산에 간접 투자합니다. 임대 수익 기반의 안정적인 배당과 함께 부동산 가치 상승에 따른 자본 이득을 기대할 수 있습니다.`;
  }

  // 신흥국 ETF
  if (themes.some(t => t.includes('Emerging') || t.includes('신흥') || t.includes('중국') || t.includes('인도'))) {
    return `본 ETF는 ${trackingIndex}를 기초지수로 하여 신흥국 시장에 투자합니다. 높은 경제 성장률과 인구 증가에 따른 성장 기회가 있으나, 환율 변동, 정치적 리스크, 유동성 제약 등에 주의가 필요합니다.`;
  }

  // 커버드콜 ETF
  if (themes.some(t => t.includes('커버드콜') || t.includes('Covered Call'))) {
    return `본 ETF는 ${trackingIndex}를 기초자산으로 보유하면서 콜옵션을 매도하는 커버드콜 전략을 구사합니다. 옵션 프리미엄을 통해 추가 인컴을 창출하여 높은 배당수익률을 제공하나, 상승장에서 수익이 제한될 수 있습니다.`;
  }

  // 시장 대표지수 ETF (KOSPI200, S&P500 등)
  if (themes.some(t => t.includes('KOSPI') || t.includes('KOSDAQ') || t.includes('S&P500') || t.includes('NASDAQ') || t.includes('시장대표') || t.includes('Index'))) {
    const market = isKorean ? '한국' : '미국';
    return `본 ETF는 ${trackingIndex}를 추종하며, ${market} 시장의 대표 기업들에 분산 투자합니다. 시장 전체의 성과를 추종하므로 개별 종목 리스크가 낮고, 장기 자산배분의 핵심 자산으로 활용할 수 있습니다. 낮은 보수로 효율적인 시장 베타 노출이 가능합니다.`;
  }

  // 기본 템플릿 (위 조건에 해당하지 않는 경우)
  const marketType = isKorean ? '국내' : '해외';
  return `본 ETF는 ${trackingIndex}를 기초지수로 추종하며, 해당 지수에 포함된 종목들에 분산 투자합니다. ${marketType} 시장에서 특정 테마나 섹터에 효율적으로 노출될 수 있으며, 패시브 운용을 통해 낮은 비용으로 투자 목표를 달성할 수 있습니다.`;
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

// 자금 흐름 데이터
export const getFundFlows = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return null;

  const monthlyFlows = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const inflow = Math.round(Math.random() * etf.aum * 0.01);
    const outflow = Math.round(Math.random() * etf.aum * 0.008);
    monthlyFlows.push({
      date: date.toISOString().slice(0, 7),
      inflow,
      outflow,
      net: inflow - outflow,
    });
  }

  const week1 = Math.round((Math.random() - 0.4) * etf.aum * 0.002);
  const month1 = Math.round((Math.random() - 0.4) * etf.aum * 0.01);
  const month3 = Math.round((Math.random() - 0.4) * etf.aum * 0.03);
  const ytd = Math.round((Math.random() - 0.4) * etf.aum * 0.08);
  const year1 = Math.round((Math.random() - 0.4) * etf.aum * 0.1);

  return {
    monthly: monthlyFlows,
    summary: { week1, month1, month3, ytd, year1 },
    cumulativeAUM: etf.aum,
    rank: Math.floor(Math.random() * 100) + 1,
  };
};

// 관련 뉴스
export const getRelatedNews = (etfId: string) => {
  const etf = getETFById(etfId);
  if (!etf) return [];

  const themes = etf.themes;
  const now = new Date();
  const isUS = etfId.startsWith('us');

  // 미국 ETF용 뉴스 템플릿
  const usNewsTemplates = [
    { title: `${etf.ticker} ${etf.changePercent > 0 ? 'Rises' : 'Falls'} Amid ${themes[0] || 'Market'} Sector Movement`, source: 'Bloomberg' },
    { title: `${themes[0] || 'Market'} ETFs See Record Inflows in Q1 2026`, source: 'Reuters' },
    { title: `${etf.issuer} ETF Products Gain Popularity Among Retail Investors`, source: 'CNBC' },
    { title: `${etf.ticker}: What Investors Need to Know About ${themes[0] || 'This'} ETF`, source: 'Morningstar' },
    { title: `Top ${etf.category} ETFs to Watch in 2026`, source: 'Barron\'s' },
  ];

  // 한국 ETF용 뉴스 템플릿
  const krNewsTemplates = [
    { title: `${etf.name}, 최근 한 달 ${etf.changePercent > 0 ? '상승세' : '조정 국면'}`, source: '연합인포맥스' },
    { title: `${themes[0] || '시장'} 관련 ETF 투자 전략`, source: '한국경제' },
    { title: `${etf.issuer}, 신규 ETF 상품 라인업 확대`, source: '이데일리' },
    { title: `글로벌 ${themes[0] || '시장'} 동향과 ETF 투자`, source: '매일경제' },
    { title: `ETF 수익률 TOP10에 ${themes[0] || etf.category} 상품 다수`, source: '서울경제' },
  ];

  const newsTemplates = isUS ? usNewsTemplates : krNewsTemplates;

  return newsTemplates.slice(0, 5).map((news, index) => ({
    id: `news-${index}`,
    title: news.title,
    source: news.source,
    date: new Date(now.getTime() - index * 24 * 60 * 60 * 1000 * (1 + Math.random() * 3)).toISOString().slice(0, 10),
    url: '#',
    summary: isUS
      ? `Market analysis and investment outlook for ${etf.name}...`
      : `${etf.name}에 대한 시장 분석 및 투자 전망...`,
  }));
};
