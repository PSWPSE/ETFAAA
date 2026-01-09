/**
 * Data Source Configuration
 * 데이터 소스 URL 및 설정
 */
import type { DataSourceType } from '../types/index.js';
export interface DataSourceConfig {
    type: DataSourceType;
    name: string;
    nameKo: string;
    baseUrl: string;
    itemUrl: string;
    dataFile: string;
    currency: 'KRW' | 'USD';
    selectors: DataSelectors;
    fields: FieldMapping[];
}
export interface DataSelectors {
    priceSelector: string;
    changeSelector: string;
    changePercentSelector?: string;
    volumeSelector: string;
    navSelector?: string;
    searchInput?: string;
    searchButton?: string;
}
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    transform?: (value: string) => number | string;
}
export declare function parseKoreanNumber(value: string): number;
export declare function parseUSNumber(value: string): number;
export declare function parsePercent(value: string): number;
export declare const KOREAN_ETF_SOURCE: DataSourceConfig;
export declare const US_ETF_SOURCE: DataSourceConfig;
export declare const INDICES_SOURCE: DataSourceConfig;
export declare const FOREX_SOURCE: DataSourceConfig;
export declare const COMMODITIES_SOURCE: DataSourceConfig;
export declare const DATA_SOURCES: Record<DataSourceType, DataSourceConfig>;
export declare function getItemUrl(source: DataSourceType, ticker: string): string;
export declare const PRIORITY_KOREAN_ETFS: string[];
export declare const PRIORITY_US_ETFS: string[];
export declare const INDEX_TICKERS: {
    KOSPI: string;
    KOSDAQ: string;
    NIKKEI: string;
    HSI: string;
    SHANGHAI: string;
    SP500: string;
    NASDAQ: string;
    DOW: string;
    FTSE: string;
    DAX: string;
    CAC: string;
};
export declare const FOREX_TICKERS: {
    USD_KRW: string;
    EUR_KRW: string;
    JPY_KRW: string;
    CNY_KRW: string;
};
export declare const COMMODITY_TICKERS: {
    GOLD: string;
    SILVER: string;
    OIL_WTI: string;
    NATURAL_GAS: string;
};
//# sourceMappingURL=data-sources.d.ts.map