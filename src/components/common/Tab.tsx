import { ReactNode, createContext, useContext, useState } from 'react';
import styles from './Tab.module.css';

interface TabContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  onChange?: (tab: string) => void;
}

export function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };
  
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={styles.tabs}>
        {children}
      </div>
    </TabContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabList({ children, variant = 'default' }: TabListProps) {
  return (
    <div className={`${styles.tabList} ${styles[variant]}`} role="tablist">
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function Tab({ value, children, disabled }: TabProps) {
  const context = useContext(TabContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  return (
    <button
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={() => !disabled && setActiveTab(value)}
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const context = useContext(TabContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  const { activeTab } = context;
  
  if (activeTab !== value) return null;
  
  return (
    <div className={styles.tabPanel} role="tabpanel">
      {children}
    </div>
  );
}




