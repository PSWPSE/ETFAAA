import { useState, useRef, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Card, CardHeader } from './index';
import { useETFStore } from '../../store/etfStore';
import { koreanETFs, usETFs } from '../../data';

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
      className={`relative z-10 overflow-visible transition-all duration-slow ${
        required && !selectedETF
          ? 'border-2 border-danger shadow-[0_0_0_4px_rgba(239,68,68,0.1),0_4px_12px_rgba(239,68,68,0.15)] animate-pulse-required'
          : ''
      } ${className}`}
    >
      {!selectedETF && (
        <CardHeader title={title} subtitle={subtitle} />
      )}

      <div className="relative mt-sm flex flex-col gap-sm" ref={dropdownRef}>
        {selectedETF ? (
          /* 선택된 ETF 표시 */
          <div className="flex items-start justify-between gap-md max-sm:flex-col max-sm:items-stretch">
            <div className="flex-1 flex flex-col gap-sm min-w-0">
              <span className="text-base font-semibold text-text-primary">{selectedETF.name}</span>
              <span className="text-sm text-text-secondary">
                {selectedETF.ticker} · {selectedETF.issuer} · {selectedETF.category}
              </span>
            </div>
            <button
              className="flex items-center gap-1.5 py-sm px-md bg-white border border-border rounded-full text-sm font-medium text-text-secondary transition-all duration-fast hover:border-text-tertiary min-h-touch whitespace-nowrap max-sm:w-full max-sm:justify-center"
              onClick={handleClear}
            >
              <ArrowLeft size={16} />
              다른 ETF 선택
            </button>
          </div>
        ) : (
          /* 검색 입력 */
          <>
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-[14px] text-text-tertiary pointer-events-none" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full h-12 px-11 bg-white border border-border rounded-lg text-base text-text-primary transition-all duration-fast focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(95,155,143,0.1)] placeholder:text-text-tertiary"
              />
            </div>

            {/* 검색 결과 */}
            {showDropdown && searchQuery && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-border rounded-lg shadow-lg z-[1000] max-h-80 overflow-hidden">
                {filteredETFs.length > 0 ? (
                  <div className="overflow-y-auto max-h-80">
                    {filteredETFs.slice(0, 10).map(etf => (
                      <button
                        key={etf.id}
                        className="flex justify-between items-center w-full py-sm px-md text-left transition-colors duration-fast min-h-touch gap-md border-b border-border-light last:border-b-0 hover:bg-bg-secondary"
                        onClick={() => handleSelect(etf.id)}
                      >
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{etf.name}</span>
                          <span className="text-xs text-text-tertiary">{etf.issuer} · {etf.category}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary flex-shrink-0">{etf.ticker}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-lg text-center text-sm text-text-tertiary">
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
