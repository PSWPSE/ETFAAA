/**
 * ETF Validation Agent Types
 * 에이전트 정의 및 상태 관련 타입
 */

// 에이전트 정의 인터페이스
export interface ETFAgentDefinition {
  name: string;
  description: string;
  prompt: string;
  tools: string[];
  model: AgentModel;
  responsibilities: string[];
}

// 에이전트 모델 타입
export type AgentModel = 'sonnet' | 'opus' | 'haiku' | 'inherit';

// 태스크 상태
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

// 데이터 소스 타입
export type DataSourceType =
  | 'korean-etf'
  | 'us-etf'
  | 'indices'
  | 'forex'
  | 'commodities';

// 에이전트 태스크 인터페이스
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

// 태스크 결과 인터페이스
export interface TaskResult {
  success: boolean;
  itemsProcessed: number;
  itemsUpdated: number;
  itemsFailed: number;
  details: ValidationDetail[];
  report?: string;
}

// 검증 상세 정보
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

// 오케스트레이터 상태
export interface OrchestratorState {
  sessionId: string;
  date: string;
  tasks: AgentTask[];
  currentPhase: OrchestratorPhase;
  agents: Record<string, AgentStatus>;
}

// 오케스트레이터 단계
export type OrchestratorPhase =
  | 'initialization'
  | 'validation'
  | 'modification'
  | 'finalization';

// 에이전트 상태
export interface AgentStatus {
  name: string;
  isActive: boolean;
  currentTask?: string;
  tasksCompleted: number;
  lastActivity: Date;
}

// 에이전트 이름 상수
export const AGENT_NAMES = {
  ORCHESTRATOR: 'orchestrator',
  VALIDATION: 'validation-agent',
  KOREAN_MODIFIER: 'korean-modifier',
  US_MODIFIER: 'us-modifier',
  MARKET_MODIFIER: 'market-modifier',
} as const;

export type AgentName = typeof AGENT_NAMES[keyof typeof AGENT_NAMES];
