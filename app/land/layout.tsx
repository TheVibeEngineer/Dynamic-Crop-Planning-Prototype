// =============================================================================
// LAND LAYOUT - Land management section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Land Management - Dynamic Crop Planning',
  description: 'Smart land management with drag & drop optimization',
};

export default function LandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
