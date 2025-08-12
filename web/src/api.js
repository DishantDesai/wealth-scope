import axios from "axios";

// Base URL for Firebase Functions (you'll need to replace this with your actual Firebase Functions URL)
const API_BASE_URL = "https://us-central1-wealth-scope.cloudfunctions.net";
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions
export const portfolioAPI = {
  // Get portfolio summary
  getPortfolioSummary: async () => {
    try {
      const response = await api.get("/getPortfolioSummary");
      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      throw error;
    }
  },

  // Get transactions
  getTransactions: async () => {
    try {
      const response = await api.get("/getTransactions");
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  // Get dividends
  getDividends: async () => {
    try {
      const response = await api.get("/getDividends");
      return response.data;
    } catch (error) {
      console.error("Error fetching dividends:", error);
      throw error;
    }
  },

  // Recalculate portfolio summary
  recalculateSummary: async () => {
    try {
      const response = await api.post("/recalculateSummary");
      return response.data;
    } catch (error) {
      console.error("Error recalculating summary:", error);
      throw error;
    }
  },

  // Get current exchange rate
  getExchangeRate: async () => {
    try {
      const response = await api.get("/getExchangeRate");
      return response.data;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      throw error;
    }
  },

  // Backfill historical data
  backfillData: async () => {
    try {
      const response = await api.post("/backfillData");
      return response.data;
    } catch (error) {
      console.error("Error backfilling data:", error);
      throw error;
    }
  },

  // Get holdings
  getHoldings: async () => {
    try {
      const response = await api.get("/getHoldings");
      return response.data;
    } catch (error) {
      console.error("Error fetching holdings:", error);
      throw error;
    }
  },

  // Recalculate holdings
  recalculateHoldings: async () => {
    try {
      const response = await api.post("/recalculateHoldings");
      return response.data;
    } catch (error) {
      console.error("Error recalculating holdings:", error);
      throw error;
    }
  },

  // Update market prices
  updateMarketPrices: async () => {
    try {
      const response = await api.post("/updateMarketPrices");
      return response.data;
    } catch (error) {
      console.error("Error updating market prices:", error);
      throw error;
    }
  },
};

// Mock data for development (remove when backend is ready)
export const mockData = {
  portfolioSummary: {
    totalInvested: 33750, // 25000 USD converted to CAD (25000 * 1.35)
    totalDividendsYTD: 608.51, // 450.75 USD converted to CAD
    portfolioValue: 35775, // 26500 USD converted to CAD
    gainLoss: 2633.51, // All values now in CAD
    lastUpdated: new Date(),
    currency: "CAD",
  },
  transactions: [
    {
      id: "1",
      symbol: "AAPL",
      type: "Buy",
      shares: 10,
      average_price: 150.0,
      total_cost: 1500.0,
      currency: "USD",
      transaction_date: new Date("2024-01-15"),
    },
    {
      id: "2",
      symbol: "TSLA",
      type: "Buy",
      shares: 5,
      average_price: 200.0,
      total_cost: 1000.0,
      currency: "USD",
      transaction_date: new Date("2024-01-20"),
    },
  ],
  dividends: [
    {
      id: "1",
      symbol: "AAPL",
      amount: 25.5,
      currency: "USD",
      payment_date: new Date("2024-02-01"),
    },
    {
      id: "2",
      symbol: "TSLA",
      amount: 15.25,
      currency: "USD",
      payment_date: new Date("2024-02-15"),
    },
  ],
  holdings: [
    {
      symbol: "AAPL",
      quantity: 10,
      avgBuyPrice: 150.0,
      avgBuyPriceCAD: 202.5,
      currentPrice: 175.0,
      currentPriceCAD: 236.25,
      totalInvested: 1500.0,
      totalInvestedCAD: 2025.0,
      marketValue: 1750.0,
      marketValueCAD: 2362.5,
      unrealizedGainLoss: 250.0,
      unrealizedGainLossCAD: 337.5,
      unrealizedGainLossPercentage: 16.67,
      currency: "USD",
      lastUpdated: new Date(),
    },
    {
      symbol: "TSLA",
      quantity: 5,
      avgBuyPrice: 200.0,
      avgBuyPriceCAD: 270.0,
      currentPrice: 180.0,
      currentPriceCAD: 243.0,
      totalInvested: 1000.0,
      totalInvestedCAD: 1350.0,
      marketValue: 900.0,
      marketValueCAD: 1215.0,
      unrealizedGainLoss: -100.0,
      unrealizedGainLossCAD: -135.0,
      unrealizedGainLossPercentage: -10.0,
      currency: "USD",
      lastUpdated: new Date(),
    },
  ],
};

export default api;
