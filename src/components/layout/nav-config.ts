import {
  Activity,
  BarChart3,
  Database,
  FileText,
  Filter,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  PieChart,
  Settings,
  Table,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Left sidebar navigation, grouped by product area. */
export const sidebarNav: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      { title: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    label: 'Data',
    items: [
      { title: 'Datasets', href: '/datasets', icon: Database },
      { title: 'Tables', href: '/tables', icon: Table },
      { title: 'Filters', href: '/filters', icon: Filter },
    ],
  },
  {
    label: 'Monitor',
    items: [
      { title: 'Realtime', href: '/realtime', icon: Activity, badge: 'Live' },
      { title: 'Metrics', href: '/metrics', icon: Gauge },
      { title: 'Insights', href: '/insights', icon: PieChart },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Team', href: '/team', icon: Users },
      { title: 'Settings', href: '/settings', icon: Settings },
      { title: 'Help', href: '/help', icon: HelpCircle },
    ],
  },
];

/** Matches an item and its descendants, but not unrelated paths (`/teams` != `/team`). */
export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

const allNavItems = sidebarNav.flatMap((group) => group.items);

/**
 * Primary sections surfaced in the top bar, as a curated subset of the sidebar
 * so titles/icons/hrefs stay in one place.
 */
const topbarHrefs = ['/', '/analytics', '/datasets', '/realtime'];

export const topbarNav: NavItem[] = topbarHrefs.flatMap((href) =>
  allNavItems.filter((item) => item.href === href),
);
