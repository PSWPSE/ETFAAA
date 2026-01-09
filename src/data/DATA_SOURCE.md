# ETF 데이터 소스 문서

## 개요
이 문서는 ETF AA 프로젝트에서 사용되는 데이터의 출처와 수집 방법을 설명합니다.

**기준일**: 2025-01-08 (종가 기준)

---

## 1. 데이터 파일 구조

```
src/data/
├── index.ts                 # 메인 export (기존 호환성 유지)
├── market/
│   ├── indices.ts           # 글로벌 시장 지수
│   ├── forex.ts             # 환율 데이터
│   ├── commodities.ts       # 원자재 데이터
│   └── index.ts
├── etf/
│   ├── korean-etfs.ts       # 한국 ETF 50개
│   ├── us-etfs.ts           # 미국/해외 ETF 50개
│   └── index.ts
├── themes/
│   ├── korean-themes.ts     # 한국 테마
│   ├── us-themes.ts         # 미국/글로벌 테마
│   └── index.ts
├── price-history/
│   └── index.ts             # 가격 히스토리 생성 함수
└── functions/
    ├── returns.ts           # 수익률 함수
    ├── dividends.ts         # 배당 함수
    ├── risk-metrics.ts      # 위험 지표
    ├── holdings.ts          # 보유종목/구성
    ├── technical.ts         # 기술적 분석
    ├── analysis.ts          # ETF 분석
    ├── similar.ts           # 유사 ETF
    ├── fund-info.ts         # 펀드 정보
    ├── filters.ts           # 필터 옵션
    └── index.ts
```

---

## 2. 데이터 출처

### 2.1 시장 지수 (market/indices.ts)

**데이터 소스**: 네이버 금융 (finance.naver.com), Yahoo Finance

| 지역 | 지수 | 심볼 | 2025-01-08 종가 |
|------|------|------|-----------------|
| 한국 | KOSPI | ^KS11 | 2,521.05 (+0.19%) |
| 한국 | KOSDAQ | ^KQ11 | 725.43 (-0.30%) |
| 일본 | 니케이225 | ^N225 | 39,981.06 (+0.26%) |
| 홍콩 | 항셍지수 | ^HSI | 19,447.58 (-0.45%) |
| 중국 | 상하이종합 | 000001.SS | 3,211.39 (+0.56%) |
| 인도 | 센섹스 | ^BSESN | 78,199.11 (+0.30%) |
| 태국 | SET지수 | ^SET | 1,352.74 (-0.32%) |
| 미국 | S&P 500 | ^GSPC | 5,909.03 (-1.11%) |
| 미국 | NASDAQ | ^IXIC | 19,489.68 (-1.19%) |
| 미국 | 다우존스 | ^DJI | 42,528.36 (-0.42%) |
| 캐나다 | TSX종합 | ^GSPTSE | 24,987.35 (+0.18%) |
| 영국 | FTSE 100 | ^FTSE | 8,251.03 (+0.07%) |
| 독일 | DAX | ^GDAXI | 20,317.10 (+0.51%) |
| 프랑스 | CAC 40 | ^FCHI | 7,490.28 (+0.52%) |

**수집 방법**:
- Chrome MCP를 통한 네이버 금융 페이지 스크린샷 확인
- Yahoo Finance API 참조

### 2.2 환율 (market/forex.ts)

**데이터 소스**: 네이버 금융, Yahoo Finance (KRW=X)

| 통화쌍 | 2025-01-08 종가 | 변동 |
|--------|-----------------|------|
| USD/KRW | 1,450.51 | +0.23% |
| EUR/KRW | 1,498.25 | -0.19% |
| JPY/KRW (100엔) | 9.28 | +0.22% |
| CNY/KRW | 198.92 | -0.18% |

### 2.3 원자재 (market/commodities.ts)

**데이터 소스**: Yahoo Finance, Investing.com

| 원자재 | 심볼 | 2025-01-08 종가 | 단위 |
|--------|------|-----------------|------|
| 금 | GC=F | $2,659.80 | $/oz |
| 은 | SI=F | $30.15 | $/oz |
| WTI 원유 | CL=F | $73.92 | $/배럴 |
| 천연가스 | NG=F | $3.58 | $/MMBtu |

---

## 3. ETF 데이터

### 3.1 한국 ETF (etf/korean-etfs.ts)

**데이터 소스**: 네이버 금융 ETF 시세 페이지
- URL: https://finance.naver.com/sise/etf.naver
- 개별 ETF: https://finance.naver.com/item/main.naver?code={종목코드}

**수집 항목**:
- 종목코드 (ticker)
- 현재가 (price) - 종가 기준
- 전일대비 (change)
- 등락률 (changePercent)
- 거래량 (volume)
- 시가총액 (marketCap)
- 순자산총액 (aum)
- 총보수 (expenseRatio)
- 배당수익률 (dividendYield)
- 설정일 (inceptionDate)
- NAV (nav)

**포함된 ETF 카테고리** (50개):
- 시장대표 지수: KODEX 200, TIGER 200, KBSTAR 200, KODEX 코스닥150 등
- 반도체: KODEX 반도체, TIGER 반도체, SOL 반도체 등
- 2차전지: TIGER 2차전지테마, KODEX 2차전지산업 등
- 배당: ARIRANG 고배당주, KODEX 고배당, TIGER 배당프리미엄 등
- 채권: KODEX 단기채권PLUS, TIGER 국채3년 등
- 원자재: KODEX 골드선물, TIGER 원유선물 등
- 레버리지/인버스: KODEX 레버리지, KODEX 인버스 등

### 3.2 미국 상장 ETF (etf/us-etfs.ts)

**데이터 소스**: Yahoo Finance (https://finance.yahoo.com)
- 개별 ETF: https://finance.yahoo.com/quote/{티커}

**수집 항목**:
- 티커 (ticker) - 예: SPY, QQQ, VOO
- 현재가 (price) - USD 종가 기준
- 전일대비 (change)
- 등락률 (changePercent)
- 거래량 (volume)
- 시가총액 (marketCap)
- 순자산총액 (aum)
- 총보수 (expenseRatio)
- 배당수익률 (dividendYield)
- 설정일 (inceptionDate)

**포함된 ETF 카테고리** (50개):

| 카테고리 | ETF 예시 | 2025-01-08 종가 |
|----------|----------|-----------------|
| S&P 500 지수 | SPY, VOO, IVV | SPY: $589.58 |
| 나스닥 100 | QQQ, QQQM | QQQ: $524.02 |
| 다우존스 | DIA | DIA: $425.15 |
| 전체시장 | VTI | VTI: $285.42 |
| 소형주 | IWM | IWM: $224.85 |
| 섹터 (기술) | XLK | XLK: $228.45 |
| 섹터 (금융) | XLF | XLF: $48.92 |
| 섹터 (헬스케어) | XLV | XLV: $145.23 |
| 섹터 (에너지) | XLE | XLE: $89.45 |
| 반도체 | SOXX, SMH | SOXX: $235.67 |
| 배당 | SCHD, VYM, DVY | SCHD: $81.25 |
| 성장주 | VUG, IWF | VUG: $385.12 |
| 가치주 | VTV, IWD | VTV: $165.78 |
| 채권 (종합) | BND, AGG | BND: $71.85 |
| 채권 (장기) | TLT | TLT: $87.92 |
| 채권 (단기) | SHY, SGOV | SHY: $82.15 |
| 채권 (회사채) | LQD | LQD: $106.45 |
| 채권 (하이일드) | HYG | HYG: $77.82 |
| 금 | GLD, IAU | GLD: $245.32 |
| 은 | SLV | SLV: $27.85 |
| 국제 (선진국) | VEA, EFA | VEA: $48.25 |
| 국제 (신흥국) | VWO, EEM | VWO: $43.15 |
| 테마 (AI/로봇) | BOTZ | BOTZ: $28.45 |
| 테마 (클린에너지) | ICLN | ICLN: $12.85 |
| 테마 (혁신) | ARKK | ARKK: $52.35 |
| 테마 (사이버보안) | BUG | BUG: $32.15 |
| 리츠 | VNQ, IYR | VNQ: $89.45 |
| 레버리지 | TQQQ, SSO | TQQQ: $78.25 |
| 인버스 | SH, SDS | SH: $13.25 |

**주요 운용사**:
- State Street (SPDR): SPY, XLK, XLF 등
- Vanguard: VOO, VTI, VEA, VWO, BND 등
- BlackRock (iShares): IVV, IWM, AGG, EFA, EEM 등
- Invesco: QQQ, QQQM
- Schwab: SCHD
- ARK Invest: ARKK

---

## 4. 가격 히스토리 (price-history/)

**데이터 생성 방식**: 시뮬레이션 기반

30일 가격 히스토리는 현재 종가를 기준으로 역산하여 생성됩니다:

```typescript
// 카테고리별 변동성 설정
- 채권/MMF: 0.1% (매우 낮음)
- 일반 주식: 1.5% (기본)
- 반도체/AI: 2.2% (높음)
- 2차전지: 2.5% (높음)
- 레버리지: 3.0% (매우 높음)
```

**생성 데이터**:
- date: 날짜 (YYYY-MM-DD)
- open: 시가
- high: 고가
- low: 저가
- close: 종가 (마지막 데이터는 실제 종가와 일치)
- volume: 거래량

---

## 5. 테마 데이터 (themes/)

**데이터 소스**: 네이버 금융 테마/업종별 시세, ETF 분류 기준

### 5.1 한국 테마 (themes/korean-themes.ts)

| 카테고리 | 테마 예시 |
|----------|-----------|
| index | KOSPI200, KOSDAQ150, KRX300, MSCI Korea |
| sector | 반도체, 2차전지, 바이오/헬스케어, 자동차, 금융, 조선, 방산, AI |
| strategy | 배당주, 커버드콜, 성장주, 가치주, TR(배당재투자) |
| asset | 채권, 금, 원유, 리츠/부동산, 머니마켓, CD금리 |
| leverage | 레버리지, 인버스 |

### 5.2 미국/글로벌 테마 (themes/us-themes.ts)

| 카테고리 | 테마 예시 |
|----------|-----------|
| index | S&P500, NASDAQ100, 다우존스, 러셀2000 |
| sector | 빅테크, AI/인공지능, 반도체(미국), 클라우드, 헬스케어 |
| bond | 미국채, 미국 단기채, 미국 장기채, TIPS |
| strategy | 미국 배당주, 미국 커버드콜, 퀄리티 |
| region | 중국, 인도, 일본, 베트남, 선진국, 신흥국 |
| commodity | 금(해외), 은, 원유(해외) |
| theme | 전기차, 클린에너지, 메타버스, 로봇/자동화, 사이버보안 |

---

## 6. 함수 데이터 (functions/)

대부분의 분석 함수는 ETF 기본 데이터를 기반으로 계산/시뮬레이션됩니다:

| 함수 | 설명 | 데이터 소스 |
|------|------|-------------|
| getReturns | 기간별 수익률 | changePercent 기반 계산 |
| getDividends | 배당 이력 | dividendYield 기반 생성 |
| getRiskMetrics | 위험 지표 | 카테고리별 변동성 기반 |
| getHoldings | 구성종목 | ETF holdings 데이터 |
| getTechnicalIndicators | 기술적 지표 | 가격 데이터 기반 계산 |
| getPhaseAnalysis | 국면 분석 | RSI, MACD 계산 |

---

## 7. 데이터 업데이트 방법

### 실시간 데이터 업데이트 시:

1. **시장 지수/환율/원자재**:
   - `src/data/market/` 폴더의 파일 수정
   - 네이버 금융 또는 Yahoo Finance에서 종가 확인

2. **한국 ETF 가격 데이터**:
   - `src/data/etf/korean-etfs.ts` 수정
   - 네이버 금융 ETF 시세에서 종가 확인

3. **미국 ETF 가격 데이터**:
   - `src/data/etf/us-etfs.ts` 수정
   - Yahoo Finance에서 USD 종가 확인

4. **테마 수익률**:
   - `src/data/themes/` 폴더의 avgReturn 값 수정

### 네이버 금융 URL 참조 (한국 ETF):
- ETF 전체 목록: https://finance.naver.com/sise/etf.naver
- ETF 상세: https://finance.naver.com/item/main.naver?code={종목코드}
- 일별 시세: https://finance.naver.com/item/sise_day.naver?code={종목코드}

### Yahoo Finance URL 참조 (미국 ETF):
- ETF 상세: https://finance.yahoo.com/quote/{티커}
- 예: https://finance.yahoo.com/quote/SPY
- 예: https://finance.yahoo.com/quote/QQQ

---

## 8. 주의사항

1. **종가 기준**: 모든 가격 데이터는 종가(close) 기준입니다.
2. **통화 단위**:
   - 한국 ETF: 원화(KRW) 기준
   - 미국 ETF: 달러(USD) 기준
3. **시뮬레이션 데이터**: 30일 가격 히스토리, 배당 이력 등은 시뮬레이션으로 생성됩니다.
4. **실제 서비스 적용 시**: API 연동 또는 실시간 데이터 피드 필요
5. **환율 영향**: 미국 ETF 투자 시 USD/KRW 환율 변동이 원화 기준 수익률에 영향을 미칩니다.

---

## 9. 라이선스 및 출처

- **네이버 금융**: https://finance.naver.com
- **Yahoo Finance**: https://finance.yahoo.com
- **한국거래소 (KRX)**: https://www.krx.co.kr

데이터는 교육 및 개발 목적으로만 사용됩니다.
