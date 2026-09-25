"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getMyBookings } from "@/lib/api/marketplace";
import type { Booking } from "@/lib/types";
import { dateLabel, money } from "@/lib/format";

export function TripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  useEffect(() => { getMyBookings().then(setBookings).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load trips.")).finally(() => setLoading(false)); }, []);
  const today = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => bookings.filter((booking) => tab === "upcoming" ? booking.check_out >= today && booking.status !== "cancelled" : booking.check_out < today || booking.status === "completed"), [bookings, tab, today]);

  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-6xl px-5 py-10 md:px-8"><h1 className="text-3xl font-semibold tracking-tight">Your trips</h1><p className="mt-2 text-sm text-neutral-500">Keep track of the places you’re going and the memories you’ve made.</p>
    <div className="mt-8 flex gap-7 border-b border-neutral-200"><button onClick={() => setTab("upcoming")} className={`pb-3 text-sm font-semibold ${tab === "upcoming" ? "border-b-2 border-neutral-900" : "text-neutral-500"}`}>Upcoming</button><button onClick={() => setTab("past")} className={`pb-3 text-sm font-semibold ${tab === "past" ? "border-b-2 border-neutral-900" : "text-neutral-500"}`}>Past</button></div>
    {loading ? <div className="mt-8 h-52 animate-pulse rounded-2xl bg-neutral-100" /> : error ? <div role="alert" className="mt-8 rounded-xl bg-rose-50 p-5 text-sm text-rose-700">{error}<button type="button" onClick={() => window.location.reload()} className="ml-3 font-semibold underline">Try again</button></div> : filtered.length ? <div className="mt-7 grid gap-5 md:grid-cols-2">{filtered.map((booking) => <article key={booking.id} className="overflow-hidden rounded-2xl border border-neutral-200"><div className="flex min-h-[178px]">
      <Link href={`/listings/${booking.listing.id}`} className="w-[34%] shrink-0 bg-neutral-100 sm:w-[38%]"><img src={booking.listing.images[0]?.url ?? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"} alt={booking.listing.title} className="h-full min-h-[178px] w-full object-cover" onError={(event) => { event.currentTarget.src = "/stay-placeholder.svg"; }} /></Link>
      <div className="flex min-w-0 flex-col justify-between p-4"><div><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-emerald-800">{booking.status}</span><span className="text-[11px] text-neutral-500">Trip #{booking.id}</span></div><Link href={`/listings/${booking.listing.id}`}><h2 className="mt-2 line-clamp-2 font-semibold">{booking.listing.title}</h2></Link><p className="mt-1 flex items-center gap-1 text-xs text-neutral-500"><MapPin size={13} />{booking.listing.location}</p></div><div className="mt-3 space-y-1.5 text-xs text-neutral-700"><p className="flex items-center gap-2"><CalendarDays size={14} />{dateLabel(booking.check_in, "MMM d")} – {dateLabel(booking.check_out, "MMM d, yyyy")}</p><p className="flex items-center gap-2"><Users size={14} />{booking.guest_count} {booking.guest_count === 1 ? "guest" : "guests"} · {money(booking.total_price_cents)} total</p></div></div>
    </div></article>)}</div> : <div className="py-20 text-center"><h2 className="text-xl font-semibold">{tab === "upcoming" ? "No upcoming trips yet" : "No past trips yet"}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">{tab === "upcoming" ? "Your next great stay is waiting to be found." : "When your stays are complete, they’ll show up here."}</p>{tab === "upcoming" && <Link href="/" className="mt-5 inline-block rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white">Explore stays</Link>}</div>}
  </section></main>;
}

