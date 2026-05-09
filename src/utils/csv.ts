import { parse } from "csv-parse/sync";

export function parseCSV(csvText: string) {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}