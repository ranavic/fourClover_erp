import React from 'react';
import type { Customer } from '../../types/customer';
import styles from './StatusBadge.module.css';

type BadgeVariant = Customer['status'] | 'Draft' | 'Confirmed' | 'Cancelled' | 'IN' | 'OUT' | string;

interface StatusBadgeProps {
  status: BadgeVariant;
}

const variantMap: Record<string, string> = {
  Active: 'success',
  Confirmed: 'success',
  IN: 'success',
  Lead: 'warning',
  Draft: 'warning',
  Inactive: 'neutral',
  Cancelled: 'danger',
  OUT: 'danger',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant = variantMap[status] || 'neutral';
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {status}
    </span>
  );
};
