/**
 * Report Generator
 * 마크다운 리포트 생성 유틸리티
 */
import type { PreValidationReport, FinalValidationReport, ModificationRecord, DataSourceReport } from '../types/index.js';
export declare function generatePreValidationReport(report: PreValidationReport): string;
export declare function generateFinalValidationReport(report: FinalValidationReport): string;
export declare function generateModificationReport(dataSource: string, date: string, modifications: ModificationRecord[]): string;
export declare function generateDailyTaskDocument(date: string, dataSourceReports: DataSourceReport[], totalDurationMs: number): string;
//# sourceMappingURL=report-generator.d.ts.map