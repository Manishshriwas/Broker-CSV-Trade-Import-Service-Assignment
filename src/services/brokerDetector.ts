export function detectBroker(headers: string[]) {
  if (
    headers.includes("trade_date") &&
    headers.includes("trade_type")
  ) {
    return "zerodha";
  }

  if (
    headers.includes("TradeID") &&
    headers.includes("Buy/Sell")
  ) {
    return "ibkr";
  }

  throw new Error("Unrecognized broker format");
}