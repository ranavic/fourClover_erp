import React, { useState, useEffect } from 'react';
import type { Product, ProductFormData } from '../../types/product';
import { productApi } from '../../api/productApi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  sku: string;
  category: string;
  unit_price: string | number;
  current_stock: string | number;
  minimum_stock: string | number;
  warehouse_location: string;
}

const emptyForm: FormState = {
  name: '',
  sku: '',
  category: '',
  unit_price: '',
  current_stock: '',
  minimum_stock: '',
  warehouse_location: '',
};

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit_price: product.unit_price,
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        warehouse_location: product.warehouse_location,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const unitPriceNum = Number(form.unit_price);
    const currentStockNum = Number(form.current_stock);
    const minimumStockNum = Number(form.minimum_stock);

    if (form.unit_price === '' || isNaN(unitPriceNum) || unitPriceNum < 0) {
      setError('Unit price must be a valid non-negative number.');
      return;
    }
    if (form.current_stock === '' || isNaN(currentStockNum) || currentStockNum < 0) {
      setError('Current stock must be a valid non-negative number.');
      return;
    }
    if (form.minimum_stock === '' || isNaN(minimumStockNum) || minimumStockNum < 0) {
      setError('Minimum stock must be a valid non-negative number.');
      return;
    }

    const payload: ProductFormData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      unit_price: unitPriceNum,
      current_stock: currentStockNum,
      minimum_stock: minimumStockNum,
      warehouse_location: form.warehouse_location.trim(),
    };

    setIsLoading(true);
    try {
      if (product) {
        await productApi.update(product.id, payload);
      } else {
        await productApi.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <Input label="Product Name *" value={form.name} onChange={set('name')} required placeholder="e.g. Cement Bag 50kg" />
        <Input label="SKU *" value={form.sku} onChange={set('sku')} required placeholder="e.g. CEM-50KG" />
      </div>

      <div className={styles.row}>
        <Input label="Category *" value={form.category} onChange={set('category')} required placeholder="e.g. Building Materials" />
        <Input label="Warehouse Location *" value={form.warehouse_location} onChange={set('warehouse_location')} required placeholder="e.g. A-12" />
      </div>

      <div className={styles.row}>
        <Input label="Unit Price (₹) *" type="number" min="0" step="0.01" value={form.unit_price} onChange={set('unit_price')} placeholder="0.00" required />
        <Input label="Current Stock *" type="number" min="0" value={form.current_stock} onChange={set('current_stock')} placeholder="0" required />
      </div>

      <div className={styles.half}>
        <Input label="Minimum Stock *" type="number" min="0" value={form.minimum_stock} onChange={set('minimum_stock')} placeholder="0" required />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};
