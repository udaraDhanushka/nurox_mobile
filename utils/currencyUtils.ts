// Currency utilities for the Sri Lankan Rupee (LKR)

export const CURRENCY_CONFIG = {
  code: 'LKR',
  symbol: 'Rs.',
  name: 'Sri Lankan Rupee',
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

/**
 * Format amount to LKR currency format
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? `${CURRENCY_CONFIG.symbol} 0.00` : '0.00';
  }

  const formatted = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals,
  }).format(amount);

  if (!showSymbol) {
    // Remove currency symbol and return just the number
    return formatted.replace(/Rs\.?\s?/, '').trim();
  }

  // Ensure consistent symbol format
  return formatted.replace(/Rs\.?\s?/, `${CURRENCY_CONFIG.symbol} `);
}

/**
 * Format amount with custom symbol
 * @param amount - The amount to format
 * @param symbol - Custom symbol to use
 * @returns Formatted currency string
 */
export function formatCurrencyWithSymbol(amount: number, symbol: string): string {
  const formatted = formatCurrency(amount, false);
  return `${symbol} ${formatted}`;
}

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbol and thousands separators
  const cleaned = currencyString
    .replace(/Rs\.?\s?/, '')
    .replace(/,/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert cents to rupees (for payment processing)
 * @param cents - Amount in cents
 * @returns Amount in rupees
 */
export function centsToRupees(cents: number): number {
  return cents / 100;
}

/**
 * Convert rupees to cents (for payment processing)
 * @param rupees - Amount in rupees
 * @returns Amount in cents
 */
export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Get currency info
 * @returns Currency configuration object
 */
export function getCurrencyInfo() {
  return CURRENCY_CONFIG;
}