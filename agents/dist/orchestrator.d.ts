/**
 * ETF Validation Orchestrator
 * Anthropic SDK를 사용한 멀티 에이전트 오케스트레이션
 */
import type { DataSourceType } from './types/index.js';
export interface OrchestratorOptions {
    date?: string;
    sources?: DataSourceType[];
    dryRun?: boolean;
    verbose?: boolean;
}
export declare function runOrchestrator(options?: OrchestratorOptions): Promise<void>;
export declare function validateSource(source: DataSourceType): Promise<void>;
export declare function validateKoreanETFs(): Promise<void>;
export declare function validateUSETFs(): Promise<void>;
export declare function validateMarketData(): Promise<void>;
//# sourceMappingURL=orchestrator.d.ts.map