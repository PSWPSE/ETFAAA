# 배경 시스템 가이드 (Background System Guide)

## 개요

ETF AAA 서비스는 etf.com 스타일을 참고하여 **레이어드 배경 시스템(Layered Background System)**을 구현했습니다. 이 시스템은 모든 컴포넌트와 **내부 세부 요소들**에서 일관된 배경색을 사용하여 시각적 계층감과 콘텐츠 집중도를 향상시킵니다.

## 배경 레이어 구조

```
┌─────────────────────────────────────────┐
│ Layer 0 (#f5f5f5) - Page Background    │  ← 가장 뒤 (가장 어두움)
│  ┌──────────────────────────────────┐  │
│  │ Layer 1 (#f8f9fa) - Sidebar     │  │  ← 중간
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Layer 2 (#ffffff) - Content     │  │  ← 가장 앞 (가장 밝음)
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## CSS 변수 정의

`src/styles/index.css`에 정의된 배경 시스템 변수:

```css
/* Background System - Layered Architecture */
--bg-layer-0: #f5f5f5;        /* Page base background (가장 뒤) */
--bg-layer-1: #f8f9fa;        /* Sidebar, Navigation (중간) */
--bg-layer-2: #ffffff;        /* Content cards, Main content (가장 앞) */
--bg-layer-header: #ffffff;   /* Header background */
--bg-layer-modal: #ffffff;    /* Modal, Dialog background */
```

## 레이어별 사용 위치 (상세)

### Layer 0 (페이지 베이스 배경)
- **변수**: `var(--bg-layer-0)`
- **색상**: `#f5f5f5`
- **사용 위치**:
  - `Layout.tsx` - 전체 페이지 베이스 배경

### Layer 1 (사이드바/네비게이션)
- **변수**: `var(--bg-layer-1)`
- **색상**: `#f8f9fa`
- **사용 위치**:
  - **Sidebar 컴포넌트**:
    - `.sidebar` - 사이드바 컨테이너
    - `.logoSection` - 로고 영역
    - `.nav` - 네비게이션 영역
    - `.footer` - 푸터 영역
  - **Header 컴포넌트**:
    - `.searchInput` - 검색 입력창 (기본 상태)
    - `.iconButton:hover` - 아이콘 버튼 호버 상태

### Layer 2 (콘텐츠 카드)
- **변수**: `var(--bg-layer-2)`
- **색상**: `#ffffff`
- **사용 위치**:
  - `Card.tsx` - 모든 콘텐츠 카드
  - **Header 컴포넌트**:
    - `.searchInput:focus` - 검색 입력창 포커스 상태
  - ETF 정보 카드
  - 랭킹 리스트 아이템
  - 데이터 테이블

### Header Layer
- **변수**: `var(--bg-layer-header)`
- **색상**: `#ffffff`
- **사용 위치**:
  - `Header.tsx`
    - `.header` - 헤더 컨테이너
    - `.headerInner` - 헤더 내부 영역
    - `.mobileSearchOverlay` - 모바일 검색 오버레이
  - `BottomNav.tsx` - 하단 네비게이션 (모바일)
  - **알림 배지**:
    - `.notiBadge` - border 색상

### Modal Layer
- **변수**: `var(--bg-layer-modal)`
- **색상**: `#ffffff`
- **사용 위치**:
  - `Modal.tsx` - 모달 대화상자
  - `MobileMenu.tsx` - 모바일 메뉴
  - `BottomNav.tsx` - 더보기 메뉴

### Transparent (투명)
- **값**: `transparent`
- **사용 위치**:
  - `PageContainer.tsx`
    - `.pageContainer` - 페이지 컨테이너 (Layer 0 배경 상속)
    - `.pageHeader` - 페이지 헤더
    - `.pageContent` - 페이지 콘텐츠
  - **Sidebar 컴포넌트**:
    - `.navItem` - 네비게이션 아이템 (기본 상태)

## 인터랙션 상태별 배경색

### Sidebar 네비게이션
```css
/* 기본 상태 */
.navItem {
  background: transparent;
}

/* 호버 상태 */
.navItem:hover {
  background: rgba(95, 155, 143, 0.08);  /* Sage Green 8% 투명도 */
}

/* 활성 상태 */
.navItem.active {
  background: var(--color-brand-lighter);  /* #e8f4f1 */
}
```

### Header 검색창
```css
/* 기본 상태 */
.searchInput {
  background: var(--bg-layer-1);  /* #f8f9fa */
}

/* 포커스 상태 */
.searchInput:focus {
  background: var(--bg-layer-2);  /* #ffffff */
}
```

### Header 아이콘 버튼
```css
/* 호버 상태 */
.iconButton:hover {
  background: var(--bg-layer-1);  /* #f8f9fa */
}
```

## 컴포넌트별 배경 규칙 요약

| 컴포넌트 | 요소 | 배경색 | 비고 |
|---------|------|--------|------|
| Layout | .layout | `--bg-layer-0` | 페이지 전체 |
| Sidebar | .sidebar | `--bg-layer-1` | 사이드바 컨테이너 |
| Sidebar | .logoSection | `--bg-layer-1` | 로고 영역 |
| Sidebar | .nav | `--bg-layer-1` | 네비게이션 영역 |
| Sidebar | .footer | `--bg-layer-1` | 푸터 영역 |
| Sidebar | .navItem | `transparent` | 기본 상태 |
| Sidebar | .navItem:hover | `rgba(95,155,143,0.08)` | 호버 상태 |
| Sidebar | .navItem.active | `--color-brand-lighter` | 활성 상태 |
| Header | .header | `--bg-layer-header` | 헤더 컨테이너 |
| Header | .headerInner | `--bg-layer-header` | 헤더 내부 |
| Header | .searchInput | `--bg-layer-1` | 검색창 기본 |
| Header | .searchInput:focus | `--bg-layer-2` | 검색창 포커스 |
| Header | .iconButton:hover | `--bg-layer-1` | 버튼 호버 |
| PageContainer | .pageContainer | `transparent` | Layer 0 상속 |
| PageContainer | .pageHeader | `transparent` | Layer 0 상속 |
| PageContainer | .pageContent | `transparent` | Layer 0 상속 |
| Card | .card | `--bg-layer-2` | 콘텐츠 카드 |
| Modal | .modal | `--bg-layer-modal` | 모달 |
| BottomNav | .bottomNav | `--bg-layer-header` | 하단 네비 |

## 새로운 컴포넌트 생성 가이드

### 1. 페이지 레벨 컴포넌트
```css
.myPage {
  /* 배경색 지정 안 함 - Layout의 --bg-layer-0 자동 상속 */
}
```

### 2. 사이드바/네비게이션 컴포넌트
```css
.myNav {
  background: var(--bg-layer-1);
}

.myNavItem {
  background: transparent;
}

.myNavItem:hover {
  background: rgba(95, 155, 143, 0.08);
}

.myNavItem.active {
  background: var(--color-brand-lighter);
}
```

### 3. 콘텐츠 카드
```css
.myCard {
  background: var(--bg-layer-2);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}
```

### 4. 헤더/푸터
```css
.myHeader {
  background: var(--bg-layer-header);
}
```

### 5. 모달/다이얼로그
```css
.myModal {
  background: var(--bg-layer-modal);
}
```

## 디자인 원칙

### 1. 명시적 배경색 선언
- 모든 주요 컴포넌트는 명시적으로 배경색을 선언
- 암묵적 상속에 의존하지 않음
- 예외: PageContainer와 같이 부모 배경을 투과해야 하는 경우 `transparent` 사용

### 2. 색상 계층화
- 배경 → 중간 레이어 → 콘텐츠 순으로 밝아짐
- 각 레이어 간 5-10% 정도의 부드러운 대비

### 3. 일관된 인터랙션
- 호버: Sage Green 8% 투명도
- 활성: `--color-brand-lighter` 사용
- 포커스: 더 밝은 레이어로 전환

### 4. 시각적 집중
- 콘텐츠 카드(Layer 2)가 자연스럽게 "떠오르는" 효과

## 잘못된 사용 예시

### ❌ 하드코딩된 배경색
```css
/* BAD */
.myComponent {
  background: #ffffff;
}

/* GOOD */
.myComponent {
  background: var(--bg-layer-2);
}
```

### ❌ 명시하지 않은 배경색
```css
/* BAD - 사이드바 내부 요소인데 배경색 명시 안 함 */
.sidebarSection {
  padding: 16px;
}

/* GOOD */
.sidebarSection {
  padding: 16px;
  background: var(--bg-layer-1);
}
```

### ❌ 일관성 없는 인터랙션
```css
/* BAD - 다른 컴포넌트들과 다른 호버 색상 */
.navItem:hover {
  background: #e0e0e0;
}

/* GOOD */
.navItem:hover {
  background: rgba(95, 155, 143, 0.08);
}
```

## 테마 변경 시

테마를 변경하려면 `src/styles/index.css`의 CSS 변수만 수정하면 됩니다:

```css
/* 예: 다크 모드 */
:root[data-theme="dark"] {
  --bg-layer-0: #1a1a1a;
  --bg-layer-1: #2d2d2d;
  --bg-layer-2: #3a3a3a;
  --bg-layer-header: #2d2d2d;
  --bg-layer-modal: #3a3a3a;
}
```

## 효과

✅ **콘텐츠 집중도 향상** - 카드가 배경에서 자연스럽게 부각  
✅ **시각적 깊이감** - 3D 레이어링 효과  
✅ **프로페셔널한 느낌** - etf.com과 동일한 디자인 언어  
✅ **유지보수 용이** - 중앙 집중식 관리  
✅ **일관된 UX** - 모든 페이지와 모든 내부 요소에서 동일한 경험  
✅ **명확한 구조** - 모든 요소가 명시적 배경색 규칙을 따름  

## 체크리스트

새로운 컴포넌트 작성 시 확인사항:

- [ ] 배경색이 명시적으로 선언되었는가?
- [ ] 적절한 레이어 변수를 사용했는가?
- [ ] 호버/활성 상태가 일관된 색상을 사용하는가?
- [ ] 부모 배경을 투과해야 하는 경우 `transparent`를 명시했는가?
- [ ] 하드코딩된 색상값을 사용하지 않았는가?

## 참고

- 디자인 참고: [etf.com](https://www.etf.com)
- 최초 적용: 2026-01-07
- 세부 요소 통합: 2026-01-07
- 관련 이슈: Background System Unification (Full Coverage)
