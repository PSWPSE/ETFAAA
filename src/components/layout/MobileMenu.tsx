import { NavLink } from 'react-router-dom';
import { X, Home, Search, BarChart3, Calculator, Calendar, Activity, GitBranch, Tag } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/search', icon: Search, label: 'ETF 검색' },
  { path: '/compare', icon: BarChart3, label: '비교분석' },
  { path: '/simulator', icon: Calculator, label: '투자 실험실' },
  { path: '/calendar', icon: Calendar, label: '배당 캘린더' },
  { path: '/phase', icon: Activity, label: '국면분석' },
  { path: '/correlation', icon: GitBranch, label: '연관도 분석' },
  { path: '/theme', icon: Tag, label: '테마' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[300] animate-[fadeIn_150ms_ease-out] lg:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-layer-modal z-[310] flex flex-col animate-[slideIn_200ms_ease-out] lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-lg py-md border-b border-border-light">
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <rect width="32" height="32" rx="6" fill="var(--color-primary)"/>
                <path d="M8 10L16 6L24 10V22L16 26L8 22V10Z" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M16 6V26" stroke="white" strokeWidth="1.5"/>
                <path d="M8 10L24 22M24 10L8 22" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary leading-tight">ETF AAA</span>
              <span className="text-xs text-text-tertiary">프리미엄 ETF 서비스</span>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-md text-text-secondary transition-all duration-fast hover:bg-bg-secondary hover:text-text-primary"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-md">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-md px-lg py-md text-base font-medium min-h-[52px] transition-all duration-fast ${
                  isActive
                    ? 'bg-brand-lighter text-brand border-r-[3px] border-brand'
                    : 'text-text-secondary hover:bg-bg hover:text-text-primary active:bg-bg-secondary'
                }`
              }
              onClick={onClose}
              end={item.path === '/'}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-lg py-md border-t border-border-light">
          <p className="text-xs text-text-tertiary m-0">v1.0.0</p>
        </div>
      </div>
    </>
  );
}
