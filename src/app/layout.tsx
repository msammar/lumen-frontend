import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { Providers } from '@/app/providers';
import { AppShell } from '@/components/layout/app-shell';
import { SIDEBAR_COOKIE, parseCollapsedCookie } from '@/components/layout/sidebar-state';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Platform',
  description: 'Interactive big-data analytics platform',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading the cookie here keeps the sidebar width stable on first paint
  // (a client-only read would flash the expanded layout first).
  const cookieStore = await cookies();
  const defaultCollapsed = parseCollapsedCookie(cookieStore.get(SIDEBAR_COOKIE)?.value);

  return (
    // suppressHydrationWarning: tolerates a theme class being set on <html>
    // before hydration (e.g. when next-themes is added later).
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* App shell. The real-time notification connection mounts inside
            Providers so it survives client-side navigation. */}
        <Providers>
          <AppShell defaultCollapsed={defaultCollapsed}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
