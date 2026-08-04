import api from './axios';

export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating?: number;
  inStock?: boolean;
}

export interface ProductParams {
  search?: string;
  category?: string;
}

/**
 * Product Catalog API Service
 */
export const productApi = {
  /**
   * Fetch all products with optional filters (search, category)
   */
  getProducts: async (params?: ProductParams): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  /**
   * Fetch single product details by ID
   */
  getProductById: async (id: string | number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
};
