/**
 * Date Utilities
 * 날짜 관련 유틸리티 함수
 */

// 날짜를 YYYY-MM-DD 형식으로 포맷
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ISO 8601 형식의 타임스탬프 생성
export function getTimestamp(): string {
  return new Date().toISOString();
}

// 현재 날짜를 YYYY-MM-DD 형식으로 반환
export function getToday(): string {
  return formatDate(new Date());
}

// 한국 시간 기준 날짜 (UTC+9)
export function getKoreanDate(): string {
  const now = new Date();
  const koreaOffset = 9 * 60; // UTC+9 in minutes
  const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);
  return formatDate(koreaTime);
}

// 날짜에서 요일 반환 (0: Sunday, 6: Saturday)
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

// 주말인지 확인
export function isWeekend(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
}

// 한국 시장 개장 여부 (9:00 - 15:30 KST)
export function isKoreanMarketOpen(): boolean {
  const now = new Date();
  const koreaOffset = 9 * 60;
  const koreaTime = new Date(now.getTime() + (koreaOffset + now.getTimezoneOffset()) * 60000);

  if (isWeekend(koreaTime)) return false;

  const hours = koreaTime.getHours();
  const minutes = koreaTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // 9:00 - 15:30
  return timeInMinutes >= 9 * 60 && timeInMinutes <= 15 * 60 + 30;
}

// 미국 시장 개장 여부 (9:30 - 16:00 ET)
export function isUSMarketOpen(): boolean {
  const now = new Date();
  // ET는 UTC-5 (동부 표준시) 또는 UTC-4 (동부 서머타임)
  // 여기서는 단순화를 위해 UTC-5 사용
  const etOffset = -5 * 60;
  const etTime = new Date(now.getTime() + (etOffset + now.getTimezoneOffset()) * 60000);

  if (isWeekend(etTime)) return false;

  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // 9:30 - 16:00
  return timeInMinutes >= 9 * 60 + 30 && timeInMinutes <= 16 * 60;
}

// 시간을 HH:MM:SS 형식으로 포맷
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// 밀리초를 사람이 읽기 쉬운 형식으로 변환
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// N일 전 날짜 반환
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

// 두 날짜 사이의 일수 계산
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
