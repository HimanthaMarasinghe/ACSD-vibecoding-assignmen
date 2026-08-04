import api from './axios';

export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  image?: string; // Kept for backwards compatibility
  stock?: number;
  inStock?: boolean;
  source?: string;
  rating?: number;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface ProductParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductDTO {
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  stock?: number;
  source?: string;
}

export interface CreateProductResponse {
  message: string;
  product: Product;
}

/**
 * Product Catalog API Service
 */
export const productApi = {
  /**
   * Fetch products with optional filters (search, category) and pagination
   */
  getProducts: async (params?: ProductParams): Promise<PaginatedProductsResponse> => {
    const response = await api.get<PaginatedProductsResponse>('/products', { params });
    return response.data;
  },

  /**
   * Fetch single product details by ID
   */
  getProductById: async (id: string | number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product (Admin only)
   */
  createProduct: async (productData: CreateProductDTO): Promise<CreateProductResponse> => {
    const response = await api.post<CreateProductResponse>('/products', productData);
    return response.data;
  }
};