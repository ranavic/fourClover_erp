export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  business_name: string;
  gst_number?: string;
  customer_type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  follow_up_date?: string;
  notes?: string;
  created_at: string;
}

export type CustomerFormData = Omit<Customer, 'id' | 'created_at'>;
