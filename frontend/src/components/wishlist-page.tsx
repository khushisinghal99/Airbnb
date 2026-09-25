"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ListingCard } from "@/components/listing-card";
import { getFavorites } from "@/lib/api/marketplace";
import type { Favorite } from "@/lib/types";

export function WishlistPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = () => { setLoading(true); getFavorites().then(setFavorites).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load your wishlists.")).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); }, []);
  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10"><h1 className="text-3xl font-semibold tracking-tight">Wishlists</h1><p className="mt-2 text-sm text-neutral-500">Your saved places, all together.</p>
    {loading ? <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-neutral-100" />)}</div> : error ? <div role="alert" className="mt-8 rounded-xl bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : favorites.length ? <><h2 className="mt-7 text-lg font-semibold">Saved stays <span className="text-neutral-400">·</span> {favorites.length}</h2><div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{favorites.map((favorite) => <ListingCard key={favorite.id} listing={favorite.listing} initiallySaved onSavedChange={(saved) => { if (!saved) setFavorites((current) => current.filter((item) => item.listing_id !== favorite.listing_id)); }} />)}</div></> : <div className="mx-auto max-w-md py-24 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-[#ff385c]"><Heart size={27} /></div><h2 className="mt-5 text-xl font-semibold">Start saving your favorite stays</h2><p className="mt-2 text-sm text-neutral-500">Tap the heart on a place you love and it’ll be right here.</p><Link href="/" className="mt-5 inline-block rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white">Explore stays</Link></div>}
  </section></main>;
}
