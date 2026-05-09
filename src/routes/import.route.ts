import express from "express";
import multer from "multer";

import { parseCSV } from "../utils/csv.js";
import { detectBroker } from "../services/brokerDetector.js";

import { parseZerodha } from "../brokers/zerodha.parser.js";
import { parseIBKR } from "../brokers/ibkr.parser.js";

const router = express.Router();

const upload = multer();

router.get("/import", (req, res) => {
  res.json({
    message: "Broker Import API",
    endpoint: "/import",
    method: "POST",
    description: "Upload a CSV file from a broker (Zerodha or IBKR)",
    usage: {
      method: "POST",
      url: "http://localhost:3000/import",
      body: "multipart/form-data with 'file' field containing CSV",
      example: "Use curl: curl -F 'file=@trades.csv' http://localhost:3000/import",
    },
    supportedBrokers: ["zerodha", "ibkr"],
    zerodhaColumns: [
      "symbol",
      "trade_date",
      "trade_type",
      "quantity",
      "price",
    ],
    ibkrColumns: [
      "Symbol",
      "DateTime",
      "Buy/Sell",
      "Quantity",
      "TradeID",
    ],
  });
});

router.get("/", (req, res) => {
  res.json({
    name: "Broker Import Service",
    version: "1.0.0",
    endpoints: {
      import: {
        path: "/import",
        method: "POST",
        description: "Upload and parse broker CSV files",
      },
      docs: {
        path: "/import",
        method: "GET",
        description: "Get API documentation",
      },
    },
  });
});

router.post(
  "/import",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "CSV file required",
        });
      }

      const csvText = req.file.buffer.toString();

      const rows = parseCSV(csvText);

      if (rows.length === 0) {
        return res.status(400).json({
          error: "Empty CSV",
        });
      }

      const headers = Object.keys(rows[0] as Record<string, unknown>);

      const broker = detectBroker(headers);

      let result;

      if (broker === "zerodha") {
        result = parseZerodha(rows);
      } else {
        result = parseIBKR(rows);
      }

      return res.json({
        broker,

        summary: {
          total: rows.length,
          valid: result.trades.length,
          skipped: result.errors.length,
        },

        trades: result.trades,

        errors: result.errors,
      });
    } catch (err) {
      return res.status(400).json({
        error: (err as Error).message,
      });
    }
  }
);

export default router;