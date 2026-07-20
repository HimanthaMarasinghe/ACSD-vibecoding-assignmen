import { createContext, useState, useEffect } from 'react';
import { getProfile } from '../api/profileApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = async (email) => {
    setLoadingProfile(true);
    try {
      const data = await getProfile(email);
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('ceyloncart_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.email);
    }
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    const mockUser = { id: 'user_1', email, name: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('ceyloncart_user', JSON.stringify(mockUser));
    await fetchProfile(email);
    return true;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('ceyloncart_user');
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loadingProfile, 
      login, 
      logout, 
      refreshProfile: () => user && fetchProfile(user.email),
      updateProfileState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
