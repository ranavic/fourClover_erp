import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
import type { Product, StockMovement } from '../../types/product';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { ProductForm } from '../../components/products/ProductForm';
import { StockMovementPanel } from '../../components/products/StockMovementPanel';
import styles from './Products.module.css';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | undefined>(undefined);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'stock'>('details');

  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  usePageTitle('Products & Inventory');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await productApi.getAll({ search });
      setProducts(data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const fetchMovements = async (productId: number) => {
    setMovementsLoading(true);
    try {
      const data = await productApi.getMovements(productId);
      setMovements(data);
    } catch {
      setMovements([]);
    } finally {
      setMovementsLoading(false);
    }
  };

  const openDetail = (product: Product) => {
    setDetailProduct(product);
    setActiveTab('details');
    setDetailOpen(true);
    fetchMovements(product.id);
  };

  const handleEditClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setDetailOpen(false);  // close detail drawer first
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchProducts();
    if (detailProduct) fetchMovements(detailProduct.id);
  };

  const handleMovementAdded = () => {
    fetchProducts();
    if (detailProduct) fetchMovements(detailProduct.id);
  };

  const isLowStock = (p: Product) => p.current_stock <= p.minimum_stock;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Products & Inventory</h1>
          <p className={styles.pageSubtitle}>{products.length} products · {products.filter(isLowStock).length} low stock</p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => { setSelectedProduct(undefined); setFormOpen(true); }}>
            <Plus size={16} /> Add Product
          </Button>
        )}
      </div>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, SKU, category, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className={styles.errorState}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingState}>Loading products...</div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No products found.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Category</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th style={{ textAlign: 'right' }}>Min Stock</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={styles.row} onClick={() => openDetail(p)}>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.name}>{p.name}</span>
                      <span className={styles.sku}>{p.sku}</span>
                    </div>
                  </td>
                  <td className={styles.muted}>{p.category}</td>
                  <td className={styles.muted}>{p.warehouse_location}</td>
                  <td className={styles.mono} style={{ textAlign: 'right' }}>
                    ₹{Number(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`${styles.stockValue} ${isLowStock(p) ? styles.lowStock : ''}`}>
                      {isLowStock(p) && <AlertTriangle size={12} className={styles.alertIcon} />}
                      {p.current_stock}
                    </span>
                  </td>
                  <td className={styles.mono} style={{ textAlign: 'right' }}>{p.minimum_stock}</td>
                  {canEdit && (
                    <td>
                      <button className={styles.editBtn} onClick={e => handleEditClick(p, e)}>Edit</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form Drawer */}
      <Drawer
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          product={selectedProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormOpen(false)}
        />
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailProduct?.name || 'Product Details'}
        width="600px"
      >
        {detailProduct && (
          <div className={styles.detail}>
            {/* Tab bar */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('details')}
              >Details</button>
              <button
                className={`${styles.tab} ${activeTab === 'stock' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('stock')}
              >Stock & Movements</button>
            </div>

            {activeTab === 'details' && (
              <div className={styles.detailContent}>
                <div className={styles.stockSummary}>
                  <div className={styles.stockCell}>
                    <span>Current Stock</span>
                    <strong className={isLowStock(detailProduct) ? styles.lowStockText : ''}>{detailProduct.current_stock}</strong>
                  </div>
                  <div className={styles.stockCell}>
                    <span>Min Stock</span>
                    <strong>{detailProduct.minimum_stock}</strong>
                  </div>
                  <div className={styles.stockCell}>
                    <span>Unit Price</span>
                    <strong>₹{Number(detailProduct.unit_price).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <div className={styles.detailRows}>
                  <div className={styles.detailRow}><span>SKU</span><strong className={styles.mono}>{detailProduct.sku}</strong></div>
                  <div className={styles.detailRow}><span>Category</span><strong>{detailProduct.category}</strong></div>
                  <div className={styles.detailRow}><span>Location</span><strong>{detailProduct.warehouse_location}</strong></div>
                </div>
                {canEdit && <Button size="sm" onClick={() => { setDetailOpen(false); setSelectedProduct(detailProduct); setFormOpen(true); }}>Edit Product</Button>}
              </div>
            )}

            {activeTab === 'stock' && (
              movementsLoading ? (
                <div className={styles.loadingState}>Loading movements...</div>
              ) : (
                <StockMovementPanel
                  product={detailProduct}
                  movements={movements}
                  onMovementAdded={handleMovementAdded}
                  canEdit={canEdit}
                />
              )
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
