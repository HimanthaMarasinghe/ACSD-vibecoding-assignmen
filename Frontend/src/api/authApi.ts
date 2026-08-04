import api from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  message: string;
  user: any;
  session?: any;
  token?: string;
}

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Log in user using Supabase Auth backend
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Sign up new user using Supabase Auth backend
   */
  signUp: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', credentials);
    return response.data;
  },

  /**
   * Log out current user session
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Fetch current authenticated user session details
   */
  getMe: async (): Promise<{ user: any }> => {
    const response = await api.get<{ user: any }>('/auth/me');
    return response.data;
  }
};
