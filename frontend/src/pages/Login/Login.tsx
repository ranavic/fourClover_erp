import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import styles from './Login.module.css';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@fourclover.com', password: 'Password123', access: 'Full access' },
  { role: 'Sales', email: 'sales@fourclover.com', password: 'Password123', access: 'Customers & Challans' },
  { role: 'Warehouse', email: 'warehouse@fourclover.com', password: 'Password123', access: 'Products & Stock' },
  { role: 'Accounts', email: 'accounts@fourclover.com', password: 'Password123', access: 'Products & Invoices' },
] as const;

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleFillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      {/* ── Left brand panel ── */}
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          {/* Wordmark only — no generic box icon */}
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>
            4C
          </span>
          <h1>fourClover</h1>
        </div>

        <div className={styles.brandBody}>
          <p className={styles.tagline}>
            Operations,<br />
            without the chaos.
          </p>
          <p className={styles.taglineSub}>
            Manage customers, inventory, and sales challans from one focused workspace.
          </p>
        </div>

        <span className={styles.brandFooter}>fourClover ERP/CRM</span>
      </div>

      {/* ── Right form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h2>Sign in</h2>
            <p>Use your organisation credentials or pick a demo role below.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <Input
              label="Email address"
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              className={styles.submitBtn}
            >
              Continue →
            </Button>
          </form>

          <div className={styles.demoSection}>
            <div className={styles.demoHeader}>
              <span className={styles.demoTitle}>Demo accounts</span>
              <span className={styles.demoHint}>Click a role to autofill</span>
            </div>
            <div className={styles.demoGrid}>
              {DEMO_ACCOUNTS.map((account) => {
                const isSelected = email.trim().toLowerCase() === account.email;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleFillDemoAccount(account.email, account.password)}
                    className={`${styles.demoCard} ${isSelected ? styles.demoCardActive : ''}`}
                  >
                    <span className={styles.demoRole}>{account.role}</span>
                    <span className={styles.demoAccess}>{account.access}</span>
                    <span className={styles.demoEmail}>{account.email}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
