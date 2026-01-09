/**
 * File Manager
 * 파일 시스템 유틸리티
 */
export declare const PROJECT_ROOT: string;
export declare const AGENTS_ROOT: string;
export declare function getReportsDir(date?: string): string;
export declare function getLogsDir(date?: string): string;
export declare function ensureDir(dirPath: string): void;
export declare function createDailyDirectories(date?: string): {
    reports: string;
    logs: string;
};
export declare function saveReport(filename: string, content: string, date?: string): string;
export declare function saveLog(filename: string, content: string, date?: string): string;
export declare function appendLog(filename: string, content: string, date?: string): void;
export declare function readFile(filePath: string): string | null;
export declare function fileExists(filePath: string): boolean;
export declare function getDataFilePath(relativePath: string): string;
export declare function listReports(date?: string): string[];
export declare function listReportDates(): string[];
export declare function getRecentReports(days?: number): Record<string, string[]>;
export declare function backupFile(filePath: string): string | null;
//# sourceMappingURL=file-manager.d.ts.map