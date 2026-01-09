/**
 * Data Source Configuration
 * 데이터 소스 URL 및 설정
 */
// 한국 숫자 파싱 (1,234,567 -> 1234567)
export function parseKoreanNumber(value) {
    if (!value)
        return 0;
    const cleaned = value.replace(/[,원\s]/g, '');
    return parseFloat(cleaned) || 0;
}
// 미국 숫자 파싱 ($1,234.56 -> 1234.56)
export function parseUSNumber(value) {
    if (!value)
        return 0;
    const cleaned = value.replace(/[$,\s]/g, '');
    return parseFloat(cleaned) || 0;
}
// 퍼센트 파싱 (+1.27% -> 1.27)
export function parsePercent(value) {
    if (!value)
        return 0;
    const cleaned = value.replace(/[%\s]/g, '');
    return parseFloat(cleaned) || 0;
}
// 한국 ETF 데이터 소스 (네이버 금융)
export const KOREAN_ETF_SOURCE = {
    type: 'korean-etf',
    name: 'Naver Finance Korean ETF',
    nameKo: '네이버 금융 한국 ETF',
    baseUrl: 'https://finance.naver.com/sise/etf.naver',
    itemUrl: 'https://finance.naver.com/item/main.naver?code={ticker}',
    dataFile: '../src/data/etf/korean-etfs.ts',
    currency: 'KRW',
    selectors: {
        priceSelector: '.no_today .blind',
        changeSelector: '.no_exday .blind',
        volumeSelector: '#_quant',
        navSelector: '.no_nav .blind'
    },
    fields: [
        { sourceField: 'price', targetField: 'price', transform: parseKoreanNumber },
        { sourceField: 'change', targetField: 'change', transform: parseKoreanNumber },
        { sourceField: 'changePercent', targetField: 'changePercent', transform: parsePercent },
        { sourceField: 'volume', targetField: 'volume', transform: parseKoreanNumber },
        { sourceField: 'nav', targetField: 'nav', transform: parseKoreanNumber }
    ]
};
// 미국 ETF 데이터 소스 (Yahoo Finance)
export const US_ETF_SOURCE = {
    type: 'us-etf',
    name: 'Yahoo Finance US ETF',
    nameKo: 'Yahoo Finance 미국 ETF',
    baseUrl: 'https://finance.yahoo.com',
    itemUrl: 'https://finance.yahoo.com/quote/{ticker}',
    dataFile: '../src/data/etf/us-etfs.ts',
    currency: 'USD',
    selectors: {
        priceSelector: '[data-testid="qsp-price"]',
        changeSelector: '[data-testid="qsp-price-change"]',
        changePercentSelector: '[data-testid="qsp-price-change-percent"]',
        volumeSelector: '[data-field="regularMarketVolume"]'
    },
    fields: [
        { sourceField: 'price', targetField: 'price', transform: parseUSNumber },
        { sourceField: 'change', targetField: 'change', transform: parseUSNumber },
        { sourceField: 'changePercent', targetField: 'changePercent', transform: parsePercent },
        { sourceField: 'volume', targetField: 'volume', transform: parseUSNumber }
    ]
};
// 시장 지수 데이터 소스
export const INDICES_SOURCE = {
    type: 'indices',
    name: 'Market Indices',
    nameKo: '시장 지수',
    baseUrl: 'https://finance.yahoo.com',
    itemUrl: 'https://finance.yahoo.com/quote/{ticker}',
    dataFile: '../src/data/market/indices.ts',
    currency: 'USD',
    selectors: {
        priceSelector: '[data-testid="qsp-price"]',
        changeSelector: '[data-testid="qsp-price-change"]',
        changePercentSelector: '[data-testid="qsp-price-change-percent"]',
        volumeSelector: '[data-field="regularMarketVolume"]'
    },
    fields: [
        { sourceField: 'value', targetField: 'value', transform: parseUSNumber },
        { sourceField: 'change', targetField: 'change', transform: parseUSNumber },
        { sourceField: 'changePercent', targetField: 'changePercent', transform: parsePercent }
    ]
};
// 환율 데이터 소스 (네이버 금융)
export const FOREX_SOURCE = {
    type: 'forex',
    name: 'Forex Rates',
    nameKo: '환율',
    baseUrl: 'https://finance.naver.com/marketindex/',
    itemUrl: 'https://finance.naver.com/marketindex/exchangeDetail.naver?marketindexCd={ticker}',
    dataFile: '../src/data/market/forex.ts',
    currency: 'KRW',
    selectors: {
        priceSelector: '.no_today .blind',
        changeSelector: '.no_exday .blind',
        volumeSelector: ''
    },
    fields: [
        { sourceField: 'rate', targetField: 'rate', transform: parseKoreanNumber },
        { sourceField: 'change', targetField: 'change', transform: parseKoreanNumber },
        { sourceField: 'changePercent', targetField: 'changePercent', transform: parsePercent }
    ]
};
// 원자재 데이터 소스 (Yahoo Finance)
export const COMMODITIES_SOURCE = {
    type: 'commodities',
    name: 'Commodities',
    nameKo: '원자재',
    baseUrl: 'https://finance.yahoo.com',
    itemUrl: 'https://finance.yahoo.com/quote/{ticker}',
    dataFile: '../src/data/market/commodities.ts',
    currency: 'USD',
    selectors: {
        priceSelector: '[data-testid="qsp-price"]',
        changeSelector: '[data-testid="qsp-price-change"]',
        changePercentSelector: '[data-testid="qsp-price-change-percent"]',
        volumeSelector: '[data-field="regularMarketVolume"]'
    },
    fields: [
        { sourceField: 'price', targetField: 'price', transform: parseUSNumber },
        { sourceField: 'change', targetField: 'change', transform: parseUSNumber },
        { sourceField: 'changePercent', targetField: 'changePercent', transform: parsePercent }
    ]
};
// 모든 데이터 소스
export const DATA_SOURCES = {
    'korean-etf': KOREAN_ETF_SOURCE,
    'us-etf': US_ETF_SOURCE,
    'indices': INDICES_SOURCE,
    'forex': FOREX_SOURCE,
    'commodities': COMMODITIES_SOURCE,
};
// 데이터 소스별 URL 생성
export function getItemUrl(source, ticker) {
    const config = DATA_SOURCES[source];
    return config.itemUrl.replace('{ticker}', ticker);
}
// 주요 ETF 티커 목록 (검증 우선순위)
export const PRIORITY_KOREAN_ETFS = [
    '069500', // KODEX 200
    '102110', // TIGER 200
    '229200', // KODEX 코스닥150
    '148020', // KBSTAR 200
    '305540', // TIGER MSCI Korea TR
];
export const PRIORITY_US_ETFS = [
    'SPY', // S&P 500
    'QQQ', // NASDAQ 100
    'VOO', // Vanguard S&P 500
    'IVV', // iShares S&P 500
    'VTI', // Total Market
];
// 시장 지수 티커
export const INDEX_TICKERS = {
    // 아시아
    KOSPI: '^KS11',
    KOSDAQ: '^KQ11',
    NIKKEI: '^N225',
    HSI: '^HSI',
    SHANGHAI: '000001.SS',
    // 미국
    SP500: '^GSPC',
    NASDAQ: '^IXIC',
    DOW: '^DJI',
    // 유럽
    FTSE: '^FTSE',
    DAX: '^GDAXI',
    CAC: '^FCHI',
};
// 환율 티커 (네이버 금융)
export const FOREX_TICKERS = {
    USD_KRW: 'FX_USDKRW',
    EUR_KRW: 'FX_EURKRW',
    JPY_KRW: 'FX_JPYKRW',
    CNY_KRW: 'FX_CNYKRW',
};
// 원자재 티커 (Yahoo Finance)
export const COMMODITY_TICKERS = {
    GOLD: 'GC=F',
    SILVER: 'SI=F',
    OIL_WTI: 'CL=F',
    NATURAL_GAS: 'NG=F',
};
//# sourceMappingURL=data-sources.js.map