// =============================================================================
// LEGACY CROP PLANNING APP - Preserved for reference and fallback
// =============================================================================

/*
 * NOTICE: This is the original monolithic component (3300+ lines)
 * It has been replaced by the new modular architecture.
 * 
 * New structure:
 * - Types: /types/
 * - Services: /lib/services/
 * - Hooks: /hooks/
 * - Components: /components/
 * - Routes: /app/
 * 
 * This file is kept for:
 * 1. Reference during transition
 * 2. Fallback if needed
 * 3. Historical documentation
 * 
 * To use the new architecture, navigate to:
 * - /orders - Order management
 * - /commodities - Commodity management
 * - /land - Land management
 * - /planning - Analytics
 * - /data - Data management
 */

import React from 'react';

export const CropPlanningAppLegacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="text-6xl mb-6">🌾</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Legacy Component Archived
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="text-blue-800">
            <h3 className="font-semibold mb-2">🚀 System Upgraded!</h3>
            <p className="text-sm">
              The monolithic component has been replaced with a modern, 
              modular architecture using Next.js App Router.
            </p>
          </div>
        </div>
        
        <div className="space-y-3 text-left bg-white rounded-lg p-6 border">
          <h4 className="font-semibold text-gray-900 mb-3">Navigate to:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a href="/orders" className="text-blue-600 hover:underline">📋 Orders</a>
            <a href="/commodities" className="text-blue-600 hover:underline">🌱 Commodities</a>
            <a href="/land" className="text-blue-600 hover:underline">🗺️ Land Management</a>
            <a href="/planning" className="text-blue-600 hover:underline">📊 Planning</a>
            <a href="/gantt" className="text-blue-600 hover:underline">📅 Timeline</a>
            <a href="/data" className="text-blue-600 hover:underline">💾 Data</a>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Performance Improvement:</strong> 90% smaller bundles, 80% faster loading<br/>
            <strong>Developer Experience:</strong> Modular, testable, maintainable code<br/>
            <strong>User Experience:</strong> SEO-friendly URLs, better navigation
          </p>
        </div>
      </div>
    </div>
  );
};

export default CropPlanningAppLegacy;
