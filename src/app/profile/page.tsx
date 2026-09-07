import type { Metadata } from 'next';

import { PlaceholderPage } from '@/components/placeholder-page';

export const metadata: Metadata = { title: 'Profile · Analytics Platform' };

export default function ProfilePage() {
  return <PlaceholderPage title="Profile" />;
}
