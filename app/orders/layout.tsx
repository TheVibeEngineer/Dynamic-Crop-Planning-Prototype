// =============================================================================
// ORDERS LAYOUT - Orders section layout
// =============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders - Dynamic Crop Planning',
  description: 'Manage customer orders and delivery schedules',
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
