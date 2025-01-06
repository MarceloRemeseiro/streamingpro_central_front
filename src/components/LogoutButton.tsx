'use client';

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";

export default function LogoutButton() {
  const router = useRouter();

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
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-nav-text hover:text-nav-hover transition-colors"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      <span>Cerrar Sesión</span>
    </button>
  );
} 