import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronLeft } from 'lucide-react';
import { useETFStore } from '../../store/etfStore';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useETFStore();
  
  const isDetailPage = location.pathname.startsWith('/etf/');
  const pageTitle = getPageTitle(location.pathname);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Left Section */}
          <div className={styles.left}>
            {isDetailPage ? (
              <button 
                className={styles.iconButton} 
                onClick={handleBack}
                aria-label="뒤로 가기"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <>
                {/* Mobile Menu Button */}
                <button 
                  className={`${styles.iconButton} ${styles.menuButton}`}
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="메뉴"
                >
                  <Menu size={22} />
                </button>
                
                <div className={styles.logo} onClick={() => navigate('/')}>
                  <div className={styles.logoIcon}>
                    <svg viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="6" fill="var(--color-primary)"/>
                      <path d="M8 10L16 6L24 10V22L16 26L8 22V10Z" stroke="white" strokeWidth="2" fill="none"/>
                      <path d="M16 6V26" stroke="white" strokeWidth="1.5"/>
                      <path d="M8 10L24 22M24 10L8 22" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className={styles.logoText}>ETF AAA</span>
                </div>
              </>
            )}
          </div>
          
          {/* Center - Title (mobile) or Search (desktop) */}
          <div className={styles.center}>
            {isDetailPage ? (
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            ) : (
              <form className={styles.searchForm} onSubmit={handleSearch}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="ETF 검색 (이름, 종목코드)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            )}
          </div>
          
          {/* Right Section */}
          <div className={styles.right}>
            {!isSearchOpen && (
              <button 
                className={`${styles.iconButton} ${styles.mobileSearchButton}`}
                onClick={() => setIsSearchOpen(true)}
                aria-label="검색"
              >
                <Search size={22} />
              </button>
            )}
            <button className={styles.iconButton} aria-label="알림">
              <Bell size={22} />
              <span className={styles.notiBadge} />
            </button>
          </div>
        </div>
        
        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className={styles.mobileSearchOverlay}>
            <form className={styles.mobileSearchForm} onSubmit={handleSearch}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="ETF 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                type="button"
                className={styles.closeButton}
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}
      </header>
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/etf/')) return 'ETF 상세';
  if (pathname === '/search') return '검색';
  if (pathname === '/compare') return '비교분석';
  if (pathname === '/simulator') return '투자 시뮬레이션';
  if (pathname === '/calendar') return '배당 캘린더';
  if (pathname === '/phase') return '국면 분석';
  if (pathname === '/correlation') return '연관도 분석';
  if (pathname.startsWith('/theme')) return '테마';
  return '';
}
