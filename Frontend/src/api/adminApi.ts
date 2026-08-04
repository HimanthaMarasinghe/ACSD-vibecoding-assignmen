import api from './axios';

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  active_customers: number;
  recent_activity: any[];
}

/**
 * Admin Dashboard API Service
 */
export const adminApi = {
  /**
   * Fetch aggregate admin dashboard statistics & analytics
   */
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  }
};
