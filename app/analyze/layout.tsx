import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analyze Deal | REI OPS™',
  description: 'Complete Canadian real estate investment analysis with CMHC insurance, land transfer taxes, and OSFI stress tests.',
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
