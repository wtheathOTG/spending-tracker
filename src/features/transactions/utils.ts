import { endOfDay, format, startOfDay } from "date-fns";

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

export function parseCurrencyToCents(input: string) {
  const normalized = input.trim().replace(/[$,]/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [dollars, cents = ""] = normalized.split(".");
  const amountCents = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));

  return Number.isSafeInteger(amountCents) && amountCents > 0
    ? amountCents
    : null;
}

export function centsToInputValue(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

export function formatTransactionDate(timestamp: number) {
  return format(new Date(timestamp), "MMM d, yyyy");
}

export function toStartOfDayTimestamp(date: Date) {
  return startOfDay(date).getTime();
}

export function toEndOfDayTimestamp(date: Date) {
  return endOfDay(date).getTime();
}

export function formatDateButton(date?: Date) {
  return date ? format(date, "MMM d, yyyy") : "Pick a date";
}
