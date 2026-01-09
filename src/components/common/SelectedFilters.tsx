import { X } from 'lucide-react';

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
    <div className="mt-md p-md bg-bg-secondary rounded-md border border-border-light">
      <div className="flex items-center justify-between mb-sm">
        <div className="text-[13px] font-semibold text-text-secondary">
          선택된 필터 (<span className="text-primary font-bold">{filters.length}</span>)
        </div>
        <button
          className="py-1 px-3 bg-transparent border border-border rounded-md text-xs font-medium text-text-secondary cursor-pointer transition-all duration-fast hover:bg-white hover:border-primary hover:text-primary"
          onClick={onClearAll}
        >
          전체 초기화
        </button>
      </div>
      <div className="flex flex-wrap gap-xs">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white border border-border-light rounded-full text-xs text-text-primary font-medium animate-[fadeIn_0.2s_ease-out]"
          >
            <span className="whitespace-nowrap">{filter.label}</span>
            <button
              onClick={() => onRemove(filter.id)}
              aria-label={`${filter.label} 필터 제거`}
              className="flex items-center justify-center p-0 bg-transparent border-none text-text-tertiary cursor-pointer transition-colors duration-fast hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

