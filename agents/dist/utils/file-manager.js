/**
 * File Manager
 * 파일 시스템 유틸리티
 */
import * as fs from 'fs';
import * as path from 'path';
import { getToday } from './date-utils.js';
// 프로젝트 루트 경로
export const PROJECT_ROOT = path.resolve(process.cwd(), '..');
export const AGENTS_ROOT = process.cwd();
// 리포트 디렉토리 경로 생성
export function getReportsDir(date) {
    const targetDate = date || getToday();
    return path.join(AGENTS_ROOT, 'reports', targetDate);
}
// 로그 디렉토리 경로 생성
export function getLogsDir(date) {
    const targetDate = date || getToday();
    return path.join(AGENTS_ROOT, 'logs', targetDate);
}
// 디렉토리 생성 (존재하지 않을 경우)
export function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
// 일일 디렉토리 구조 생성
export function createDailyDirectories(date) {
    const reportsDir = getReportsDir(date);
    const logsDir = getLogsDir(date);
    ensureDir(reportsDir);
    ensureDir(logsDir);
    return { reports: reportsDir, logs: logsDir };
}
// 리포트 파일 저장
export function saveReport(filename, content, date) {
    const reportsDir = getReportsDir(date);
    ensureDir(reportsDir);
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
}
// 로그 파일 저장
export function saveLog(filename, content, date) {
    const logsDir = getLogsDir(date);
    ensureDir(logsDir);
    const filePath = path.join(logsDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
}
// 로그 파일에 추가
export function appendLog(filename, content, date) {
    const logsDir = getLogsDir(date);
    ensureDir(logsDir);
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, content + '\n', 'utf-8');
}
// 파일 읽기
export function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    }
    catch {
        return null;
    }
}
// 파일 존재 여부 확인
export function fileExists(filePath) {
    return fs.existsSync(filePath);
}
// 데이터 파일 경로 조회
export function getDataFilePath(relativePath) {
    return path.join(PROJECT_ROOT, relativePath);
}
// 기존 리포트 목록 조회
export function listReports(date) {
    const reportsDir = getReportsDir(date);
    if (!fs.existsSync(reportsDir)) {
        return [];
    }
    return fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));
}
// 날짜별 리포트 디렉토리 목록 조회
export function listReportDates() {
    const reportsRoot = path.join(AGENTS_ROOT, 'reports');
    if (!fs.existsSync(reportsRoot)) {
        return [];
    }
    return fs.readdirSync(reportsRoot)
        .filter(f => fs.statSync(path.join(reportsRoot, f)).isDirectory())
        .sort()
        .reverse();
}
// 마지막 N일간의 리포트 조회
export function getRecentReports(days = 7) {
    const dates = listReportDates().slice(0, days);
    const result = {};
    for (const date of dates) {
        result[date] = listReports(date);
    }
    return result;
}
// 파일 백업 생성
export function backupFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}
//# sourceMappingURL=file-manager.js.map