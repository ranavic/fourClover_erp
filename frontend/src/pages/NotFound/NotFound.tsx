import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export const NotFound: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className={styles.link}>← Back to Dashboard</Link>
      </div>
    </div>
  );
};
