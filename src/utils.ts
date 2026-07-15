/**
 * Currency conversion and formatting utilities for ProViva Wellness.
 * Exchange rate: 1 USD = 15.00 GHS (Ghana Cedis)
 */

export const EXCHANGE_RATE = 15.00;

export type CurrencyType = "USD" | "GHS";

/**
 * Converts a price in USD to GHS if the active currency is GHS.
 */
export function convertPrice(priceInUSD: number, currency: CurrencyType): number {
  if (currency === "GHS") {
    return priceInUSD * EXCHANGE_RATE;
  }
  return priceInUSD;
}

/**
 * Formats a price in USD to either GHS (GH₵) or USD ($).
 */
export function formatPrice(priceInUSD: number, currency: CurrencyType): string {
  const converted = convertPrice(priceInUSD, currency);
  if (currency === "GHS") {
    return `GH₵ ${converted.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
