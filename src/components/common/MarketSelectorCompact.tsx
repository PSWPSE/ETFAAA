import { useETFStore } from '../../store/etfStore';

export default function MarketSelectorCompact() {
  const { selectedMarket, setSelectedMarket } = useETFStore();

  return (
    <div className="flex gap-1 p-[3px] bg-bg-secondary rounded-md border border-border-light md:gap-1.5 md:p-1">
      <button
        className={`flex items-center justify-center gap-1 py-[7px] px-3 bg-transparent border-none rounded-sm cursor-pointer transition-all duration-fast text-xs md:gap-1.5 md:py-1.5 md:px-3 md:text-sm hover:bg-white ${
          selectedMarket === 'korea' ? 'bg-white shadow-sm' : ''
        }`}
        onClick={() => setSelectedMarket('korea')}
      >
        <span className="text-lg leading-none md:text-base">🇰🇷</span>
        <span className={`hidden md:block font-semibold ${
          selectedMarket === 'korea' ? 'text-text-primary' : 'text-text-secondary'
        }`}>한국</span>
      </button>
      <button
        className={`flex items-center justify-center gap-1 py-[7px] px-3 bg-transparent border-none rounded-sm cursor-pointer transition-all duration-fast text-xs md:gap-1.5 md:py-1.5 md:px-3 md:text-sm hover:bg-white ${
          selectedMarket === 'us' ? 'bg-white shadow-sm' : ''
        }`}
        onClick={() => setSelectedMarket('us')}
      >
        <span className="text-lg leading-none md:text-base">🇺🇸</span>
        <span className={`hidden md:block font-semibold ${
          selectedMarket === 'us' ? 'text-text-primary' : 'text-text-secondary'
        }`}>미국</span>
      </button>
      <button
        className={`flex items-center justify-center gap-1 py-[7px] px-3 bg-transparent border-none rounded-sm cursor-pointer transition-all duration-fast text-xs md:gap-1.5 md:py-1.5 md:px-3 md:text-sm hover:bg-white ${
          selectedMarket === 'all' ? 'bg-white shadow-sm' : ''
        }`}
        onClick={() => setSelectedMarket('all')}
      >
        <span className="text-lg leading-none md:text-base">🌐</span>
        <span className={`hidden md:block font-semibold ${
          selectedMarket === 'all' ? 'text-text-primary' : 'text-text-secondary'
        }`}>전체</span>
      </button>
    </div>
  );
}
