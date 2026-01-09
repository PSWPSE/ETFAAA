import { useETFStore, Market } from '../../store/etfStore';

interface MarketSelectorProps {
  className?: string;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ className = '' }) => {
  const { selectedMarket, setSelectedMarket } = useETFStore();

  const handleMarketChange = (market: Market) => {
    setSelectedMarket(market);
  };

  return (
    <div className={`flex gap-2 p-1 bg-layer-1 rounded-[10px] max-md:gap-1 max-md:p-[3px] ${className}`}>
      <button
        className={`flex items-center gap-1.5 py-sm px-md border-none rounded-xl bg-transparent cursor-pointer transition-all duration-normal text-sm font-medium text-text-secondary min-h-touch hover:bg-border max-md:py-1.5 max-md:px-3 max-md:text-[13px] max-md:min-h-10 ${
          selectedMarket === 'korea'
            ? 'bg-primary text-white shadow-[0_2px_8px_rgba(30,58,95,0.25)] hover:bg-primary'
            : ''
        }`}
        onClick={() => handleMarketChange('korea')}
      >
        <span className="text-lg leading-none max-md:text-base">🇰🇷</span>
        <span className="whitespace-nowrap">한국 ETF</span>
      </button>
      <button
        className={`flex items-center gap-1.5 py-sm px-md border-none rounded-xl bg-transparent cursor-pointer transition-all duration-normal text-sm font-medium text-text-secondary min-h-touch hover:bg-border max-md:py-1.5 max-md:px-3 max-md:text-[13px] max-md:min-h-10 ${
          selectedMarket === 'us'
            ? 'bg-primary text-white shadow-[0_2px_8px_rgba(30,58,95,0.25)] hover:bg-primary'
            : ''
        }`}
        onClick={() => handleMarketChange('us')}
      >
        <span className="text-lg leading-none max-md:text-base">🇺🇸</span>
        <span className="whitespace-nowrap">미국 ETF</span>
      </button>
      <button
        className={`flex items-center gap-1.5 py-sm px-md border-none rounded-xl bg-transparent cursor-pointer transition-all duration-normal text-sm font-medium text-text-secondary min-h-touch hover:bg-border max-md:py-1.5 max-md:px-3 max-md:text-[13px] max-md:min-h-10 ${
          selectedMarket === 'all'
            ? 'bg-primary text-white shadow-[0_2px_8px_rgba(30,58,95,0.25)] hover:bg-primary'
            : ''
        }`}
        onClick={() => handleMarketChange('all')}
      >
        <span className="text-lg leading-none max-md:text-base">🌐</span>
        <span className="whitespace-nowrap">전체</span>
      </button>
    </div>
  );
};

export default MarketSelector;
