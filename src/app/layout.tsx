import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { getAllDocs } from '@/lib/markdown';
import { ProgressProvider } from '@/components/ProgressContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Agentic AI Handbook',
  description: 'A modular, self-built handbook for learning Agentic AI end-to-end.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = getAllDocs();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-foreground`}>
        <ProgressProvider>
          <AppLayout docs={docs}>
            {children}
          </AppLayout>
        </ProgressProvider>
      </body>
    </html>
  );
}
