'use client';

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
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