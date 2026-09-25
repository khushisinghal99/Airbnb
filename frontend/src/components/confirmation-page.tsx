"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, CalendarDays, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getBooking } from "@/lib/api/marketplace";
import type { Booking } from "@/lib/types";
import { dateLabel, money } from "@/lib/format";

export function ConfirmationPage() {
  const params = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getBooking(Number(params.bookingId)).then(setBooking).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load booking.")); }, [params.bookingId]);
  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-3xl px-5 py-14 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><BadgeCheck size={35} /></div><p className="mt-5 text-sm font-semibold uppercase tracking-[.16em] text-emerald-700">You’re all set</p><h1 className="mt-2 text-3xl font-semibold">Your stay is confirmed</h1><p className="mt-2 text-sm text-neutral-500">We’ve saved the booking details for you.</p>
    {booking ? <article className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 text-left shadow-sm"><div className="flex flex-wrap"><div className="h-56 w-full bg-neutral-100 sm:h-auto sm:w-[38%]"><img src={booking.listing.images[0]?.url ?? "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80"} alt={booking.listing.title} className="h-full min-h-56 w-full object-cover" /></div><div className="flex-1 p-5 sm:p-7"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Booking #{booking.id}</span><h2 className="mt-3 text-xl font-semibold">{booking.listing.title}</h2><p className="mt-1 flex items-center gap-1 text-sm text-neutral-500"><MapPin size={15} />{booking.listing.location}</p><div className="mt-6 space-y-3 border-t border-neutral-200 pt-5 text-sm"><p className="flex items-center gap-2"><CalendarDays size={16} />{dateLabel(booking.check_in, "MMM d, yyyy")} – {dateLabel(booking.check_out, "MMM d, yyyy")}</p><p className="flex items-center gap-2"><Users size={16} />{booking.guest_count} {booking.guest_count === 1 ? "guest" : "guests"}</p><p className="flex justify-between border-t border-neutral-200 pt-4 font-semibold"><span>Total paid</span><span>{money(booking.total_price_cents)}</span></p></div></div></div></article> : error ? <p role="alert" className="mt-7 text-sm text-rose-700">{error}</p> : <div className="mx-auto mt-8 h-48 max-w-2xl animate-pulse rounded-2xl bg-neutral-100" />}
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/trips" className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white">Go to trips</Link><Link href="/" className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold">Explore more stays</Link></div>
  </section></main>;
}
