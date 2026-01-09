/**
 * Validation Rules Configuration
 * 검증 규칙 설정
 */
import type { DataSourceType } from '../types/index.js';
export interface ValidationRule {
    field: string;
    thresholdPercent: number;
    allowNegative: boolean;
    required: boolean;
    description: string;
}
export interface DataSourceValidationRules {
    source: DataSourceType;
    rules: ValidationRule[];
    maxItemsPerSession: number;
    retryOnError: boolean;
    maxRetries: number;
    waitBetweenRequests: number;
}
export declare const KOREAN_ETF_RULES: DataSourceValidationRules;
export declare const US_ETF_RULES: DataSourceValidationRules;
export declare const INDICES_RULES: DataSourceValidationRules;
export declare const FOREX_RULES: DataSourceValidationRules;
export declare const COMMODITIES_RULES: DataSourceValidationRules;
export declare const VALIDATION_RULES: Record<DataSourceType, DataSourceValidationRules>;
export declare function getValidationRules(source: DataSourceType): DataSourceValidationRules;
export declare function getFieldRule(source: DataSourceType, field: string): ValidationRule | undefined;
export declare function compareValues(currentValue: number, fetchedValue: number, thresholdPercent: number): {
    needsUpdate: boolean;
    percentDiff: number;
};
export declare function detectAnomaly(currentValue: number, fetchedValue: number, maxChangePercent?: number): boolean;
//# sourceMappingURL=validation-rules.d.ts.map