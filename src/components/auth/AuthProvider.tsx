'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { appAuth } from '@/services/appAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;secure;samesite=strict`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar el estado inicial de autenticación
  useEffect(() => {
    const isAuthenticatedCookie = getCookie('isAuthenticated') === 'true';
    setIsAuthenticated(isAuthenticatedCookie);
    setIsLoading(false);
  }, []);

  // Manejar redirecciones basadas en autenticación
  useEffect(() => {
    if (isLoading) return; // No hacer nada mientras se está cargando

    if (isAuthenticated && pathname === '/login') {
      router.replace('/');
    } else if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router, isLoading]);

  const login = () => {
    setIsAuthenticated(true);
    setCookie('isAuthenticated', 'true', 30); // Cookie válida por 30 días
    router.replace('/');
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeCookie('isAuthenticated');
    appAuth.logout();
    router.replace('/login');
  };

  // Mostrar nada mientras se está cargando
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 