// 국면분석 API 응답 타입 정의

// 차트 데이터 항목
export interface PhaseListItem {
  trd_dt: string;        // 거래일 (YYYYMMDD)
  value: number;         // 지표 값
  adj_close_prc: number; // 조정종가
}

// 국면 분석 상태
export interface PhaseStatus {
  trd_dt: string;              // 분석 기준일
  symbol: string;              // 심볼
  period_typ: string;          // 기간 유형
  status_level: number;        // 국면 수준 (1: 공포, 2: 중립, 3: 과열, 4: 큰 과열)
  status_level_text: string;   // 국면 설명 ("중립", "큰 과열" 등)
  predict_ratio: number;       // 예측 신뢰도 (%)
  reverse_holding_period: number; // 반전까지 예상 일수
  recur_period: number;        // 재발 주기
  expect_return_text: string;  // 기대 수익률 텍스트
  range_0: number;             // 목표 가격 범위 0
  range_1: number;             // 목표 가격 범위 1
  range_2: number;             // 목표 가격 범위 2
  range_3: number;             // 목표 가격 범위 3
  range_4: number;             // 목표 가격 범위 4
  range_5: number;             // 목표 가격 범위 5
  up_down_nm: string;          // 상승/하락 방향
  summary: string;             // 분석 요약
  recommend_opinion: string;   // 투자 제안
}

// 기간별 국면 데이터 (S: 단기, M: 중기, L: 장기)
export interface PeriodPhaseData {
  list: PhaseListItem[];       // 차트 데이터
  status: PhaseStatus;         // 국면 상태
  price_list: number[];        // 종가 배열
  range: number[];             // 가격 범위 배열
}

// 심볼별 전체 국면분석 데이터
export interface SymbolPhaseAnalysis {
  S: PeriodPhaseData;  // 단기 (Short)
  M: PeriodPhaseData;  // 중기 (Mid)
  L: PeriodPhaseData;  // 장기 (Long)
}

// readme.json 응답
export interface ReadmeResponse {
  KOR: string;  // 한국 데이터 폴더명
  USA: string;  // 미국 데이터 폴더명
  [key: string]: string; // 기타 키
}

// 시장 타입
export type MarketType = 'KOR' | 'USA';

// 기간 타입
export type PeriodType = 'S' | 'M' | 'L';

// 국면 상태 매핑
export const STATUS_LEVEL_MAP = {
  1: { text: '공포', color: '#3B82F6', status: 'oversold' },
  2: { text: '중립', color: '#6B7280', status: 'neutral' },
  3: { text: '과열', color: '#F59E0B', status: 'overbought' },
  4: { text: '큰 과열', color: '#EF4444', status: 'overbought_extreme' },
} as const;

// 기간 라벨 매핑
export const PERIOD_LABEL_MAP = {
  S: { label: '단기', days: 14 },
  M: { label: '중기', days: 30 },
  L: { label: '장기', days: 60 },
} as const;
