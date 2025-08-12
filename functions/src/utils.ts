import * as functions from "firebase-functions";

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
      functions.logger.info(
        `💱 Using cached exchange rate: ${exchangeRateCache.rate}`
      );
      return exchangeRateCache.rate;
    }

    functions.logger.info("🌐 Fetching fresh USD to CAD exchange rate...");
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

      functions.logger.info(
        `💱 Fresh exchange rate fetched and cached: ${rate}`
      );
      return rate;
    }

    throw new Error("Failed to get exchange rate");
  } catch (error) {
    functions.logger.error("❌ Error fetching USD to CAD rate:", error);

    // Fallback to a reasonable rate if API fails
    functions.logger.warn("⚠️ Using fallback exchange rate: 1.35");
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

// Market price cache to avoid hitting API too frequently
let marketPriceCache: Map<string, { price: number; timestamp: number }> =
  new Map();
const MARKET_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache

export async function getStockPrice(symbol: string): Promise<number> {
  try {
    // Check if we have a valid cached price
    const cached = marketPriceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_DURATION) {
      functions.logger.info(
        `💹 Using cached price for ${symbol}: ${cached.price}`
      );
      return cached.price;
    }

    functions.logger.info(`📈 Fetching fresh price for ${symbol}...`);
    // Fetch from Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const price = data.chart.result[0].meta.regularMarketPrice;

      // Cache the price
      marketPriceCache.set(symbol, {
        price,
        timestamp: Date.now(),
      });

      functions.logger.info(
        `💹 Fresh price fetched and cached for ${symbol}: ${price}`
      );
      return price;
    }

    throw new Error("No price data available");
  } catch (error) {
    functions.logger.error(`❌ Error fetching price for ${symbol}:`, error);

    // Return cached price if available, even if expired
    const cached = marketPriceCache.get(symbol);
    if (cached) {
      functions.logger.info(
        `🔄 Using expired cached price for ${symbol}: ${cached.price}`
      );
      return cached.price;
    }

    // Fallback to a reasonable price if no cache
    functions.logger.warn(
      `⚠️ No price available for ${symbol}, using fallback: 0`
    );
    return 0;
  }
}

export async function getMultipleStockPrices(
  symbols: string[]
): Promise<Map<string, number>> {
  functions.logger.info(
    `📊 Starting batch price fetch for ${symbols.length} symbols`
  );
  const prices = new Map<string, number>();

  // Process symbols in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    functions.logger.info(
      `🔄 Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.join(
        ", "
      )}`
    );

    const promises = batch.map(async (symbol) => {
      try {
        const price = await getStockPrice(symbol);
        return { symbol, price };
      } catch (error) {
        functions.logger.error(`❌ Error getting price for ${symbol}:`, error);
        return { symbol, price: 0 };
      }
    });

    const results = await Promise.all(promises);
    results.forEach(({ symbol, price }) => {
      prices.set(symbol, price);
    });

    functions.logger.info(
      `✅ Batch ${Math.floor(i / batchSize) + 1} completed:`,
      {
        batch: batch,
        prices: results.map((r) => ({ symbol: r.symbol, price: r.price })),
      }
    );

    // Add small delay between batches to be respectful to the API
    if (i + batchSize < symbols.length) {
      functions.logger.info("⏳ Waiting 100ms before next batch...");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  functions.logger.info(
    `🎉 Batch price fetch completed. Successfully fetched ${prices.size} prices`
  );
  return prices;
}
