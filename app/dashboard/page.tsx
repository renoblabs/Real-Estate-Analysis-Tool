'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { getUserDeals } from '@/lib/database';
import { withTimeout } from '@/lib/utils';
import { toast } from 'sonner';
import type { Deal } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Add timeout to auth check (10 seconds)
      const { data: { user } } = await withTimeout(
        supabase.auth.getUser(),
        10000
      );

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Add timeout to database query (15 seconds)
      const { data: dealsData, error } = await withTimeout(
        getUserDeals(user.id),
        15000
      );

      if (error) throw error;

      if (dealsData) {
        setDeals(dealsData.slice(0, 5)); // Show last 5 deals
      }
    } catch (error: any) {
      const message = error.message?.includes('timed out')
        ? 'Request timed out. Please check your connection and try again.'
        : 'Failed to load dashboard. Please try again.';

      toast.error(message);
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">REI OPS™</span>
            <Badge variant="outline">🇨🇦</Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/deals">
              <Button variant="ghost" size="sm">Deals</Button>
            </Link>
            <Link href="/compare">
              <Button variant="ghost" size="sm">Compare</Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="ghost" size="sm">Portfolio</Button>
            </Link>
            <Link href="/analyze">
              <Button size="sm">+ New</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">
            {user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Deals</CardDescription>
              <CardTitle className="text-3xl">{deals.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Cash Flow</CardDescription>
              <CardTitle className="text-3xl">
                ${deals.length > 0
                  ? Math.round(deals.reduce((sum, d) => sum + (d.monthly_cash_flow || 0), 0) / deals.length)
                  : 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg CoC Return</CardDescription>
              <CardTitle className="text-3xl">
                {deals.length > 0
                  ? (deals.reduce((sum, d) => sum + (d.cash_on_cash_return || 0), 0) / deals.length).toFixed(1)
                  : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Deal Score</CardDescription>
              <CardTitle className="text-3xl">
                {deals.length > 0
                  ? Math.round(deals.reduce((sum, d) => sum + (d.deal_score || 0), 0) / deals.length)
                  : 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link href="/analyze">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <CardTitle>Analyze New Deal</CardTitle>
                  <CardDescription>
                    Run a complete Canadian market analysis
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/deals">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <CardTitle>View All Deals</CardTitle>
                  <CardDescription>
                    Browse and filter your saved deals
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/compare">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <CardTitle>Compare Deals</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of up to 3 deals
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/portfolio">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <CardTitle>Portfolio Analytics</CardTitle>
                  <CardDescription>
                    Aggregate insights across all deals
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/settings">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Update your preferences and defaults
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Deals</h2>
            <Link href="/deals">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {deals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No deals yet. Start by analyzing your first property!
                </p>
                <Link href="/analyze">
                  <Button>Analyze First Deal</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deals.map((deal) => (
                <Card key={deal.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{deal.address}</CardTitle>
                        <CardDescription>
                          {deal.city}, {deal.province} • {deal.property_type.replace('_', ' ')}
                        </CardDescription>
                      </div>
                      <Badge className={getGradeColor(deal.deal_grade)}>
                        {deal.deal_grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cash Flow</p>
                        <p className="font-semibold">
                          ${deal.monthly_cash_flow?.toFixed(0) || 0}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CoC Return</p>
                        <p className="font-semibold">
                          {deal.cash_on_cash_return?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cap Rate</p>
                        <p className="font-semibold">
                          {deal.cap_rate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className="font-semibold">{deal.deal_score || 0}/100</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/deals/${deal.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                      <Badge variant="outline">{deal.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
