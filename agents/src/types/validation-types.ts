/**
 * Validation Report Types
 * 검증 리포트 관련 타입
 */

import type { DataSourceType, ValidationDetail } from './agent-types.js';

// Pre-Validation 리포트 구조
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

// 잠재적 이슈
export interface PotentialIssue {
  severity: IssueSeverity;
  category: string;
  description: string;
  affectedItems: string[];
  suggestedAction: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

// 최종 검증 리포트
export interface FinalValidationReport {
  date: string;
  generatedAt: string;
  executionSummary: ExecutionSummary;
  dataSourceReports: DataSourceReport[];
  modifications: ModificationRecord[];
  errors: ErrorRecord[];
}

// 실행 요약
export interface ExecutionSummary {
  totalDataSources: number;
  totalItemsValidated: number;
  totalItemsUpdated: number;
  totalErrors: number;
  executionTimeMs: number;
  status: 'success' | 'partial' | 'failed';
}

// 데이터 소스별 리포트
export interface DataSourceReport {
  source: DataSourceType;
  sourceName: string;
  itemsValidated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors: number;
  preValidationReport?: PreValidationReport;
}

// 수정 기록
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

// 에러 기록
export interface ErrorRecord {
  timestamp: string;
  agent: string;
  task: string;
  error: string;
  recoverable: boolean;
  retryCount?: number;
}

// ETF 데이터 비교 결과
export interface ETFComparisonResult {
  ticker: string;
  name: string;
  hasDiscrepancy: boolean;
  fields: FieldComparison[];
}

// 필드 비교
export interface FieldComparison {
  field: string;
  currentValue: unknown;
  fetchedValue: unknown;
  match: boolean;
  percentDiff?: number;
}

// 검증 설정
export interface ValidationConfig {
  priceThreshold: number;      // 가격 차이 임계값 (%)
  volumeThreshold: number;     // 거래량 차이 임계값 (%)
  skipIfMarketClosed: boolean; // 시장 폐장 시 건너뛰기
  retryOnError: boolean;       // 에러 시 재시도
  maxRetries: number;          // 최대 재시도 횟수
}

// 기본 검증 설정
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  priceThreshold: 0.1,
  volumeThreshold: 5.0,
  skipIfMarketClosed: false,
  retryOnError: true,
  maxRetries: 3,
};
