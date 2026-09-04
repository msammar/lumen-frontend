import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Platform',
  description: 'Interactive big-data analytics platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: tolerates a theme class being set on <html>
    // before hydration (e.g. when next-themes is added later).
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* App shell. The real-time notification connection mounts inside
            Providers so it survives client-side navigation. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
