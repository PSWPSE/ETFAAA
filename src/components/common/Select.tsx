import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'py-1.5 pl-2.5 pr-8 text-xs',
  md: 'py-2 pl-3 pr-9 text-sm',
  lg: 'py-2.5 pl-3.5 pr-10 text-base',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  placeholder,
  fullWidth = false,
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col gap-xs ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${error ? '[&>select]:border-danger' : ''}`}>
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-bg border border-border rounded-md font-semibold text-text-primary cursor-pointer appearance-none transition-all duration-fast hover:bg-white hover:border-primary focus:outline-none focus:bg-white focus:border-primary ${sizeClasses[size]} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-3 text-text-tertiary pointer-events-none" />
      </div>
      {error && <p className="text-xs text-danger m-0">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;





