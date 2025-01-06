'use client';

import { ProcessList } from "@/components/ProcessList";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateProcessModal from "@/components/CreateProcessModal";
import { PlusIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { AuthService } from "@/services/auth";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const auth = AuthService.getInstance();
    const storedToken = getCookie('auth_token');
    
    if (storedToken) {
      auth.setAccessToken(storedToken);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleProcessCreated = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const authService = AuthService.getInstance();
      authService.setAccessToken(''); // Limpiamos el token
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          SINCROS STREAMER
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crear Input
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-full"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">INPUTS</h2>

      <ProcessList key={refreshKey} />

      <CreateProcessModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleProcessCreated}
      />
    </main>
  );
}
