// Auth utilities for demo mode support

import { createClient } from '@/lib/supabase/client';

export interface DemoUser {
  id: string;
  email: string;
}

export async function checkAuthWithDemo(): Promise<{ user: any | DemoUser | null; isDemo: boolean }> {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  if (isDemoMode) {
    // In demo mode, return a mock user
    return {
      user: { id: 'demo-user', email: 'demo@example.com' },
      isDemo: true
    };
  }

  // Normal auth flow
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    user,
    isDemo: false
  };
}

export function shouldSkipDatabaseOperations(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}