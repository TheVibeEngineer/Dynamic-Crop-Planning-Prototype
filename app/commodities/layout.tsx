// =============================================================================
// COMMODITIES LAYOUT - Commodities section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commodities & Varieties - Dynamic Crop Planning',
  description: 'Manage crop commodities and varieties configuration',
};

export default function CommoditiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
