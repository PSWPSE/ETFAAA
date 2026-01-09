import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:hover:bg-brand',
  secondary: 'bg-bg-secondary text-text-primary hover:bg-bg-gray disabled:hover:bg-bg-secondary',
  outline: 'bg-transparent text-brand border-[1.5px] border-brand hover:bg-brand hover:text-white disabled:hover:bg-transparent disabled:hover:text-brand',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:hover:bg-transparent disabled:hover:text-text-secondary',
  danger: 'bg-danger text-white hover:bg-red-600 disabled:hover:bg-danger',
};

const sizeClasses = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-[52px] px-8 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  leftIcon,
  rightIcon,
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-xs font-medium rounded-sm
        transition-all duration-fast whitespace-nowrap cursor-pointer select-none
        border-0 tracking-normal shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        active:enabled:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'pointer-events-none' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
      )}
      {!loading && leftIcon && (
        <span className="flex items-center justify-center flex-shrink-0">{leftIcon}</span>
      )}
      <span className="flex items-center font-bold">{children}</span>
      {!loading && rightIcon && (
        <span className="flex items-center justify-center flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
