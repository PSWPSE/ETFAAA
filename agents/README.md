# ETF Validation Agent System

Claude Agent SDK를 활용한 ETF 데이터 자동 검증 및 업데이트 시스템

## 구조

```
agents/
├── package.json              # 의존성 정의
├── tsconfig.json             # TypeScript 설정
├── src/
│   ├── index.ts              # 메인 진입점
│   ├── orchestrator.ts       # 오케스트레이터 로직
│   ├── config/
│   │   ├── agent-config.ts   # 에이전트 정의
│   │   ├── data-sources.ts   # 데이터 소스 URL
│   │   └── validation-rules.ts # 검증 규칙
│   ├── types/
│   │   ├── agent-types.ts    # 에이전트 타입
│   │   ├── validation-types.ts # 검증 타입
│   │   └── task-types.ts     # 태스크 타입
│   └── utils/
│       ├── date-utils.ts     # 날짜 유틸리티
│       ├── report-generator.ts # 리포트 생성
│       └── file-manager.ts   # 파일 관리
├── reports/                  # 날짜별 리포트
│   └── YYYY-MM-DD/
│       ├── pre-validation-report.md
│       ├── final-report.md
│       └── daily-tasks.md
└── logs/                     # 날짜별 로그
```

## 에이전트

1. **Orchestrator**: 전체 조율, 태스크 분배, 최종 리포트 생성
2. **Validation Agent (Agent1)**: Chrome MCP로 웹 데이터 추출, 검증
3. **Korean Modifier (Agent2a)**: 한국 ETF 데이터 수정
4. **US Modifier (Agent2b)**: 미국 ETF 데이터 수정
5. **Market Modifier (Agent2c)**: 시장 데이터 수정

## 설치

```bash
cd agents
npm install
```

## 사용법

```bash
# 전체 검증 (모든 데이터 소스)
npm run validate

# 한국 ETF만 검증
npm run validate:korean

# 미국 ETF만 검증
npm run validate:us

# 시장 데이터만 검증 (지수, 환율, 원자재)
npm run validate:market
```

## 데이터 소스

| 소스 | 설명 | URL |
|------|------|-----|
| korean-etf | 한국 ETF 50개 | 네이버 금융 |
| us-etf | 미국 ETF 50개 | Yahoo Finance |
| indices | 글로벌 시장 지수 | Yahoo/Naver |
| forex | 환율 | 네이버 금융 |
| commodities | 원자재 | Yahoo Finance |

## 리포트

검증 실행 후 `reports/YYYY-MM-DD/` 폴더에 리포트가 생성됩니다:

- `pre-validation-report.md`: 1차 검증 결과
- `final-report.md`: 최종 실행 요약
- `daily-tasks.md`: 태스크 완료 로그

## 워크플로우

1. **초기화**: 리포트 디렉토리 생성, 현재 데이터 확인
2. **검증 (Agent1)**: 웹사이트 접속 → 데이터 추출 → 비교
3. **수정 (Agent2a/b/c)**: 2차 검증 → TypeScript 파일 수정
4. **완료**: 리포트 생성 및 저장
