// =============================================================================
// GLOBAL LOADING COMPONENT - App-wide loading state
// =============================================================================

import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-900">Loading Crop Planning System...</div>
        <div className="text-sm text-gray-600 mt-1">Please wait while we prepare your data</div>
      </div>
    </div>
  );
}
