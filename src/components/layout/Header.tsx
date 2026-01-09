import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronLeft } from 'lucide-react';
import { useETFStore } from '../../store/etfStore';
import MobileMenu from './MobileMenu';

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
      <header className="fixed top-0 left-0 right-0 h-header bg-layer-header border-b-0 z-[100] shadow-none lg:pl-sidebar">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-full max-w-content-max mx-auto px-sm bg-layer-header lg:flex lg:justify-between lg:px-lg lg:gap-xl lg:max-w-none">
          {/* Left Section */}
          <div className="flex items-center gap-sm justify-start lg:shrink-0">
            {isDetailPage ? (
              <button
                className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-md text-text-secondary transition-all duration-fast relative hover:bg-layer-1 hover:text-text-primary active:scale-95"
                onClick={handleBack}
                aria-label="뒤로 가기"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <button
                className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-md text-text-secondary transition-all duration-fast relative hover:bg-layer-1 hover:text-text-primary active:scale-95 lg:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label="메뉴"
              >
                <Menu size={22} />
              </button>
            )}
          </div>

          {/* Center - Logo or Title */}
          <div className="flex justify-center items-center lg:flex-1 lg:justify-start">
            {isDetailPage ? (
              <h1 className="text-lg font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis lg:hidden">{pageTitle}</h1>
            ) : (
              <div className="flex items-center gap-sm cursor-pointer lg:hidden" onClick={() => navigate('/')}>
                <div className="w-8 h-8 [&_svg]:w-full [&_svg]:h-full">
                  <svg viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="var(--color-primary)"/>
                    <path d="M8 10L16 6L24 10V22L16 26L8 22V10Z" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M16 6V26" stroke="white" strokeWidth="1.5"/>
                    <path d="M8 10L24 22M24 10L8 22" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-primary tracking-[-0.02em]">ETF AAA</span>
              </div>
            )}

            {/* Desktop Search Form */}
            <form className="hidden lg:flex relative w-full max-w-[560px]" onSubmit={handleSearch}>
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                className="w-full h-11 pl-11 pr-lg bg-layer-1 border border-transparent rounded-lg text-base text-text-primary transition-all duration-fast placeholder:text-text-tertiary focus:outline-none focus:bg-layer-2 focus:border-brand focus:shadow-[0_0_0_3px_rgba(95,155,143,0.1)]"
                placeholder="ETF 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-xs justify-end lg:shrink-0 lg:gap-sm">
            {!isSearchOpen && (
              <button
                className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-md text-text-secondary transition-all duration-fast relative hover:bg-layer-1 hover:text-text-primary active:scale-95"
                onClick={() => setIsSearchOpen(true)}
                aria-label="검색"
              >
                <Search size={22} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 right-0 h-header bg-layer-header flex items-center px-sm lg:px-lg animate-slide-in-up z-10 border-b border-border-light">
            <form className="flex items-center relative w-full" onSubmit={handleSearch}>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                className="w-full h-10 lg:h-11 pl-10 pr-11 bg-layer-1 border border-transparent rounded-lg text-sm lg:text-base text-text-primary transition-all duration-fast placeholder:text-text-tertiary focus:outline-none focus:bg-layer-2 focus:border-brand focus:shadow-[0_0_0_3px_rgba(95,155,143,0.1)]"
                placeholder="ETF 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-2 flex items-center justify-center w-8 h-8 rounded-sm text-text-tertiary"
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
  if (pathname === '/simulator') return '투자 실험실';
  if (pathname === '/calendar') return '배당 캘린더';
  if (pathname === '/phase') return '국면 분석';
  if (pathname === '/correlation') return '연관도 분석';
  if (pathname.startsWith('/theme')) return '테마';
  return '';
}
