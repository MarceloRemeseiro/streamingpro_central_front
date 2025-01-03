import { useState, useEffect } from 'react';

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Movemos la lógica de localStorage al useEffect
  useEffect(() => {
    const stored = localStorage.getItem('isAuthenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}; 