"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, TentTree, Waves, Trees, House, Castle, Mountain, Building2, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FilterDialog } from "@/components/filter-dialog";
import { ListingGrid, ListingSkeletons } from "@/components/listing-grid";
import { useToast } from "@/components/toast-provider";
import { getFavorites, getListings } from "@/lib/api/marketplace";
import type { Listing } from "@/lib/types";
import type { ListingFilters } from "@/lib/api/marketplace";

const categories = [
  { label: "Cabins", type: "Cabin", icon: TentTree }, { label: "Beachfront", type: "Villa", icon: Waves },
  { label: "Countryside", type: "Farm stay", icon: Trees }, { label: "Tiny homes", type: "Tiny home", icon: House },
  { label: "Amazing views", type: "Chalet", icon: Mountain }, { label: "Design", type: "Loft", icon: Building2 },
  { label: "Heritage", type: "Heritage home", icon: Castle },
];

function todayIso() { return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }

export function HomePage() {
  const [filters, setFilters] = useState<ListingFilters>({ page: 1, page_size: 12 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialLocation = params.get("location") ?? "";
    const initialCheckIn = params.get("check_in") ?? "";
    const initialCheckOut = params.get("check_out") ?? "";
    const initialGuests = params.get("guests") ?? "";
    setLocation(initialLocation);
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setGuests(initialGuests);
    if (initialLocation || initialCheckIn || initialCheckOut || initialGuests) {
      setFilters((current) => ({
        ...current,
        location: initialLocation || undefined,
        check_in: initialCheckIn || undefined,
        check_out: initialCheckOut || undefined,
        guests: initialGuests ? Number(initialGuests) : undefined,
      }));
    }
  }, []);

  const loadListings = useCallback(async (query: ListingFilters) => {
    setLoading(true); setError("");
    try {
      const [result, favorites] = await Promise.all([getListings(query), getFavorites()]);
      setListings(result.items); setTotal(result.total); setSavedIds(favorites.map((favorite) => favorite.listing_id));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "We couldn't load stays right now.";
      setError(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadListings(filters); }, [filters, loadListings]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((checkIn && !checkOut) || (!checkIn && checkOut)) { toast("Choose both check-in and check-out dates", "error"); return; }
    if (checkIn && checkOut && checkOut <= checkIn) { toast("Check-out must be after check-in", "error"); return; }
    setFilters((current) => ({ ...current, location: location.trim() || undefined, check_in: checkIn || undefined, check_out: checkOut || undefined, guests: guests ? Number(guests) : undefined, page: 1 }));
  }

  function applyCategory(property_type?: string) { setFilters((current) => ({ ...current, property_type, page: 1 })); }
  const pages = Math.max(1, Math.ceil(total / (filters.page_size ?? 12)));

  return <main className="min-h-screen bg-white">
    <SiteHeader />
    <section className="mx-auto max-w-[1440px] px-5 md:px-10">
      <form onSubmit={submitSearch} className="mx-auto mt-5 grid max-w-[850px] grid-cols-2 rounded-2xl border border-neutral-200 shadow-[0_2px_14px_rgba(0,0,0,0.08)] md:mt-7 md:grid-cols-[1.35fr_1fr_1fr_0.9fr_auto] md:rounded-full">
        <label className="search-segment col-span-2 rounded-t-2xl px-5 py-3 md:col-span-1 md:rounded-l-full md:rounded-tr-none"><span className="block text-[11px] font-bold">Where</span><input aria-label="Search location" placeholder="Search destinations" value={location} onChange={(event) => setLocation(event.target.value)} className="mt-0.5 w-full truncate bg-transparent text-sm outline-none placeholder:text-neutral-500" /></label>
        <label className="search-segment border-t border-neutral-200 px-5 py-3 md:border-l md:border-t-0"><span className="block text-[11px] font-bold">Check in</span><input aria-label="Check-in date" type="date" min={todayIso()} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-0.5 w-full bg-transparent text-xs outline-none" /></label>
        <label className="search-segment border-l border-t border-neutral-200 px-5 py-3 md:border-t-0"><span className="block text-[11px] font-bold">Check out</span><input aria-label="Check-out date" type="date" min={checkIn || todayIso()} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-0.5 w-full bg-transparent text-xs outline-none" /></label>
        <label className="search-segment border-t border-neutral-200 px-5 py-3 md:border-l md:border-t-0"><span className="block text-[11px] font-bold">Who</span><select aria-label="Number of guests" value={guests} onChange={(event) => setGuests(event.target.value)} className="mt-0.5 w-full bg-transparent text-sm outline-none"><option value="">Add guests</option>{[1, 2, 3, 4, 5, 6, 8, 10].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label>
        <button type="submit" aria-label="Search stays" className="col-span-2 m-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[#ff385c] px-4 font-semibold text-white shadow-sm transition hover:bg-[#e31c5f] md:col-span-1 md:grid md:h-12 md:w-12 md:px-0"><Search size={19} /><span className="text-sm md:hidden">Search stays</span></button>
      </form>
    </section>
    <section className="mx-auto mt-7 flex max-w-[1440px] items-center justify-between gap-4 border-b border-neutral-200 px-5 md:px-10">
      <nav aria-label="Stay categories" className="flex min-w-0 gap-8 overflow-x-auto scrollbar-hide">
        <button type="button" onClick={() => applyCategory(undefined)} className={`category-item ${!filters.property_type ? "category-item-active" : ""}`}><House size={23} /><span>All stays</span></button>
        {categories.map(({ label, type, icon: Icon }) => <button key={label} type="button" onClick={() => applyCategory(filters.property_type === type ? undefined : type)} aria-pressed={filters.property_type === type} className={`category-item ${filters.property_type === type ? "category-item-active" : ""}`}><Icon size={23} strokeWidth={1.6} /><span>{label}</span></button>)}
      </nav>
      <button type="button" onClick={() => setFiltersOpen(true)} className="mb-3 flex h-12 shrink-0 items-center gap-2 rounded-xl border border-neutral-300 px-4 text-xs font-semibold transition hover:border-neutral-900"><SlidersHorizontal size={16} /> Filters{(filters.min_price || filters.max_price || filters.amenities?.length) ? <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c]" /> : null}</button>
    </section>
    <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 md:px-10">
      <div className="mb-5 flex items-end justify-between"><div><h1 className="text-[22px] font-semibold tracking-tight">Stays that feel like somewhere</h1><p className="mt-1 text-sm text-neutral-500">A little inspiration for your next getaway.</p></div><span className="hidden text-sm text-neutral-500 sm:block">{total} places</span></div>
      {loading ? <ListingSkeletons /> : error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800"><p className="font-semibold">We couldn’t load the stays.</p><p className="mt-1">{error}. Check that the FastAPI server is running.</p><button onClick={() => void loadListings(filters)} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-white">Try again</button></div> : listings.length ? <>
        <ListingGrid listings={listings} savedIds={savedIds} />
        {pages > 1 && <div className="mt-12 flex items-center justify-center gap-5"><button type="button" aria-label="Previous page" disabled={filters.page === 1} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))} className="grid h-10 w-10 place-items-center rounded-full border disabled:opacity-35"><ChevronLeft size={18} /></button><span className="text-sm">Page {filters.page} of {pages}</span><button type="button" aria-label="Next page" disabled={filters.page === pages} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))} className="grid h-10 w-10 place-items-center rounded-full border disabled:opacity-35"><ChevronRight size={18} /></button></div>}
      </> : <div className="mx-auto max-w-xl py-20 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neutral-100"><Search size={24} /></div><h2 className="mt-5 text-xl font-semibold">No stays match those filters</h2><p className="mt-2 text-sm text-neutral-500">Try another location or adjust your dates and filters.</p><button onClick={() => { setLocation(""); setCheckIn(""); setCheckOut(""); setGuests(""); setFilters({ page: 1, page_size: 12 }); }} className="mt-5 rounded-lg border px-4 py-2.5 text-sm font-semibold">Clear filters</button></div>}
      <div className="mt-14 flex flex-col items-center border-t border-neutral-200 py-7 text-center"><h2 className="text-lg font-semibold">Keep exploring stays</h2><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-4 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700">Show all places</button><p className="mt-8 text-xs text-neutral-500">© 2026 Staybnb · Privacy · Terms · Your privacy choices</p></div>
    </section>
    <FilterDialog key={`${filters.min_price}-${filters.max_price}-${filters.property_type}-${filters.amenities?.join(",")}`} open={filtersOpen} initial={filters} onClose={() => setFiltersOpen(false)} onApply={(next) => { setFilters({ ...next, page: 1 }); setFiltersOpen(false); }} />
  </main>;
}
