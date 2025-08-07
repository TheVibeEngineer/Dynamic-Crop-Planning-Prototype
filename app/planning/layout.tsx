// =============================================================================
// PLANNING LAYOUT - Planning section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Planning - Dynamic Crop Planning',
  description: 'Crop planning analytics and insights dashboard',
};

export default function PlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
