import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Topbar.module.css';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.spacer} />
      
      <div className={styles.actions}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <UserIcon size={20} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Admin User'}</span>
            <span className={styles.userRole}>{user?.role || 'Admin'}</span>
          </div>
        </div>
        
        <button className={styles.logoutBtn} onClick={logout} title="Log Out">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
