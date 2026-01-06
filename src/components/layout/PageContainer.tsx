import { ReactNode } from 'react';
import MarketSelectorCompact from '../common/MarketSelectorCompact';
import styles from './PageContainer.module.css';

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
    <div className={`${styles.pageContainer} ${className}`}>
      {hasHeader && (
        <header className={styles.pageHeader}>
          <div className={styles.headerMain}>
            {headerComponent || (
              <div className={styles.headerTitleGroup}>
                <div>
                  {title && <h1 className={styles.pageTitle}>{title}</h1>}
                  {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
                </div>
              </div>
            )}
          </div>
          {(headerAction || showMarketSelector) && (
            <div className={styles.headerAction}>
              {headerAction || (showMarketSelector && <MarketSelectorCompact />)}
            </div>
          )}
        </header>
      )}
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}

