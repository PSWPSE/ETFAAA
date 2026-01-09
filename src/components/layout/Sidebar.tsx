import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  TrendingUp,
  BarChart3,
  Calculator,
  Calendar,
  Activity,
  GitBranch,
  Tag
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/search', icon: Search, label: 'ETF 검색' },
  { path: '/ranking', icon: TrendingUp, label: '랭킹' },
  { path: '/compare', icon: BarChart3, label: '비교분석' },
  { path: '/simulator', icon: Calculator, label: '투자 실험실' },
  { path: '/calendar', icon: Calendar, label: '배당캘린더' },
  { path: '/phase', icon: Activity, label: '국면분석' },
  { path: '/correlation', icon: GitBranch, label: '연관도' },
  { path: '/theme', icon: Tag, label: '테마' },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-sidebar bg-layer-1 border-r border-border hidden lg:flex flex-col z-[200] overflow-y-auto">
      {/* Logo */}
      <div className="h-header px-md border-b-0 flex items-center bg-layer-1">
        <NavLink to="/" className="flex items-center gap-sm w-full">
          <div className="w-8 h-8 shrink-0 [&_svg]:w-full [&_svg]:h-full">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="var(--color-primary)"/>
              <path d="M8 10L16 6L24 10V22L16 26L8 22V10Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M16 6V26" stroke="white" strokeWidth="1.5"/>
              <path d="M8 10L24 22M24 10L8 22" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary tracking-[-0.02em] leading-[1.3]">ETF AAA</span>
            <span className="text-[10px] text-text-tertiary tracking-[-0.01em] leading-[1.2]">프리미엄 ETF 서비스</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-0 pt-6 pb-md bg-layer-1">
        <ul className="flex flex-col gap-0">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 m-0 border-l-[3px] border-l-transparent bg-transparent text-text-secondary text-base font-normal transition-all duration-fast hover:bg-brand/[0.08] hover:text-text-primary ${
                    isActive ? 'bg-brand-lighter text-brand !border-l-brand [&_svg]:text-brand' : ''
                  }`
                }
                end={item.path === '/'}
              >
                <item.icon size={20} strokeWidth={1.5} className="shrink-0 text-inherit" />
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-md border-t border-border-light bg-layer-1">
        <p className="text-xs text-text-tertiary text-center">v1.0.0</p>
      </div>
    </aside>
  );
}

