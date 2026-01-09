import { ReactNode, HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  overflow?: 'hidden' | 'visible' | 'auto';
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-sm',
  md: 'p-md',
  lg: 'p-lg',
};

const overflowClasses = {
  hidden: 'overflow-hidden',
  visible: 'overflow-visible',
  auto: 'overflow-auto',
};

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  padding = 'md',
  hover = false,
  clickable = false,
  overflow = 'hidden',
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-layer-2 rounded-sm border border-border shadow-card
        ${overflowClasses[overflow]}
        ${paddingClasses[padding]}
        ${hover ? 'transition-all duration-fast hover:border-border hover:shadow-md' : ''}
        ${clickable ? 'cursor-pointer transition-all duration-fast hover:border-border hover:shadow-md active:scale-[0.99]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-sm mb-md">
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-primary m-0 leading-[1.4]">{title}</h3>
        {subtitle && <p className="text-sm text-text-tertiary mt-0.5 mb-0">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
