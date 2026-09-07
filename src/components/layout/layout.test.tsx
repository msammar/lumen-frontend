import type { ComponentProps } from 'react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/layout/app-shell';
import { isActive, sidebarNav, topbarNav } from '@/components/layout/nav-config';
import { accountLinks } from '@/components/layout/user-menu';

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => '/') }));

vi.mock('next/navigation', () => ({ usePathname }));

vi.mock('next/link', () => ({
  default: ({ href, ...props }: ComponentProps<'a'>) => <a href={href} {...props} />,
}));

afterEach(() => {
  usePathname.mockReturnValue('/');
});

function renderShell(pathname = '/') {
  usePathname.mockReturnValue(pathname);
  return render(
    <AppShell>
      <p>Page content</p>
    </AppShell>,
  );
}

function sidebar() {
  return document.getElementById('app-sidebar')!;
}

describe('isActive', () => {
  it('matches the root exactly', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/analytics', '/')).toBe(false);
  });

  it('matches a section and its children', () => {
    expect(isActive('/analytics', '/analytics')).toBe(true);
    expect(isActive('/analytics/123', '/analytics')).toBe(true);
  });

  it('does not match a sibling that only shares a prefix', () => {
    expect(isActive('/teams', '/team')).toBe(false);
  });
});

describe('nav config', () => {
  it('derives the top bar items from the sidebar config', () => {
    const sidebarItems = sidebarNav.flatMap((group) => group.items);

    expect(topbarNav.map((item) => item.href)).toEqual([
      '/',
      '/analytics',
      '/datasets',
      '/realtime',
    ]);
    topbarNav.forEach((item) => expect(sidebarItems).toContain(item));
  });
});

describe('routes', () => {
  it('has a page for every nav and account link', () => {
    const appDir = join(process.cwd(), 'src/app');
    const hrefs = [
      ...sidebarNav.flatMap((group) => group.items).map((item) => item.href),
      ...topbarNav.map((item) => item.href),
      ...accountLinks.map((link) => link.href),
    ];

    const missing = [...new Set(hrefs)].filter(
      (href) => href !== '/' && !existsSync(join(appDir, href, 'page.tsx')),
    );

    expect(missing).toEqual([]);
  });
});

describe('AppShell', () => {
  it('renders a labelled main region with a skip link', () => {
    renderShell();

    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(document.getElementById('main-content')).not.toBeNull();
  });

  it('keeps the closed mobile drawer out of the tab order', () => {
    renderShell();

    expect(sidebar()).toHaveClass('invisible');
  });

  it('opens the drawer, locks scroll, and closes on Escape', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(sidebar()).not.toHaveClass('invisible');
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(sidebar()).toHaveClass('invisible');
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the drawer when the route changes', async () => {
    const user = userEvent.setup();
    const { rerender } = renderShell();

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(sidebar()).not.toHaveClass('invisible');

    usePathname.mockReturnValue('/analytics');
    rerender(
      <AppShell>
        <p>Page content</p>
      </AppShell>,
    );

    expect(sidebar()).toHaveClass('invisible');
  });

  it('persists the collapsed state to a cookie', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(sidebar()).toHaveAttribute('data-collapsed', 'true');
    expect(document.cookie).toContain('sidebar:collapsed=true');
  });

  it('keeps labels in the a11y tree when collapsed', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    const nav = within(sidebar());
    expect(nav.getByText('Lumen')).toBeInTheDocument();
    expect(nav.getByText('Dashboard')).toBeInTheDocument();
  });

  it('marks the active route in both navigations', () => {
    renderShell('/analytics');

    const topbarNav = within(screen.getByRole('navigation', { name: 'Sections' }));
    expect(within(sidebar()).getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(topbarNav.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(topbarNav.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
