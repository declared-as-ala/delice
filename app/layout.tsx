'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Admin Dashboard - Les Délices du Verger</title>
        <meta name="description" content="Administration des Délices du Verger" />
        {/* Favicon */}
      <link rel="icon" type="image/png" sizes="500x500" href="/logo.png" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
