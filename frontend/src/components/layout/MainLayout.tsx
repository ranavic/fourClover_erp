import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className={styles.mainWrapper}>
        {/* Mobile topbar */}
        <div className={styles.mobileTopbar}>
          <button className={styles.hamburger} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>fourClover</span>
        </div>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
