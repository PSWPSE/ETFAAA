# ETFAAA 일일 점검 및 데이터 유지보수 가이드

> 마지막 업데이트: 2026-01-09

---

## Part 1: 일일 점검 체크리스트

### 점검 전 준비
```bash
cd ETFAAA
npm run dev
# http://localhost:5174/ 접속
```

---

### 1. 홈 (`/`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 시황 전광판 - 증시 | KOSPI, KOSDAQ, S&P500 등 지수 표시 | `market/indices.ts` |
| [ ] 시황 전광판 - 환율 | USD/KRW, EUR/KRW 등 표시 | `market/forex.ts` |
| [ ] 시황 전광판 - 원자재 | 금, 은, WTI 등 표시 | `market/commodities.ts` |
| [ ] ETF 통계 | 상승/하락 ETF 수 정상 계산 | `etf/korean-etfs.ts`, `etf/us-etfs.ts` |
| [ ] 테마 섹션 | 테마 카드 정상 표시 | `themes/korean-themes.ts`, `themes/us-themes.ts` |
| [ ] 배당 예측 섹션 | 배당 예정 ETF 표시 | `functions/dividends.ts` |

---

### 2. ETF 검색 (`/search`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] ETF 목록 표시 | 한국/미국 ETF 목록 렌더링 | `etf/korean-etfs.ts`, `etf/us-etfs.ts` |
| [ ] 검색 기능 | 이름/티커 검색 동작 | - |
| [ ] 필터 옵션 | 카테고리, 운용사 등 필터 동작 | `functions/filters.ts` |
| [ ] 수익률 표시 | 1일/1주/1개월 등 수익률 | `functions/returns.ts` |

---

### 3. 랭킹 (`/ranking`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 수익률 랭킹 | 기간별 수익률 순위 정렬 | `etf/*.ts`, `functions/returns.ts` |
| [ ] 배당 랭킹 | 배당수익률 순위 정렬 | `etf/*.ts` (dividendYield) |
| [ ] 운용규모 랭킹 | AUM 순위 정렬 | `etf/*.ts` (aum) |
| [ ] 탭 전환 | 한국/미국 시장 전환 | - |

---

### 4. 비교분석 (`/compare`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] ETF 선택 | 검색 및 선택 동작 | `etf/*.ts` |
| [ ] 차트 표시 | 가격 비교 차트 렌더링 | `price-history/index.ts` |
| [ ] 수익률 비교 | 기간별 수익률 비교표 | `functions/returns.ts` |
| [ ] 위험지표 비교 | 샤프지수, MDD 등 표시 | `functions/risk-metrics.ts` |

---

### 5. 투자 실험실 (`/simulator`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 시뮬레이션 입력 | 금액, 기간 입력 동작 | - |
| [ ] 결과 차트 | 성장 시뮬레이션 차트 | `functions/returns.ts` (getGrowthSimulation) |
| [ ] ETF 선택 | ETF 검색 및 추가 | `etf/*.ts` |

---

### 6. 배당캘린더 (`/calendar`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 캘린더 표시 | 월별 배당 일정 표시 | `functions/dividends.ts` |
| [ ] 배당 상세 | 클릭 시 상세 정보 | `etf/*.ts` |

---

### 7. 국면분석 (`/phase`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 과열/공포 구간 | RSI 기반 구간 분류 | `functions/technical.ts` |
| [ ] 추세 분석 | 단기/중기/장기 추세 | `functions/technical.ts` |
| [ ] ETF 목록 | 각 구간별 ETF 표시 | `etf/*.ts` |

---

### 8. 연관도 (`/correlation`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 기준 ETF 선택 | 검색 및 선택 동작 | `etf/*.ts` |
| [ ] 상관관계 매트릭스 | 양의/음의 상관 표시 | `functions/similar.ts` |
| [ ] 상관 ETF 목록 | 관련 ETF 표시 | `functions/filters.ts` (correlations) |

---

### 9. 테마 (`/theme`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 테마 목록 | 카테고리별 테마 표시 | `themes/korean-themes.ts`, `themes/us-themes.ts` |
| [ ] 테마 검색 | 테마명 검색 동작 | - |
| [ ] Top10/Bottom8 | 수익률 상위/하위 테마 | themes/*.ts (avgReturn) |
| [ ] 테마별 ETF | 테마 클릭 시 ETF 목록 | `etf/*.ts` (themes 필드) |

---

### 10. ETF 상세 (`/etf/:id`)

| 항목 | 확인 내용 | 관련 데이터 파일 |
|------|----------|-----------------|
| [ ] 기본 정보 | 이름, 티커, 운용사, 가격 표시 | `etf/*.ts` |
| [ ] 가격 차트 | 1M/3M/6M/1Y/전체 차트 렌더링 | `price-history/index.ts` |
| [ ] 투자 포인트 | 고수익/고배당/저비용/저위험/고유동성 | `etf/*.ts`, `functions/returns.ts` |
| [ ] 투자전략 | 추적지수, 운용목표 표시 | `etf/*.ts` (themes, name), `functions/fund-info.ts` |
| [ ] 구성종목 | Top 보유종목 비중 표시 | `etf/*.ts` (holdings) |
| [ ] 배당 정보 | 배당수익률, 배당 이력 | `functions/dividends.ts` |
| [ ] 수익률 탭 | 기간별/월별 수익률 | `functions/returns.ts` |
| [ ] 리스크 탭 | 샤프지수, MDD, 변동성 | `functions/risk-metrics.ts` |
| [ ] 기술적 분석 | RSI, MACD, 스토캐스틱 | `functions/technical.ts` |
| [ ] 관련 뉴스 | 최근 뉴스 목록 | `functions/fund-info.ts` |

---

## Part 2: 데이터 유지보수 가이드

### 데이터 파일 구조

```
src/data/
├── index.ts                    # 메인 export (수정 불필요)
├── etf/
│   ├── korean-etfs.ts          # ★ 한국 ETF (매일 업데이트)
│   └── us-etfs.ts              # ★ 미국 ETF (매일 업데이트)
├── themes/
│   ├── korean-themes.ts        # 한국 테마 (주간 업데이트)
│   └── us-themes.ts            # 미국 테마 (주간 업데이트)
├── market/
│   ├── indices.ts              # ★ 시장 지수 (매일 업데이트)
│   ├── forex.ts                # ★ 환율 (매일 업데이트)
│   └── commodities.ts          # ★ 원자재 (매일 업데이트)
├── price-history/
│   └── index.ts                # 자동 생성 (수정 불필요)
└── functions/
    └── *.ts                    # 계산 함수 (수정 불필요)
```

---

### 핵심 데이터 파일 상세

#### 1. ETF 데이터 (`etf/korean-etfs.ts`, `etf/us-etfs.ts`)

**업데이트 주기**: 매일 (장 마감 후)

**필드 설명**:
```typescript
{
  id: string;              // 고유 ID (변경 금지)
  name: string;            // ETF 이름
  ticker: string;          // 종목코드
  issuer: string;          // 운용사
  category: string;        // 카테고리 (국내주식, 채권, 원자재 등)
  themes: string[];        // 테마 태그 배열

  // ★ 매일 업데이트 필드
  price: number;           // 현재가
  change: number;          // 전일대비 금액
  changePercent: number;   // 등락률 (%)
  volume: number;          // 거래량
  nav: number;             // NAV (순자산가치)

  // 주간/월간 업데이트 필드
  marketCap: number;       // 시가총액
  aum: number;             // 순자산총액
  dividendYield: number;   // 배당수익률 (%)

  // 고정 필드 (변경 거의 없음)
  expenseRatio: number;    // 총보수 (%)
  inceptionDate: string;   // 설정일
  personalPension: boolean;    // 개인연금
  retirementPension: boolean;  // 퇴직연금
  holdings: Holding[];     // 주요 보유종목
}
```

**업데이트 예시**:
```typescript
// korean-etfs.ts 1번째 ETF 업데이트
{
  id: 'kr-1',
  name: 'KODEX 200',
  ticker: '069500',
  // ... 고정 필드 ...

  // 아래 필드만 업데이트
  price: 67225,           // ← 오늘 종가
  change: 605,            // ← 전일대비
  changePercent: 0.91,    // ← 등락률
  volume: 4754173,        // ← 거래량
  nav: 67254,             // ← NAV
}
```

**데이터 출처**:
- 한국 ETF: 네이버 금융 (https://finance.naver.com)
- 미국 ETF: Yahoo Finance (https://finance.yahoo.com)

---

#### 2. 시장 지수 (`market/indices.ts`)

**업데이트 주기**: 매일

**필드 설명**:
```typescript
{
  symbol: string;          // 심볼 (^KS11)
  name: string;            // 지수명
  value: number;           // ★ 현재값 (매일 업데이트)
  change: number;          // ★ 전일대비 (매일 업데이트)
  changePercent: number;   // ★ 등락률 (매일 업데이트)
  region: string;          // 국기 이모지
}
```

**지수 목록**:
- 아시아: KOSPI, KOSDAQ, 니케이225, 항셍, 상하이, 센섹스, SET
- 북미: S&P500, NASDAQ, 다우존스, TSX
- 유럽: FTSE100, DAX, CAC40, FTSE MIB, IBEX35

---

#### 3. 환율 (`market/forex.ts`)

**업데이트 주기**: 매일

**필드 설명**:
```typescript
{
  pair: string;            // 통화쌍 (USD/KRW)
  name: string;            // 표시명
  rate: number;            // ★ 환율 (매일 업데이트)
  change: number;          // ★ 전일대비 (매일 업데이트)
  changePercent: number;   // ★ 등락률 (매일 업데이트)
}
```

---

#### 4. 원자재 (`market/commodities.ts`)

**업데이트 주기**: 매일

**필드 설명**:
```typescript
{
  symbol: string;          // 심볼 (GC=F)
  name: string;            // 원자재명
  price: number;           // ★ 가격 (매일 업데이트)
  change: number;          // ★ 전일대비 (매일 업데이트)
  changePercent: number;   // ★ 등락률 (매일 업데이트)
  unit: string;            // 단위 ($/oz)
}
```

---

#### 5. 테마 (`themes/korean-themes.ts`, `themes/us-themes.ts`)

**업데이트 주기**: 주간

**필드 설명**:
```typescript
{
  id: string;                    // 고유 ID
  name: string;                  // 테마명
  description: string;           // 설명
  category: string;              // 카테고리 (index, sector, strategy 등)
  etfCount: number;              // ★ 테마 내 ETF 수 (주간 업데이트)
  avgReturn: number;             // ★ 평균 수익률 (주간 업데이트)
  representativeETFId: string;   // 대표 ETF ID
}
```

---

#### 6. 투자전략 데이터 (`functions/fund-info.ts`)

**현재 방식**: ETF 유형별 자동 생성 (테마 기반 차별화된 설명)

**투자전략 설명 생성 원리**:

ETF 상세 페이지의 "투자전략" 섹션은 `generateInvestmentStrategy()` 함수에서 ETF 유형에 따라 차별화된 설명을 자동 생성합니다.

**지원되는 ETF 유형별 설명**:

| ETF 유형 | 테마 키워드 | 설명 예시 |
|---------|------------|----------|
| 반도체 | `반도체`, `Semiconductor` | "반도체 설계, 제조, 장비 기업에 집중 투자..." |
| AI/기술 | `AI`, `Technology` | "인공지능, 클라우드, 소프트웨어 등 첨단 기술 기업..." |
| 2차전지 | `2차전지`, `전기차`, `Clean Energy` | "배터리, 전기차, 신재생에너지 밸류체인..." |
| 배당 | `배당`, `Dividend`, `Income` | "안정적인 배당을 지급하는 우량 기업..." |
| 채권 | `채권`, `Bond`, `Treasury` | "채권 포트폴리오에 투자하여 안정적인 이자 수익..." |
| 단기금융 | `CD금리`, `KOFR`, `MMF` | "초단기 금융상품으로, 현금성 자산 운용에 적합..." |
| 원자재 | `금`, `Gold`, `Silver`, `원유` | "실물 자산 가격 변동에 연동, 인플레이션 헷지..." |
| 바이오 | `바이오`, `헬스케어`, `Healthcare` | "제약, 바이오텍, 의료기기, 헬스케어 서비스..." |
| 조선/방산 | `조선`, `방산` | "한국의 조선/방산 관련 핵심 기업에 집중 투자..." |
| 리츠 | `REIT`, `Real Estate` | "오피스, 물류센터, 데이터센터 등 부동산 간접 투자..." |
| 레버리지 | 이름에 `레버리지`, `2X`, `3X` | "일간 수익률을 N배로 추종하는 레버리지 상품..." |
| 인버스 | 이름에 `인버스` | "역방향으로 추종하는 인버스 상품..." |
| 시장지수 | `KOSPI`, `S&P500`, `NASDAQ` | "시장의 대표 기업들에 분산 투자..." |

**추적지수 매핑 (trackingIndexMap)**:

60개+ 키워드를 실제 지수명으로 매핑:
```typescript
'KOSPI200' → 'KOSPI 200'
'Semiconductor' → 'PHLX Semiconductor'
'Dividend' → 'Dow Jones US Dividend 100'
'Bond' → 'Bloomberg US Aggregate Bond'
// ... 등
```

---

**🔄 향후 개선: 실제 데이터 스크래핑**

현재는 템플릿 기반 자동 생성이지만, 더 정확한 투자전략을 위해 실제 데이터 스크래핑 가능:

**데이터 출처**:
- 네이버 금융: `https://finance.naver.com/item/main.nhn?code={ticker}`
- 각 운용사 사이트:
  - 삼성자산운용: `https://www.samsungfund.com`
  - 미래에셋: `https://www.miraeasset.com`
- KRX (한국거래소): `https://www.krx.co.kr`

**구현 방법** (추후):
```typescript
// ETF 데이터에 investmentStrategy 필드 추가
{
  id: 'kr-12',
  name: 'KODEX 반도체',
  // ... 기존 필드 ...
  investmentStrategy: '이 투자신탁은 FnGuide 반도체 지수를 기초지수로...' // 실제 스크래핑 데이터
}
```

**새 ETF 추가 시 투자전략 확인**:
1. `themes[]` 배열에 적절한 테마 키워드 포함 (반도체, NASDAQ, Dividend 등)
2. 레버리지/인버스 ETF는 이름에 "레버리지", "2X", "3X", "인버스" 포함
3. 상세 페이지(`/etf/{id}`)에서 "투자전략" 섹션이 ETF 유형에 맞게 표시되는지 확인

---

### 메뉴 → 데이터 매핑 요약표

| 메뉴 | 필수 데이터 파일 | 업데이트 우선순위 |
|------|-----------------|------------------|
| 홈 | `market/*`, `etf/*`, `themes/*` | 높음 |
| ETF 검색 | `etf/*`, `functions/filters.ts` | 높음 |
| 랭킹 | `etf/*`, `functions/returns.ts` | 높음 |
| 비교분석 | `etf/*`, `price-history/*` | 중간 |
| 투자 실험실 | `etf/*` | 중간 |
| 배당캘린더 | `etf/*`, `functions/dividends.ts` | 중간 |
| 국면분석 | `etf/*`, `functions/technical.ts` | 낮음 |
| 연관도 | `etf/*`, `functions/similar.ts` | 낮음 |
| 테마 | `themes/*`, `etf/*` | 중간 |
| **ETF 상세** | `etf/*`, `functions/*` (전체) | 높음 |

---

### 빠른 업데이트 순서 (일일)

1. **시장 데이터** (3개 파일)
   - `market/indices.ts` - 글로벌 지수
   - `market/forex.ts` - 환율
   - `market/commodities.ts` - 원자재

2. **ETF 데이터** (2개 파일)
   - `etf/korean-etfs.ts` - 한국 ETF (price, change, changePercent, volume)
   - `etf/us-etfs.ts` - 미국 ETF (price, change, changePercent, volume)

3. **파일 상단 날짜 업데이트**
   - 각 파일 첫 줄의 기준일 수정
   - 예: `// 한국 ETF 데이터 (2026-01-10 종가 기준, 네이버 금융)`

---

### 데이터 검증 방법

```bash
# 1. TypeScript 타입 체크
npm run build

# 2. 개발 서버 실행
npm run dev

# 3. 각 메뉴 확인
# http://localhost:5174/
```

**확인 포인트**:
- 콘솔에 에러 없음
- 모든 ETF 목록 정상 표시
- 수치가 합리적인 범위 내 (등락률 -10% ~ +10%)
- 차트 및 그래프 정상 렌더링

---

### 자주 발생하는 오류

| 오류 | 원인 | 해결 방법 |
|------|------|----------|
| `undefined is not iterable` | ETF 배열이 비어있음 | `koreanETFs`/`usETFs` 데이터 확인 |
| 차트 미표시 | 가격 데이터 누락 | `price` 필드 확인 |
| NaN 표시 | 숫자 필드에 문자열 | 타입 확인 (number로 변환) |
| 테마 연결 안됨 | themes 배열 불일치 | ETF의 themes와 Theme.id 매칭 확인 |

---

## 부록 A: 데이터 출처 링크

- **네이버 금융**: https://finance.naver.com
- **Yahoo Finance**: https://finance.yahoo.com
- **한국거래소**: https://www.krx.co.kr
- **ETF CHECK**: https://www.etfcheck.co.kr

---

## 부록 B: Claude Code 서브에이전트 활용

### 서브에이전트 개요

일일 점검을 자동화하기 위해 4개의 서브에이전트가 준비되어 있습니다.

| 에이전트 | 파일 | 역할 |
|----------|------|------|
| `daily-checker` | `.claude/agents/daily-checker.md` | 일일 점검 총괄 |
| `etf-data-validator` | `.claude/agents/etf-data-validator.md` | 로컬 데이터 검증 |
| `etf-ui-checker` | `.claude/agents/etf-ui-checker.md` | UI 점검 (Hyperbrowser) |
| `etf-data-fetcher` | `.claude/agents/etf-data-fetcher.md` | 웹 데이터 크롤링 |

### 서브에이전트 위치

```
ETFAAA/
└── .claude/
    └── agents/
        ├── daily-checker.md        # 일일 점검 총괄
        ├── etf-data-fetcher.md     # 데이터 수집
        ├── etf-data-validator.md   # 데이터 검증
        └── etf-ui-checker.md       # UI 점검
```

### 사용 방법

#### 전체 일일 점검 실행
```
"일일 점검 실행해줘"
"daily check 해줘"
"전체 데이터 점검"
```

#### 개별 에이전트 실행
```
"데이터 파일 검증해줘"      → etf-data-validator 자동 호출
"UI 점검해줘"              → etf-ui-checker 자동 호출
"ETF 데이터 수집해줘"       → etf-data-fetcher 자동 호출
```

### 워크플로우

```
┌─────────────────┐
│  daily-checker  │ ← 일일 점검 요청
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│데이터 │ │  UI   │
│ 검증  │ │ 점검  │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌─────────────────┐
│   결과 리포트    │
└─────────────────┘
         │
         ▼ (데이터 오래된 경우)
┌─────────────────┐
│  데이터 수집    │
└─────────────────┘
```

### MCP 도구 활용

#### Hyperbrowser MCP (UI 점검 & 데이터 수집)
```
mcp__hyperbrowser__scrape_webpage     - 웹페이지 스크래핑
mcp__hyperbrowser__extract_structured_data - 구조화 데이터 추출
```

#### Chrome MCP (UI 점검)
```
mcp__claude-in-chrome__navigate       - URL 이동
mcp__claude-in-chrome__computer       - 스크린샷/클릭
mcp__claude-in-chrome__read_page      - 페이지 분석
mcp__claude-in-chrome__read_console_messages - 콘솔 에러 확인
```

### 서브에이전트 수정 방법

1. `.claude/agents/` 폴더의 해당 .md 파일 편집
2. YAML 프론트매터에서 설정 수정:
   - `name`: 에이전트 식별자
   - `description`: 자동 호출 트리거 키워드
   - `model`: 사용 모델 (sonnet/opus)
   - `color`: UI 표시 색상

3. 마크다운 본문에서 상세 동작 수정

### 새 에이전트 추가 예시

```markdown
---
name: my-custom-agent
description: |
  커스텀 작업을 수행하는 에이전트.
  예: "커스텀 작업 실행"
model: sonnet
color: orange
---

# 커스텀 에이전트

## 역할
...

## 작업 흐름
...
```

### 점검 결과 상태 코드

| 상태 | 의미 | 조치 |
|------|------|------|
| `PASS` | 모든 검증 통과 | 정상 운영 |
| `WARNING` | 경고 발생 | 확인 권장 |
| `FAIL` | 오류 발생 | 수정 필요 |
| `CRITICAL` | 치명적 오류 | 즉시 수정 |

### 권장 점검 스케줄

| 시간 | 작업 | 에이전트 |
|------|------|----------|
| 08:30 | 데이터 검증 | etf-data-validator |
| 08:35 | 데이터 수집 (필요시) | etf-data-fetcher |
| 09:00 | UI 점검 | etf-ui-checker |

### 참고 문서

- [Claude Code Subagents 공식 문서](https://code.claude.com/docs/en/sub-agents)
- [Claude Code 커스터마이징 가이드](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)

---

## 부록 C: 향후 개선 TODO

### 실제 주가 데이터 연동

현재 차트 데이터(`price-history/index.ts`)는 더미 데이터로 생성됩니다. 향후 실제 주가 데이터로 교체가 필요합니다.

**현재 상태**: 더미 데이터 (시스템 날짜 기준 동적 생성)

**개선 방안**:

| 방안 | 설명 | 장단점 |
|------|------|--------|
| 정적 JSON 파일 | 실제 데이터를 JSON으로 저장 | 백엔드 불필요, 수동 업데이트 필요 |
| Yahoo Finance API | 실시간 데이터 조회 | 자동 업데이트, CORS/호출제한 이슈 |
| 프록시 백엔드 | 서버에서 API 호출 후 전달 | 가장 안정적, 서버 구축 필요 |

**관련 파일**:
- `src/data/price-history/index.ts` - 차트 데이터 생성 함수
- `src/pages/DetailPage.tsx` - ETF 상세 차트
- `src/pages/ComparePage.tsx` - 비교 분석 차트
- `src/pages/SimulatorPage.tsx` - 시뮬레이터 차트

**작업 우선순위**: 낮음 (기능적으로는 정상 동작)

---

### 투자전략 실제 데이터 스크래핑

현재 투자전략 설명은 ETF 유형별 템플릿으로 자동 생성됩니다. 향후 실제 펀드 투자설명서 데이터로 교체가 필요합니다.

**현재 상태**: 테마 기반 자동 생성 (13+ 유형별 템플릿)

**데이터 출처**:
- 한국 ETF: 금융투자협회 전자공시 (https://dis.kofia.or.kr)
- 미국 ETF: SEC EDGAR (https://www.sec.gov/edgar)

**관련 파일**:
- `src/data/functions/fund-info.ts` - `generateInvestmentStrategy()` 함수

**작업 우선순위**: 중간
