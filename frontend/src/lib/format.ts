import { format, parseISO } from "date-fns";

export function money(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

export function dateLabel(value: string, pattern = "MMM d, yyyy") {
  return format(parseISO(value), pattern);
}
