'use client';

import { useEffect } from 'react';
import { Login } from '@/components/Login';
import { ProcessList } from '@/components/ProcessList';
import { useAuthState } from '@/hooks/useAuthState';

export default function Home() {
  const { isAuthenticated, login, logout } = useAuthState();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Sesión restaurada');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card-background rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Procesos Activos</h2>
            <ProcessList />
          </div>
        </div>
      </div>
    </div>
  );
}
