'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { getUserDeals, deleteDeal } from '@/lib/database';
import { toast } from 'sonner';
import { withTimeout, formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Deal, Province, PropertyType, DealStatus } from '@/types';

type SortField = 'created_at' | 'cash_flow' | 'coc_return' | 'deal_score' | 'purchase_price';
type SortOrder = 'asc' | 'desc';

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<Province | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchQuery, provinceFilter, typeFilter, statusFilter, sortField, sortOrder]);

  const loadDeals = async () => {
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

      // Add timeout to database query (15 seconds)
      const { data, error } = await withTimeout(
        getUserDeals(user.id),
        15000
      );

      if (error) throw error;

      setDeals(data || []);
    } catch (error: any) {
      const message = error.message?.includes('timed out')
        ? 'Request timed out. Please check your connection and try again.'
        : 'Failed to load deals. Please try again.';

      toast.error(message);
      console.error('Load deals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDeals = () => {
    let filtered = [...deals];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        deal =>
          deal.address.toLowerCase().includes(query) ||
          deal.city.toLowerCase().includes(query)
      );
    }

    // Province filter
    if (provinceFilter !== 'all') {
      filtered = filtered.filter(deal => deal.province === provinceFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(deal => deal.property_type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'cash_flow':
          aVal = a.monthly_cash_flow || 0;
          bVal = b.monthly_cash_flow || 0;
          break;
        case 'coc_return':
          aVal = a.cash_on_cash_return || 0;
          bVal = b.cash_on_cash_return || 0;
          break;
        case 'deal_score':
          aVal = a.deal_score || 0;
          bVal = b.deal_score || 0;
          break;
        case 'purchase_price':
          aVal = a.purchase_price || 0;
          bVal = b.purchase_price || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredDeals(filtered);
  };

  const handleDeleteClick = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dealToDelete) return;

    setDeleting(true);
    try {
      const { error } = await deleteDeal(dealToDelete.id);
      if (error) throw error;

      toast.success('Deal deleted successfully');
      setDeals(deals.filter(d => d.id !== dealToDelete.id));
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    } catch (error: any) {
      toast.error('Failed to delete deal');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">REI OPS™</span>
              <Badge variant="outline">🇨🇦</Badge>
            </Link>
          </div>
        </header>
        <main className="container py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
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
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/analyze">
              <Button size="sm">+ New Analysis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Deals</h1>
          <p className="text-muted-foreground mt-2">
            {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} found
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter & Sort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search address or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={provinceFilter}
                  onChange={e => setProvinceFilter(e.target.value as any)}
                >
                  <option value="all">All Provinces</option>
                  <option value="ON">Ontario</option>
                  <option value="BC">British Columbia</option>
                  <option value="AB">Alberta</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="QC">Quebec</option>
                </select>
              </div>

              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="single_family">Single Family</option>
                  <option value="duplex">Duplex</option>
                  <option value="triplex">Triplex</option>
                  <option value="fourplex">Fourplex</option>
                  <option value="multi_unit_5plus">5+ Units</option>
                </select>
              </div>

              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="pursuing">Pursuing</option>
                  <option value="under_contract">Under Contract</option>
                  <option value="closed">Closed</option>
                  <option value="passed">Passed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortField}
                  onChange={e => setSortField(e.target.value as SortField)}
                >
                  <option value="created_at">Date Created</option>
                  <option value="cash_flow">Cash Flow</option>
                  <option value="coc_return">CoC Return</option>
                  <option value="deal_score">Deal Score</option>
                  <option value="purchase_price">Purchase Price</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deals List */}
        {filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery || provinceFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No deals match your filters'
                  : 'No deals yet. Start by analyzing your first property!'}
              </p>
              <Link href="/analyze">
                <Button>Analyze First Deal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDeals.map(deal => (
              <Card key={deal.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{deal.address}</CardTitle>
                      <CardDescription>
                        {deal.city}, {deal.province} • {deal.property_type.replace(/_/g, ' ')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getGradeColor(deal.deal_grade)}>
                        {deal.deal_grade}
                      </Badge>
                      <Badge variant="outline">{deal.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Purchase Price</p>
                      <p className="font-semibold">{formatCurrency(deal.purchase_price)}</p>
                    </div>
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
                      <p className="font-semibold">{deal.cap_rate?.toFixed(1) || 0}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-semibold">{deal.deal_score || 0}/100</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/deals/${deal.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                    <Link href={`/analyze?edit=${deal.id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(deal)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {dealToDelete && (
            <div className="py-4">
              <p className="font-medium">{dealToDelete.address}</p>
              <p className="text-sm text-muted-foreground">
                {dealToDelete.city}, {dealToDelete.province}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
