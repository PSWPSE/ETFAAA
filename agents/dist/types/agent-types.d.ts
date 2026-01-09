/**
 * ETF Validation Agent Types
 * 에이전트 정의 및 상태 관련 타입
 */
export interface ETFAgentDefinition {
    name: string;
    description: string;
    prompt: string;
    tools: string[];
    model: AgentModel;
    responsibilities: string[];
}
export type AgentModel = 'sonnet' | 'opus' | 'haiku' | 'inherit';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
export type DataSourceType = 'korean-etf' | 'us-etf' | 'indices' | 'forex' | 'commodities';
export interface AgentTask {
    id: string;
    agentName: string;
    taskType: 'validation' | 'modification' | 'report';
    dataSource: DataSourceType;
    status: TaskStatus;
    priority: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    result?: TaskResult;
    error?: string;
}
export interface TaskResult {
    success: boolean;
    itemsProcessed: number;
    itemsUpdated: number;
    itemsFailed: number;
    details: ValidationDetail[];
    report?: string;
}
export interface ValidationDetail {
    id: string;
    ticker: string;
    name: string;
    field: string;
    currentValue: unknown;
    fetchedValue: unknown;
    discrepancy: boolean;
    discrepancyType?: 'price' | 'change' | 'volume' | 'other';
    percentDiff?: number;
    action: 'update' | 'skip' | 'manual_review';
    notes?: string;
}
export interface OrchestratorState {
    sessionId: string;
    date: string;
    tasks: AgentTask[];
    currentPhase: OrchestratorPhase;
    agents: Record<string, AgentStatus>;
}
export type OrchestratorPhase = 'initialization' | 'validation' | 'modification' | 'finalization';
export interface AgentStatus {
    name: string;
    isActive: boolean;
    currentTask?: string;
    tasksCompleted: number;
    lastActivity: Date;
}
export declare const AGENT_NAMES: {
    readonly ORCHESTRATOR: "orchestrator";
    readonly VALIDATION: "validation-agent";
    readonly KOREAN_MODIFIER: "korean-modifier";
    readonly US_MODIFIER: "us-modifier";
    readonly MARKET_MODIFIER: "market-modifier";
};
export type AgentName = typeof AGENT_NAMES[keyof typeof AGENT_NAMES];
//# sourceMappingURL=agent-types.d.ts.map