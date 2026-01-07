import { X } from 'lucide-react';
import styles from './SelectedFilters.module.css';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface SelectedFiltersProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function SelectedFilters({
  filters,
  onRemove,
  onClearAll,
}: SelectedFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className={styles.selectedFiltersSection}>
      <div className={styles.selectedFiltersHeader}>
        <div className={styles.selectedFiltersLabel}>
          선택된 필터 (<span className={styles.selectedFiltersCount}>{filters.length}</span>)
        </div>
        <button
          className={styles.clearAllFiltersButton}
          onClick={onClearAll}
        >
          전체 초기화
        </button>
      </div>
      <div className={styles.selectedFilterChips}>
        {filters.map((filter) => (
          <div key={filter.id} className={styles.selectedFilterChip}>
            <span>{filter.label}</span>
            <button
              onClick={() => onRemove(filter.id)}
              aria-label={`${filter.label} 필터 제거`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

