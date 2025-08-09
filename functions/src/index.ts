/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { parseCurrencyAmount, getUSDtoCADRate } from "./utils";
import {
  calculatePortfolioSummary,
  getPortfolioSummary,
  recalculatePortfolioSummaryAndHoldings,
  backfillHistoricalData,
  getHoldings,
  calculateHoldings,
  saveHoldings,
} from "./firestore";
admin.initializeApp();

exports.transactionWebhook = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      functions.logger.info(
        "INFO: Transaction webhook triggered with body:",
        req.body
      );
      const {
        symbol,
        account,
        shares,
        average_price,
        total_cost,
        total_value,
        type,
        time,
      } = req.body;

      functions.logger.info("before parsing", total_value, total_cost);

      const currency =
        total_value?.includes("US$") || total_cost?.includes("US$")
          ? "USD"
          : "CAD";
      functions.logger.info(currency);
      const parsed = {
        shares: parseFloat(shares),
        average_price: parseFloat(average_price?.replace(/[^\d.-]/g, "") || ""),
        total_cost: parseCurrencyAmount(total_cost),
        total_value: parseCurrencyAmount(total_value),
      };

      const commonData = {
        symbol,
        account,
        currency,
        time,
      };

      const transactionData: Record<string, any> = {
        ...commonData,
        type: type.toLowerCase().includes("sell") ? "Sell" : "Buy",
        shares: parsed.shares,
        average_price: parsed.average_price,
        transaction_date: admin.firestore.Timestamp.fromDate(new Date()),
        ...(parsed.total_cost !== undefined && {
          total_cost: parsed.total_cost,
        }),
        ...(parsed.total_value !== undefined && {
          total_value: parsed.total_value,
        }),
      };

      await admin.firestore().collection("transactions").add(transactionData);

      // Recalculate holdings and portfolio summary after new transaction
      await recalculatePortfolioSummaryAndHoldings();

      res.status(200).send("Email processed successfully");
    } catch (err) {
      functions.logger.error("ERROR: Transaction Webhook Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

exports.dividendWebhook = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      functions.logger.info(
        "INFO: Dividend webhook triggered with body:",
        req.body
      );
      const { symbol, account, amount } = req.body;
      const currency = amount.includes("US$") ? "USD" : "CAD";
      const dividendData = {
        symbol,
        account,
        currency,
        amount: parseFloat(amount.replace(/[^\d.]/g, "")),
        payment_date: admin.firestore.Timestamp.fromDate(new Date()),
      };
      await admin.firestore().collection("dividends").add(dividendData);

      // Recalculate portfolio summary after new dividend
      await recalculatePortfolioSummaryAndHoldings();

      res.status(200).send("Email processed successfully");
    } catch (err: any) {
      functions.logger.error("ERROR: Dividend Webhook Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);
// API endpoint to get portfolio summary
exports.getPortfolioSummary = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const summary = await getPortfolioSummary();
      if (summary) {
        res.status(200).json(summary);
      } else {
        // If no summary exists, calculate one
        const newSummary = await calculatePortfolioSummary();
        res.status(200).json(newSummary);
      }
    } catch (err) {
      functions.logger.error("ERROR: Get Portfolio Summary Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to get transactions
exports.getTransactions = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const transactionsSnapshot = await admin
        .firestore()
        .collection("transactions")
        .orderBy("transaction_date", "desc")
        .limit(50)
        .get();

      const transactions: any[] = [];
      transactionsSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      res.status(200).json(transactions);
    } catch (err) {
      functions.logger.error("ERROR: Get Transactions Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to get dividends
exports.getDividends = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const dividendsSnapshot = await admin
        .firestore()
        .collection("dividends")
        .orderBy("payment_date", "desc")
        .limit(50)
        .get();

      const dividends: any[] = [];
      dividendsSnapshot.forEach((doc) => {
        dividends.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      res.status(200).json(dividends);
    } catch (err) {
      functions.logger.error("ERROR: Get Dividends Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to recalculate portfolio summary manually
exports.recalculateSummary = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      await recalculatePortfolioSummaryAndHoldings();
      res.status(200).send("Portfolio summary recalculated successfully");
    } catch (err) {
      functions.logger.error("ERROR: Recalculate Summary Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to get current USD to CAD exchange rate
exports.getExchangeRate = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const rate = await getUSDtoCADRate();
      res.status(200).json({
        rate,
        from: "USD",
        to: "CAD",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      functions.logger.error("ERROR: Get Exchange Rate Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to backfill historical data
exports.backfillData = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      await backfillHistoricalData();
      res.status(200).send("Historical data backfill completed successfully");
    } catch (err) {
      functions.logger.error("ERROR: Backfill Data Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to get holdings
exports.getHoldings = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const holdings = await getHoldings();
      res.status(200).json(holdings);
    } catch (err) {
      functions.logger.error("ERROR: Get Holdings Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);

// API endpoint to recalculate holdings
exports.recalculateHoldings = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      const holdings = await calculateHoldings();
      await saveHoldings(holdings);
      res.status(200).send("Holdings recalculated successfully");
    } catch (err) {
      functions.logger.error("ERROR: Recalculate Holdings Error:", err);
      res.status(500).send("Error: " + err);
    }
  }
);
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
