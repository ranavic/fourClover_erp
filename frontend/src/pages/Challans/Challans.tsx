import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { challanApi } from '../../api/challanApi';
import type { Challan, ChallanDetail, ChallanStatus } from '../../types/challan';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { ChallanForm } from '../../components/challans/ChallanForm';
import styles from './Challans.module.css';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ChallanDetail | undefined>(undefined);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  usePageTitle('Sales Challans');

  const fetchChallans = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await challanApi.getAll({ status: statusFilter });
      setChallans(data);
    } catch {
      setError('Failed to load challans.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchChallans(); }, [fetchChallans]);

  const openDetail = async (challan: Challan) => {
    setDetailLoading(true);
    setStatusError('');
    setDetailOpen(true);
    try {
      const data = await challanApi.getById(challan.id);
      setDetail(data);
    } catch {
      setDetail(undefined);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (status: ChallanStatus) => {
    if (!detail) return;
    setStatusUpdating(true);
    setStatusError('');
    try {
      await challanApi.updateStatus(detail.id, status);
      const updated = await challanApi.getById(detail.id);
      setDetail(updated);
      fetchChallans();
    } catch (err: any) {
      setStatusError(err.response?.data?.message || `Failed to update to ${status}.`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleInvoiceDownload = () => {
    if (!detail) return;
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/challans/${detail.id}/invoice`;
    // Use fetch to download with auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice-${detail.challan_number}.pdf`;
        link.click();
      });
  };

  const grandTotal = detail?.items?.reduce(
    (sum, i) => sum + Number(i.product_price_snapshot) * i.quantity, 0
  ) ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sales Challans</h1>
          <p className={styles.pageSubtitle}>{challans.length} records</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New Challan
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className={styles.filters}>
        {(['', 'Draft', 'Confirmed', 'Cancelled'] as const).map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${statusFilter === s ? styles.chipActive : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {error && <div className={styles.errorState}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingState}>Loading challans...</div>
      ) : challans.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No challans found.</p>
          {!statusFilter && canCreate && <Button size="sm" onClick={() => setCreateOpen(true)}>Create first challan</Button>}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Challan No.</th>
                <th>Customer</th>
                <th>Total Qty</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {challans.map(c => (
                <tr key={c.id} className={styles.row} onClick={() => openDetail(c)}>
                  <td className={styles.mono}>{c.challan_number}</td>
                  <td>
                    <div className={styles.nameCell}>
                      <span>{c.customer_name}</span>
                      <span className={styles.muted}>{c.business_name}</span>
                    </div>
                  </td>
                  <td className={styles.mono}>{c.total_quantity}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className={styles.muted}>{c.created_by_name}</td>
                  <td className={styles.muted}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Challan Drawer */}
      <Drawer isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Challan" width="640px">
        <ChallanForm
          onSuccess={() => { setCreateOpen(false); fetchChallans(); }}
          onCancel={() => setCreateOpen(false)}
        />
      </Drawer>

      {/* Detail Drawer */}
      <Drawer isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Challan Details" width="640px">
        {detailLoading ? (
          <div className={styles.loadingState}>Loading...</div>
        ) : detail ? (
          <div className={styles.detail}>
            {/* Header Meta */}
            <div className={styles.metaRow}>
              <div className={styles.metaBlock}>
                <span>Challan No.</span>
                <strong className={styles.mono}>{detail.challan_number}</strong>
              </div>
              <div className={styles.metaBlock}>
                <span>Status</span>
                <StatusBadge status={detail.status} />
              </div>
              <div className={styles.metaBlock}>
                <span>Date</span>
                <strong>{new Date(detail.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
            </div>

            {/* Customer */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Customer</h4>
              <div className={styles.customerBlock}>
                <strong>{detail.customer_name}</strong>
                <span>{detail.business_name}</span>
                <span className={styles.muted}>{detail.customer_mobile}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Products</h4>
              <div className={styles.itemsTable}>
                <div className={styles.itemHeader}>
                  <span>Product</span>
                  <span>SKU</span>
                  <span style={{ textAlign: 'right' }}>Price</span>
                  <span style={{ textAlign: 'right' }}>Qty</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
                {detail.items.map(item => (
                  <div key={item.id} className={styles.itemRow}>
                    <span>{item.product_name_snapshot}</span>
                    <span className={styles.mono}>{item.product_sku_snapshot}</span>
                    <span className={styles.mono} style={{ textAlign: 'right' }}>₹{Number(item.product_price_snapshot).toLocaleString('en-IN')}</span>
                    <span className={styles.mono} style={{ textAlign: 'right' }}>{item.quantity}</span>
                    <span className={styles.mono} style={{ textAlign: 'right' }}>
                      ₹{(Number(item.product_price_snapshot) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div className={styles.grandTotalRow}>
                  <span>Grand Total</span>
                  <strong className={styles.mono}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            {statusError && <div className={styles.statusError}>{statusError}</div>}

            <div className={styles.actions}>
              {canCreate && detail.status === 'Draft' && (
                <>
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={statusUpdating}
                    onClick={() => handleStatusUpdate('Cancelled')}
                  >
                    Cancel Challan
                  </Button>
                  <Button
                    size="sm"
                    isLoading={statusUpdating}
                    onClick={() => handleStatusUpdate('Confirmed')}
                  >
                    Confirm & Deduct Stock
                  </Button>
                </>
              )}
              {detail.status === 'Confirmed' && (
                <Button size="sm" variant="secondary" onClick={handleInvoiceDownload}>
                  <Download size={14} /> Download Invoice PDF
                </Button>
              )}
              {detail.status === 'Cancelled' && (
                <span className={styles.cancelledNote}>This challan has been cancelled and cannot be modified.</span>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.errorState}>Failed to load challan details.</div>
        )}
      </Drawer>
    </div>
  );
};
