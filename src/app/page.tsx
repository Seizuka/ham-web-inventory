'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/dashboard'); // Atau ke page sesuai role user
    }
  }, [user, router]);

  return null; // Atau loading spinner jika mau
}
