import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/',          label: 'Dashboard',      icon: <LayoutDashboard size={16} />, end: true, show: true },
    { path: '/customers', label: 'Customers',       icon: <Users size={16} />, show: ['ADMIN', 'SALES'].includes(user?.role || '') },
    { path: '/products',  label: 'Products',        icon: <Package size={16} />, show: true },
    { path: '/challans',  label: 'Sales Challans',  icon: <FileText size={16} />, show: true },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className={styles.sidebar}>
      {/* Wordmark */}
      <div className={styles.logo}>
        <span className={styles.logoWordmark}>four<em>Clover</em></span>
      </div>

      {/* Navigation */}
      <nav className={styles.navSection}>
        <span className={styles.sectionLabel}>Workspace</span>
        {navItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User strip at bottom */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userStrip}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.name || 'Admin'}</span>
            <span className={styles.userRole}>{user?.role || 'admin'}</span>
          </div>
          <span className={styles.logoutIcon} onClick={logout} title="Sign out">
            <LogOut size={14} />
          </span>
        </div>
      </div>
    </aside>
  );
};
