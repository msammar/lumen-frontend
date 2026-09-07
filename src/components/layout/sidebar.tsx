'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { currentUser } from '@/features/auth/currentUser';
import { isActive, sidebarNav } from './nav-config';
import { UserAvatar, UserMenu } from './user-menu';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        data-collapsed={collapsed}
        aria-label="Main navigation"
        className={cn(
          'group fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform,visibility] duration-300 ease-in-out',
          // Collapse only applies from `lg` up; the mobile drawer is always full width.
          'lg:data-[collapsed=true]:w-16',
          // Off-canvas on mobile. `invisible` also drops it from the tab order and
          // the a11y tree, which a translate alone does not.
          mobileOpen
            ? 'visible translate-x-0'
            : 'invisible -translate-x-full lg:visible lg:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            L
          </div>
          {/* Labels stay in the a11y tree when collapsed via sr-only, not hidden. */}
          <span className="truncate text-base font-semibold tracking-tight group-data-[collapsed=true]:lg:sr-only">
            Lumen
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sidebarNav.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground group-data-[collapsed=true]:lg:sr-only">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:group-data-[collapsed=true]:justify-center lg:group-data-[collapsed=true]:px-0',
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate group-data-[collapsed=true]:lg:sr-only">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary group-data-[collapsed=true]:lg:sr-only">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer / account */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <UserMenu>
            <button
              type="button"
              aria-label="Account menu"
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:group-data-[collapsed=true]:justify-center lg:group-data-[collapsed=true]:px-0',
              )}
            >
              <UserAvatar />
              <span className="min-w-0 flex-1 group-data-[collapsed=true]:lg:sr-only">
                <span className="block truncate text-sm font-medium">
                  {currentUser.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {currentUser.email}
                </span>
              </span>
            </button>
          </UserMenu>
        </div>
      </aside>
    </>
  );
}
