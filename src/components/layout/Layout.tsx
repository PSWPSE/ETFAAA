import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

