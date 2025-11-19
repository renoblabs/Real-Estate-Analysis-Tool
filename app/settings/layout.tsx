import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | REI OPS™',
  description: 'Manage your account settings and default analysis assumptions for Canadian real estate deals.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
