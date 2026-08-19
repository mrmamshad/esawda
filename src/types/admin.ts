/**
 * Types shared across the /admin panel. Kept small + focused so swapping
 * mock data for real API responses is a straight assignment.
 */

export type TrendPoint = { date: string; total: number };

export type AdminCounts = {
  users:          number;
  ads_total:      number;
  ads_active:     number;
  ads_pending:    number;
  ads_expired:    number;
  tx_total:       number;
  tx_success:     number;
  revenue_total:  number;
};

export type AdminTrend = {
  users_delta?:   number;    // % vs previous period
  ads_delta?:    number;
  revenue_delta?:number;
  tx_delta?:      number;
};

export type AdminRecentAd = {
  id: number;
  product_name: string;
  user_id: number;
  status: string;
  price: number;
  category?: string | number | null;
  created_at?: string | null;
};

export type AdminRecentUser = {
  id: number;
  username: string;
  email: string;
  user_type: string;
  status: string;
  created_at?: string | null;
};

export type AdminRecentTx = {
  id: number;
  seller_id: number;
  amount: number;
  status: string;
  transaction_gatway: string;
  product_name: string | null;
  created_at?: string | null;
};

export type DateRangeValue = 'today' | 'week' | 'month' | 'custom';

export type AdminWindow = {
  range:        DateRangeValue;
  from:         string;
  to:           string;
  revenue:      TrendPoint[];
  users:        TrendPoint[];
  transactions: TrendPoint[];
};

export type AdminDashboardData = {
  counts: AdminCounts;
  trend?: AdminTrend;
  recent: {
    ads:          AdminRecentAd[];
    users:        AdminRecentUser[];
    transactions: AdminRecentTx[];
  };
  revenue_series?: {
    '7D':  TrendPoint[];
    '30D': TrendPoint[];
    '90D': TrendPoint[];
    '1Y':  TrendPoint[];
  };
  category_breakdown?: { name: string; value: number }[];
  top_categories?:     { name: string; count: number }[];
  user_growth?:        TrendPoint[];
  window?:             AdminWindow;
};
