/**
 * Task Management Types
 * 태스크 관리 관련 타입
 */
// 태스크 ID 생성 함수
export function generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
// 날짜 기반 리포트 경로 생성
export function getReportPath(date, filename) {
    return `reports/${date}/${filename}`;
}
// 날짜 기반 로그 경로 생성
export function getLogPath(date, filename) {
    return `logs/${date}/${filename}`;
}
//# sourceMappingURL=task-types.js.map