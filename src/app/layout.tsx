import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova Treasury - Enterprise API Insights',
  description: 'Enterprise treasury management, real-time liquidity trends, and API balance conversions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light select-none">
      <body className="antialiased min-h-screen bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
