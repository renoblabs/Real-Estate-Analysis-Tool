'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { getUserPreferences, saveUserPreferences } from '@/lib/database';
import { toast } from 'sonner';
import type { UserPreferences, InvestorType } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    investor_type: 'Beginner',
    default_vacancy_rate: 5.0,
    default_pm_percent: 8.0,
    default_maintenance_percent: 10.0,
    target_coc_return: 8.0,
    target_cap_rate: 5.0,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data } = await getUserPreferences(user.id);
      if (data) {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const prefsToSave: UserPreferences = {
        user_id: user.id,
        investor_type: preferences.investor_type as InvestorType,
        default_vacancy_rate: preferences.default_vacancy_rate!,
        default_pm_percent: preferences.default_pm_percent!,
        default_maintenance_percent: preferences.default_maintenance_percent!,
        target_coc_return: preferences.target_coc_return!,
        target_cap_rate: preferences.target_cap_rate!,
      };

      const { error } = await saveUserPreferences(prefsToSave);
      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container py-8">
          <Skeleton className="h-12 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
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

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and default analysis assumptions
          </p>
        </div>

        {/* Account Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <Label htmlFor="investor_type">Investor Type</Label>
              <select
                id="investor_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={preferences.investor_type}
                onChange={e => setPreferences({ ...preferences, investor_type: e.target.value as InvestorType })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Your experience level as a real estate investor
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Analysis Assumptions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Default Analysis Assumptions</CardTitle>
            <CardDescription>
              These values will be pre-filled when creating new deals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vacancy_rate">Default Vacancy Rate (%)</Label>
                <Input
                  id="vacancy_rate"
                  type="number"
                  step="0.1"
                  value={preferences.default_vacancy_rate}
                  onChange={e => setPreferences({ ...preferences, default_vacancy_rate: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Typical: 4-7%
                </p>
              </div>

              <div>
                <Label htmlFor="pm_percent">Property Management Fee (%)</Label>
                <Input
                  id="pm_percent"
                  type="number"
                  step="0.1"
                  value={preferences.default_pm_percent}
                  onChange={e => setPreferences({ ...preferences, default_pm_percent: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Typical: 7-10% of gross rent
                </p>
              </div>

              <div>
                <Label htmlFor="maintenance_percent">Maintenance Reserve (%)</Label>
                <Input
                  id="maintenance_percent"
                  type="number"
                  step="0.1"
                  value={preferences.default_maintenance_percent}
                  onChange={e => setPreferences({ ...preferences, default_maintenance_percent: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Typical: 8-15% of gross rent
                </p>
              </div>

              <div>
                <Label htmlFor="target_coc">Target Cash-on-Cash Return (%)</Label>
                <Input
                  id="target_coc"
                  type="number"
                  step="0.1"
                  value={preferences.target_coc_return}
                  onChange={e => setPreferences({ ...preferences, target_coc_return: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your minimum acceptable CoC return
                </p>
              </div>

              <div>
                <Label htmlFor="target_cap_rate">Target Cap Rate (%)</Label>
                <Input
                  id="target_cap_rate"
                  type="number"
                  step="0.1"
                  value={preferences.target_cap_rate}
                  onChange={e => setPreferences({ ...preferences, target_cap_rate: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your minimum acceptable cap rate
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button variant="outline" onClick={() => loadSettings()}>
                Reset to Saved
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button variant="outline" onClick={handleSignOut} className="w-full md:w-auto">
                Sign Out
              </Button>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
