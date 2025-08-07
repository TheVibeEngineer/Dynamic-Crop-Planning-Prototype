// =============================================================================
// GLOBAL ERROR COMPONENT - App-wide error boundary
// =============================================================================

'use client';

import React from 'react';
import { Button } from '@/components/common';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong!
        </h2>
        
        <p className="text-gray-600 mb-4">
          We encountered an unexpected error while loading the crop planning system. 
          This might be a temporary issue.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full"
          >
            <RefreshCw size={16} />
            Try again
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return to home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
