# ETF AAA - ETF 분석 및 비교 플랫폼

국내/해외 ETF의 상세 정보, 비교 분석, 상관관계 분석, 투자 시뮬레이션 등을 제공하는 종합 ETF 분석 플랫폼입니다.

## 🚀 주요 기능

### 📊 ETF 탐색 및 분석
- **ETF 목록**: 국내/해외 ETF 실시간 조회 및 필터링
- **상세 정보**: 가격 차트, 기간별 수익률, 구성종목, 배당 정보
- **심층 분석**: 월별 수익률, 기술적 분석, 위험지표, 상관관계

### 🔍 비교 및 분석 도구
- **ETF 비교**: 최대 4개 ETF 동시 비교 (수익률, 위험도, 비용 등)
- **상관관계 분석**: 기준 ETF와 양의/음의 상관관계 ETF 자동 분석
- **테마 분석**: 산업별, 전략별 테마 수익률 비교

### 💡 투자 도구
- **투자 시뮬레이션**: 과거 데이터 기반 투자 수익률 실험
- **국면 분석**: 단기/중기/장기 시장 국면 종합 분석
- **포트폴리오**: 관심 ETF 저장 및 관리

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: CSS Modules
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone <새로운-저장소-URL>
cd etfaaa

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 외부 접속 (모바일 테스트 등)

개발 서버는 `0.0.0.0`으로 바인딩되어 있어 같은 네트워크의 다른 기기에서 접속 가능합니다.

```bash
# 서버 실행 후 표시되는 Network 주소로 접속
# 예: http://192.168.x.x:5173
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── common/       # 공통 컴포넌트 (Button, Card, Badge 등)
│   └── layout/       # 레이아웃 컴포넌트 (Header, Sidebar, Layout)
├── pages/            # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── DetailPage.tsx
│   ├── ComparePage.tsx
│   ├── CorrelationPage.tsx
│   ├── SimulatorPage.tsx
│   ├── PhasePage.tsx
│   ├── ThemePage.tsx
│   └── PortfolioPage.tsx
├── data/             # 데이터 및 API
│   └── etfs.ts       # ETF 데이터 및 헬퍼 함수
├── store/            # 전역 상태 관리 (Zustand)
│   └── etfStore.ts
├── types/            # TypeScript 타입 정의
│   └── etf.ts
├── utils/            # 유틸리티 함수
│   └── format.ts
├── App.tsx           # 앱 라우팅
└── main.tsx          # 앱 엔트리 포인트
```

## 🎨 디자인 시스템

- **색상**: CSS 변수 기반 테마 시스템
- **타이포그래피**: 본고딕(Noto Sans KR) + 시스템 폰트
- **간격**: 8px 기반 스케일
- **반응형**: 모바일 퍼스트 디자인
- **애니메이션**: CSS transitions + 키프레임

## 🔧 개발 가이드

### 코드 스타일

```bash
# ESLint 실행
npm run lint
```

### 컴포넌트 작성 규칙

1. **CSS Modules** 사용
2. **TypeScript** 타입 정의 필수
3. **함수형 컴포넌트** + Hooks
4. **Props 인터페이스** 명시
5. **CSS 변수** 활용

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정
- `refactor/*`: 리팩토링

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 스타일 변경 (코드 포맷팅, 세미콜론 누락 등)
docs: 문서 수정
test: 테스트 코드
chore: 빌드 프로세스 또는 보조 도구 변경
```

## 📝 주요 페이지

### 홈 (`/`)
- ETF 목록 및 필터링
- 시장별 전환 (국내/해외)
- 카테고리별 분류

### ETF 상세 (`/etf/:id`)
- 가격 차트 및 메트릭스
- 핵심 키워드
- 탭별 정보 (개요, 구성종목, 배당, 심층분석, 뉴스)

### ETF 비교 (`/compare`)
- 최대 4개 ETF 선택
- 수익률, 위험도, 비용 비교
- 시각적 차트 제공

### 상관관계 분석 (`/correlation`)
- 기준 ETF 선택
- 상관관계 매트릭스
- 양의/음의 상관관계 ETF 목록

### 투자 시뮬레이션 (`/simulator`)
- 기간 설정 및 투자금액 입력
- 실제 과거 데이터 기반 시뮬레이션
- 수익률 및 총액 계산

### 국면 분석 (`/phase`)
- 단기/중기/장기 국면 분석
- 기술적 지표 (RSI, MACD, 이동평균)
- 국면별 수익률 비교

### 테마 분석 (`/theme`)
- 산업/섹터별 테마 분류
- 기간별 수익률 순위
- 히트맵 시각화

## 🤝 협업 가이드

### 이슈 작성
1. 명확한 제목 작성
2. 재현 방법 또는 요구사항 상세 기술
3. 스크린샷/영상 첨부 (UI 관련)
4. 라벨 지정 (bug, enhancement, question 등)

### Pull Request
1. 기능별로 작은 단위로 분리
2. 변경사항 명확히 기술
3. 스크린샷 첨부 (UI 변경 시)
4. 리뷰 요청

### 코드 리뷰 포인트
- 타입 안정성
- 성능 최적화
- 접근성 (a11y)
- 반응형 디자인
- 코드 가독성

## 📄 라이선스

이 프로젝트는 협업 목적으로 제작되었습니다.

## 👥 기여자

협업에 참여하시는 모든 분들을 환영합니다!

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.

---

**Made with ❤️ by Alpha Bridge Team**

