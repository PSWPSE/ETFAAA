/**
 * Task Management Types
 * 태스크 관리 관련 타입
 */

import type { DataSourceType, TaskStatus } from './agent-types.js';

// 일일 태스크 문서
export interface DailyTaskDocument {
  date: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed' | 'failed';
  tasks: TaskEntry[];
  summary?: DailyTaskSummary;
}

// 태스크 항목
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

// 태스크 결과
export interface TaskEntryResult {
  success: boolean;
  itemsProcessed: number;
  itemsUpdated: number;
  errors: number;
  reportPath?: string;
}

// 일일 태스크 요약
export interface DailyTaskSummary {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalItemsUpdated: number;
  totalErrors: number;
  totalDurationMs: number;
  dataSourcesProcessed: DataSourceType[];
}

// 태스크 큐 항목
export interface TaskQueueItem {
  task: TaskEntry;
  priority: number;
  dependencies: string[];
  retryCount: number;
}

// 태스크 이벤트
export interface TaskEvent {
  type: TaskEventType;
  taskId: string;
  timestamp: string;
  data?: unknown;
}

export type TaskEventType =
  | 'task_created'
  | 'task_started'
  | 'task_progress'
  | 'task_completed'
  | 'task_failed'
  | 'task_retrying';

// 진행 상황 업데이트
export interface ProgressUpdate {
  taskId: string;
  current: number;
  total: number;
  message: string;
  percentage: number;
}

// 태스크 생성 옵션
export interface CreateTaskOptions {
  name: string;
  description: string;
  agent: string;
  dataSource?: DataSourceType;
  priority?: number;
  dependencies?: string[];
}

// 태스크 필터
export interface TaskFilter {
  status?: TaskStatus[];
  agent?: string[];
  dataSource?: DataSourceType[];
  dateFrom?: string;
  dateTo?: string;
}

// 태스크 ID 생성 함수
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 날짜 기반 리포트 경로 생성
export function getReportPath(date: string, filename: string): string {
  return `reports/${date}/${filename}`;
}

// 날짜 기반 로그 경로 생성
export function getLogPath(date: string, filename: string): string {
  return `logs/${date}/${filename}`;
}
