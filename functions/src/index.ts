/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import {parseCurrencyAmount} from './utils'
admin.initializeApp();


exports.transactionWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
    try {
        functions.logger.info("INFO: Transaction webhook triggered with body:", req.body);
        const {
          symbol,
          account,
          shares,
          average_price,
          total_cost,
          total_value,
          type,
          time
        } = req.body;
        
        functions.logger.info("before parsing", total_value, total_cost);
        
        const currency = (total_value?.includes("US$") || total_cost?.includes("US$")) ? "USD" : "CAD";
        functions.logger.info(currency)
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
          time
        };

        const transactionData: Record<string, any> = {
          ...commonData,
          type: type.toLowerCase().includes("sell") ? "Sell" : "Buy",
          shares: parsed.shares,
          average_price: parsed.average_price,
          transaction_date: admin.firestore.Timestamp.fromDate(new Date()),
          ...(parsed.total_cost !== undefined && { total_cost: parsed.total_cost }),
          ...(parsed.total_value !== undefined && { total_value: parsed.total_value }),        
        };

        await admin.firestore().collection("transactions").add(transactionData);
        res.status(200).send("Email processed successfully");
    } catch (err) {
        functions.logger.error("ERROR: Transaction Webhook Error:", err);
        res.status(500).send("Error: " + err);
    }
});

exports.dividendWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
  try{
    functions.logger.info("INFO: Dividend webhook triggered with body:", req.body);
    const {
      symbol,
      account,
      amount
    } = req.body;
    const currency = amount.includes("US$") ? "USD" : "CAD";
    const dividendData = {
      symbol,
      account,
      currency,
      amount: parseFloat(amount.replace(/[^\d.]/g, "")),
      payment_date: admin.firestore.Timestamp.fromDate(new Date()),
    };
    await admin.firestore().collection("dividends").add(dividendData);
    res.status(200).send("Email processed successfully");
  }catch(err: any){
    functions.logger.error("ERROR: Dividend Webhook Error:", err);
    res.status(500).send("Error: " + err);
  }
});
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
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


