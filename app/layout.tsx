// =============================================================================
// ROOT LAYOUT - Main application layout with navigation
// =============================================================================

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppLayout } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dynamic Crop Planning System',
  description: 'Smart crop planning and land management system',
  keywords: ['agriculture', 'crop planning', 'land management', 'farming'],
  authors: [{ name: 'Crop Planning Team' }],
  openGraph: {
    title: 'Dynamic Crop Planning System',
    description: 'Smart crop planning and land management system',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}