export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  product_price_snapshot: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name: string;
  business_name: string;
  total_quantity: number;
  status: ChallanStatus;
  created_by_name: string;
  created_at: string;
}

export interface ChallanDetail extends Challan {
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  items: ChallanItem[];
}

export interface CreateChallanPayload {
  customer_id: number;
  items: { product_id: number; quantity: number }[];
}
