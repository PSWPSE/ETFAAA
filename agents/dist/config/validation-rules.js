/**
 * Validation Rules Configuration
 * 검증 규칙 설정
 */
// 한국 ETF 검증 규칙
export const KOREAN_ETF_RULES = {
    source: 'korean-etf',
    rules: [
        {
            field: 'price',
            thresholdPercent: 0.1,
            allowNegative: false,
            required: true,
            description: '현재가 (0.1% 이상 차이 시 업데이트)'
        },
        {
            field: 'change',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: '전일대비 (항상 업데이트)'
        },
        {
            field: 'changePercent',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: '등락률 (항상 업데이트)'
        },
        {
            field: 'volume',
            thresholdPercent: 5.0,
            allowNegative: false,
            required: true,
            description: '거래량 (5% 이상 차이 시 업데이트)'
        },
        {
            field: 'nav',
            thresholdPercent: 0.1,
            allowNegative: false,
            required: false,
            description: 'NAV (0.1% 이상 차이 시 업데이트)'
        }
    ],
    maxItemsPerSession: 50,
    retryOnError: true,
    maxRetries: 3,
    waitBetweenRequests: 1000
};
// 미국 ETF 검증 규칙
export const US_ETF_RULES = {
    source: 'us-etf',
    rules: [
        {
            field: 'price',
            thresholdPercent: 0.1,
            allowNegative: false,
            required: true,
            description: 'Current price (update if >0.1% diff)'
        },
        {
            field: 'change',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Price change (always update)'
        },
        {
            field: 'changePercent',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Change percent (always update)'
        },
        {
            field: 'volume',
            thresholdPercent: 5.0,
            allowNegative: false,
            required: true,
            description: 'Volume (update if >5% diff)'
        }
    ],
    maxItemsPerSession: 50,
    retryOnError: true,
    maxRetries: 3,
    waitBetweenRequests: 1500 // Yahoo Finance에는 더 긴 대기
};
// 시장 지수 검증 규칙
export const INDICES_RULES = {
    source: 'indices',
    rules: [
        {
            field: 'value',
            thresholdPercent: 0.1,
            allowNegative: false,
            required: true,
            description: 'Index value (update if >0.1% diff)'
        },
        {
            field: 'change',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Point change (always update)'
        },
        {
            field: 'changePercent',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Percent change (always update)'
        }
    ],
    maxItemsPerSession: 20,
    retryOnError: true,
    maxRetries: 3,
    waitBetweenRequests: 1000
};
// 환율 검증 규칙
export const FOREX_RULES = {
    source: 'forex',
    rules: [
        {
            field: 'rate',
            thresholdPercent: 0.05,
            allowNegative: false,
            required: true,
            description: '환율 (0.05% 이상 차이 시 업데이트)'
        },
        {
            field: 'change',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: '전일대비 (항상 업데이트)'
        },
        {
            field: 'changePercent',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: '등락률 (항상 업데이트)'
        }
    ],
    maxItemsPerSession: 10,
    retryOnError: true,
    maxRetries: 3,
    waitBetweenRequests: 1000
};
// 원자재 검증 규칙
export const COMMODITIES_RULES = {
    source: 'commodities',
    rules: [
        {
            field: 'price',
            thresholdPercent: 0.1,
            allowNegative: false,
            required: true,
            description: 'Price (update if >0.1% diff)'
        },
        {
            field: 'change',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Price change (always update)'
        },
        {
            field: 'changePercent',
            thresholdPercent: 0,
            allowNegative: true,
            required: true,
            description: 'Change percent (always update)'
        }
    ],
    maxItemsPerSession: 10,
    retryOnError: true,
    maxRetries: 3,
    waitBetweenRequests: 1500
};
// 모든 검증 규칙
export const VALIDATION_RULES = {
    'korean-etf': KOREAN_ETF_RULES,
    'us-etf': US_ETF_RULES,
    'indices': INDICES_RULES,
    'forex': FOREX_RULES,
    'commodities': COMMODITIES_RULES,
};
// 검증 규칙 조회
export function getValidationRules(source) {
    return VALIDATION_RULES[source];
}
// 필드별 규칙 조회
export function getFieldRule(source, field) {
    const rules = VALIDATION_RULES[source];
    return rules.rules.find(r => r.field === field);
}
// 값 비교 및 차이 계산
export function compareValues(currentValue, fetchedValue, thresholdPercent) {
    if (currentValue === 0 && fetchedValue === 0) {
        return { needsUpdate: false, percentDiff: 0 };
    }
    if (currentValue === 0) {
        return { needsUpdate: true, percentDiff: 100 };
    }
    const percentDiff = Math.abs((fetchedValue - currentValue) / currentValue) * 100;
    return {
        needsUpdate: percentDiff > thresholdPercent,
        percentDiff
    };
}
// 이상치 탐지 (비정상적인 변동)
export function detectAnomaly(currentValue, fetchedValue, maxChangePercent = 15) {
    if (currentValue === 0)
        return false;
    const percentDiff = Math.abs((fetchedValue - currentValue) / currentValue) * 100;
    return percentDiff > maxChangePercent;
}
//# sourceMappingURL=validation-rules.js.map