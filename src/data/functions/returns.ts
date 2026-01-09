// 수익률 관련 함수
import type { Returns } from '../../types/etf';
import { etfs } from '../etf';

// ETF별 수익률
export const getReturns = (etfId: string): Returns => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) {
    return { day1: 0, week1: 0, month1: 0, month3: 0, month6: 0, year1: 0, ytd: 0 };
  }

  // 기본 변동률을 기반으로 기간별 수익률 생성
  const baseChange = etf.changePercent;

  return {
    day1: baseChange,
    week1: baseChange * (2.5 + Math.random() * 1),
    month1: baseChange * (6 + Math.random() * 4),
    month3: baseChange * (12 + Math.random() * 6),
    month6: baseChange * (20 + Math.random() * 10),
    year1: baseChange * (35 + Math.random() * 15),
    ytd: baseChange * (30 + Math.random() * 10),
  };
};

// 월별 수익률 히트맵 데이터
export const getMonthlyReturns = (_etfId: string) => {
  const years = [2023, 2024, 2025];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return years.map(year => ({
    year,
    returns: months.map((month) => ({
      month,
      value: Math.random() * 20 - 10, // -10% ~ +10%
    })),
  }));
};

// $10,000 성장 시뮬레이션 데이터
export const getGrowthSimulation = (etfId: string, years: number = 5) => {
  const etf = etfs.find(e => e.id === etfId);
  if (!etf) return [];

  const returns = getReturns(etfId);
  const annualReturn = returns.year1 / 100 || 0.08;

  const data = [];
  const startValue = 10000000; // 1000만원
  let value = startValue;

  const today = new Date();

  for (let i = years * 12; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);

    const monthlyReturn = annualReturn / 12;
    const volatility = (Math.random() - 0.5) * 0.04;
    value = value * (1 + monthlyReturn + volatility);

    data.push({
      date: date.toISOString().slice(0, 7),
      value: Math.round(value),
      benchmark: Math.round(startValue * Math.pow(1 + (annualReturn * 0.8) / 12, (years * 12) - i)),
    });
  }

  return data;
};
