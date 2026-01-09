import { NavLink } from 'react-router-dom';
import { Home, Search, BarChart3, Calculator, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const mainNavItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/search', icon: Search, label: '검색' },
  { path: '/compare', icon: BarChart3, label: '비교' },
  { path: '/simulator', icon: Calculator, label: '시뮬' },
];

const moreNavItems = [
  { path: '/calendar', label: '배당캘린더' },
  { path: '/phase', label: '국면분석' },
  { path: '/correlation', label: '연관도' },
  { path: '/theme', label: '테마' },
];

export default function BottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[150] animate-[fadeIn_150ms_ease-out] lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu */}
      {isMoreOpen && (
        <div className="fixed bottom-bottom-nav left-0 right-0 bg-layer-modal rounded-t-xl z-[160] animate-[slideUp_200ms_ease-out] pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
          <div className="flex items-center justify-between px-lg py-md border-b border-border-light font-semibold text-text-primary">
            <span>더보기</span>
            <button onClick={() => setIsMoreOpen(false)} className="text-sm text-text-secondary">닫기</button>
          </div>
          <nav className="grid grid-cols-3 gap-xs p-md">
            {moreNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center p-md rounded-md text-sm font-medium min-h-touch transition-all duration-fast ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`
                }
                onClick={() => setIsMoreOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-bottom-nav bg-layer-header border-t border-border-light flex items-stretch justify-around pb-[env(safe-area-inset-bottom,0px)] z-[100] lg:hidden">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-0.5 py-xs text-text-tertiary transition-colors duration-fast min-w-touch active:bg-bg-secondary ${
                isActive ? 'text-brand' : ''
              }`
            }
            end={item.path === '/'}
          >
            <item.icon size={22} className="flex-shrink-0" />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </NavLink>
        ))}

        <button
          className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-xs transition-colors duration-fast min-w-touch active:bg-bg-secondary ${
            isMoreOpen ? 'text-brand' : 'text-text-tertiary'
          }`}
          onClick={() => setIsMoreOpen(!isMoreOpen)}
        >
          <MoreHorizontal size={22} className="flex-shrink-0" />
          <span className="text-[10px] font-medium tracking-tight">더보기</span>
        </button>
      </nav>
    </>
  );
}
