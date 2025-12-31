import { useNavigate, useLocation } from 'react-router-dom';
import { X, BarChart3, Trash2 } from 'lucide-react';
import { useETFStore } from '../../store/etfStore';
import { koreanETFs, usETFs } from '../../data/etfs';
import { formatPrice, formatPercent, getChangeClass } from '../../utils/format';
import styles from './ComparisonBar.module.css';

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
    <div className={styles.comparisonBar}>
      <div className={styles.container}>
        <div className={styles.etfList}>
          {compareETFs.map((etf) => (
            <div key={etf.id} className={styles.etfItem}>
              <button
                className={styles.removeButton}
                onClick={() => removeFromCompare(etf.id)}
                title="제거"
                aria-label={`${etf.name} 제거`}
              >
                <X size={14} />
              </button>
              <div 
                className={styles.etfInfo}
                onClick={() => navigate(`/etf/${etf.id}`)}
              >
                <span className={styles.etfName}>{etf.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.buttonWrapper}>
            <button 
              className={styles.compareButton}
              onClick={handleCompare}
              disabled={isDisabled}
              title={tooltipMessage}
              aria-label={tooltipMessage}
            >
              <span>비교 분석</span>
              <span className={styles.count}>{compareList.length}/4</span>
            </button>
            {isDisabled && (
              <div className={styles.tooltip}>
                2개 이상 선택
              </div>
            )}
          </div>
          <button 
            className={styles.clearButton}
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

