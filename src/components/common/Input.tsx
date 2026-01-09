import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col gap-xs ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${error ? '[&>input]:border-danger' : ''}`}>
        {leftIcon && (
          <span className="absolute left-3 flex items-center justify-center text-text-tertiary pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 px-md bg-white border border-border rounded-sm
            text-base text-text-primary transition-all duration-fast
            placeholder:text-text-tertiary
            hover:border-text-tertiary
            focus:outline-none
            [&[inputmode="numeric"]]:text-right [&[inputmode="numeric"]]:tabular-nums
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center justify-center text-text-tertiary pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger m-0">{error}</p>}
      {hint && !error && <p className="text-xs text-text-tertiary m-0">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
