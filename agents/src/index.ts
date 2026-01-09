#!/usr/bin/env node
/**
 * ETF Validation Agent System
 * 메인 진입점
 */

import {
  runOrchestrator,
  validateKoreanETFs,
  validateUSETFs,
  validateMarketData,
} from './orchestrator.js';
import type { DataSourceType } from './types/index.js';

// CLI 인자 파싱
function parseArgs(): { source?: DataSourceType | 'market' | 'all'; help?: boolean } {
  const args = process.argv.slice(2);
  const result: { source?: DataSourceType | 'market' | 'all'; help?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--source' || arg === '-s') {
      const nextArg = args[i + 1];
      if (nextArg) {
        result.source = nextArg as DataSourceType | 'market' | 'all';
        i++;
      }
    } else if (arg.startsWith('--source=')) {
      result.source = arg.split('=')[1] as DataSourceType | 'market' | 'all';
    }
  }

  return result;
}

// 도움말 출력
function printHelp(): void {
  console.log(`
ETF Validation Agent System
===========================

Usage:
  npm run validate              # Run full validation (all sources)
  npm run validate:korean       # Validate Korean ETFs only
  npm run validate:us           # Validate US ETFs only
  npm run validate:market       # Validate market data only

Options:
  --source, -s <source>   Specify data source to validate
                          Options: korean-etf, us-etf, indices, forex, commodities, market, all
  --help, -h              Show this help message

Examples:
  tsx src/index.ts --source korean-etf
  tsx src/index.ts --source us-etf
  tsx src/index.ts --source market
  tsx src/index.ts                        # Same as --source all

Data Sources:
  korean-etf   - Korean ETFs from Naver Finance (50 items)
  us-etf       - US ETFs from Yahoo Finance (50 items)
  indices      - Global market indices
  forex        - Exchange rates
  commodities  - Commodity prices
  market       - Indices + Forex + Commodities (combined)
  all          - All data sources (default)

Reports:
  Reports are saved to: agents/reports/YYYY-MM-DD/
  - pre-validation-report.md   Pre-validation findings
  - final-report.md            Final execution summary
  - daily-tasks.md             Task completion log
`);
}

// 메인 함수
async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const source = args.source || 'all';

  console.log('');
  console.log('ETF Validation Agent System');
  console.log('===========================');
  console.log('');

  try {
    switch (source) {
      case 'korean-etf':
        console.log('Mode: Korean ETF Validation');
        await validateKoreanETFs();
        break;

      case 'us-etf':
        console.log('Mode: US ETF Validation');
        await validateUSETFs();
        break;

      case 'market':
        console.log('Mode: Market Data Validation');
        await validateMarketData();
        break;

      case 'indices':
      case 'forex':
      case 'commodities':
        console.log(`Mode: ${source} Validation`);
        await runOrchestrator({ sources: [source] });
        break;

      case 'all':
      default:
        console.log('Mode: Full Validation (All Sources)');
        await runOrchestrator();
        break;
    }

    console.log('');
    console.log('Validation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

// 실행
main().catch(console.error);
