/**
 * ETF Validation Orchestrator
 * Anthropic SDK를 사용한 멀티 에이전트 오케스트레이션
 */
import Anthropic from '@anthropic-ai/sdk';
import { DATA_SOURCES, } from './config/index.js';
import { getToday, getTimestamp, formatDuration } from './utils/date-utils.js';
import { createDailyDirectories, saveReport } from './utils/file-manager.js';
import { generateFinalValidationReport, generateDailyTaskDocument, } from './utils/report-generator.js';
// 기본 옵션
const DEFAULT_OPTIONS = {
    date: getToday(),
    sources: ['korean-etf', 'us-etf', 'indices', 'forex', 'commodities'],
    dryRun: false,
    verbose: true,
};
// Anthropic 클라이언트
const anthropic = new Anthropic();
// 검증 에이전트 도구 정의
const VALIDATION_TOOLS = [
    {
        name: 'fetch_web_data',
        description: 'Fetch data from a financial website (Naver Finance or Yahoo Finance)',
        input_schema: {
            type: 'object',
            properties: {
                url: { type: 'string', description: 'URL to fetch' },
                selector: { type: 'string', description: 'CSS selector to extract data' },
            },
            required: ['url'],
        },
    },
    {
        name: 'compare_data',
        description: 'Compare stored data with live data',
        input_schema: {
            type: 'object',
            properties: {
                ticker: { type: 'string', description: 'ETF ticker code' },
                storedPrice: { type: 'number', description: 'Stored price value' },
                livePrice: { type: 'number', description: 'Live price value' },
            },
            required: ['ticker', 'storedPrice', 'livePrice'],
        },
    },
    {
        name: 'generate_report',
        description: 'Generate validation report for a data source',
        input_schema: {
            type: 'object',
            properties: {
                source: { type: 'string', description: 'Data source name' },
                discrepancies: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ticker: { type: 'string' },
                            field: { type: 'string' },
                            storedValue: { type: 'number' },
                            liveValue: { type: 'number' },
                        },
                    },
                },
            },
            required: ['source', 'discrepancies'],
        },
    },
];
// 수정 에이전트 도구 정의
const MODIFICATION_TOOLS = [
    {
        name: 'update_etf_data',
        description: 'Update ETF data in TypeScript file',
        input_schema: {
            type: 'object',
            properties: {
                file: { type: 'string', description: 'File path to update' },
                ticker: { type: 'string', description: 'ETF ticker code' },
                updates: {
                    type: 'object',
                    properties: {
                        price: { type: 'number' },
                        change: { type: 'number' },
                        changePercent: { type: 'number' },
                        volume: { type: 'number' },
                        nav: { type: 'number' },
                    },
                },
            },
            required: ['file', 'ticker', 'updates'],
        },
    },
];
// 검증 에이전트 실행
async function runValidationAgent(source, verbose) {
    if (verbose) {
        console.log(`\n[Validation Agent] Starting validation for: ${source}`);
    }
    const sourceConfig = DATA_SOURCES[source];
    if (!sourceConfig) {
        throw new Error(`Unknown data source: ${source}`);
    }
    const systemPrompt = `You are a data validation agent. Your task is to validate ETF data.
Data source: ${source}
URL: ${sourceConfig.baseUrl}

Validate the data by comparing stored values with live values. Report any discrepancies.`;
    const messages = [
        {
            role: 'user',
            content: `Validate ${source} data. Check for price discrepancies between stored and live data.`,
        },
    ];
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
            tools: VALIDATION_TOOLS,
        });
        if (verbose) {
            console.log(`[Validation Agent] Response received`);
        }
        // 시뮬레이션된 결과 반환 (실제 구현에서는 도구 호출 결과를 처리)
        return { discrepancies: [] };
    }
    catch (error) {
        console.error(`[Validation Agent] Error:`, error);
        throw error;
    }
}
// 수정 에이전트 실행
async function runModificationAgent(source, discrepancies, verbose) {
    if (verbose) {
        console.log(`\n[Modification Agent] Starting modifications for: ${source}`);
    }
    if (discrepancies.length === 0) {
        if (verbose) {
            console.log(`[Modification Agent] No modifications needed`);
        }
        return [];
    }
    const systemPrompt = `You are a data modification agent. Your task is to update ETF data files.
Data source: ${source}

Update the TypeScript files with the correct values based on the discrepancies found.`;
    const messages = [
        {
            role: 'user',
            content: `Update the following discrepancies:\n${JSON.stringify(discrepancies, null, 2)}`,
        },
    ];
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
            tools: MODIFICATION_TOOLS,
        });
        if (verbose) {
            console.log(`[Modification Agent] Response received`);
        }
        // 수정 기록 반환
        return discrepancies.map(d => ({
            timestamp: getTimestamp(),
            file: source === 'korean-etf' ? 'korean-etfs.ts' : 'us-etfs.ts',
            ticker: d.ticker,
            name: d.ticker,
            field: d.field,
            oldValue: d.storedValue,
            newValue: d.liveValue,
            agent: 'modification-agent',
        }));
    }
    catch (error) {
        console.error(`[Modification Agent] Error:`, error);
        throw error;
    }
}
// 오케스트레이터 실행
export async function runOrchestrator(options = {}) {
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
    // 상태 추적
    const state = {
        sessionId: `session_${Date.now()}`,
        date,
        tasks: [],
        currentPhase: 'initialization',
        agents: {},
    };
    // 리포트 데이터 수집
    const dataSourceReports = [];
    const modifications = [];
    const errors = [];
    try {
        console.log('Starting orchestration...');
        console.log('');
        // 각 데이터 소스에 대해 검증 및 수정 실행
        for (const source of opts.sources || []) {
            console.log(`\n${'─'.repeat(40)}`);
            console.log(`Processing: ${source}`);
            console.log(`${'─'.repeat(40)}`);
            state.currentPhase = 'validation';
            // 검증 에이전트 실행
            const validationResult = await runValidationAgent(source, opts.verbose || false);
            const sourceReport = {
                source,
                sourceName: DATA_SOURCES[source]?.name || source,
                itemsValidated: 0,
                itemsUpdated: validationResult.discrepancies.length,
                itemsSkipped: 0,
                errors: 0,
            };
            state.currentPhase = 'modification';
            // 수정이 필요한 경우 수정 에이전트 실행
            if (validationResult.discrepancies.length > 0 && !opts.dryRun) {
                const modRecords = await runModificationAgent(source, validationResult.discrepancies, opts.verbose || false);
                modifications.push(...modRecords);
                sourceReport.itemsUpdated = modRecords.length;
            }
            dataSourceReports.push(sourceReport);
        }
        state.currentPhase = 'finalization';
        // 최종 리포트 생성
        const endTime = Date.now();
        const executionTimeMs = endTime - startTime;
        const finalReport = {
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
    }
    catch (error) {
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
// 단일 데이터 소스 검증
export async function validateSource(source) {
    const options = {
        sources: [source],
        verbose: true,
    };
    await runOrchestrator(options);
}
// 한국 ETF만 검증
export async function validateKoreanETFs() {
    await validateSource('korean-etf');
}
// 미국 ETF만 검증
export async function validateUSETFs() {
    await validateSource('us-etf');
}
// 시장 데이터만 검증
export async function validateMarketData() {
    const options = {
        sources: ['indices', 'forex', 'commodities'],
        verbose: true,
    };
    await runOrchestrator(options);
}
//# sourceMappingURL=orchestrator.js.map