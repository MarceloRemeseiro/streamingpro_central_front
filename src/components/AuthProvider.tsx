'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth';

const AuthContext = createContext<{ isAuthenticated: boolean }>({
  isAuthenticated: false,
});

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function clearAuthCookie() {
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingAuth = useRef(false);
  const checkTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialCheckDone = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCookie('auth_token'));

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (isCheckingAuth.current) return;
      isCheckingAuth.current = true;

      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }

      try {
        const auth = AuthService.getInstance();
        const storedToken = getCookie('auth_token');
        
        // Si no hay token y no estamos en login, redirigir
        if (!storedToken && pathname !== '/login') {
          if (isMounted) {
            setIsAuthenticated(false);
            router.push('/login');
          }
          return;
        }

        // Si hay token y estamos en login, ir a home
        if (storedToken && pathname === '/login') {
          if (isMounted) {
            setIsAuthenticated(true);
            router.push('/');
          }
          return;
        }

        // Si hay token, verificar que sea válido
        if (storedToken) {
          auth.setAccessToken(storedToken);
          try {
            // Durante la carga inicial, intentamos hasta 3 veces
            let attempts = !initialCheckDone.current ? 3 : 1;
            
            while (attempts > 0) {
              try {
                await auth.request('GET', '/api/v3/process');
                if (isMounted) {
                  setIsAuthenticated(true);
                  initialCheckDone.current = true;
                  // Programar la próxima verificación
                  checkTimeout.current = setTimeout(checkAuth, 60000); // Verificar cada minuto
                }
                break; // Si la petición es exitosa, salimos del bucle
              } catch (error: any) {
                if (error?.response?.status === 401 && attempts > 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre intentos
                  attempts--;
                  continue;
                }
                throw error; // Si no es 401 o es el último intento, propagamos el error
              }
            }
          } catch (error: any) {
            console.error('Error al verificar token:', error);
            // Solo manejar errores de autenticación
            if (error?.response?.status === 401) {
              clearAuthCookie();
              auth.setAccessToken('');
              
              if (isMounted) {
                setIsAuthenticated(false);
                if (pathname !== '/login') {
                  router.push('/login');
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error en checkAuth:', error);
      } finally {
        if (isMounted) {
          isCheckingAuth.current = false;
        }
      }
    };

    // Solo verificar en rutas protegidas
    if (pathname !== '/login') {
      checkAuth();
    } else {
      setIsAuthenticated(false);
    }

    return () => {
      isMounted = false;
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 