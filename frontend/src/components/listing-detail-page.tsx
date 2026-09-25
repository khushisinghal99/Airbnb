"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, Share2, ShieldCheck, Star, Wifi } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/toast-provider";
import { getBookingQuote, getListing, getReviews } from "@/lib/api/marketplace";
import type { Listing, PriceBreakdown, Review } from "@/lib/types";
import { dateLabel, money } from "@/lib/format";

function todayIso() { return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }

export function ListingDetailPage({ listingId }: { listingId: number }) {
  const router = useRouter();
  const toast = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [quote, setQuote] = useState<PriceBreakdown | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getListing(listingId), getReviews(listingId)]).then(([stay, stayReviews]) => {
      if (active) { setListing(stay); setReviews(stayReviews); setError(""); }
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load this stay."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingId]);

  useEffect(() => {
    if (!listing || !checkIn || !checkOut || checkOut <= checkIn) { setQuote(null); setQuoteError(""); return; }
    let active = true;
    setQuote(null); setQuoteError("");
    getBookingQuote({ listing_id: listing.id, check_in: checkIn, check_out: checkOut, guest_count: guestCount })
      .then((value) => { if (active) setQuote(value); })
      .catch((cause: unknown) => { if (active) setQuoteError(cause instanceof Error ? cause.message : "Those dates are unavailable."); });
    return () => { active = false; };
  }, [listing, checkIn, checkOut, guestCount]);

  if (loading) return <><SiteHeader /><div className="mx-auto max-w-6xl animate-pulse px-6 py-12"><div className="h-8 w-2/3 rounded bg-neutral-200" /><div className="mt-8 h-[420px] rounded-2xl bg-neutral-100" /></div></>;
  if (error || !listing) return <><SiteHeader /><div className="mx-auto max-w-3xl px-6 py-20 text-center"><h1 className="text-2xl font-semibold">This stay is unavailable</h1><p className="mt-2 text-sm text-neutral-500">{error || "We couldn’t find this listing."}</p><Link href="/" className="mt-5 inline-block rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white">Back to stays</Link></div></>;

  const photos = listing.images.length ? listing.images : [{ id: 0, url: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85", caption: listing.title, position: 0 }];
  const currentListingId = listing.id;
  const openGallery = (index: number) => { setActivePhoto(index); setGalleryOpen(true); };
  const movePhoto = (direction: number) => setActivePhoto((current) => (current + direction + photos.length) % photos.length);
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : listing.rating;
  const minimumCheckOut = checkIn ? format(addDays(parseISO(checkIn), 1), "yyyy-MM-dd") : todayIso();

  function reserve() {
    if (!checkIn || !checkOut) { toast("Add your dates to check the total", "error"); return; }
    if (checkOut <= checkIn) { toast("Check-out must be after check-in", "error"); return; }
    if (!quote) { toast(quoteError || "Choose available dates before continuing", "error"); return; }
    const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut, guests: String(guestCount) });
    router.push(`/checkout/${currentListingId}?${params}`);
  }

  return <main><SiteHeader /><article className="mx-auto max-w-[1120px] px-5 pb-16 pt-6 md:px-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[25px] font-semibold leading-tight tracking-[-.45px]">{listing.title}</h1><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"><span className="flex items-center gap-1"><Star size={14} fill="currentColor" />{averageRating?.toFixed(2) ?? "New"}</span>{reviews.length > 0 && <a href="#reviews" className="underline">{reviews.length} reviews</a>}<span className="text-neutral-400">·</span><span className="underline">{listing.location}</span></div></div><div className="flex gap-2"><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); toast("Link copied"); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline hover:bg-neutral-100"><Share2 size={16} />Share</button><button type="button" onClick={() => { toast("Sign in is simulated for this demo"); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline hover:bg-neutral-100"><Heart size={16} />Save</button></div></div>
    <section aria-label="Listing photos" className="relative mt-6 grid h-[270px] grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:h-[350px] md:h-[430px] md:grid-cols-4">
      {photos.slice(0, 5).map((photo, index) => <button key={photo.id} type="button" onClick={() => openGallery(index)} className={`group relative overflow-hidden bg-neutral-100 ${index === 0 ? "col-span-2 row-span-2" : "hidden md:block"}`}>
        <img src={photo.url} alt={photo.caption ?? listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" onError={(event) => { event.currentTarget.src = "/stay-placeholder.svg"; }} />
      </button>)}
      {photos.length > 1 && <button type="button" onClick={() => openGallery(0)} className="absolute bottom-4 right-4 rounded-lg border border-neutral-800 bg-white px-4 py-2 text-xs font-semibold shadow-sm">Show all {photos.length} photos</button>}
    </section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_370px] lg:gap-12">
      <div>
        <section className="flex items-center justify-between border-b border-neutral-200 pb-6"><div><h2 className="text-[21px] font-semibold">Entire {listing.property_type.toLowerCase()} hosted by {listing.host.name.split(" ")[0]}</h2><p className="mt-1 text-neutral-600">Up to {listing.capacity} guests · thoughtfully prepared for your stay</p></div><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f1e9e3] text-xl font-semibold text-[#644d40]">{listing.host.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div></section>
        <section className="space-y-5 border-b border-neutral-200 py-6"><div className="flex gap-4"><HouseIcon /><div><h3 className="font-semibold">A place with its own character</h3><p className="mt-1 text-sm text-neutral-500">Every detail has been considered for a comfortable stay.</p></div></div><div className="flex gap-4"><ShieldCheck size={23} /><div><h3 className="font-semibold">A thoughtful, welcoming host</h3><p className="mt-1 text-sm text-neutral-500">Your host {listing.host.name.split(" ")[0]} is here to help make your stay easy.</p></div></div><div className="flex gap-4"><MapPin size={23} /><div><h3 className="font-semibold">A great location</h3><p className="mt-1 text-sm text-neutral-500">Explore the neighborhood around {listing.location}.</p></div></div></section>
        <section className="border-b border-neutral-200 py-6"><h2 className="text-xl font-semibold">About this place</h2><p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-neutral-700">{listing.description}</p></section>
        <section className="border-b border-neutral-200 py-6"><h2 className="text-xl font-semibold">What this place offers</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{listing.amenities.map((amenity) => <div className="flex items-center gap-3 text-sm" key={amenity.id}><Wifi size={18} strokeWidth={1.5} /><span>{amenity.name}</span></div>)}</div>{listing.amenities.length === 0 && <p className="mt-3 text-sm text-neutral-500">Ask your host about available amenities.</p>}</section>
        <section id="reviews" className="py-7"><h2 className="flex items-center gap-2 text-xl font-semibold"><Star size={19} fill="currentColor" />{averageRating?.toFixed(2) ?? "New"}<span className="text-neutral-400">·</span>{reviews.length} reviews</h2>{reviews.length ? <div className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">{reviews.slice(0, 6).map((review) => <article key={review.id}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-neutral-200 font-semibold">{review.guest.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h3 className="text-sm font-semibold">{review.guest.name}</h3><p className="text-xs text-neutral-500">{dateLabel(review.created_at, "MMMM yyyy")}</p></div></div><p className="mt-3 text-sm leading-6">{review.comment}</p></article>)}</div> : <p className="mt-3 text-sm text-neutral-500">Be the first to share what you loved about this stay.</p>}</section>
      </div>
      <aside className="order-first h-fit lg:sticky lg:top-28 lg:order-last"><div className="rounded-xl border border-neutral-200 p-6 shadow-[0_6px_22px_rgba(0,0,0,.12)]"><div className="flex items-end justify-between"><div><span className="text-[22px] font-semibold">{money(listing.price_per_night_cents)}</span><span className="text-sm"> night</span></div><span className="flex items-center gap-1 text-xs"><Star size={12} fill="currentColor" />{averageRating?.toFixed(2) ?? "New"} · {reviews.length} reviews</span></div>
          <div className="mt-5 overflow-hidden rounded-lg border border-neutral-500"><div className="grid grid-cols-2"><label className="border-b border-r border-neutral-400 px-3 py-2 text-[9px] font-bold uppercase tracking-wide">Check-in<input aria-label="Check-in date" type="date" min={todayIso()} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 block w-full text-xs font-normal outline-none" /></label><label className="border-b border-neutral-400 px-3 py-2 text-[9px] font-bold uppercase tracking-wide">Check-out<input aria-label="Check-out date" type="date" min={minimumCheckOut} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 block w-full text-xs font-normal outline-none" /></label></div><label className="block px-3 py-2 text-[9px] font-bold uppercase tracking-wide">Guests<select aria-label="Guests" value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} className="mt-1 block w-full bg-white text-xs font-normal outline-none">{Array.from({ length: listing.capacity }, (_, index) => index + 1).map((count) => <option value={count} key={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label></div>
          <button type="button" onClick={reserve} className="mt-4 w-full rounded-lg bg-[#e31c5f] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c81450]">Reserve</button><p className="mt-3 text-center text-xs text-neutral-500">You won’t be charged yet</p>
          {checkIn && checkOut && !quote && !quoteError && <p role="status" className="mt-3 text-center text-xs text-neutral-500">Checking availability and total…</p>}
          {quoteError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{quoteError}</p>}
          {quote && <div className="mt-5 space-y-3 border-t border-neutral-200 pt-4 text-sm"><div className="flex justify-between"><span className="underline">{money(quote.nightly_price_cents)} × {quote.nights} nights</span><span>{money(quote.nightly_subtotal_cents)}</span></div><div className="flex justify-between"><span className="underline">Cleaning fee</span><span>{money(quote.cleaning_fee_cents)}</span></div><div className="flex justify-between"><span className="underline">Service fee</span><span>{money(quote.service_fee_cents)}</span></div><div className="flex justify-between border-t border-neutral-200 pt-3 font-semibold"><span>Total before taxes</span><span>{money(quote.total_price_cents)}</span></div></div>}
        </div><p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500"><ShieldCheck size={15} />Great stays start with a good plan</p></aside>
    </div>
    {galleryOpen && <div role="dialog" aria-modal="true" aria-label="Photo gallery" className="fixed inset-0 z-[80] flex flex-col bg-[#111] text-white"><div className="flex items-center justify-between px-5 py-4"><button onClick={() => setGalleryOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Close gallery"><ChevronLeft size={22} /></button><span className="text-sm">{activePhoto + 1} / {photos.length}</span><span className="w-10" /></div><div className="relative flex min-h-0 flex-1 items-center justify-center px-5 pb-6"><button onClick={() => movePhoto(-1)} aria-label="Previous photo" className="absolute left-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 hover:bg-white/15"><ChevronLeft /></button><img src={photos[activePhoto]?.url} alt={photos[activePhoto]?.caption ?? listing.title} className="max-h-full max-w-full object-contain" /><button onClick={() => movePhoto(1)} aria-label="Next photo" className="absolute right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 hover:bg-white/15"><ChevronRight /></button></div></div>}
  </article></main>;
}

function HouseIcon() { return <CalendarDays size={23} />; }



