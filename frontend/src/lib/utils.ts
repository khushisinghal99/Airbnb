export function formatCurrency(amountInCents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountInCents / 100);
}
