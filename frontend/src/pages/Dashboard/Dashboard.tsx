import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { challanApi } from '../../api/challanApi';
import type { Challan } from '../../types/challan';
import type { Product } from '../../types/product';
import { StatusBadge } from '../../components/common/StatusBadge';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [draftCount, setDraftCount] = useState<number | null>(null);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — fourClover ERP';
    const load = async () => {
      try {
        const [customers, prods, allChallans, draftChallans] = await Promise.all([
          customerApi.getAll(),
          productApi.getAll(),
          challanApi.getAll(),
          challanApi.getAll({ status: 'Draft' }),
        ]);
        setCustomerCount(customers.length);
        setProducts(prods);
        setDraftCount(draftChallans.length);
        setRecentChallans(allChallans.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const lowStock = products.filter(p => p.current_stock <= p.minimum_stock);

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Overview</h1>
        <p className={styles.pageSubtitle}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary row */}
      <div className={styles.summaryRow}>
        <Link to="/customers" className={styles.summaryCell}>
          <span className={styles.summaryCellLabel}>Customers</span>
          <span className={styles.summaryCellValue}>{isLoading ? '·' : customerCount ?? '—'}</span>
          <span className={styles.summaryCellNote}>Total registered ↗</span>
        </Link>
        <Link to="/products" className={styles.summaryCell}>
          <span className={styles.summaryCellLabel}>Products</span>
          <span className={styles.summaryCellValue}>{isLoading ? '·' : products.length}</span>
          <span className={styles.summaryCellNote}>In inventory ↗</span>
        </Link>
        <Link to="/challans" className={styles.summaryCell}>
          <span className={styles.summaryCellLabel}>Challans (Draft)</span>
          <span className={styles.summaryCellValue}>{isLoading ? '·' : draftCount ?? '—'}</span>
          <span className={styles.summaryCellNote}>Pending confirmation ↗</span>
        </Link>
      </div>

      <div className={styles.sectionRow}>
        {/* Recent Challans */}
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Recent Challans</span>
            <Link to="/challans" className={styles.sectionLink}>View all <ArrowRight size={12} /></Link>
          </div>
          {isLoading ? (
            <div className={styles.placeholderBlock}><span>Loading...</span></div>
          ) : recentChallans.length === 0 ? (
            <div className={styles.placeholderBlock}>
              <FileText size={28} strokeWidth={1.25} />
              <span>No challans yet</span>
            </div>
          ) : (
            <div className={styles.listBlock}>
              {recentChallans.map(c => (
                <Link to="/challans" key={c.id} className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.listItemTitle}>{c.challan_number}</span>
                    <span className={styles.listItemSub}>{c.customer_name} · {c.business_name}</span>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Low Stock Alerts</span>
            {lowStock.length > 0 && (
              <Link to="/products" className={styles.sectionLink}>View all <ArrowRight size={12} /></Link>
            )}
          </div>
          {isLoading ? (
            <div className={styles.placeholderBlock}><span>Loading...</span></div>
          ) : lowStock.length === 0 ? (
            <div className={styles.placeholderBlock}>
              <Package size={28} strokeWidth={1.25} />
              <span>All stock levels OK</span>
            </div>
          ) : (
            <div className={styles.listBlock}>
              {lowStock.slice(0, 6).map(p => (
                <Link to="/products" key={p.id} className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.listItemTitle}>{p.name}</span>
                    <span className={styles.listItemSub}>{p.sku}</span>
                  </div>
                  <span className={styles.stockAlert}>
                    <AlertTriangle size={12} />
                    {p.current_stock}/{p.minimum_stock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
