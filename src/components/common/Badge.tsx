import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-bg-secondary text-text-secondary',
  primary: 'bg-brand-lighter text-brand',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
};

const sizeClasses = {
  sm: 'py-0.5 px-1.5 text-xs',
  md: 'py-xs px-sm text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md'
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium rounded-sm whitespace-nowrap
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {children}
    </span>
  );
}
