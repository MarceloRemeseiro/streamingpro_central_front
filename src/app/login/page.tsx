'use client';

import { Login } from "@/components/Login";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/');
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
