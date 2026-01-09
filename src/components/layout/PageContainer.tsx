import { ReactNode } from 'react';
import MarketSelectorCompact from '../common/MarketSelectorCompact';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerComponent?: ReactNode;
  headerAction?: ReactNode;
  showMarketSelector?: boolean;
  className?: string;
}

export default function PageContainer({
  children,
  title,
  subtitle,
  headerComponent,
  headerAction,
  showMarketSelector = false,
  className = ''
}: PageContainerProps) {
  const hasHeader = title || subtitle || headerComponent || headerAction || showMarketSelector;

  return (
    <div className={`flex flex-col gap-2xl p-md pb-[120px] max-w-full overflow-x-hidden bg-transparent md:gap-2xl md:px-2xl md:py-xl md:pb-[140px] lg:gap-2xl lg:p-2xl lg:pb-[140px] ${className}`}>
      {hasHeader && (
        <header className="flex flex-row items-start justify-between gap-md pb-md border-b-2 border-border-light bg-transparent md:gap-lg">
          <div className="flex-1 min-w-0">
            {headerComponent || (
              <div className="flex flex-col gap-1.5">
                <div>
                  {title && <h1 className="text-2xl font-extrabold text-text-primary tracking-tight m-0 leading-tight md:text-3xl">{title}</h1>}
                  {subtitle && <p className="text-sm font-medium text-text-secondary m-0 leading-normal md:text-base">{subtitle}</p>}
                </div>
              </div>
            )}
          </div>
          {(headerAction || showMarketSelector) && (
            <div className="flex-shrink-0 flex items-start md:items-center">
              {headerAction || (showMarketSelector && <MarketSelectorCompact />)}
            </div>
          )}
        </header>
      )}
      <div className="flex flex-col gap-2xl bg-transparent md:gap-2xl">
        {children}
      </div>
    </div>
  );
}
