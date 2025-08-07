// =============================================================================
// NOT FOUND PAGE - 404 error page
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">🌾</div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/orders">
              <Home size={16} />
              Go to Orders
            </Link>
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft size={16} />
            Go back
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Available sections:</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            <Link href="/orders" className="text-blue-600 hover:underline">Orders</Link>
            <Link href="/commodities" className="text-blue-600 hover:underline">Commodities</Link>
            <Link href="/land" className="text-blue-600 hover:underline">Land</Link>
            <Link href="/planning" className="text-blue-600 hover:underline">Planning</Link>
            <Link href="/data" className="text-blue-600 hover:underline">Data</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
