import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  BarChart3, 
  Calculator, 
  Calendar, 
  Activity, 
  GitBranch, 
  Tag 
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/search', icon: Search, label: 'ETF 검색' },
  { path: '/compare', icon: BarChart3, label: '비교분석' },
  { path: '/simulator', icon: Calculator, label: '시뮬레이션' },
  { path: '/calendar', icon: Calendar, label: '배당캘린더' },
  { path: '/phase', icon: Activity, label: '국면분석' },
  { path: '/correlation', icon: GitBranch, label: '연관도' },
  { path: '/theme', icon: Tag, label: '테마' },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="var(--color-primary)"/>
              <path d="M8 10L16 6L24 10V22L16 26L8 22V10Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M16 6V26" stroke="white" strokeWidth="1.5"/>
              <path d="M8 10L24 22M24 10L8 22" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className={styles.logoTextContainer}>
            <span className={styles.logoText}>ETF AAA</span>
            <span className={styles.logoSubtext}>ETF 정보 서비스</span>
          </div>
        </NavLink>
      </div>
      
      {/* Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                end={item.path === '/'}
              >
                <item.icon size={20} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.version}>v1.0.0</p>
      </div>
    </aside>
  );
}

