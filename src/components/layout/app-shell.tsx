'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import {
  SIDEBAR_COOKIE,
  SIDEBAR_COOKIE_MAX_AGE,
} from './sidebar-state';
import { Topbar } from './topbar';

interface AppShellProps {
  children: React.ReactNode;
  /** Read from the cookie on the server so there is no layout flash. */
  defaultCollapsed?: boolean;
}

export function AppShell({ children, defaultCollapsed = false }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  // The drawer is tied to the path it was opened on, so any navigation
  // (including back/forward, which never fires a link click) closes it.
  const [openPath, setOpenPath] = React.useState<string | null>(null);
  const mobileOpen = openPath === pathname;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const wasOpen = React.useRef(false);

  React.useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE}=${collapsed}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
  }, [collapsed]);

  // Escape to dismiss and scroll lock while the drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPath(null);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  // Return focus to the trigger when the drawer closes, unless the user moved
  // focus somewhere meaningful (e.g. they navigated from a link inside it).
  React.useEffect(() => {
    if (mobileOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      wasOpen.current = true;
      return;
    }

    if (!wasOpen.current) return;
    wasOpen.current = false;

    const active = document.activeElement;
    const sidebar = document.getElementById('app-sidebar');
    const focusIsLost =
      !active || active === document.body || Boolean(sidebar?.contains(active));

    if (focusIsLost) triggerRef.current?.focus();
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setOpenPath(null)}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out',
          collapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        <Topbar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMenuClick={() => setOpenPath(pathname)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
