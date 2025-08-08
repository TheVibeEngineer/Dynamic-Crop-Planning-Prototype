'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to orders page as the default landing
    router.push('/orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-bounce">🥬</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dynamic Crop Planning
        </h1>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}