import { useETFStore, Market } from '../../store/etfStore';
import styles from './MarketSelector.module.css';

interface MarketSelectorProps {
  className?: string;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ className = '' }) => {
  const { selectedMarket, setSelectedMarket } = useETFStore();

  const handleMarketChange = (market: Market) => {
    setSelectedMarket(market);
  };

  return (
    <div className={`${styles.marketSelector} ${className}`}>
      <button
        className={`${styles.marketButton} ${selectedMarket === 'korea' ? styles.active : ''}`}
        onClick={() => handleMarketChange('korea')}
      >
        <span className={styles.flag}>🇰🇷</span>
        <span className={styles.label}>한국 ETF</span>
      </button>
      <button
        className={`${styles.marketButton} ${selectedMarket === 'us' ? styles.active : ''}`}
        onClick={() => handleMarketChange('us')}
      >
        <span className={styles.flag}>🇺🇸</span>
        <span className={styles.label}>미국 ETF</span>
      </button>
    </div>
  );
};

export default MarketSelector;

