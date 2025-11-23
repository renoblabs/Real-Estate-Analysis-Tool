import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Deals | REI OPS™',
  description: 'View and manage all your Canadian real estate investment deals. Filter, sort, and compare property analyses.',
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
