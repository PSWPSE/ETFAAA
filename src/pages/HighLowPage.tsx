import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { Card } from '../components/common';
import PageContainer from '../components/layout/PageContainer';
import { koreanETFs, usETFs } from '../data';
import { useETFStore } from '../store/etfStore';
import { formatPrice, formatPercent, getChangeClass } from '../utils/format';

type HighLowCategory = 'high' | 'low';

export default function HighLowPage() {
  const navigate = useNavigate();
  const { selectedMarket } = useETFStore();
  const [activeCategory, setActiveCategory] = useState<HighLowCategory>('high');

  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;

  // 52주 신고가 ETF
  const nearHigh52w = useMemo(() => {
    return etfs.map(e => {
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (1.0 + Math.random() * 0.5);
      const return3m = baseReturn * (1.2 + Math.random() * 0.8);
      const distanceFromHigh = Math.random() * 5; // 0~5% 이내

      return { ...e, return1w, return1m, return3m, distanceFromHigh };
    })
    .sort((a, b) => a.distanceFromHigh - b.distanceFromHigh);
  }, [etfs]);

  // 52주 신저가 ETF
  const nearLow52w = useMemo(() => {
    return etfs.map(e => {
      const baseReturn = e.changePercent;
      const return1w = baseReturn * (0.8 + Math.random() * 0.4);
      const return1m = baseReturn * (1.0 + Math.random() * 0.5);
      const return3m = baseReturn * (1.2 + Math.random() * 0.8);
      const distanceFromLow = Math.random() * 5; // 0~5% 이내

      return { ...e, return1w, return1m, return3m, distanceFromLow };
    })
    .sort((a, b) => a.distanceFromLow - b.distanceFromLow);
  }, [etfs]);

  const displayList = activeCategory === 'high' ? nearHigh52w : nearLow52w;

  return (
    <PageContainer
      title="52주 신기록"
      subtitle="52주 신고가/신저가를 기록한 ETF 목록"
      showMarketSelector={true}
    >
      <div className="flex flex-col gap-xl">
        {/* 카테고리 탭 */}
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-md max-md:gap-sm">
          <button
            className={`flex items-center justify-center gap-sm px-lg py-md max-md:px-md max-md:py-sm rounded-lg text-base max-md:text-sm font-semibold cursor-pointer transition-all border-2 ${
              activeCategory === 'high'
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-layer-0 text-text-secondary hover:border-primary hover:bg-layer-1'
            }`}
            onClick={() => setActiveCategory('high')}
          >
            <ArrowUpCircle size={18} className="shrink-0 max-md:w-4 max-md:h-4" />
            <span>52주 신고가</span>
            <span className={`inline-flex items-center justify-center min-w-6 max-md:min-w-5 h-6 max-md:h-5 px-2 text-sm max-md:text-xs font-bold rounded-full ${
              activeCategory === 'high' ? 'bg-white/30' : 'bg-white/20'
            }`}>{nearHigh52w.length}</span>
          </button>
          <button
            className={`flex items-center justify-center gap-sm px-lg py-md max-md:px-md max-md:py-sm rounded-lg text-base max-md:text-sm font-semibold cursor-pointer transition-all border-2 ${
              activeCategory === 'low'
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-layer-0 text-text-secondary hover:border-primary hover:bg-layer-1'
            }`}
            onClick={() => setActiveCategory('low')}
          >
            <ArrowDownCircle size={18} className="shrink-0 max-md:w-4 max-md:h-4" />
            <span>52주 신저가</span>
            <span className={`inline-flex items-center justify-center min-w-6 max-md:min-w-5 h-6 max-md:h-5 px-2 text-sm max-md:text-xs font-bold rounded-full ${
              activeCategory === 'low' ? 'bg-white/30' : 'bg-white/20'
            }`}>{nearLow52w.length}</span>
          </button>
        </div>

        {/* 안내 카드 */}
        <Card padding="md" className="bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(30,58,95,0.08)] border border-[rgba(30,58,95,0.1)]">
          <div className="flex gap-md max-md:gap-sm items-start">
            <TrendingUp size={20} className="shrink-0 text-primary mt-0.5 max-md:w-[18px] max-md:h-[18px]" />
            <div className="flex-1">
              <p className="text-base max-md:text-sm font-bold text-text-primary m-0 mb-xs">
                {activeCategory === 'high' ? '52주 신고가' : '52주 신저가'}란?
              </p>
              <p className="text-sm max-md:text-xs text-text-secondary leading-relaxed m-0">
                {activeCategory === 'high'
                  ? '최근 52주(1년) 동안 가장 높은 가격을 기록한 ETF입니다. 강한 상승 추세를 나타냅니다.'
                  : '최근 52주(1년) 동안 가장 낮은 가격을 기록한 ETF입니다. 반등 가능성을 주목할 수 있습니다.'}
              </p>
            </div>
          </div>
        </Card>

        {/* ETF 리스트 */}
        <div className="flex flex-col gap-md">
          {displayList.map((etf, index) => (
            <Card
              key={etf.id}
              padding="md"
              className="cursor-pointer transition-all border border-border hover:border-primary hover:shadow-[0_4px_12px_rgba(30,58,95,0.08)] hover:-translate-y-0.5"
              onClick={() => navigate(`/etf/${etf.id}`)}
            >
              <div className="flex items-start gap-md max-md:gap-sm mb-sm pb-sm border-b border-border/50">
                <div className="flex items-center justify-center w-10 h-10 max-md:w-8 max-md:h-8 bg-gradient-to-br from-primary to-primary-dark text-white text-lg max-md:text-base font-extrabold rounded-md shrink-0">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base max-md:text-sm font-bold text-text-primary m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</h3>
                  <p className="text-sm max-md:text-xs text-text-tertiary m-0 mb-0.5">{etf.ticker}</p>
                  <div className="flex items-center gap-2 max-md:gap-1.5 mt-1.5 max-md:mt-1">
                    <span className="text-xs max-md:text-[10px] text-text-secondary font-medium">{etf.issuer}</span>
                    <span className="text-text-tertiary text-[10px] max-md:text-[8px]">•</span>
                    <span className="text-xs max-md:text-[10px] text-text-secondary font-medium">배당 {formatPercent(etf.dividendYield)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg max-md:text-base font-bold text-text-primary">{formatPrice(etf.price)}</span>
                  <span className={`text-sm max-md:text-xs font-semibold ${getChangeClass(etf.changePercent)}`}>
                    {formatPercent(etf.changePercent)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 max-md:grid-cols-2 gap-sm max-md:gap-2 mb-md p-md md:p-lg max-md:p-sm bg-gradient-to-br from-[rgba(249,250,251,0.8)] to-[rgba(243,244,246,0.6)] rounded-md border border-border/50">
                <div className="flex flex-col justify-center items-center gap-1.5 max-md:gap-1 p-sm max-md:p-[10px_8px] md:p-[var(--spacing-sm)_var(--spacing-md)] bg-white border border-border/50 rounded-sm transition-all text-center min-h-[60px] max-md:min-h-[52px] md:min-h-[68px] hover:border-primary hover:shadow-[0_2px_8px_rgba(30,58,95,0.08)] hover:-translate-y-px">
                  <span className="text-[11px] max-md:text-[10px] md:text-xs text-text-tertiary font-semibold tracking-[0.3px] uppercase">1주</span>
                  <span className={`text-[15px] max-md:text-[13px] md:text-[17px] font-extrabold font-mono tabular-nums ${getChangeClass(etf.return1w)}`}>
                    {formatPercent(etf.return1w)}
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center gap-1.5 max-md:gap-1 p-sm max-md:p-[10px_8px] md:p-[var(--spacing-sm)_var(--spacing-md)] bg-white border border-border/50 rounded-sm transition-all text-center min-h-[60px] max-md:min-h-[52px] md:min-h-[68px] hover:border-primary hover:shadow-[0_2px_8px_rgba(30,58,95,0.08)] hover:-translate-y-px">
                  <span className="text-[11px] max-md:text-[10px] md:text-xs text-text-tertiary font-semibold tracking-[0.3px] uppercase">1개월</span>
                  <span className={`text-[15px] max-md:text-[13px] md:text-[17px] font-extrabold font-mono tabular-nums ${getChangeClass(etf.return1m)}`}>
                    {formatPercent(etf.return1m)}
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center gap-1.5 max-md:gap-1 p-sm max-md:p-[10px_8px] md:p-[var(--spacing-sm)_var(--spacing-md)] bg-white border border-border/50 rounded-sm transition-all text-center min-h-[60px] max-md:min-h-[52px] md:min-h-[68px] hover:border-primary hover:shadow-[0_2px_8px_rgba(30,58,95,0.08)] hover:-translate-y-px">
                  <span className="text-[11px] max-md:text-[10px] md:text-xs text-text-tertiary font-semibold tracking-[0.3px] uppercase">3개월</span>
                  <span className={`text-[15px] max-md:text-[13px] md:text-[17px] font-extrabold font-mono tabular-nums ${getChangeClass(etf.return3m)}`}>
                    {formatPercent(etf.return3m)}
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center gap-1.5 max-md:gap-1 p-sm max-md:p-[10px_8px] md:p-[var(--spacing-sm)_var(--spacing-md)] bg-gradient-to-br from-[rgba(30,58,95,0.03)] to-[rgba(30,58,95,0.05)] border border-[rgba(30,58,95,0.15)] rounded-sm transition-all text-center min-h-[60px] max-md:min-h-[52px] md:min-h-[68px] hover:border-primary hover:bg-gradient-to-br hover:from-[rgba(30,58,95,0.05)] hover:to-[rgba(30,58,95,0.08)] hover:-translate-y-px">
                  <span className="text-[11px] max-md:text-[10px] md:text-xs text-text-tertiary font-semibold tracking-[0.3px] uppercase">
                    {activeCategory === 'high' ? '고점대비' : '저점대비'}
                  </span>
                  <span className="text-[15px] max-md:text-[13px] md:text-[17px] font-black font-mono text-primary tabular-nums">
                    {activeCategory === 'high'
                      ? `-${((etf as typeof nearHigh52w[number]).distanceFromHigh).toFixed(2)}%`
                      : `+${((etf as typeof nearLow52w[number]).distanceFromLow).toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
