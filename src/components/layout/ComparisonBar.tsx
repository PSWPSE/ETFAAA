import { useNavigate, useLocation } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useETFStore } from '../../store/etfStore';
import { koreanETFs, usETFs } from '../../data';

export default function ComparisonBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMarket, compareList, removeFromCompare, clearCompare } = useETFStore();

  const etfs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const compareETFs = compareList.map(id => etfs.find(etf => etf.id === id)).filter(Boolean);

  // 비교 목록이 비어있거나 비교분석 페이지에서는 렌더링하지 않음
  if (compareList.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const handleCompare = () => {
    if (compareList.length >= 2) {
      navigate('/compare?autoCompare=true');
    }
  };

  const isDisabled = compareList.length < 2;
  const tooltipMessage = isDisabled
    ? '2개 이상의 ETF를 선택해주세요'
    : 'ETF 비교 분석 시작';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/[0.98] backdrop-blur-sm border-t border-gray-200/80 shadow-[0_-2px_12px_rgba(30,58,95,0.06)] z-[100] animate-[slideUp_300ms_ease-out] lg:left-sidebar">
      <div className="flex flex-wrap items-center gap-2 max-w-full py-[9px] px-sm mx-auto md:flex-nowrap md:gap-lg md:py-[11px] md:px-lg lg:max-w-content-max lg:gap-xl lg:py-3 lg:px-2xl">
        {/* ETF List */}
        <div className="flex flex-1 gap-1.5 overflow-x-auto overflow-y-hidden py-0.5 w-full scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent md:w-auto md:gap-2 lg:gap-2">
          {compareETFs.map((etf) => (
            <div
              key={etf?.id}
              className="relative flex items-center flex-shrink-0 py-[5px] pr-2 pl-6 bg-gray-50/60 border border-gray-200/60 rounded-sm transition-all duration-200 hover:bg-white hover:border-gray-300/80 hover:shadow-[0_1px_4px_rgba(30,58,95,0.06)] md:py-1.5 md:pr-[11px] md:pl-7 lg:py-[7px] lg:pr-3 lg:pl-7"
            >
              <button
                className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 p-0 bg-transparent border-none rounded-full text-text-tertiary cursor-pointer transition-all duration-150 hover:bg-red-500/10 hover:text-danger hover:scale-110 md:left-[5px] md:w-[18px] md:h-[18px] lg:left-[5px]"
                onClick={() => removeFromCompare(etf?.id || '')}
                title="제거"
                aria-label={`${etf?.name} 제거`}
              >
                <X size={14} />
              </button>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate(`/etf/${etf?.id}`)}
              >
                <span className="text-[11px] font-semibold text-text-primary whitespace-nowrap md:text-xs lg:text-[13px]">{etf?.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto w-full justify-between md:w-auto md:ml-auto">
          <div className="relative flex items-center flex-1 md:flex-initial">
            <button
              className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3.5 bg-primary text-white text-xs font-semibold border-none rounded-sm cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(30,58,95,0.12)] whitespace-nowrap w-full md:w-auto md:py-2 md:px-4 md:text-[13px] lg:py-[9px] lg:px-[18px] lg:text-[13px] hover:enabled:bg-[#1a4d8f] hover:enabled:shadow-[0_2px_6px_rgba(30,58,95,0.18)] hover:enabled:-translate-y-px active:enabled:translate-y-0 active:enabled:shadow-[0_1px_2px_rgba(30,58,95,0.12)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[rgba(30,58,95,0.3)] disabled:text-white/70"
              onClick={handleCompare}
              disabled={isDisabled}
              title={tooltipMessage}
              aria-label={tooltipMessage}
            >
              <span>비교 분석</span>
              <span className="inline-flex items-center justify-center min-w-[24px] h-[18px] px-1.5 bg-white text-primary text-[10px] font-bold rounded-[10px] ml-1 border border-[rgba(30,58,95,0.15)] md:min-w-7 md:h-5 md:text-[11px] lg:min-w-7 lg:h-5 lg:text-[11px] disabled:opacity-70">{compareList.length}/4</span>
            </button>
            {isDisabled && (
              <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 py-[5px] px-2 bg-[rgba(30,58,95,0.95)] text-white text-[10px] font-medium whitespace-nowrap rounded-sm pointer-events-none z-[1000] animate-[tooltipFadeIn_200ms_ease-out] md:bottom-[calc(100%+8px)] md:py-1.5 md:px-2.5 md:text-[11px] lg:py-1.5 lg:px-2.5 lg:text-[11px] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[rgba(30,58,95,0.95)]">
                2개 이상 선택
              </div>
            )}
          </div>
          <button
            className="flex items-center justify-center w-8 h-8 p-0 bg-transparent border border-gray-200/80 rounded-sm text-text-tertiary cursor-pointer transition-all duration-200 hover:bg-red-500/[0.06] hover:border-red-500/40 hover:text-danger md:w-[34px] md:h-[34px] lg:w-9 lg:h-9"
            onClick={clearCompare}
            title="전체 삭제"
            aria-label="전체 삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
