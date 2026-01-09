/**
 * Validation Report Types
 * 검증 리포트 관련 타입
 */
import type { DataSourceType, ValidationDetail } from './agent-types.js';
export interface PreValidationReport {
    date: string;
    generatedAt: string;
    dataSource: DataSourceType;
    sourceUrl: string;
    totalItems: number;
    itemsChecked: number;
    discrepancies: ValidationDetail[];
    potentialIssues: PotentialIssue[];
    recommendations: string[];
}
export interface PotentialIssue {
    severity: IssueSeverity;
    category: string;
    description: string;
    affectedItems: string[];
    suggestedAction: string;
}
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface FinalValidationReport {
    date: string;
    generatedAt: string;
    executionSummary: ExecutionSummary;
    dataSourceReports: DataSourceReport[];
    modifications: ModificationRecord[];
    errors: ErrorRecord[];
}
export interface ExecutionSummary {
    totalDataSources: number;
    totalItemsValidated: number;
    totalItemsUpdated: number;
    totalErrors: number;
    executionTimeMs: number;
    status: 'success' | 'partial' | 'failed';
}
export interface DataSourceReport {
    source: DataSourceType;
    sourceName: string;
    itemsValidated: number;
    itemsUpdated: number;
    itemsSkipped: number;
    errors: number;
    preValidationReport?: PreValidationReport;
}
export interface ModificationRecord {
    timestamp: string;
    file: string;
    ticker: string;
    name: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    agent: string;
}
export interface ErrorRecord {
    timestamp: string;
    agent: string;
    task: string;
    error: string;
    recoverable: boolean;
    retryCount?: number;
}
export interface ETFComparisonResult {
    ticker: string;
    name: string;
    hasDiscrepancy: boolean;
    fields: FieldComparison[];
}
export interface FieldComparison {
    field: string;
    currentValue: unknown;
    fetchedValue: unknown;
    match: boolean;
    percentDiff?: number;
}
export interface ValidationConfig {
    priceThreshold: number;
    volumeThreshold: number;
    skipIfMarketClosed: boolean;
    retryOnError: boolean;
    maxRetries: number;
}
export declare const DEFAULT_VALIDATION_CONFIG: ValidationConfig;
//# sourceMappingURL=validation-types.d.ts.map