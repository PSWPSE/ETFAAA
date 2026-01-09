// 시장 데이터 통합 export
export * from './indices';
export * from './forex';
export * from './commodities';

import { indices } from './indices';
import { forex } from './forex';
import { commoditiesData } from './commodities';

// HomePage.tsx의 MARKET_DATA 형식과 호환
export const MARKET_DATA = {
  indices,
  forex,
  commodities: commoditiesData,
};
