// =============================================================================
// DATA LAYOUT - Data management section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Management - Dynamic Crop Planning',
  description: 'Export, import, and manage your crop planning data',
};

export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
