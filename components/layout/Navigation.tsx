"use client";

// =============================================================================
// NAVIGATION COMPONENT - App navigation with Next.js routing
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
  id: string;
  name: string;
  icon: string;
  href: string;
}

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { id: 'orders', name: 'Orders', icon: '📋', href: '/orders' },
    { id: 'commodities', name: 'Commodities & Varieties', icon: '🌱', href: '/commodities' },
    { id: 'land', name: 'Land Management', icon: '🗺️', href: '/land' },
    { id: 'gantt', name: 'Timeline View', icon: '📅', href: '/gantt' },
    { id: 'planning', name: 'Crop Planning', icon: '📊', href: '/planning' },
    { id: 'data', name: 'Data Management', icon: '💾', href: '/data' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = pathname === tab.href || (pathname === '/' && tab.href === '/orders');
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-green-600 text-green-600 bg-green-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-green-300 hover:bg-gray-50/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};