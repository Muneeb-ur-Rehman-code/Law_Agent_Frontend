import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marjiya Law — AI Multi-Agent Operating System',
  description: 'Attorney Dashboard for Marjiya Law PC — West Covina, CA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-light-gray text-dark">
        {children}
      </body>
    </html>
  );
}
