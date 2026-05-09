import type { Trade } from "../schemas/trade.schema.js";

interface ParseResult {
  trades: Trade[];
  errors: { row: number; reason: string }[];
}

export function parseZerodha(rows: any[]): ParseResult {
  const trades: Trade[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    try {
      const quantity = Number(row.quantity);
      const price = Number(row.price);

      if (quantity <= 0) {
        throw new Error(`Quantity must be positive`);
      }

      const [day, month, year] = row.trade_date.split("-");

      const date = new Date(`${year}-${month}-${day}`);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date`);
      }

      const trade: Trade = {
        symbol: row.symbol,
        side:
          row.trade_type.toUpperCase() === "BUY"
            ? "BUY"
            : "SELL",

        quantity,
        price,

        totalAmount:
          row.trade_type.toUpperCase() === "BUY"
            ? quantity * price
            : -(quantity * price),

        currency: "INR",

        executedAt: date.toISOString(),

        broker: "zerodha",

        rawData: row,
      };

      trades.push(trade);
    } catch (err) {
      errors.push({
        row: index + 2,
        reason: (err as Error).message,
      });
    }
  });

  return { trades, errors };
}