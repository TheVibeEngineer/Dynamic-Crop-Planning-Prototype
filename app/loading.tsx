// =============================================================================
// GLOBAL LOADING COMPONENT - App-wide loading state
// =============================================================================

import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-100 border-t-green-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-lg animate-pulse">🥬</div>
          </div>
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">Loading Crop Planning...</div>
        <div className="text-sm text-gray-600">Please wait while we prepare your data</div>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}
