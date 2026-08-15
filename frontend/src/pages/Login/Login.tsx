import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

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

        <span className={styles.brandFooter}>fourClover ERP/CRM · Internal Use Only</span>
      </div>

      {/* ── Right form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h2>Sign in</h2>
            <p>Use your organisation credentials to continue.</p>
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
        </div>
      </div>

    </div>
  );
};
