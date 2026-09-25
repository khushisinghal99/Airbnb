"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import { money } from "@/lib/format";
import { addFavorite, removeFavorite } from "@/lib/api/marketplace";
import { useToast } from "@/components/toast-provider";

export function ListingCard({ listing, initiallySaved = false, onSavedChange }: { listing: Listing; initiallySaved?: boolean; onSavedChange?: (saved: boolean) => void }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const photos = listing.images;
  const image = photos[0]?.url ?? "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85";

  async function toggleFavorite(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (saved) await removeFavorite(listing.id);
      else await addFavorite(listing.id);
      setSaved(!saved);
      onSavedChange?.(!saved);
      toast(saved ? "Removed from your wishlist" : "Saved to your wishlist");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update wishlist", "error");
    } finally { setBusy(false); }
  }

  return (
    <article className="min-w-0">
      <div className="group relative aspect-[1/0.96] overflow-hidden rounded-[15px] bg-neutral-100">
        <Link href={`/listings/${listing.id}`} aria-label={`View ${listing.title}`} className="absolute inset-0 z-0">
          <img src={image} alt={listing.images[0]?.caption ?? listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" onError={(event) => { event.currentTarget.src = "/stay-placeholder.svg"; }} />
        </Link>
        {listing.rating !== null && listing.rating >= 4.9 && <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold shadow-sm">Guest favorite</span>}
        <button type="button" onClick={toggleFavorite} disabled={busy} aria-label={saved ? `Remove ${listing.title} from wishlist` : `Add ${listing.title} to wishlist`} aria-pressed={saved} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-white transition hover:scale-105 disabled:opacity-60">
          <Heart size={24} strokeWidth={2} fill={saved ? "#ff385c" : "rgba(0,0,0,0.22)"} className={saved ? "text-[#ff385c]" : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"} />
        </button>
      </div>
      <Link href={`/listings/${listing.id}`} className="mt-3 block">
        <div className="flex items-start justify-between gap-2"><h2 className="line-clamp-1 text-[14px] font-semibold leading-5">{listing.location}</h2><span className="flex shrink-0 items-center gap-1 text-[13px]"><Star size={13} fill="currentColor" strokeWidth={1.5} />{listing.rating?.toFixed(2) ?? "New"}</span></div>
        <p className="mt-0.5 line-clamp-1 text-[14px] leading-5 text-neutral-500">{listing.title}</p>
        <p className="mt-2 text-[14px]"><strong className="font-semibold">{money(listing.price_per_night_cents)}</strong><span className="text-neutral-700"> night</span></p>
      </Link>
    </article>
  );
}
