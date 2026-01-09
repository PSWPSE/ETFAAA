/**
 * ETF Validation Orchestrator
 * Claude Agent SDK를 사용한 멀티 에이전트 오케스트레이션
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { DATA_SOURCES } from './config/index.js';
import { getToday, getTimestamp, formatDuration } from './utils/date-utils.js';
import { createDailyDirectories, saveReport, PROJECT_ROOT } from './utils/file-manager.js';
import {
  generateFinalValidationReport,
  generateDailyTaskDocument,
} from './utils/report-generator.js';
import type {
  DataSourceType,
  FinalValidationReport,
  DataSourceReport,
  ModificationRecord,
  ErrorRecord,
} from './types/index.js';

// 오케스트레이터 옵션
export interface OrchestratorOptions {
  date?: string;
  sources?: DataSourceType[];
  dryRun?: boolean;
  verbose?: boolean;
}

// 기본 옵션
const DEFAULT_OPTIONS: OrchestratorOptions = {
  date: getToday(),
  sources: ['korean-etf'],
  dryRun: false,
  verbose: true,
};

// 오케스트레이터 실행
export async function runOrchestrator(options: OrchestratorOptions = {}): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const date = opts.date || getToday();
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log(`ETF Data Validation Orchestrator`);
  console.log(`Date: ${date}`);
  console.log(`Sources: ${opts.sources?.join(', ')}`);
  console.log('='.repeat(60));
  console.log('');

  // 일일 디렉토리 생성
  const { reports: reportsDir, logs: logsDir } = createDailyDirectories(date);
  console.log(`Reports directory: ${reportsDir}`);
  console.log(`Logs directory: ${logsDir}`);
  console.log('');

  // 리포트 데이터 수집
  const dataSourceReports: DataSourceReport[] = [];
  const modifications: ModificationRecord[] = [];
  const errors: ErrorRecord[] = [];

  try {
    console.log('Starting orchestration with Claude Agent SDK...');
    console.log('');

    // 각 데이터 소스에 대해 검증 실행
    for (const source of opts.sources || []) {
      console.log(`\n${'─'.repeat(40)}`);
      console.log(`Processing: ${source}`);
      console.log(`${'─'.repeat(40)}`);

      const sourceConfig = DATA_SOURCES[source];
      if (!sourceConfig) {
        console.error(`Unknown data source: ${source}`);
        continue;
      }

      // 검증 프롬프트 생성
      const validationPrompt = generateValidationPrompt(source, sourceConfig, date);

      let itemsValidated = 0;
      let itemsUpdated = 0;

      // Claude Agent SDK query 실행
      for await (const message of query({
        prompt: validationPrompt,
        options: {
          cwd: PROJECT_ROOT,
          allowedTools: ['Read', 'Edit', 'Glob', 'Grep', 'Bash', 'WebFetch', 'Task'],
          permissionMode: 'acceptEdits', // 파일 수정 자동 허용
          maxTurns: 50,
        },
      })) {
        // 메시지 처리
        if (opts.verbose) {
          handleMessage(message);
        }

        // 수정 카운트 추적
        if (isToolUseMessage(message) && message.name === 'Edit') {
          itemsUpdated++;
        }
      }

      const sourceReport: DataSourceReport = {
        source,
        sourceName: sourceConfig.name,
        itemsValidated,
        itemsUpdated,
        itemsSkipped: 0,
        errors: 0,
      };

      dataSourceReports.push(sourceReport);
    }

    // 최종 리포트 생성
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    const finalReport: FinalValidationReport = {
      date,
      generatedAt: getTimestamp(),
      executionSummary: {
        totalDataSources: opts.sources?.length || 0,
        totalItemsValidated: dataSourceReports.reduce((sum, ds) => sum + ds.itemsValidated, 0),
        totalItemsUpdated: dataSourceReports.reduce((sum, ds) => sum + ds.itemsUpdated, 0),
        totalErrors: errors.length,
        executionTimeMs,
        status: errors.length === 0 ? 'success' : 'partial',
      },
      dataSourceReports,
      modifications,
      errors,
    };

    // 리포트 저장
    const reportContent = generateFinalValidationReport(finalReport);
    const reportPath = saveReport('final-report.md', reportContent, date);
    console.log('');
    console.log(`Final report saved: ${reportPath}`);

    // 일일 태스크 문서 저장
    const taskDocContent = generateDailyTaskDocument(date, dataSourceReports, executionTimeMs);
    const taskDocPath = saveReport('daily-tasks.md', taskDocContent, date);
    console.log(`Daily task document saved: ${taskDocPath}`);

    console.log('');
    console.log('='.repeat(60));
    console.log('Orchestration completed successfully');
    console.log(`Total time: ${formatDuration(executionTimeMs)}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Orchestration failed:', error);

    errors.push({
      timestamp: getTimestamp(),
      agent: 'orchestrator',
      task: 'main',
      error: error instanceof Error ? error.message : String(error),
      recoverable: false,
    });

    throw error;
  }
}

// 검증 프롬프트 생성
function generateValidationPrompt(
  source: DataSourceType,
  sourceConfig: { name: string; baseUrl: string; itemUrl: string },
  date: string
): string {
  if (source === 'korean-etf') {
    return `# 한국 ETF 데이터 검증 태스크

오늘 날짜: ${date}
데이터 소스: ${sourceConfig.name}
URL: ${sourceConfig.baseUrl}

## 목표
한국 ETF 데이터를 네이버 금융에서 검증하고, 불일치가 있으면 TypeScript 파일을 업데이트합니다.

## 단계

### 1. 현재 데이터 확인
- src/data/etf/korean-etfs.ts 파일을 읽어서 현재 저장된 ETF 데이터를 확인하세요.
- 각 ETF의 ticker, price, change, changePercent, volume, nav 값을 파악하세요.

### 2. 실시간 데이터 검증
- WebFetch를 사용하여 네이버 금융에서 실시간 데이터를 가져오세요.
- 예: https://finance.naver.com/item/main.naver?code=069500 (KODEX 200)
- 현재가, 전일대비, 등락률, 거래량, NAV를 추출하세요.

### 3. 데이터 비교 및 업데이트
- 저장된 값과 실시간 값을 비교하세요.
- 차이가 있으면 Edit 도구를 사용하여 korean-etfs.ts 파일을 업데이트하세요.
- 파일 상단의 날짜 주석도 오늘 날짜로 업데이트하세요.

### 4. 검증할 주요 ETF (우선순위)
1. KODEX 200 (069500)
2. TIGER 200 (102110)
3. KODEX 레버리지 (122630)
4. RISE 200 (148020)
5. KODEX 코스닥150 (229200)

## 중요 사항
- 가격은 원 단위 정수로 저장 (예: 67225)
- changePercent는 소수점 두 자리까지 (예: 0.91)
- 각 ETF 업데이트 후 변경 내용을 출력하세요.`;
  }

  return `Validate ${source} data from ${sourceConfig.baseUrl}`;
}

// 메시지 타입 체크
function isToolUseMessage(message: unknown): message is { type: 'tool_use'; name: string } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    (message as Record<string, unknown>).type === 'tool_use'
  );
}

// 메시지 핸들러
function handleMessage(message: unknown): void {
  const msg = message as Record<string, unknown>;

  if (msg.type === 'text' || msg.type === 'assistant') {
    const content = msg.content || msg.text;
    if (content && typeof content === 'string') {
      // 긴 텍스트는 줄여서 출력
      const truncated = content.length > 300 ? content.substring(0, 300) + '...' : content;
      console.log('[Claude]:', truncated);
    }
  } else if (msg.type === 'tool_use') {
    console.log(`[Tool]: ${msg.name}`);
  } else if (msg.type === 'tool_result') {
    console.log(`[Tool Result]: completed`);
  } else if (msg.type === 'system') {
    if (msg.subtype === 'init') {
      console.log(`[Session]: ${(msg as Record<string, unknown>).session_id}`);
    }
  }
}

// 단일 데이터 소스 검증
export async function validateSource(source: DataSourceType): Promise<void> {
  const options: OrchestratorOptions = {
    sources: [source],
    verbose: true,
  };

  await runOrchestrator(options);
}

// 한국 ETF만 검증
export async function validateKoreanETFs(): Promise<void> {
  await validateSource('korean-etf');
}

// 미국 ETF만 검증
export async function validateUSETFs(): Promise<void> {
  await validateSource('us-etf');
}

// 시장 데이터만 검증
export async function validateMarketData(): Promise<void> {
  const options: OrchestratorOptions = {
    sources: ['indices', 'forex', 'commodities'],
    verbose: true,
  };

  await runOrchestrator(options);
}
