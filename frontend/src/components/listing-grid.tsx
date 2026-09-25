import type { Listing } from "@/lib/types";
import { ListingCard } from "@/components/listing-card";

export function ListingGrid({ listings, savedIds = [] }: { listings: Listing[]; savedIds?: number[] }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
    {listings.map((listing) => <ListingCard key={listing.id} listing={listing} initiallySaved={savedIds.includes(listing.id)} />)}
  </div>;
}

export function ListingSkeletons({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: count }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-square rounded-2xl bg-neutral-200" /><div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" /><div className="mt-2 h-3 w-1/2 rounded bg-neutral-100" /></div>)}</div>;
}
