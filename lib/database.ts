// REI OPS™ - Database Operations

import type { Deal, UserPreferences, DealAnalysis, DealStatus } from '@/types';
import { createClient as createBrowserClient } from './supabase/client';
import { withRetry } from './utils';

/**
 * Save a new deal to the database
 */
export async function saveDeal(
  userId: string,
  analysis: DealAnalysis,
  status: DealStatus = 'analyzing',
  notes?: string
): Promise<{ data: Deal | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const dealData = {
      user_id: userId,
      // Property Information
      address: analysis.property.address,
      city: analysis.property.city,
      province: analysis.property.province,
      postal_code: analysis.property.postal_code,
      property_type: analysis.property.property_type,
      bedrooms: analysis.property.bedrooms,
      bathrooms: analysis.property.bathrooms,
      square_feet: analysis.property.square_feet,
      year_built: analysis.property.year_built,
      lot_size: analysis.property.lot_size,
      // Financial Inputs
      purchase_price: analysis.property.purchase_price,
      down_payment_percent: analysis.property.down_payment_percent,
      down_payment_amount: analysis.property.down_payment_amount,
      interest_rate: analysis.property.interest_rate,
      amortization_years: analysis.property.amortization_years,
      // Strategy & Condition
      strategy: analysis.property.strategy,
      property_condition: analysis.property.property_condition,
      renovation_cost: analysis.property.renovation_cost,
      after_repair_value: analysis.property.after_repair_value,
      // Revenue
      monthly_rent: analysis.property.monthly_rent,
      other_income: analysis.property.other_income,
      vacancy_rate: analysis.property.vacancy_rate,
      // Expenses
      property_tax_annual: analysis.property.property_tax_annual,
      insurance_annual: analysis.property.insurance_annual,
      property_management_percent: analysis.property.property_management_percent,
      maintenance_percent: analysis.property.maintenance_percent,
      utilities_monthly: analysis.property.utilities_monthly,
      hoa_fees_monthly: analysis.property.hoa_condo_fees_monthly,
      other_expenses_monthly: analysis.property.other_expenses_monthly,
      // Calculated Outputs
      total_acquisition_cost: analysis.acquisition.total_acquisition_cost,
      cmhc_premium: analysis.financing.cmhc_premium,
      land_transfer_tax: analysis.acquisition.land_transfer_tax,
      mortgage_amount: analysis.financing.mortgage_amount,
      monthly_mortgage_payment: analysis.financing.monthly_payment,
      monthly_cash_flow: analysis.cash_flow.monthly_cash_flow,
      annual_cash_flow: analysis.cash_flow.annual_cash_flow,
      cash_on_cash_return: analysis.metrics.cash_on_cash_return,
      cap_rate: analysis.metrics.cap_rate,
      dscr: analysis.metrics.dscr,
      grm: analysis.metrics.grm,
      deal_score: analysis.scoring.total_score,
      deal_grade: analysis.scoring.grade,
      // BRRRR Specific
      brrrr_cash_left_in_deal: analysis.brrrr?.cash_left_in_deal,
      brrrr_cash_recovered: analysis.brrrr?.cash_recovered,
      // Management
      status,
      notes,
      is_favorite: false
    };

    // Use retry logic for database operations
    const { data, error } = await withRetry(
      async () => supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single(),
      3, // 3 retries
      1000 // 1 second delay with exponential backoff
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('saveDeal failed after retries:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update an existing deal
 */
export async function updateDeal(
  dealId: string,
  analysis: DealAnalysis,
  status?: DealStatus,
  notes?: string
): Promise<{ data: Deal | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const updateData: any = {
      // Property Information
      address: analysis.property.address,
      city: analysis.property.city,
      province: analysis.property.province,
      postal_code: analysis.property.postal_code,
      property_type: analysis.property.property_type,
      bedrooms: analysis.property.bedrooms,
      bathrooms: analysis.property.bathrooms,
      square_feet: analysis.property.square_feet,
      year_built: analysis.property.year_built,
      lot_size: analysis.property.lot_size,
      // Financial Inputs
      purchase_price: analysis.property.purchase_price,
      down_payment_percent: analysis.property.down_payment_percent,
      down_payment_amount: analysis.property.down_payment_amount,
      interest_rate: analysis.property.interest_rate,
      amortization_years: analysis.property.amortization_years,
      // Strategy & Condition
      strategy: analysis.property.strategy,
      property_condition: analysis.property.property_condition,
      renovation_cost: analysis.property.renovation_cost,
      after_repair_value: analysis.property.after_repair_value,
      // Revenue
      monthly_rent: analysis.property.monthly_rent,
      other_income: analysis.property.other_income,
      vacancy_rate: analysis.property.vacancy_rate,
      // Expenses
      property_tax_annual: analysis.property.property_tax_annual,
      insurance_annual: analysis.property.insurance_annual,
      property_management_percent: analysis.property.property_management_percent,
      maintenance_percent: analysis.property.maintenance_percent,
      utilities_monthly: analysis.property.utilities_monthly,
      hoa_fees_monthly: analysis.property.hoa_condo_fees_monthly,
      other_expenses_monthly: analysis.property.other_expenses_monthly,
      // Calculated Outputs
      total_acquisition_cost: analysis.acquisition.total_acquisition_cost,
      cmhc_premium: analysis.financing.cmhc_premium,
      land_transfer_tax: analysis.acquisition.land_transfer_tax,
      mortgage_amount: analysis.financing.mortgage_amount,
      monthly_mortgage_payment: analysis.financing.monthly_payment,
      monthly_cash_flow: analysis.cash_flow.monthly_cash_flow,
      annual_cash_flow: analysis.cash_flow.annual_cash_flow,
      cash_on_cash_return: analysis.metrics.cash_on_cash_return,
      cap_rate: analysis.metrics.cap_rate,
      dscr: analysis.metrics.dscr,
      grm: analysis.metrics.grm,
      deal_score: analysis.scoring.total_score,
      deal_grade: analysis.scoring.grade,
      // BRRRR Specific
      brrrr_cash_left_in_deal: analysis.brrrr?.cash_left_in_deal,
      brrrr_cash_recovered: analysis.brrrr?.cash_recovered,
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Use retry logic for database operations
    const { data, error } = await withRetry(
      async () => supabase
        .from('deals')
        .update(updateData)
        .eq('id', dealId)
        .select()
        .single(),
      3,
      1000
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('updateDeal failed after retries:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get all deals for a user
 */
export async function getUserDeals(
  userId: string
): Promise<{ data: Deal[] | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    // Use retry logic for database operations
    const { data, error } = await withRetry(
      async () => supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      3,
      1000
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('getUserDeals failed after retries:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get a single deal by ID
 */
export async function getDeal(
  dealId: string
): Promise<{ data: Deal | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    // Use retry logic for database operations
    const { data, error } = await withRetry(
      async () => supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single(),
      3,
      1000
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('getDeal failed after retries:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a deal
 */
export async function deleteDeal(
  dealId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  dealId: string,
  isFavorite: boolean
): Promise<{ error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('deals')
      .update({ is_favorite: isFavorite })
      .eq('id', dealId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(
  userId: string
): Promise<{ data: UserPreferences | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // If no preferences exist, return defaults
    if (!data) {
      return {
        data: {
          user_id: userId,
          investor_type: 'Beginner',
          default_vacancy_rate: 5.0,
          default_pm_percent: 8.0,
          default_maintenance_percent: 10.0,
          target_coc_return: 8.0,
          target_cap_rate: 5.0
        },
        error: null
      };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(
  preferences: UserPreferences
): Promise<{ data: UserPreferences | null; error: Error | null }> {
  try {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferences)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
