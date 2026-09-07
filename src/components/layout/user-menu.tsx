'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { currentUser, userInitials } from '@/features/auth/currentUser';

export const accountLinks = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Sign out', href: '/login', icon: LogOut },
];

export function UserAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold',
        className,
      )}
    >
      {userInitials(currentUser.name)}
    </span>
  );
}

/** Account dropdown, shared by the top bar and the sidebar footer. */
export function UserMenu({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{currentUser.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {currentUser.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accountLinks.map(({ label, href, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
