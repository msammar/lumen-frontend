'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Menu,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Search,
  Sun,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isActive, topbarNav } from './nav-config';
import { UserAvatar, UserMenu } from './user-menu';

interface TopbarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMenuClick: () => void;
  onToggleCollapse: () => void;
}

export function Topbar({
  collapsed,
  mobileOpen,
  onMenuClick,
  onToggleCollapse,
}: TopbarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // next-themes resolves the theme on the client only, so the icon waits for
  // hydration to keep the first client render identical to the server's.
  const hydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = hydrated && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: mobile menu + desktop collapse + top nav */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
        >
          <Menu className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar"
        >
          {collapsed ? (
            <PanelLeft className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>
      </div>

      <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
        {topbarNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Right: actions + user */}
      <div className="ml-auto flex items-center gap-1">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search"
            placeholder="Search…"
            className="h-9 w-40 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none transition-[width] focus-visible:w-56 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <Button variant="ghost" size="icon" aria-label="Help" asChild>
          <Link href="/help">
            <HelpCircle className="size-5" />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu>
          <Button variant="ghost" className="gap-2 px-2" aria-label="Account menu">
            <UserAvatar className="size-7" />
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </UserMenu>
      </div>
    </header>
  );
}
