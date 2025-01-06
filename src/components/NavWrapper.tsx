'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';

export default function NavWrapper() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return null;
  }

  return <Nav />;
} 