export function parseCurrencyAmount(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(num) ? undefined : num;
}

// Exchange rate cache to avoid hitting API too frequently
let exchangeRateCache: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

export async function getUSDtoCADRate(): Promise<number> {
  try {
    // Check if we have a valid cached rate
    if (
      exchangeRateCache &&
      Date.now() - exchangeRateCache.timestamp < CACHE_DURATION
    ) {
      return exchangeRateCache.rate;
    }

    // Fetch from Exchange Rate API (free tier available)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();

    if (data.rates && data.rates.CAD) {
      const rate = data.rates.CAD;

      // Cache the rate
      exchangeRateCache = {
        rate,
        timestamp: Date.now(),
      };

      return rate;
    }

    throw new Error("Failed to get exchange rate");
  } catch (error) {
    console.error("Error fetching USD to CAD rate:", error);

    // Fallback to a reasonable rate if API fails
    return 1.35; // Approximate USD to CAD rate
  }
}

export function convertUSDtoCAD(
  usdAmount: number,
  exchangeRate: number
): number {
  return usdAmount * exchangeRate;
}

export function convertCurrencyToCAD(
  amount: number,
  currency: string,
  exchangeRate: number
): number {
  if (currency === "CAD") {
    return amount;
  } else if (currency === "USD") {
    return convertUSDtoCAD(amount, exchangeRate);
  }
  // For other currencies, you might want to add more conversion logic
  return amount; // Default fallback
}
