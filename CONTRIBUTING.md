# 기여 가이드

ETF AAA 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 시작하기

### 1. 저장소 포크 및 클론

```bash
# 저장소 포크 (GitHub에서)
# 포크한 저장소 클론
git clone <your-fork-url>
cd etfaaa

# 원본 저장소를 upstream으로 추가
git remote add upstream <original-repo-url>
```

### 2. 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 브랜치 전략

### 메인 브랜치
- `main`: 프로덕션 코드
- `develop`: 개발 진행 중인 코드

### 작업 브랜치
```bash
# 새 기능 개발
git checkout -b feature/기능명

# 버그 수정
git checkout -b fix/버그명

# 리팩토링
git checkout -b refactor/작업명

# 문서 수정
git checkout -b docs/문서명
```

## 개발 워크플로우

### 1. 최신 코드 동기화

```bash
git checkout develop
git pull upstream develop
```

### 2. 브랜치 생성 및 작업

```bash
# 브랜치 생성
git checkout -b feature/새로운-기능

# 작업 진행...
# 파일 수정 후
git add .
git commit -m "feat: 새로운 기능 추가"
```

### 3. 커밋 메시지 규칙

```
<type>: <subject>

<body> (선택사항)
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `docs`: 문서 수정
- `test`: 테스트 코드
- `chore`: 빌드 프로세스, 패키지 매니저 등

**예시:**
```bash
git commit -m "feat: ETF 상세 페이지에 배당 정보 추가"
git commit -m "fix: 모바일에서 차트가 깨지는 버그 수정"
git commit -m "refactor: DetailPage 컴포넌트 구조 개선"
```

### 4. Pull Request 생성

```bash
# 본인의 포크 저장소에 푸시
git push origin feature/새로운-기능
```

GitHub에서 Pull Request 생성:
- 제목: 명확하고 간결하게
- 설명: 변경사항, 이유, 스크린샷 등
- 라벨: 적절한 라벨 추가
- 리뷰어: 팀원 지정

## 코드 스타일 가이드

### TypeScript

```typescript
// ✅ Good
interface ETFProps {
  id: string;
  name: string;
  price: number;
}

export default function ETFCard({ id, name, price }: ETFProps) {
  // ...
}

// ❌ Bad - Props 타입 미정의
export default function ETFCard({ id, name, price }) {
  // ...
}
```

### React 컴포넌트

```typescript
// ✅ Good - 함수형 컴포넌트 + Hooks
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad - 클래스형 컴포넌트
class Counter extends React.Component {
  // ...
}
```

### CSS Modules

```typescript
// ✅ Good
import styles from './Button.module.css';

export default function Button() {
  return <button className={styles.button}>Click</button>;
}

// ❌ Bad - 인라인 스타일 또는 전역 CSS
export default function Button() {
  return <button style={{ color: 'red' }}>Click</button>;
}
```

### 네이밍 규칙

- **컴포넌트**: PascalCase (예: `DetailPage`, `ETFCard`)
- **함수/변수**: camelCase (예: `getETFById`, `selectedETF`)
- **상수**: UPPER_SNAKE_CASE (예: `CHART_PERIODS`, `API_BASE_URL`)
- **CSS 클래스**: camelCase (CSS Modules 자동 변환)

## 테스트

```bash
# 린트 검사
npm run lint

# 타입 체크
npm run build
```

## Pull Request 체크리스트

PR을 생성하기 전에 다음을 확인하세요:

- [ ] 코드가 정상적으로 빌드되는가?
- [ ] 린트 에러가 없는가?
- [ ] 타입 에러가 없는가?
- [ ] 모바일 반응형이 잘 작동하는가?
- [ ] 스크린샷을 첨부했는가? (UI 변경 시)
- [ ] 커밋 메시지가 규칙에 맞는가?
- [ ] 불필요한 파일이 포함되지 않았는가?

## 이슈 작성 가이드

### 버그 리포트

```markdown
## 버그 설명
간단명료하게 버그를 설명해주세요.

## 재현 방법
1. '...'로 이동
2. '...' 클릭
3. 스크롤을 '...'로
4. 에러 발생

## 예상 동작
어떻게 동작해야 하는지 설명해주세요.

## 실제 동작
실제로 어떻게 동작하는지 설명해주세요.

## 스크린샷
가능하면 스크린샷을 첨부해주세요.

## 환경
- OS: [예: macOS, Windows]
- 브라우저: [예: Chrome, Safari]
- 화면 크기: [예: Desktop, Mobile]
```

### 기능 제안

```markdown
## 제안하는 기능
기능을 간단히 설명해주세요.

## 동기
왜 이 기능이 필요한가요?

## 예시
구체적인 사용 예시를 들어주세요.

## 대안
고려한 다른 방법이 있나요?
```

## 코드 리뷰

### 리뷰어 가이드
- 건설적인 피드백 제공
- 코드 품질, 성능, 가독성 체크
- 반응형 디자인 확인
- 접근성 고려사항 검토

### 작성자 가이드
- 피드백에 열린 자세로 대응
- 변경사항 반영 후 재요청
- 논의가 필요한 부분은 댓글로 토론

## 질문이 있나요?

- 이슈로 질문 남기기
- 팀 채널에서 논의
- README.md 참고

## 감사합니다!

모든 기여에 감사드립니다. 함께 더 나은 프로젝트를 만들어가요! 🚀

