"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/toast-provider";
import { getAmenities, getListing, saveListing } from "@/lib/api/marketplace";
import type { Amenity, Listing } from "@/lib/types";

const fieldClass = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-800";

export function ListingEditor({ listingId }: { listingId?: number }) {
  const router = useRouter();
  const toast = useToast();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(Boolean(listingId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAmenities().then(setAmenities).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load amenities."));
    if (listingId) getListing(listingId).then(setListing).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load listing.")).finally(() => setLoading(false));
  }, [listingId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const images = String(form.get("images") ?? "").split("\n").map((url) => url.trim()).filter(Boolean).map((url) => ({ url }));
    const payload = {
      title: String(form.get("title")), description: String(form.get("description")), location: String(form.get("location")),
      property_type: String(form.get("property_type")), price_per_night_cents: Math.round(Number(form.get("price")) * 100),
      cleaning_fee_cents: Math.round(Number(form.get("cleaning_fee") || 0) * 100), capacity: Number(form.get("capacity")),
      images, amenity_ids: form.getAll("amenity_ids").map(Number),
    };
    try { await saveListing(payload, listingId); toast(listingId ? "Listing updated" : "Listing created"); router.push("/host"); }
    catch (cause) { const message = cause instanceof Error ? cause.message : "Could not save listing."; setError(message); toast(message, "error"); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen"><SiteHeader /><section className="mx-auto max-w-3xl px-5 py-9 md:px-8"><Link href="/host" className="text-sm text-neutral-500 hover:underline">← Host dashboard</Link><h1 className="mt-4 text-3xl font-semibold">{listingId ? "Edit your place" : "Tell us about your place"}</h1><p className="mt-2 text-sm text-neutral-500">Add the essentials. You can update these details later.</p>
    {loading ? <div className="mt-8 h-72 animate-pulse rounded-2xl bg-neutral-100" /> : <form onSubmit={submit} className="mt-7 space-y-5 rounded-2xl border border-neutral-200 p-5 sm:p-7">
      {error && <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <label className="block text-sm font-semibold">Listing title<input name="title" required minLength={3} maxLength={180} defaultValue={listing?.title ?? ""} placeholder="A sunny cottage near the coast" className={fieldClass} /></label>
      <label className="block text-sm font-semibold">Description<textarea name="description" required minLength={10} maxLength={4000} rows={5} defaultValue={listing?.description ?? ""} placeholder="What makes this place special?" className={fieldClass} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Location<input name="location" required minLength={2} defaultValue={listing?.location ?? ""} placeholder="Goa, India" className={fieldClass} /></label><label className="block text-sm font-semibold">Property type<select name="property_type" required defaultValue={listing?.property_type ?? "Apartment"} className={fieldClass}>{["Apartment", "Cabin", "Cottage", "Villa", "Guesthouse", "Bungalow", "Chalet", "Treehouse", "Loft", "Farm stay", "Heritage home"].map((type) => <option key={type}>{type}</option>)}</select></label></div>
      <div className="grid gap-4 sm:grid-cols-3"><label className="block text-sm font-semibold">Price per night (₹)<input type="number" name="price" min="0" step="1" required defaultValue={listing ? listing.price_per_night_cents / 100 : ""} className={fieldClass} /></label><label className="block text-sm font-semibold">Cleaning fee (₹)<input type="number" name="cleaning_fee" min="0" step="1" defaultValue={listing ? listing.cleaning_fee_cents / 100 : 0} className={fieldClass} /></label><label className="block text-sm font-semibold">Maximum guests<input type="number" name="capacity" min="1" max="30" required defaultValue={listing?.capacity ?? 2} className={fieldClass} /></label></div>
      <label className="block text-sm font-semibold">Photo URLs <span className="font-normal text-neutral-500">(one URL per line)</span><textarea name="images" rows={3} defaultValue={listing?.images.map((image) => image.url).join("\n") ?? ""} placeholder="https://images.unsplash.com/..." className={fieldClass} /></label>
      <fieldset><legend className="text-sm font-semibold">Amenities</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{amenities.map((amenity) => <label key={amenity.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="amenity_ids" value={amenity.id} defaultChecked={listing?.amenities.some((item) => item.id === amenity.id)} className="h-4 w-4 accent-neutral-900" />{amenity.name}</label>)}</div></fieldset>
      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5"><Link href="/host" className="rounded-lg border px-4 py-3 text-sm font-semibold">Cancel</Link><button disabled={saving} className="rounded-lg bg-[#e31c5f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : listingId ? "Save changes" : "Create listing"}</button></div>
    </form>}
  </section></main>;
}
