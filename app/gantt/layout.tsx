// =============================================================================
// GANTT LAYOUT - Timeline view section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline View - Dynamic Crop Planning',
  description: 'Timeline visualization of planting schedules',
};

export default function GanttLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
