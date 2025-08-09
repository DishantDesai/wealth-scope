import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { getUSDtoCADRate, convertCurrencyToCAD } from "./utils";

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
    // Get current exchange rate
    const exchangeRate = await getUSDtoCADRate();
    functions.logger.info(`Using USD to CAD exchange rate: ${exchangeRate}`);

    // Get all transactions
    const transactionsSnapshot = await db.collection("transactions").get();
    const transactions: Transaction[] = [];

    transactionsSnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });

    // Calculate total invested (sum of all buy transactions minus sells) - all converted to CAD
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

    // Get dividends for current year - all converted to CAD
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

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
    dividendsSnapshot.forEach((doc) => {
      const dividend = doc.data() as Dividend;
      // Convert dividend to CAD
      const dividendInCAD = convertCurrencyToCAD(
        dividend.amount,
        dividend.currency,
        exchangeRate
      );
      totalDividendsYTD += dividendInCAD;
    });

    // For now, we'll use a placeholder portfolio value
    // TODO: Integrate with real-time price API (Yahoo Finance, Alpha Vantage, etc.)
    const portfolioValue = totalInvested; // Placeholder - should be calculated from current holdings × latest prices

    const gainLoss = portfolioValue + totalDividendsYTD - totalInvested;

    const summary: PortfolioSummary = {
      totalInvested,
      totalDividendsYTD,
      portfolioValue,
      gainLoss,
      lastUpdated: admin.firestore.Timestamp.now(),
      currency: "CAD", // All values are now in CAD
    };

    // Store the summary in Firestore
    await db.collection("portfolio_summary").doc("current").set(summary);

    return summary;
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
    // Recalculate holdings first
    const holdings = await calculateHoldings();
    await saveHoldings(holdings);

    // Then recalculate portfolio summary
    await calculatePortfolioSummary();
    functions.logger.info(
      "Portfolio summary and holdings recalculated successfully"
    );
  } catch (error) {
    functions.logger.error("Error recalculating portfolio summary:", error);
    throw error;
  }
}

// Calculate holdings from all historical transactions
export async function calculateHoldings(): Promise<Holding[]> {
  try {
    const exchangeRate = await getUSDtoCADRate();
    functions.logger.info(
      `Calculating holdings with USD to CAD rate: ${exchangeRate}`
    );

    // Get all transactions ordered by date
    const transactionsSnapshot = await db
      .collection("transactions")
      .orderBy("transaction_date", "asc")
      .get();

    const transactions: Transaction[] = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push(doc.data() as Transaction);
    });

    // Group transactions by symbol and calculate holdings
    const holdingsMap = new Map<string, any>();

    transactions.forEach((transaction) => {
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
      }

      const holding = holdingsMap.get(symbol);
      const transactionAmount = total_cost || shares * average_price;
      const transactionAmountCAD = convertCurrencyToCAD(
        transactionAmount,
        currency,
        exchangeRate
      );

      if (type === "Buy") {
        // Calculate new average price
        const newTotalCost = holding.totalCost + transactionAmount;
        const newTotalCostCAD = holding.totalCostCAD + transactionAmountCAD;
        const newQuantity = holding.quantity + shares;

        holding.quantity = newQuantity;
        holding.totalCost = newTotalCost;
        holding.totalCostCAD = newTotalCostCAD;
        holding.avgBuyPrice = newTotalCost / newQuantity;
        holding.avgBuyPriceCAD = newTotalCostCAD / newQuantity;
      } else if (type === "Sell") {
        // Reduce quantity but keep average price (FIFO method)
        holding.quantity = Math.max(0, holding.quantity - shares);

        if (holding.quantity === 0) {
          // If all shares sold, reset the holding
          holding.totalCost = 0;
          holding.totalCostCAD = 0;
          holding.avgBuyPrice = 0;
          holding.avgBuyPriceCAD = 0;
        } else {
          // Adjust total cost proportionally
          const sellRatio = shares / (holding.quantity + shares);
          const costReduction = holding.totalCost * sellRatio;
          const costReductionCAD = holding.totalCostCAD * sellRatio;

          holding.totalCost -= costReduction;
          holding.totalCostCAD -= costReductionCAD;
        }
      }
    });

    // Convert to Holding objects and filter out zero quantity holdings
    const holdings: Holding[] = [];
    for (const [symbol, holding] of holdingsMap) {
      if (holding.quantity > 0) {
        // For now, use average price as current price (will be updated by market data)
        const currentPrice = holding.avgBuyPrice;
        const currentPriceCAD = holding.avgBuyPriceCAD;
        const marketValue = holding.quantity * currentPrice;
        const marketValueCAD = holding.quantity * currentPriceCAD;
        const unrealizedGainLoss = marketValue - holding.totalCost;
        const unrealizedGainLossCAD = marketValueCAD - holding.totalCostCAD;
        const unrealizedGainLossPercentage =
          holding.totalCost > 0
            ? (unrealizedGainLoss / holding.totalCost) * 100
            : 0;

        holdings.push({
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
        });
      }
    }

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
