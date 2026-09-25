"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, CreditCard, ShieldCheck, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/toast-provider";
import { createBooking, getBookingQuote, getListing } from "@/lib/api/marketplace";
import type { Listing, PriceBreakdown } from "@/lib/types";
import { dateLabel, money } from "@/lib/format";

function CheckoutContent() {
  const params = useParams<{ listingId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const listingId = Number(params.listingId);
  const checkIn = search.get("check_in") ?? "";
  const checkOut = search.get("check_out") ?? "";
  const guestCount = Number(search.get("guests") ?? 1);
  const [listing, setListing] = useState<Listing | null>(null);
  const [quote, setQuote] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getListing(listingId),
      getBookingQuote({ listing_id: listingId, check_in: checkIn, check_out: checkOut, guest_count: guestCount }),
    ]).then(([stay, price]) => { setListing(stay); setQuote(price); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not prepare this booking."))
      .finally(() => setLoading(false));
  }, [listingId, checkIn, checkOut, guestCount]);

  async function confirm() {
    if (!listing || !quote || !checkIn || !checkOut) { setError("Go back and choose dates before confirming."); return; }
    setSaving(true); setError("");
    try {
      const receipt = await createBooking({ listing_id: listing.id, check_in: checkIn, check_out: checkOut, guest_count: guestCount });
      router.push(`/booking-confirmation/${receipt.booking.id}`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Booking could not be confirmed.";
      setError(message); toast(message, "error");
    } finally { setSaving(false); }
  }

  return <main className="min-h-screen"><SiteHeader /><div className="mx-auto max-w-6xl px-5 py-8 md:px-8"><Link href={listing ? `/listings/${listing.id}` : "/"} className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-neutral-100"><ChevronLeft size={20} /><span className="sr-only">Back to listing</span></Link><h1 className="mt-3 text-3xl font-semibold">Confirm and pay</h1>
    {loading ? <div className="mt-8 grid animate-pulse gap-8 lg:grid-cols-[1fr_390px]"><div className="h-80 rounded-xl bg-neutral-100" /><div className="h-80 rounded-xl bg-neutral-100" /></div> : error && !quote ? <div role="alert" className="mt-7 rounded-xl bg-rose-50 p-5 text-sm text-rose-700">{error}<Link href={listing ? `/listings/${listing.id}` : "/"} className="ml-2 font-semibold underline">Go back</Link></div> : listing && quote ? <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_390px]">
      <section><h2 className="text-xl font-semibold">Your trip</h2><div className="mt-5 grid gap-5 border-b border-neutral-200 pb-6 sm:grid-cols-2"><div><h3 className="font-semibold">Dates</h3><p className="mt-1 text-sm text-neutral-600">{dateLabel(checkIn, "MMM d, yyyy")} – {dateLabel(checkOut, "MMM d, yyyy")}</p></div><div><h3 className="font-semibold">Guests</h3><p className="mt-1 text-sm text-neutral-600">{guestCount} {guestCount === 1 ? "guest" : "guests"}</p></div></div>
        <div className="border-b border-neutral-200 py-6"><h2 className="text-xl font-semibold">Mock payment</h2><div className="mt-4 flex items-start gap-3 rounded-xl border border-neutral-300 p-4"><input type="radio" checked readOnly aria-label="Mock payment selected" className="mt-1 accent-neutral-900" /><CreditCard size={20} /><div><p className="text-sm font-semibold">Demo payment</p><p className="mt-1 text-xs text-neutral-500">No real payment will be collected. Confirming creates a booking for this assignment.</p></div></div></div>
        <div className="mt-6 flex gap-3 rounded-xl bg-neutral-50 p-4 text-sm"><ShieldCheck className="shrink-0" size={20} /><p>Your booking will be confirmed immediately. The host will be able to see your reservation.</p></div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button disabled={saving} onClick={() => void confirm()} className="mt-6 rounded-lg bg-[#e31c5f] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#c81450] disabled:opacity-60">{saving ? "Confirming…" : `Confirm reservation · ${money(quote.total_price_cents)}`}</button>
      </section>
      <aside className="rounded-2xl border border-neutral-200 p-5 shadow-sm"><div className="flex gap-4"><img src={listing.images[0]?.url ?? "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=700&q=80"} alt={listing.title} className="h-28 w-32 rounded-xl object-cover" /><div className="py-1"><p className="line-clamp-2 text-sm font-semibold">{listing.title}</p><p className="mt-1 text-xs text-neutral-500">{listing.property_type} · {listing.location}</p><p className="mt-2 flex items-center gap-1 text-xs"><Star size={12} fill="currentColor" />{listing.rating?.toFixed(2) ?? "New"}</p></div></div><div className="my-5 border-t border-neutral-200" /><h2 className="font-semibold">Price details</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="underline">{money(quote.nightly_price_cents)} × {quote.nights} nights</span><span>{money(quote.nightly_subtotal_cents)}</span></div><div className="flex justify-between"><span className="underline">Cleaning fee</span><span>{money(quote.cleaning_fee_cents)}</span></div><div className="flex justify-between"><span className="underline">Service fee</span><span>{money(quote.service_fee_cents)}</span></div><div className="flex justify-between border-t border-neutral-200 pt-4 font-semibold"><span>Total</span><span>{money(quote.total_price_cents)}</span></div></div></aside>
    </div> : null}
  </div></main>;
}

export function CheckoutPage() { return <Suspense fallback={<><SiteHeader /><div className="mx-auto max-w-6xl animate-pulse px-6 py-12"><div className="h-8 w-1/3 rounded bg-neutral-200" /></div></>}><CheckoutContent /></Suspense>; }
