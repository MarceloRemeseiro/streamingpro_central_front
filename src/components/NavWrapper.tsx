'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';
import { useAuth } from './AuthProvider';

export default function NavWrapper() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isLoginPage = pathname === '/login';

  if (isLoginPage || !isAuthenticated) {
    return null;
  }

  return <Nav />;
} 