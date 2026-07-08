import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { getAllDocs } from '@/lib/markdown';
import { ProgressProvider } from '@/components/ProgressContext';
import { ThemeProvider } from '@/components/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Agentic AI Handbook',
  description: 'A modular, self-built handbook for learning Agentic AI end-to-end. Built for developers transitioning to AI engineering.',
  openGraph: {
    title: 'Agentic AI Handbook',
    description: 'Learn Agentic AI end-to-end. Modules covering LLMs, MCP, RAG, Memory, and Production.',
    url: 'https://agentic-ai-handbook.dev',
    siteName: 'Agentic AI Handbook',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agentic AI Handbook',
    description: 'A modular handbook for learning Agentic AI end-to-end.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = getAllDocs();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-gray-900 bg-white dark:text-gray-100 dark:bg-[#09090b] transition-colors duration-300`}>
        <ThemeProvider>
          <ProgressProvider>
            <AppLayout docs={docs}>
              {children}
            </AppLayout>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
