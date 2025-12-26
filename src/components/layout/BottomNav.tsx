import { NavLink } from 'react-router-dom';
import { Home, Search, BarChart3, Calculator, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import styles from './BottomNav.module.css';

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
          className={styles.overlay} 
          onClick={() => setIsMoreOpen(false)}
        />
      )}
      
      {/* More Menu */}
      {isMoreOpen && (
        <div className={styles.moreMenu}>
          <div className={styles.moreMenuHeader}>
            <span>더보기</span>
            <button onClick={() => setIsMoreOpen(false)}>닫기</button>
          </div>
          <nav className={styles.moreMenuNav}>
            {moreNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `${styles.moreMenuItem} ${isActive ? styles.active : ''}`
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
      <nav className={styles.bottomNav}>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end={item.path === '/'}
          >
            <item.icon size={22} className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
        
        <button 
          className={`${styles.navItem} ${isMoreOpen ? styles.active : ''}`}
          onClick={() => setIsMoreOpen(!isMoreOpen)}
        >
          <MoreHorizontal size={22} className={styles.navIcon} />
          <span className={styles.navLabel}>더보기</span>
        </button>
      </nav>
    </>
  );
}

