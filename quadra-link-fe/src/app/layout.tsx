// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import DynamicBackground from '../components/DynamicBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Community App',
  description: 'A full-stack community platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} app-root`}>
        <DynamicBackground />
        <main className="app-content">
          {children}
        </main>
        <Toaster richColors position='top-right' />
      </body>
    </html>
  );
}