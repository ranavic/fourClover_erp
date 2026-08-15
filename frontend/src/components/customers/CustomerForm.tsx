import React, { useState, useEffect } from 'react';
import type { Customer, CustomerFormData } from '../../types/customer';
import { customerApi } from '../../api/customerApi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import styles from './CustomerForm.module.css';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyForm: CustomerFormData = {
  name: '',
  mobile: '',
  email: '',
  business_name: '',
  gst_number: '',
  customer_type: 'Retail',
  address: '',
  status: 'Lead',
  follow_up_date: '',
  notes: '',
};

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess, onCancel }) => {
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email || '',
        business_name: customer.business_name,
        gst_number: customer.gst_number || '',
        customer_type: customer.customer_type,
        address: customer.address,
        status: customer.status,
        follow_up_date: customer.follow_up_date ? customer.follow_up_date.split('T')[0] : '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const set = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (customer) {
        await customerApi.update(customer.id, form);
      } else {
        await customerApi.create(form);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <Input label="Full Name *" value={form.name} onChange={set('name')} required placeholder="e.g. Rajesh Kumar" />
        <Input label="Mobile *" value={form.mobile} onChange={set('mobile')} required placeholder="+91 98765 43210" />
      </div>

      <div className={styles.row}>
        <Input label="Business Name *" value={form.business_name} onChange={set('business_name')} required placeholder="Company / Trade name" />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="optional" />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Customer Type *</label>
          <select className={styles.select} value={form.customer_type} onChange={set('customer_type')} required>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Status</label>
          <select className={styles.select} value={form.status} onChange={set('status')}>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input label="GST Number" value={form.gst_number} onChange={set('gst_number')} placeholder="optional" />
        <Input label="Follow-up Date" type="date" value={form.follow_up_date} onChange={set('follow_up_date')} />
      </div>

      <Input label="Address *" value={form.address} onChange={set('address')} required placeholder="Full address" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Notes</label>
        <textarea
          className={styles.textarea}
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          placeholder="Optional internal notes..."
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>
          {customer ? 'Save Changes' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
};
