import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Canadian currency
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted currency string (e.g., "$1,234")
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value - Number to format (e.g., 5.25 for 5.25%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "5.3%")
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Timeout wrapper for promises
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @returns Promise that rejects on timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param retries - Number of retries (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @returns Result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = delayMs * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed'); // Should never reach here
}

/**
 * Format a date as a localized string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', options).format(d);
}
