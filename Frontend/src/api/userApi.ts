import api from './axios';

export interface User {
  id?: number;
  name: string;
  email: string;
}

/**
 * Fetch all users (GET example)
 */
export const getUsers = async () => {
  const response = await api.get('/');
  console.log(response.data);
  return response.data;
};

/**
 * Fetch a single user by ID (GET example with param)
 */
export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new user (POST example)
 */
export const createUser = async (userData: User) => {
  const response = await api.post('/users', userData);
  return response.data;
};
