import api from './axios';

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  avatar_url: string;
  bio: string;
  created_at?: string;
}

/**
 * Fetch a user profile by email
 */
export const getProfile = async (email: string): Promise<UserProfile> => {
  const response = await api.get(`/api/profile/${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * Update a user profile by email
 */
export const updateProfile = async (email: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put(`/api/profile/${encodeURIComponent(email)}`, profileData);
  return response.data;
};
