"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Plus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/toast-provider";
import { deleteListing, getHostBookings, getHostListings } from "@/lib/api/marketplace";
import type { Booking, Listing } from "@/lib/types";
import { dateLabel, money } from "@/lib/format";

export function HostDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  useEffect(() => {
    Promise.all([getHostListings(), getHostBookings()]).then(([stays, reservations]) => { setListings(stays); setBookings(reservations); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load the host dashboard."))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: number) {
    if (!window.confirm("Delete this listing? Listings with booking history cannot be deleted.")) return;
    try { await deleteListing(id); setListings((current) => current.filter((listing) => listing.id !== id)); toast("Listing deleted"); }
    catch (cause) { toast(cause instanceof Error ? cause.message : "Could not delete this listing", "error"); }
  }

  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-6xl px-5 py-10 md:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#ff385c]">HOSTING</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Your dashboard</h1><p className="mt-2 text-sm text-neutral-500">Manage your homes and keep an eye on upcoming stays.</p></div><Link href="/host/listings/new" className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />Create a listing</Link></div>
    {loading ? <div className="mt-8 h-60 animate-pulse rounded-2xl bg-neutral-100" /> : error ? <div role="alert" className="mt-8 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">{error}. Use the profile menu to switch to host mode, then <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">try again</button>.</div> : <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border p-5"><p className="text-sm text-neutral-500">Your listings</p><p className="mt-2 text-3xl font-semibold">{listings.length}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-neutral-500">Reservations</p><p className="mt-2 text-3xl font-semibold">{bookings.length}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-neutral-500">Confirmed stays</p><p className="mt-2 text-3xl font-semibold">{bookings.filter((booking) => booking.status === "confirmed").length}</p></div></div>
      <section className="mt-10"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Your listings</h2><Link href="/host/listings/new" className="text-sm font-semibold underline">Add a place</Link></div>
        {listings.length ? <div className="mt-4 divide-y rounded-2xl border">{listings.map((listing) => <article key={listing.id} className="flex flex-wrap items-center gap-4 p-4"><Link href={`/listings/${listing.id}`} className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"><img src={listing.images[0]?.url ?? "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=500&q=80"} alt={listing.title} className="h-full w-full object-cover" /></Link><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{listing.title}</h3><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Active</span></div><p className="mt-1 flex items-center gap-1 text-sm text-neutral-500"><MapPin size={14} />{listing.location}</p><p className="mt-1 text-sm">{money(listing.price_per_night_cents)} <span className="text-neutral-500">night</span></p></div><div className="flex items-center gap-2"><Link href={`/host/listings/${listing.id}/edit`} className="rounded-lg border px-3 py-2 text-sm font-semibold">Edit</Link><button aria-label={`Delete ${listing.title}`} onClick={() => void remove(listing.id)} className="rounded-lg border p-2 text-neutral-600 hover:text-rose-600"><Trash2 size={17} /></button></div></article>)}</div> : <p className="mt-4 rounded-xl bg-neutral-50 p-6 text-sm text-neutral-500">You haven’t added a place yet.</p>}
      </section>
      <section className="mt-10"><h2 className="text-xl font-semibold">Recent bookings</h2>{bookings.length ? <div className="mt-4 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-neutral-50 text-xs uppercase text-neutral-500"><tr><th className="px-4 py-3">Place</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Guests</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y">{bookings.map((booking) => <tr key={booking.id}><td className="px-4 py-3 font-medium">{booking.listing.title}<span className="block text-xs text-neutral-500">Guest #{booking.guest_id}</span></td><td className="px-4 py-3"><span className="flex items-center gap-1"><CalendarDays size={14} />{dateLabel(booking.check_in, "MMM d")} – {dateLabel(booking.check_out, "MMM d, yyyy")}</span></td><td className="px-4 py-3">{booking.guest_count}</td><td className="px-4 py-3">{money(booking.total_price_cents)}</td><td className="px-4 py-3 capitalize">{booking.status}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl bg-neutral-50 p-6 text-sm text-neutral-500">Guest reservations will appear here.</p>}</section>
    </>}
  </section></main>;
}

