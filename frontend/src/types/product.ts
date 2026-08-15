export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location: string;
  created_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at'>;

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity_changed: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}
