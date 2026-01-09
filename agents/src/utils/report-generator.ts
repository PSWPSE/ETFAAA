/**
 * Report Generator
 * 마크다운 리포트 생성 유틸리티
 */

import type {
  PreValidationReport,
  FinalValidationReport,
  ModificationRecord,
  ErrorRecord,
  DataSourceReport,
} from '../types/index.js';
import { getTimestamp, formatDuration } from './date-utils.js';

// Pre-Validation 리포트 생성
export function generatePreValidationReport(report: PreValidationReport): string {
  const lines: string[] = [];

  lines.push(`# Pre-Validation Report`);
  lines.push(`**Date**: ${report.date}`);
  lines.push(`**Generated**: ${report.generatedAt}`);
  lines.push(`**Data Source**: ${report.dataSource}`);
  lines.push(`**Source URL**: ${report.sourceUrl}`);
  lines.push('');

  lines.push(`## Summary`);
  lines.push(`- **Total Items**: ${report.totalItems}`);
  lines.push(`- **Items Checked**: ${report.itemsChecked}`);
  lines.push(`- **Discrepancies Found**: ${report.discrepancies.length}`);
  lines.push(`- **Potential Issues**: ${report.potentialIssues.length}`);
  lines.push('');

  if (report.discrepancies.length > 0) {
    lines.push(`## Discrepancies`);
    lines.push('');

    // 높은 우선순위 (5% 이상 차이)
    const highPriority = report.discrepancies.filter(d => (d.percentDiff || 0) > 5);
    if (highPriority.length > 0) {
      lines.push(`### High Priority (>5% difference)`);
      lines.push('| Ticker | Name | Field | Current | Fetched | Diff % | Action |');
      lines.push('|--------|------|-------|---------|---------|--------|--------|');
      for (const d of highPriority) {
        lines.push(`| ${d.ticker} | ${d.name} | ${d.field} | ${d.currentValue} | ${d.fetchedValue} | ${(d.percentDiff || 0).toFixed(2)}% | ${d.action.toUpperCase()} |`);
      }
      lines.push('');
    }

    // 일반 업데이트
    const normalUpdates = report.discrepancies.filter(d => (d.percentDiff || 0) <= 5);
    if (normalUpdates.length > 0) {
      lines.push(`### Standard Updates`);
      lines.push('| Ticker | Name | Field | Current | Fetched | Diff % | Action |');
      lines.push('|--------|------|-------|---------|---------|--------|--------|');
      for (const d of normalUpdates) {
        lines.push(`| ${d.ticker} | ${d.name} | ${d.field} | ${d.currentValue} | ${d.fetchedValue} | ${(d.percentDiff || 0).toFixed(2)}% | ${d.action.toUpperCase()} |`);
      }
      lines.push('');
    }
  }

  if (report.potentialIssues.length > 0) {
    lines.push(`## Potential Issues`);
    for (let i = 0; i < report.potentialIssues.length; i++) {
      const issue = report.potentialIssues[i];
      lines.push(`${i + 1}. **${issue.severity.toUpperCase()}**: ${issue.description}`);
      lines.push(`   - Category: ${issue.category}`);
      lines.push(`   - Affected Items: ${issue.affectedItems.join(', ')}`);
      lines.push(`   - Recommended: ${issue.suggestedAction}`);
      lines.push('');
    }
  }

  if (report.recommendations.length > 0) {
    lines.push(`## Recommendations`);
    for (let i = 0; i < report.recommendations.length; i++) {
      lines.push(`${i + 1}. ${report.recommendations[i]}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Final Validation 리포트 생성
export function generateFinalValidationReport(report: FinalValidationReport): string {
  const lines: string[] = [];

  lines.push(`# Daily ETF Data Validation Report`);
  lines.push(`**Date**: ${report.date}`);
  lines.push(`**Generated**: ${report.generatedAt}`);
  lines.push(`**Execution Time**: ${formatDuration(report.executionSummary.executionTimeMs)}`);
  lines.push(`**Status**: ${report.executionSummary.status.toUpperCase()}`);
  lines.push('');

  lines.push(`## Execution Summary`);
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Data Sources Processed | ${report.executionSummary.totalDataSources} |`);
  lines.push(`| Total Items Validated | ${report.executionSummary.totalItemsValidated} |`);
  lines.push(`| Items Updated | ${report.executionSummary.totalItemsUpdated} |`);
  lines.push(`| Total Errors | ${report.executionSummary.totalErrors} |`);
  lines.push('');

  lines.push(`## Data Source Results`);
  lines.push('');
  for (const ds of report.dataSourceReports) {
    lines.push(`### ${ds.sourceName} (${ds.source})`);
    lines.push(`- Validated: ${ds.itemsValidated} | Updated: ${ds.itemsUpdated} | Skipped: ${ds.itemsSkipped} | Errors: ${ds.errors}`);
    lines.push('');
  }

  if (report.modifications.length > 0) {
    lines.push(`## Modification Log`);
    lines.push('| Time | File | Ticker | Field | Old Value | New Value |');
    lines.push('|------|------|--------|-------|-----------|-----------|');
    for (const m of report.modifications.slice(0, 50)) { // 최대 50개만 표시
      const time = m.timestamp.split('T')[1]?.split('.')[0] || m.timestamp;
      lines.push(`| ${time} | ${m.file.split('/').pop()} | ${m.ticker} | ${m.field} | ${m.oldValue} | ${m.newValue} |`);
    }
    if (report.modifications.length > 50) {
      lines.push(`| ... | (${report.modifications.length - 50} more) | ... | ... | ... | ... |`);
    }
    lines.push('');
  }

  if (report.errors.length > 0) {
    lines.push(`## Errors & Issues`);
    for (let i = 0; i < report.errors.length; i++) {
      const e = report.errors[i];
      lines.push(`${i + 1}. **${e.agent}** - ${e.task}: ${e.error}`);
      if (e.recoverable) {
        lines.push(`   - Status: Recoverable (Retry: ${e.retryCount || 0})`);
      } else {
        lines.push(`   - Status: Non-recoverable, manual intervention required`);
      }
    }
    lines.push('');
  }

  lines.push(`## Next Steps`);
  lines.push(`1. Verify UI displays updated data correctly`);
  lines.push(`2. Review any flagged items requiring manual attention`);
  lines.push(`3. Schedule next validation`);
  lines.push('');

  return lines.join('\n');
}

// Modification 리포트 생성
export function generateModificationReport(
  dataSource: string,
  date: string,
  modifications: ModificationRecord[]
): string {
  const lines: string[] = [];

  lines.push(`# ${dataSource} Modification Report`);
  lines.push(`**Date**: ${date}`);
  lines.push(`**Generated**: ${getTimestamp()}`);
  lines.push(`**Total Modifications**: ${modifications.length}`);
  lines.push('');

  if (modifications.length === 0) {
    lines.push('No modifications were made.');
    return lines.join('\n');
  }

  lines.push(`## Modifications`);
  lines.push('');
  lines.push('| Time | Ticker | Name | Field | Old Value | New Value | Agent |');
  lines.push('|------|--------|------|-------|-----------|-----------|-------|');

  for (const m of modifications) {
    const time = m.timestamp.split('T')[1]?.split('.')[0] || m.timestamp;
    lines.push(`| ${time} | ${m.ticker} | ${m.name} | ${m.field} | ${m.oldValue} | ${m.newValue} | ${m.agent} |`);
  }
  lines.push('');

  return lines.join('\n');
}

// 일일 태스크 문서 생성
export function generateDailyTaskDocument(
  date: string,
  dataSourceReports: DataSourceReport[],
  totalDurationMs: number
): string {
  const lines: string[] = [];

  lines.push(`# Daily Task Report - ${date}`);
  lines.push(`**Generated**: ${getTimestamp()}`);
  lines.push(`**Total Duration**: ${formatDuration(totalDurationMs)}`);
  lines.push('');

  lines.push(`## Tasks Completed`);
  lines.push('');

  let taskNumber = 1;
  for (const ds of dataSourceReports) {
    const status = ds.errors === 0 ? 'COMPLETED' : 'PARTIAL';
    lines.push(`### ${taskNumber}. ${ds.sourceName}`);
    lines.push(`- **Status**: ${status}`);
    lines.push(`- **Items Validated**: ${ds.itemsValidated}`);
    lines.push(`- **Items Updated**: ${ds.itemsUpdated}`);
    lines.push(`- **Items Skipped**: ${ds.itemsSkipped}`);
    lines.push(`- **Errors**: ${ds.errors}`);
    lines.push('');
    taskNumber++;
  }

  lines.push(`## Summary`);
  const totalValidated = dataSourceReports.reduce((sum, ds) => sum + ds.itemsValidated, 0);
  const totalUpdated = dataSourceReports.reduce((sum, ds) => sum + ds.itemsUpdated, 0);
  const totalErrors = dataSourceReports.reduce((sum, ds) => sum + ds.errors, 0);

  lines.push(`- **Total Data Sources**: ${dataSourceReports.length}`);
  lines.push(`- **Total Items Validated**: ${totalValidated}`);
  lines.push(`- **Total Items Updated**: ${totalUpdated}`);
  lines.push(`- **Total Errors**: ${totalErrors}`);
  lines.push('');

  return lines.join('\n');
}
