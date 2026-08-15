import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import type { Customer } from '../../types/customer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { CustomerForm } from '../../components/customers/CustomerForm';
import styles from './Customers.module.css';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | undefined>(undefined);

  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  usePageTitle('Customers');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await customerApi.getAll({ search, status: statusFilter });
      setCustomers(data);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleAddClick = () => {
    setSelectedCustomer(undefined);
    setDrawerOpen(true);
  };

  const handleEditClick = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setDetailOpen(false); // close detail drawer first
    setDrawerOpen(true);
  };

  const handleRowClick = (customer: Customer) => {
    setDetailCustomer(customer);
    setDetailOpen(true);
  };

  const handleFormSuccess = () => {
    setDrawerOpen(false);
    fetchCustomers();
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSubtitle}>{customers.length} records</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddClick} size="sm">
            <Plus size={16} /> Add Customer
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, mobile, email, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {error && <div className={styles.errorState}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingState}>Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No customers found.</p>
          {!search && !statusFilter && canEdit && (
            <Button size="sm" onClick={handleAddClick}>Add your first customer</Button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name / Business</th>
                <th>Type</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Follow-up</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} onClick={() => handleRowClick(c)} className={styles.row}>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.name}>{c.name}</span>
                      <span className={styles.business}>{c.business_name}</span>
                    </div>
                  </td>
                  <td><span className={styles.type}>{c.customer_type}</span></td>
                  <td className={styles.mono}>{c.mobile}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className={styles.date}>
                    {c.follow_up_date
                      ? new Date(c.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span className={styles.none}>—</span>}
                  </td>
                  {canEdit && (
                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={(e) => handleEditClick(c, e)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={handleFormSuccess}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Customer Details"
      >
        {detailCustomer && (
          <div className={styles.detail}>
            <div className={styles.detailRow}><span>Name</span><strong>{detailCustomer.name}</strong></div>
            <div className={styles.detailRow}><span>Business</span><strong>{detailCustomer.business_name}</strong></div>
            <div className={styles.detailRow}><span>Type</span><strong>{detailCustomer.customer_type}</strong></div>
            <div className={styles.detailRow}><span>Status</span><StatusBadge status={detailCustomer.status} /></div>
            <div className={styles.detailRow}><span>Mobile</span><strong>{detailCustomer.mobile}</strong></div>
            <div className={styles.detailRow}><span>Email</span><strong>{detailCustomer.email || '—'}</strong></div>
            <div className={styles.detailRow}><span>GST</span><strong className={styles.mono}>{detailCustomer.gst_number || '—'}</strong></div>
            <div className={styles.detailRow}><span>Address</span><strong>{detailCustomer.address}</strong></div>
            <div className={styles.detailRow}><span>Follow-up</span><strong>
              {detailCustomer.follow_up_date
                ? new Date(detailCustomer.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </strong></div>
            {detailCustomer.notes && (
              <div className={styles.detailNotes}>
                <span>Notes</span>
                <p>{detailCustomer.notes}</p>
              </div>
            )}
            {canEdit && (
              <div className={styles.detailActions}>
                <Button size="sm" onClick={() => { setDetailOpen(false); setSelectedCustomer(detailCustomer); setDrawerOpen(true); }}>
                  Edit Customer
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
