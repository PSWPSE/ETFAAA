import { useState, useRef, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Card, CardHeader } from './index';
import { useETFStore } from '../../store/etfStore';
import { koreanETFs, usETFs } from '../../data/etfs';
import type { ETF } from '../../types/etf';
import styles from './ETFSearchCard.module.css';

interface ETFSearchCardProps {
  title: string;
  subtitle: string;
  selectedETFId: string;
  onSelect: (etfId: string) => void;
  onClear?: () => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function ETFSearchCard({
  title,
  subtitle,
  selectedETFId,
  onSelect,
  onClear,
  placeholder = 'ETF 이름 또는 종목코드 검색...',
  required = false,
  className = ''
}: ETFSearchCardProps) {
  const { selectedMarket } = useETFStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const allETFs = selectedMarket === 'korea' ? koreanETFs : usETFs;
  const selectedETF = allETFs.find(etf => etf.id === selectedETFId);
  
  // 검색 결과 필터링
  const filteredETFs = allETFs.filter(etf =>
    etf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    etf.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (etfId: string) => {
    onSelect(etfId);
    setSearchQuery('');
    setShowDropdown(false);
  };
  
  const handleClear = () => {
    onSelect('');
    setSearchQuery('');
    if (onClear) onClear();
  };
  
  return (
    <Card 
      padding="md" 
      className={`${styles.etfCard} ${required && !selectedETF ? styles.required : ''} ${className}`}
    >
      {!selectedETF && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      
      <div className={styles.etfSelector} ref={dropdownRef}>
        {selectedETF ? (
          /* 선택된 ETF 표시 */
          <div className={styles.selectedETFCard}>
            <div className={styles.selectedETFInfo}>
              <span className={styles.selectedETFName}>{selectedETF.name}</span>
              <span className={styles.selectedETFMeta}>
                {selectedETF.ticker} · {selectedETF.issuer} · {selectedETF.category}
              </span>
            </div>
            <button 
              className={styles.changeETFButton}
              onClick={handleClear}
            >
              <ArrowLeft size={16} />
              다른 ETF 선택
            </button>
          </div>
        ) : (
          /* 검색 입력 */
          <>
            <div className={styles.etfSearchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={styles.etfSearchInput}
              />
            </div>
            
            {/* 검색 결과 */}
            {showDropdown && searchQuery && (
              <div className={styles.etfDropdown}>
                {filteredETFs.length > 0 ? (
                  <div className={styles.etfList}>
                    {filteredETFs.slice(0, 10).map(etf => (
                      <button
                        key={etf.id}
                        className={styles.etfItem}
                        onClick={() => handleSelect(etf.id)}
                      >
                        <div className={styles.etfItemInfo}>
                          <span className={styles.etfItemName}>{etf.name}</span>
                          <span className={styles.etfItemMeta}>{etf.issuer} · {etf.category}</span>
                        </div>
                        <span className={styles.etfItemTicker}>{etf.ticker}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

