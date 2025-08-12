import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {
  getUSDtoCADRate,
  convertCurrencyToCAD,
  getMultipleStockPrices,
} from "./utils";

const db = admin.firestore();

export interface PortfolioSummary {
  totalInvested: number;
  totalDividendsYTD: number;
  portfolioValue: number;
  gainLoss: number;
  lastUpdated: admin.firestore.Timestamp;
  currency: string;
}

export interface Transaction {
  symbol: string;
  type: "Buy" | "Sell";
  shares: number;
  average_price: number;
  total_cost?: number;
  total_value?: number;
  currency: string;
  transaction_date: admin.firestore.Timestamp;
}

export interface Dividend {
  symbol: string;
  amount: number;
  currency: string;
  payment_date: admin.firestore.Timestamp;
}

export interface Holding {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  avgBuyPriceCAD: number;
  currentPrice: number;
  currentPriceCAD: number;
  totalInvested: number;
  totalInvestedCAD: number;
  marketValue: number;
  marketValueCAD: number;
  unrealizedGainLoss: number;
  unrealizedGainLossCAD: number;
  unrealizedGainLossPercentage: number;
  currency: string;
  lastUpdated: admin.firestore.Timestamp;
}

export async function calculatePortfolioSummary(): Promise<PortfolioSummary> {
  try {
    // Use the combined function to avoid redundancy
    const { portfolioSummary } = await calculateHoldingsAndPortfolioSummary();

    // Store the summary in Firestore
    await db
      .collection("portfolio_summary")
      .doc("current")
      .set(portfolioSummary);

    return portfolioSummary;
  } catch (error) {
    functions.logger.error("Error calculating portfolio summary:", error);
    throw error;
  }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary | null> {
  try {
    const doc = await db.collection("portfolio_summary").doc("current").get();
    if (doc.exists) {
      return doc.data() as PortfolioSummary;
    }
    return null;
  } catch (error) {
    functions.logger.error("Error getting portfolio summary:", error);
    throw error;
  }
}

// Function to recalculate summary when transactions or dividends are added
export async function recalculatePortfolioSummaryAndHoldings() {
  try {
    // Calculate holdings and portfolio summary in one pass
    const { holdings, portfolioSummary } =
      await calculateHoldingsAndPortfolioSummary();

    // Save holdings
    await saveHoldings(holdings);

    // Save portfolio summary
    await db
      .collection("portfolio_summary")
      .doc("current")
      .set(portfolioSummary);

    functions.logger.info(
      "Portfolio summary and holdings recalculated successfully"
    );
  } catch (error) {
    functions.logger.error("Error recalculating portfolio summary:", error);
    throw error;
  }
}

// Combined function to calculate both holdings and portfolio summary in one pass
export async function calculateHoldingsAndPortfolioSummary(): Promise<{
  holdings: Holding[];
  portfolioSummary: PortfolioSummary;
}> {
  try {
    functions.logger.info("🚀 Starting calculateHoldingsAndPortfolioSummary");

    const exchangeRate = await getUSDtoCADRate();
    functions.logger.info(
      `💱 Exchange rate fetched: USD to CAD = ${exchangeRate}`
    );

    // Get all transactions ordered by date
    functions.logger.info("📊 Fetching transactions from Firestore...");
    const transactionsSnapshot = await db
      .collection("transactions")
      .orderBy("transaction_date", "asc")
      .get();

    const transactions: Transaction[] = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });

    functions.logger.info(
      `📈 Found ${transactions.length} transactions to process`
    );

    // Group transactions by symbol and calculate holdings
    const holdingsMap = new Map<string, any>();
    let buyCount = 0;
    let sellCount = 0;

    transactions.forEach((transaction, index) => {
      const { symbol, type, shares, average_price, total_cost, currency } =
        transaction;

      if (!holdingsMap.has(symbol)) {
        holdingsMap.set(symbol, {
          symbol,
          quantity: 0,
          totalCost: 0,
          totalCostCAD: 0,
          currency: currency || "CAD",
        });
        functions.logger.info(
          `🆕 New symbol found: ${symbol} (currency: ${currency || "CAD"})`
        );
      }

      const holding = holdingsMap.get(symbol);
      const transactionAmount = total_cost || shares * average_price;
      const transactionAmountCAD = convertCurrencyToCAD(
        transactionAmount,
        currency,
        exchangeRate
      );

      functions.logger.info(`💼 Processing transaction ${index + 1}:`, {
        symbol,
        type,
        shares,
        average_price,
        total_cost,
        currency,
        transactionAmount,
        transactionAmountCAD,
        currentQuantity: holding.quantity,
        currentTotalCost: holding.totalCost,
      });

      if (type === "Buy") {
        buyCount++;
        // Calculate new average price
        const newTotalCost = holding.totalCost + transactionAmount;
        const newTotalCostCAD = holding.totalCostCAD + transactionAmountCAD;
        const newQuantity = holding.quantity + shares;

        holding.quantity = newQuantity;
        holding.totalCost = newTotalCost;
        holding.totalCostCAD = newTotalCostCAD;
        holding.avgBuyPrice = newTotalCost / newQuantity;
        holding.avgBuyPriceCAD = newTotalCostCAD / newQuantity;

        functions.logger.info(`📈 Buy processed for ${symbol}:`, {
          newQuantity,
          newTotalCost,
          newTotalCostCAD,
          avgBuyPrice: holding.avgBuyPrice,
          avgBuyPriceCAD: holding.avgBuyPriceCAD,
        });
      } else if (type === "Sell") {
        sellCount++;
        // Reduce quantity but keep average price (FIFO method)
        const oldQuantity = holding.quantity;
        holding.quantity = Math.max(0, holding.quantity - shares);

        functions.logger.info(`📉 Sell processed for ${symbol}:`, {
          oldQuantity,
          sharesSold: shares,
          newQuantity: holding.quantity,
        });

        if (holding.quantity === 0) {
          // If all shares sold, reset the holding
          holding.totalCost = 0;
          holding.totalCostCAD = 0;
          holding.avgBuyPrice = 0;
          holding.avgBuyPriceCAD = 0;
          functions.logger.info(
            `🗑️ All shares sold for ${symbol}, holding reset`
          );
        } else {
          // Adjust total cost proportionally
          const sellRatio = shares / oldQuantity;
          const costReduction = holding.totalCost * sellRatio;
          const costReductionCAD = holding.totalCostCAD * sellRatio;

          holding.totalCost -= costReduction;
          holding.totalCostCAD -= costReductionCAD;

          functions.logger.info(`💰 Cost adjusted for ${symbol}:`, {
            sellRatio,
            costReduction,
            costReductionCAD,
            newTotalCost: holding.totalCost,
            newTotalCostCAD: holding.totalCostCAD,
          });
        }
      }
    });

    functions.logger.info(
      `📊 Transaction summary: ${buyCount} buys, ${sellCount} sells`
    );

    // Calculate total invested from transactions
    let totalInvested = 0;
    transactions.forEach((transaction) => {
      const transactionAmount =
        transaction.total_cost ||
        transaction.shares * transaction.average_price;

      // Convert to CAD
      const amountInCAD = convertCurrencyToCAD(
        transactionAmount,
        transaction.currency,
        exchangeRate
      );

      if (transaction.type === "Buy") {
        totalInvested += amountInCAD;
      } else if (transaction.type === "Sell") {
        totalInvested -= amountInCAD;
      }
    });

    functions.logger.info(`💰 Total invested (CAD): ${totalInvested}`);

    // Get dividends for current year - all converted to CAD
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    functions.logger.info(`📅 Fetching dividends for year ${currentYear}...`);
    const dividendsSnapshot = await db
      .collection("dividends")
      .where(
        "payment_date",
        ">=",
        admin.firestore.Timestamp.fromDate(startOfYear)
      )
      .where(
        "payment_date",
        "<=",
        admin.firestore.Timestamp.fromDate(endOfYear)
      )
      .get();

    let totalDividendsYTD = 0;
    const dividends: Dividend[] = [];
    dividendsSnapshot.forEach((doc) => {
      const dividend = doc.data() as Dividend;
      dividends.push(dividend);
      // Convert dividend to CAD
      const dividendInCAD = convertCurrencyToCAD(
        dividend.amount,
        dividend.currency,
        exchangeRate
      );
      totalDividendsYTD += dividendInCAD;
    });

    // Get current market prices for all symbols
    const symbols = Array.from(holdingsMap.keys());
    functions.logger.info(
      `📈 Fetching market prices for ${symbols.length} symbols:`,
      symbols
    );

    const marketPrices = await getMultipleStockPrices(symbols);
    functions.logger.info(`💹 Market prices fetched:`, {
      symbolsWithPrices: Array.from(marketPrices.entries()),
      totalSymbols: symbols.length,
      symbolsWithPricesCount: marketPrices.size,
    });

    // Convert to Holding objects and filter out zero quantity holdings
    const holdings: Holding[] = [];
    let portfolioValue = 0;

    functions.logger.info(
      `🏢 Processing ${holdingsMap.size} potential holdings...`
    );

    for (const [symbol, holding] of holdingsMap) {
      if (holding.quantity > 0) {
        // Get current market price
        const currentPrice = marketPrices.get(symbol) || holding.avgBuyPrice;

        functions.logger.info(`📊 Processing holding for ${symbol}:`, {
          quantity: holding.quantity,
          avgBuyPrice: holding.avgBuyPrice,
          avgBuyPriceCAD: holding.avgBuyPriceCAD,
          currentPrice,
          currency: holding.currency,
          hasMarketPrice: marketPrices.has(symbol),
        });

        const currentPriceCAD = convertCurrencyToCAD(
          currentPrice,
          holding.currency,
          exchangeRate
        );
        const marketValue = holding.quantity * currentPrice;
        const marketValueCAD = holding.quantity * currentPriceCAD;
        const unrealizedGainLoss = marketValue - holding.totalCost;
        const unrealizedGainLossCAD = marketValueCAD - holding.totalCostCAD;
        const unrealizedGainLossPercentage =
          holding.totalCost > 0
            ? (unrealizedGainLoss / holding.totalCost) * 100
            : 0;

        const holdingObj = {
          symbol,
          quantity: holding.quantity,
          avgBuyPrice: holding.avgBuyPrice,
          avgBuyPriceCAD: holding.avgBuyPriceCAD,
          currentPrice,
          currentPriceCAD,
          totalInvested: holding.totalCost,
          totalInvestedCAD: holding.totalCostCAD,
          marketValue,
          marketValueCAD,
          unrealizedGainLoss,
          unrealizedGainLossCAD,
          unrealizedGainLossPercentage,
          currency: holding.currency,
          lastUpdated: admin.firestore.Timestamp.now(),
        };

        holdings.push(holdingObj);

        // Add to portfolio value
        portfolioValue += marketValueCAD;

        functions.logger.info(`✅ Holding calculated for ${symbol}:`, {
          marketValue,
          marketValueCAD,
          unrealizedGainLoss,
          unrealizedGainLossCAD,
          unrealizedGainLossPercentage: `${unrealizedGainLossPercentage.toFixed(
            2
          )}%`,
        });
      } else {
        functions.logger.info(`❌ Skipping ${symbol} - zero quantity`);
      }
    }

    const gainLoss = portfolioValue + totalDividendsYTD - totalInvested;

    functions.logger.info(`📊 Portfolio summary calculated:`, {
      totalInvested,
      totalDividendsYTD,
      portfolioValue,
      gainLoss,
      holdingsCount: holdings.length,
    });

    const portfolioSummary: PortfolioSummary = {
      totalInvested,
      totalDividendsYTD,
      portfolioValue,
      gainLoss,
      lastUpdated: admin.firestore.Timestamp.now(),
      currency: "CAD", // All values are now in CAD
    };

    functions.logger.info(
      "🎉 calculateHoldingsAndPortfolioSummary completed successfully"
    );
    return { holdings, portfolioSummary };
  } catch (error) {
    functions.logger.error(
      "❌ Error calculating holdings and portfolio summary:",
      error
    );
    throw error;
  }
}

// Calculate holdings from all historical transactions
export async function calculateHoldings(): Promise<Holding[]> {
  try {
    // Use the combined function to avoid redundancy
    const { holdings } = await calculateHoldingsAndPortfolioSummary();
    return holdings;
  } catch (error) {
    functions.logger.error("Error calculating holdings:", error);
    throw error;
  }
}

// Save holdings to Firestore
export async function saveHoldings(holdings: Holding[]): Promise<void> {
  try {
    const batch = db.batch();

    // Clear existing holdings
    const existingHoldings = await db.collection("holdings").get();
    existingHoldings.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new holdings
    holdings.forEach((holding) => {
      const docRef = db.collection("holdings").doc(holding.symbol);
      batch.set(docRef, holding);
    });

    await batch.commit();
    functions.logger.info(`Saved ${holdings.length} holdings to Firestore`);
  } catch (error) {
    functions.logger.error("Error saving holdings:", error);
    throw error;
  }
}

// Backfill function to process all historical data
export async function backfillHistoricalData(): Promise<void> {
  try {
    functions.logger.info("Starting historical data backfill...");

    // Calculate holdings from all transactions
    const holdings = await calculateHoldings();
    await saveHoldings(holdings);

    // Recalculate portfolio summary
    await calculatePortfolioSummary();

    functions.logger.info("Historical data backfill completed successfully");
  } catch (error) {
    functions.logger.error("Error during historical data backfill:", error);
    throw error;
  }
}

// Get all holdings
export async function getHoldings(): Promise<Holding[]> {
  try {
    const holdingsSnapshot = await db.collection("holdings").get();
    const holdings: Holding[] = [];

    holdingsSnapshot.forEach((doc) => {
      holdings.push(doc.data() as Holding);
    });

    return holdings;
  } catch (error) {
    functions.logger.error("Error getting holdings:", error);
    throw error;
  }
}
