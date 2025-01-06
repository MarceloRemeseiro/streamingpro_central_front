'use client';

import { ProcessList } from "@/components/ProcessList";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function Home() {
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

  return (
    <main className="container mx-auto py-8 px-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">INPUTS</h2>
      <ProcessList key={refreshKey} />
    </main>
  );
}
