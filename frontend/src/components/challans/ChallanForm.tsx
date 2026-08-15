import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { challanApi } from '../../api/challanApi';
import type { Customer } from '../../types/customer';
import type { Product } from '../../types/product';
import { Button } from '../common/Button';
import styles from './ChallanForm.module.css';

interface ChallanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface LineItem {
  product_id: number;
  product: Product;
  quantity: number | '';
}

export const ChallanForm: React.FC<ChallanFormProps> = ({ onSuccess, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      customerApi.getAll({ status: 'Active' }),
      productApi.getAll(),
    ]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
    });
  }, []);

  const addItem = () => {
    const unused = products.find(p => !items.some(i => i.product_id === p.id));
    if (!unused) return;
    setItems(prev => [...prev, { product_id: unused.id, product: unused, quantity: 1 }]);
  };

  const updateItemProduct = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setItems(prev => prev.map((item, i) => i === index ? { ...item, product_id: productId, product } : item));
  };

  const updateItemQty = (index: number, qty: number | '') => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const grandTotal = items.reduce((sum, i) => sum + (Number(i.product.unit_price) * (Number(i.quantity) || 0)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedCustomerId) { setError('Please select a customer.'); return; }
    if (items.length === 0) { setError('Add at least one product.'); return; }
    for (const item of items) {
      if (item.quantity === '' || Number(item.quantity) <= 0) { setError('All quantities must be greater than 0.'); return; }
    }
    setIsLoading(true);
    try {
      await challanApi.create({
        customer_id: Number(selectedCustomerId),
        items: items.map(i => ({ product_id: i.product_id, quantity: Number(i.quantity) })),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create challan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Customer */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Customer *</label>
        <select
          className={styles.select}
          value={selectedCustomerId}
          onChange={e => setSelectedCustomerId(Number(e.target.value))}
          required
        >
          <option value="">Select a customer...</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.business_name}</option>
          ))}
        </select>
      </div>

      {/* Line items */}
      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <span className={styles.label}>Products *</span>
          <button
            type="button"
            className={styles.addItemBtn}
            onClick={addItem}
            disabled={products.length === 0 || items.length >= products.length}
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyItems} onClick={addItem}>
            <Plus size={20} />
            <span>Click to add a product</span>
          </div>
        ) : (
          <div className={styles.itemsTable}>
            {/* Header */}
            <div className={styles.itemRowHeader}>
              <span>Product</span>
              <span>SKU</span>
              <span>Stock</span>
              <span>Unit Price</span>
              <span>Qty</span>
              <span></span>
            </div>
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <select
                  className={styles.itemSelect}
                  value={item.product_id}
                  onChange={e => updateItemProduct(index, Number(e.target.value))}
                >
                  {products
                    .filter(p => p.id === item.product_id || !items.some(i => i.product_id === p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <span className={styles.itemMono}>{item.product.sku}</span>
                <span className={`${styles.itemStock} ${Number(item.quantity) > item.product.current_stock ? styles.overStock : ''}`}>
                  {item.product.current_stock}
                </span>
                <span className={styles.itemMono}>₹{Number(item.product.unit_price).toLocaleString('en-IN')}</span>
                <input
                  className={styles.qtyInput}
                  type="number"
                  min="1"
                  max={item.product.current_stock}
                  value={item.quantity}
                  onChange={e => updateItemQty(index, e.target.value === '' ? '' : Number(e.target.value))}
                />
                <button type="button" className={styles.removeBtn} onClick={() => removeItem(index)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Total Quantity</span>
            <strong>{totalQty}</strong>
          </div>
          <div className={styles.totalRow}>
            <span>Estimated Value</span>
            <strong>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>Create Draft Challan</Button>
      </div>
    </form>
  );
};
