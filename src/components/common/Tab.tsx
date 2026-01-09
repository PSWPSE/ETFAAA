import { ReactNode, createContext, useContext, useState } from 'react';

interface TabContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: 'default' | 'pills' | 'underline';
}

const TabContext = createContext<TabContextValue | null>(null);

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  onChange?: (tab: string) => void;
  className?: string;
}

export function Tabs({ defaultTab, children, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant: 'default' }}>
      <div className={`flex flex-col ${className || ''}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  variant?: 'default' | 'pills' | 'underline';
}

const tabListVariantClasses = {
  default: 'bg-bg-secondary p-1 rounded-md',
  pills: 'gap-sm',
  underline: 'gap-1.5 py-3 px-6 bg-gradient-to-b from-[#fafbfc] to-[#f5f7fa] border-b-[3px] border-border-light relative max-md:py-2.5 max-md:px-3 max-md:gap-[3px] max-md:overflow-x-auto max-md:scrollbar-none',
};

export function TabList({ children, variant = 'default' }: TabListProps) {
  return (
    <TabListContext.Provider value={variant}>
      <div
        className={`flex gap-xs overflow-x-auto scrollbar-none ${tabListVariantClasses[variant]}`}
        role="tablist"
      >
        {children}
      </div>
    </TabListContext.Provider>
  );
}

const TabListContext = createContext<'default' | 'pills' | 'underline'>('default');

interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

const getTabClasses = (variant: 'default' | 'pills' | 'underline', isActive: boolean) => {
  const baseClasses = 'min-h-touch cursor-pointer flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';

  if (variant === 'default') {
    return `${baseClasses} py-sm px-md rounded-sm text-sm font-medium text-text-secondary bg-transparent transition-all duration-fast hover:text-text-primary ${
      isActive ? 'bg-white text-text-primary shadow-sm' : ''
    }`;
  }

  if (variant === 'pills') {
    return `${baseClasses} py-sm px-md rounded-full text-sm font-medium text-text-secondary bg-bg-secondary transition-all duration-fast hover:bg-border ${
      isActive ? 'bg-primary text-white' : ''
    }`;
  }

  // underline variant
  return `${baseClasses} py-2.5 px-7 text-[15px] font-bold text-text-tertiary bg-white/50 border-2 border-transparent rounded-t-[10px] relative transition-all duration-200 tracking-tight shadow-[inset_0_-1px_2px_rgba(0,0,0,0.02)] ml-0.5 first:ml-0 max-md:py-2.5 max-md:px-[18px] max-md:text-[13px] max-md:shrink-0 ${
    isActive
      ? 'text-primary font-extrabold bg-white border-2 border-border border-b-white shadow-[0_-3px_12px_rgba(30,58,95,0.1),inset_0_1px_0_rgba(255,255,255,0.5)] relative -mb-[3px] pb-[13px] z-10 max-md:pb-3'
      : 'hover:text-text-primary hover:bg-white/80 hover:border-[rgba(30,58,95,0.15)] hover:-translate-y-px'
  }`;
};

export function Tab({ value, children, disabled }: TabProps) {
  const context = useContext(TabContext);
  const variant = useContext(TabListContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      className={getTabClasses(variant, isActive)}
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
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const context = useContext(TabContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div
      className={`flex flex-col gap-lg py-xl pb-12 animate-[fadeIn_0.3s_ease-out] max-w-full overflow-x-hidden [&>*]:!mb-0 [&>*:first-child]:mt-0 max-md:gap-lg max-md:py-lg max-md:pb-10 ${className || ''}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}





