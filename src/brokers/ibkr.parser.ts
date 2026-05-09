import type { Trade } from "../schemas/trade.schema.js";

export function parseIBKR(rows: any[]) {
  const trades: Trade[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    try {
      const quantity = Number(row.Quantity);

      if (quantity <= 0) {
        throw new Error("Quantity must be positive");
      }

      let symbol = row.Symbol;

      if (symbol.includes(".")) {
        symbol = symbol.replace(".", "/");
      }

      let date = new Date(row.DateTime);

      if (isNaN(date.getTime())) {
        const altDate = new Date(row.DateTime);

        if (isNaN(altDate.getTime())) {
          throw new Error("Invalid date");
        }

        date = altDate;
      }

      const side =
        row["Buy/Sell"] === "BOT"
          ? "BUY"
          : "SELL";

      const price = Number(row.TradePrice);

      trades.push({
        symbol,
        side,
        quantity,
        price,

        totalAmount:
          side === "BUY"
            ? quantity * price
            : -(quantity * price),

        currency: row.Currency,

        executedAt: date.toISOString(),

        broker: "ibkr",

        rawData: row,
      });
    } catch (err) {
      errors.push({
        row: index + 2,
        reason: (err as Error).message,
      });
    }
  });

  return { trades, errors };
}