import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ComparisonBar from './ComparisonBar';
// import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-layer-1">
      <Header />
      <Sidebar />
      <main className="flex-1 pt-header pb-[calc(theme(spacing.bottom-nav)+var(--safe-area-bottom,0px))] lg:pl-sidebar lg:pb-0 transition-[padding-left] duration-normal">
        <div className="max-w-content-max mx-auto p-0">
          {children}
        </div>
      </main>
      <ComparisonBar />
      {/* <BottomNav /> */}
    </div>
  );
}



