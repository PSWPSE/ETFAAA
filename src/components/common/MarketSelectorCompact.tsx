import { useETFStore } from '../../store/etfStore';
import styles from './MarketSelectorCompact.module.css';

export default function MarketSelectorCompact() {
  const { selectedMarket, setSelectedMarket } = useETFStore();
  
  return (
    <div className={styles.marketSelectorCompact}>
      <button
        className={`${styles.marketOption} ${selectedMarket === 'korea' ? styles.active : ''}`}
        onClick={() => setSelectedMarket('korea')}
      >
        <span className={styles.marketFlag}>🇰🇷</span>
        <span className={styles.marketName}>한국</span>
      </button>
      <button
        className={`${styles.marketOption} ${selectedMarket === 'us' ? styles.active : ''}`}
        onClick={() => setSelectedMarket('us')}
      >
        <span className={styles.marketFlag}>🇺🇸</span>
        <span className={styles.marketName}>미국</span>
      </button>
    </div>
  );
}

