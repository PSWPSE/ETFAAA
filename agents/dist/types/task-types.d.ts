/**
 * Task Management Types
 * 태스크 관리 관련 타입
 */
import type { DataSourceType, TaskStatus } from './agent-types.js';
export interface DailyTaskDocument {
    date: string;
    createdAt: string;
    updatedAt: string;
    status: 'in_progress' | 'completed' | 'failed';
    tasks: TaskEntry[];
    summary?: DailyTaskSummary;
}
export interface TaskEntry {
    id: string;
    order: number;
    name: string;
    description: string;
    agent: string;
    dataSource?: DataSourceType;
    status: TaskStatus;
    startTime?: string;
    endTime?: string;
    duration?: number;
    result?: TaskEntryResult;
    notes?: string[];
}
export interface TaskEntryResult {
    success: boolean;
    itemsProcessed: number;
    itemsUpdated: number;
    errors: number;
    reportPath?: string;
}
export interface DailyTaskSummary {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalItemsUpdated: number;
    totalErrors: number;
    totalDurationMs: number;
    dataSourcesProcessed: DataSourceType[];
}
export interface TaskQueueItem {
    task: TaskEntry;
    priority: number;
    dependencies: string[];
    retryCount: number;
}
export interface TaskEvent {
    type: TaskEventType;
    taskId: string;
    timestamp: string;
    data?: unknown;
}
export type TaskEventType = 'task_created' | 'task_started' | 'task_progress' | 'task_completed' | 'task_failed' | 'task_retrying';
export interface ProgressUpdate {
    taskId: string;
    current: number;
    total: number;
    message: string;
    percentage: number;
}
export interface CreateTaskOptions {
    name: string;
    description: string;
    agent: string;
    dataSource?: DataSourceType;
    priority?: number;
    dependencies?: string[];
}
export interface TaskFilter {
    status?: TaskStatus[];
    agent?: string[];
    dataSource?: DataSourceType[];
    dateFrom?: string;
    dateTo?: string;
}
export declare function generateTaskId(): string;
export declare function getReportPath(date: string, filename: string): string;
export declare function getLogPath(date: string, filename: string): string;
//# sourceMappingURL=task-types.d.ts.map