import React, { useState } from 'react';
import type { Product } from '../../types/product';
import type { StockMovement } from '../../types/product';
import { productApi } from '../../api/productApi';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import styles from './StockMovementPanel.module.css';

interface Props {
  product: Product;
  movements: StockMovement[];
  onMovementAdded: () => void;
  canEdit?: boolean;
}

export const StockMovementPanel: React.FC<Props> = ({ product, movements, onMovementAdded, canEdit = true }) => {
  const [qty, setQty] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await productApi.addMovement(product.id, {
        quantity_changed: quantity,
        movement_type: type,
        reason: reason.trim(),
      });
      setSuccess(`Stock updated. New stock: ${res.new_stock}`);
      setQty('');
      setReason('');
      onMovementAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record movement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      {/* Quick movement form */}
      {canEdit && (
        <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Record Movement</h4>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'IN' ? styles.typeIn : ''}`}
              onClick={() => setType('IN')}
            >IN</button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'OUT' ? styles.typeOut : ''}`}
              onClick={() => setType('OUT')}
            >OUT</button>
          </div>

          <div className={styles.row}>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
              required
            />
            <Input
              label="Reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Purchase order, Sale"
              required
            />
          </div>

          <Button type="submit" size="sm" isLoading={isLoading}>
            Record {type} Movement
          </Button>
        </form>
      </div>
      )}

      {/* Movement history */}
      <div className={styles.historySection}>
        <h4 className={styles.sectionTitle}>Movement History</h4>
        {movements.length === 0 ? (
          <p className={styles.empty}>No movements recorded yet.</p>
        ) : (
          <div className={styles.movementList}>
            {movements.map(m => (
              <div key={m.id} className={styles.movementItem}>
                <div className={styles.movementLeft}>
                  <StatusBadge status={m.movement_type} />
                  <span className={styles.movementReason}>{m.reason}</span>
                </div>
                <div className={styles.movementRight}>
                  <span className={`${styles.movementQty} ${m.movement_type === 'IN' ? styles.qtyIn : styles.qtyOut}`}>
                    {m.movement_type === 'IN' ? '+' : '−'}{m.quantity_changed}
                  </span>
                  <span className={styles.movementMeta}>
                    {m.created_by_name} · {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
