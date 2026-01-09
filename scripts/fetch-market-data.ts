/**
 * ETF 시장 데이터 페칭 스크립트
 * Yahoo Finance API를 사용하여 실제 가격/배당 데이터를 가져옵니다.
 *
 * 사용법: npx ts-node scripts/fetch-market-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ETF 티커 목록 (korean-etfs.ts와 동일하게 매핑)
const KOREAN_ETFS = [
  { id: 'kr-1', ticker: '069500', name: 'KODEX 200' },
  { id: 'kr-2', ticker: '102110', name: 'TIGER 200' },
  { id: 'kr-3', ticker: '148020', name: 'RISE 200' },
  { id: 'kr-4', ticker: '229200', name: 'KODEX 코스닥150' },
  { id: 'kr-5', ticker: '122630', name: 'KODEX 레버리지' },
  { id: 'kr-6', ticker: '252670', name: 'KODEX 200선물인버스2X' },
  { id: 'kr-7', ticker: '233740', name: 'KODEX 코스닥150레버리지' },
  { id: 'kr-8', ticker: '315930', name: 'KIWOOM 200TR' },
  { id: 'kr-9', ticker: '278530', name: 'KODEX 200TR' },
  { id: 'kr-10', ticker: '315960', name: 'KODEX Top5PlusTR' },
  { id: 'kr-11', ticker: '310970', name: 'KODEX MSCI Korea TR' },
  { id: 'kr-12', ticker: '091160', name: 'KODEX 반도체' },
  { id: 'kr-13', ticker: '396500', name: 'TIGER 반도체TOP10' },
  { id: 'kr-14', ticker: '102780', name: 'KODEX 삼성그룹' },
  { id: 'kr-15', ticker: '360750', name: 'TIGER 미국S&P500' },
  { id: 'kr-16', ticker: '379800', name: 'KODEX 미국S&P500' },
  { id: 'kr-17', ticker: '360200', name: 'ACE 미국S&P500' },
  { id: 'kr-18', ticker: '379780', name: 'RISE 미국S&P500' },
  { id: 'kr-19', ticker: '133690', name: 'TIGER 미국나스닥100' },
  { id: 'kr-20', ticker: '379810', name: 'KODEX 미국나스닥100' },
  { id: 'kr-21', ticker: '367380', name: 'ACE 미국나스닥100' },
  { id: 'kr-22', ticker: '381180', name: 'TIGER 미국필라델피아반도체나스닥' },
  { id: 'kr-23', ticker: '489250', name: 'KODEX 미국AI전력핵심인프라' },
  { id: 'kr-24', ticker: '381170', name: 'TIGER 미국테크TOP10 INDXX' },
  { id: 'kr-25', ticker: '305720', name: 'KODEX 2차전지산업' },
  { id: 'kr-26', ticker: '305540', name: 'TIGER 2차전지테마' },
  { id: 'kr-27', ticker: '371460', name: 'TIGER 차이나전기차SOLACTIVE' },
  { id: 'kr-28', ticker: '161510', name: 'PLUS 고배당주' },
  { id: 'kr-29', ticker: '279530', name: 'KODEX 고배당' },
  { id: 'kr-30', ticker: '458730', name: 'TIGER 미국배당다우존스' },
  { id: 'kr-31', ticker: '289480', name: 'TIGER 200커버드콜ATM' },
  { id: 'kr-32', ticker: '475080', name: 'KODEX 200타겟위클리커버드콜' },
  { id: 'kr-33', ticker: '476550', name: 'TIGER 미국30년국채커버드콜액티브(H)' },
  { id: 'kr-34', ticker: '214980', name: 'KODEX 단기채권PLUS' },
  { id: 'kr-35', ticker: '453850', name: 'ACE 미국30년국채액티브(H)' },
  { id: 'kr-36', ticker: '443090', name: 'RISE 종합채권(A-이상)액티브' },
  { id: 'kr-37', ticker: '459580', name: 'KODEX CD금리액티브(합성)' },
  { id: 'kr-38', ticker: '475640', name: 'TIGER CD1년금리액티브(합성)' },
  { id: 'kr-39', ticker: '423160', name: 'KODEX KOFR금리액티브(합성)' },
  { id: 'kr-40', ticker: '451600', name: 'TIGER KOFR금리액티브(합성)' },
  { id: 'kr-41', ticker: '449180', name: 'KODEX 머니마켓액티브' },
  { id: 'kr-42', ticker: '453080', name: 'TIGER 머니마켓액티브' },
  { id: 'kr-43', ticker: '455890', name: 'RISE 머니마켓액티브' },
  { id: 'kr-44', ticker: '478320', name: 'TIGER 코리아TOP10' },
  { id: 'kr-45', ticker: '466920', name: 'SOL 조선TOP3플러스' },
  { id: 'kr-46', ticker: '494300', name: 'PLUS K방산' },
  { id: 'kr-47', ticker: '244580', name: 'KODEX 바이오' },
  { id: 'kr-48', ticker: '143860', name: 'TIGER 헬스케어' },
  { id: 'kr-49', ticker: '132030', name: 'KODEX 골드선물(H)' },
  { id: 'kr-50', ticker: '261220', name: 'KODEX WTI원유선물(H)' },
];

const US_ETFS = [
  { id: 'us-1', ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { id: 'us-2', ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { id: 'us-3', ticker: 'IVV', name: 'iShares Core S&P 500 ETF' },
  { id: 'us-4', ticker: 'QQQ', name: 'Invesco QQQ Trust' },
  { id: 'us-5', ticker: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { id: 'us-6', ticker: 'IWM', name: 'iShares Russell 2000 ETF' },
  { id: 'us-7', ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  { id: 'us-8', ticker: 'ARKK', name: 'ARK Innovation ETF' },
  { id: 'us-9', ticker: 'XLK', name: 'Technology Select Sector SPDR Fund' },
  { id: 'us-10', ticker: 'XLF', name: 'Financial Select Sector SPDR Fund' },
  { id: 'us-11', ticker: 'VNQ', name: 'Vanguard Real Estate ETF' },
  { id: 'us-12', ticker: 'GLD', name: 'SPDR Gold Shares' },
  { id: 'us-13', ticker: 'SLV', name: 'iShares Silver Trust' },
  { id: 'us-14', ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
  { id: 'us-15', ticker: 'BND', name: 'Vanguard Total Bond Market ETF' },
  { id: 'us-16', ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF' },
  { id: 'us-17', ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF' },
  { id: 'us-18', ticker: 'SOXX', name: 'iShares Semiconductor ETF' },
  { id: 'us-19', ticker: 'SMH', name: 'VanEck Semiconductor ETF' },
  { id: 'us-20', ticker: 'TQQQ', name: 'ProShares UltraPro QQQ' },
];

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DividendData {
  exDate: string;
  payDate: string;
  amount: number;
}

interface ETFMarketData {
  id: string;
  ticker: string;
  name: string;
  lastUpdated: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  priceHistory: PriceData[];
  dividends: DividendData[];
}

// Yahoo Finance API로 가격 히스토리 가져오기
async function fetchYahooFinanceData(
  ticker: string,
  isKorean: boolean = false
): Promise<{ priceHistory: PriceData[]; dividends: DividendData[]; currentData: any } | null> {
  try {
    // 한국 ETF는 .KS (KOSPI) 또는 .KQ (KOSDAQ) 추가
    const yahooTicker = isKorean ? `${ticker}.KS` : ticker;

    // 1년치 데이터 가져오기
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (365 * 24 * 60 * 60); // 1년 전

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?period1=${startDate}&period2=${endDate}&interval=1d&events=div`;

    console.log(`Fetching: ${yahooTicker}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${yahooTicker}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.error(`No data for ${yahooTicker}`);
      return null;
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const events = result.events || {};

    // 가격 히스토리 변환
    const priceHistory: PriceData[] = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: Math.round((quotes.open?.[i] || 0) * 100) / 100,
      high: Math.round((quotes.high?.[i] || 0) * 100) / 100,
      low: Math.round((quotes.low?.[i] || 0) * 100) / 100,
      close: Math.round((quotes.close?.[i] || 0) * 100) / 100,
      volume: quotes.volume?.[i] || 0,
    })).filter((p: PriceData) => p.close > 0);

    // 배당 데이터 변환
    const dividends: DividendData[] = [];
    if (events.dividends) {
      for (const [ts, div] of Object.entries(events.dividends) as [string, any][]) {
        dividends.push({
          exDate: new Date(parseInt(ts) * 1000).toISOString().split('T')[0],
          payDate: new Date(parseInt(ts) * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 약 30일 후
          amount: Math.round(div.amount * 100) / 100,
        });
      }
    }

    // 현재 데이터
    const lastPrice = priceHistory[priceHistory.length - 1];
    const prevPrice = priceHistory[priceHistory.length - 2];

    return {
      priceHistory,
      dividends: dividends.sort((a, b) => b.exDate.localeCompare(a.exDate)),
      currentData: {
        price: lastPrice?.close || 0,
        change: lastPrice && prevPrice ? Math.round((lastPrice.close - prevPrice.close) * 100) / 100 : 0,
        changePercent: lastPrice && prevPrice
          ? Math.round(((lastPrice.close - prevPrice.close) / prevPrice.close) * 10000) / 100
          : 0,
        volume: lastPrice?.volume || 0,
      }
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

// 딜레이 함수 (API 제한 방지를 위해 충분한 딜레이)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const API_DELAY = 1500; // 1.5초 딜레이 (Yahoo Finance 제한 방지)

// 메인 함수
async function main() {
  console.log('=== ETF 시장 데이터 페칭 시작 ===\n');

  const allData: { korean: ETFMarketData[]; us: ETFMarketData[] } = {
    korean: [],
    us: [],
  };

  // 한국 ETF 데이터 가져오기
  console.log('📈 한국 ETF 데이터 가져오는 중...\n');
  for (const etf of KOREAN_ETFS) {
    const data = await fetchYahooFinanceData(etf.ticker, true);
    if (data) {
      allData.korean.push({
        id: etf.id,
        ticker: etf.ticker,
        name: etf.name,
        lastUpdated: new Date().toISOString(),
        currentPrice: data.currentData.price,
        change: data.currentData.change,
        changePercent: data.currentData.changePercent,
        volume: data.currentData.volume,
        priceHistory: data.priceHistory,
        dividends: data.dividends,
      });
      console.log(`  ✅ ${etf.name} (${etf.ticker}) - ${data.priceHistory.length}일 데이터, ${data.dividends.length}개 배당`);
    } else {
      console.log(`  ❌ ${etf.name} (${etf.ticker}) - 실패`);
    }
    await delay(API_DELAY); // API 제한 방지 (1.5초)
  }

  // 미국 ETF 데이터 가져오기
  console.log('\n📊 미국 ETF 데이터 가져오는 중...\n');
  for (const etf of US_ETFS) {
    const data = await fetchYahooFinanceData(etf.ticker, false);
    if (data) {
      allData.us.push({
        id: etf.id,
        ticker: etf.ticker,
        name: etf.name,
        lastUpdated: new Date().toISOString(),
        currentPrice: data.currentData.price,
        change: data.currentData.change,
        changePercent: data.currentData.changePercent,
        volume: data.currentData.volume,
        priceHistory: data.priceHistory,
        dividends: data.dividends,
      });
      console.log(`  ✅ ${etf.name} (${etf.ticker}) - ${data.priceHistory.length}일 데이터, ${data.dividends.length}개 배당`);
    } else {
      console.log(`  ❌ ${etf.name} (${etf.ticker}) - 실패`);
    }
    await delay(API_DELAY); // API 제한 방지 (1.5초)
  }

  // 데이터 저장
  const outputDir = path.join(__dirname, '../src/data/real');

  // 한국 ETF 데이터 저장
  fs.writeFileSync(
    path.join(outputDir, 'korean-market-data.json'),
    JSON.stringify(allData.korean, null, 2),
    'utf-8'
  );

  // 미국 ETF 데이터 저장
  fs.writeFileSync(
    path.join(outputDir, 'us-market-data.json'),
    JSON.stringify(allData.us, null, 2),
    'utf-8'
  );

  // 요약 정보 출력
  console.log('\n=== 데이터 페칭 완료 ===');
  console.log(`한국 ETF: ${allData.korean.length}개`);
  console.log(`미국 ETF: ${allData.us.length}개`);
  console.log(`\n저장 위치: ${outputDir}`);
  console.log('  - korean-market-data.json');
  console.log('  - us-market-data.json');
}

main().catch(console.error);
