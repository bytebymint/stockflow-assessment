export type CsvCell = string | number | boolean | Date | null | undefined;

const spreadsheetFormulaPrefix =
  /^(?:[\u0000\t\r\n]|[ \u0000\t\r\n]*[=+\-@＝＋－＠])/u;

function cellText(value: CsvCell) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function escapeCsvCell(value: CsvCell) {
  const text = cellText(value);
  const spreadsheetSafeText = spreadsheetFormulaPrefix.test(text)
    ? `'${text}`
    : text;

  return `"${spreadsheetSafeText.replaceAll('"', '""')}"`;
}

export function buildCsv(headers: string[], rows: CsvCell[][]) {
  for (const row of rows) {
    if (row.length !== headers.length) {
      throw new Error("CSV rows must match the header column count.");
    }
  }

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}
