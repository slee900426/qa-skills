/**
 * Shared test helpers and constants.
 */

/** Common password for every SauceDemo account. */
export const SAUCE_PASSWORD = 'secret_sauce';

/** SauceDemo accounts (all share SAUCE_PASSWORD). */
export const SAUCE_USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export type SauceUserKey = keyof typeof SAUCE_USERS;

/**
 * Extract the first numeric value from a price-bearing string.
 * e.g. "$29.99" -> 29.99, "Item total: $39.98" -> 39.98
 */
export function parsePrice(text: string | null | undefined): number {
  if (!text) return NaN;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

/** Round to 2 decimals to avoid floating point noise in money comparisons. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Lexicographic ascending copy (locale-aware), used to assert A→Z sorting. */
export function sortedAsc(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

/** Lexicographic descending copy, used to assert Z→A sorting. */
export function sortedDesc(values: string[]): string[] {
  return [...values].sort((a, b) => b.localeCompare(a));
}

/** Numeric ascending copy, used to assert price low→high sorting. */
export function numericAsc(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

/** Numeric descending copy, used to assert price high→low sorting. */
export function numericDesc(values: number[]): number[] {
  return [...values].sort((a, b) => b - a);
}
