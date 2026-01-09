// 숫자 포맷팅 유틸리티

// 금액 포맷 (원)
export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value);
};

// 금액 포맷 (USD)
export const formatUSDPrice = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// 시장에 따른 가격 포맷 (KR: 원, US: $)
export const formatPriceByMarket = (
  value: number,
  market: 'korea' | 'us' | 'all',
  showConversion?: boolean,
  exchangeRate?: number
): string => {
  if (market === 'us') {
    const usdPrice = `$${formatUSDPrice(value)}`;
    if (showConversion && exchangeRate) {
      const krwPrice = formatPrice(Math.round(value * exchangeRate));
      return `${usdPrice} (${krwPrice}원)`;
    }
    return usdPrice;
  }
  return `${formatPrice(value)}원`;
};

// 금액 포맷 (억/조 단위)
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(1)}조`;
  }
  if (value >= 1e8) {
    return `${(value / 1e8).toFixed(1)}억`;
  }
  if (value >= 1e4) {
    return `${(value / 1e4).toFixed(1)}만`;
  }
  return formatPrice(value);
};

// 시장에 따른 큰 숫자 포맷 (KR: 조/억원, US: $T/B/M)
export const formatLargeNumberByMarket = (value: number, market: 'korea' | 'us' | 'all'): string => {
  if (market === 'us') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${formatUSDPrice(value)}`;
  }
  // 한국: 원 단위 포함
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(1)}조원`;
  }
  if (value >= 1e8) {
    return `${(value / 1e8).toFixed(1)}억원`;
  }
  if (value >= 1e4) {
    return `${(value / 1e4).toFixed(1)}만원`;
  }
  return `${formatPrice(value)}원`;
};

// ETF ID로 시장 판별
export const getMarketFromETFId = (id: string): 'korea' | 'us' => {
  return id.startsWith('us-') ? 'us' : 'korea';
};

// 퍼센트 포맷
export const formatPercent = (value: number, digits: number = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
};

// 변동률 클래스
export const getChangeClass = (value: number): string => {
  if (value > 0) return 'number-up';
  if (value < 0) return 'number-down';
  return '';
};

// 날짜 포맷
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// 날짜 포맷 (짧은 형식)
export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// 거래량 포맷
export const formatVolume = (value: number): string => {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toString();
};

// 비율 포맷 (총보수율 등)
export const formatRatio = (value: number): string => {
  return `${value.toFixed(2)}%`;
};





