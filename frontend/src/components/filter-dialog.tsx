"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { ListingFilters } from "@/lib/api/marketplace";

const propertyTypes = ["Apartment", "Cabin", "Cottage", "Villa", "Guesthouse", "Bungalow", "Treehouse", "Loft"];
const amenityOptions = [{ slug: "wifi", label: "Wifi" }, { slug: "kitchen", label: "Kitchen" }, { slug: "pool", label: "Pool" }, { slug: "free-parking", label: "Free parking" }, { slug: "pets-allowed", label: "Pets allowed" }, { slug: "hot-tub", label: "Hot tub" }, { slug: "workspace", label: "Dedicated workspace" }];

export function FilterDialog({ open, initial, onClose, onApply }: { open: boolean; initial: ListingFilters; onClose: () => void; onApply: (filters: ListingFilters) => void }) {
  const [minPrice, setMinPrice] = useState(initial.min_price ? String(initial.min_price / 100) : "");
  const [maxPrice, setMaxPrice] = useState(initial.max_price ? String(initial.max_price / 100) : "");
  const [propertyType, setPropertyType] = useState(initial.property_type ?? "");
  const [amenities, setAmenities] = useState(initial.amenities ?? []);
  if (!open) return null;
  const toggle = (slug: string) => setAmenities((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="filter-title" className="flex max-h-[90vh] w-full max-w-[570px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4"><button aria-label="Close filters" onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100"><X size={18} /></button><h2 id="filter-title" className="text-sm font-semibold">Filters</h2><span className="w-9" /></div>
      <div className="overflow-y-auto px-6 py-5">
        <section><h3 className="text-lg font-semibold">Price range</h3><p className="mt-1 text-sm text-neutral-500">Nightly prices before taxes</p><div className="mt-5 grid grid-cols-2 gap-3">
          <label className="rounded-xl border border-neutral-300 px-4 py-3 text-xs text-neutral-600">Minimum price<input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="₹ 0" className="mt-1 block w-full border-0 p-0 text-base text-neutral-900 outline-none placeholder:text-neutral-400" /></label>
          <label className="rounded-xl border border-neutral-300 px-4 py-3 text-xs text-neutral-600">Maximum price<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="No limit" className="mt-1 block w-full border-0 p-0 text-base text-neutral-900 outline-none placeholder:text-neutral-400" /></label>
        </div></section>
        <section className="mt-7 border-t border-neutral-200 pt-6"><h3 className="text-lg font-semibold">Property type</h3><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{propertyTypes.map((type) => <button key={type} type="button" aria-pressed={propertyType === type} onClick={() => setPropertyType(propertyType === type ? "" : type)} className={`rounded-xl border px-3 py-3 text-sm transition ${propertyType === type ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-900"}`}>{type}</button>)}</div></section>
        <section className="mt-7 border-t border-neutral-200 pt-6"><h3 className="text-lg font-semibold">Amenities</h3><div className="mt-3 grid grid-cols-1 gap-x-5 sm:grid-cols-2">{amenityOptions.map((item) => <label key={item.slug} className="flex cursor-pointer items-center gap-3 py-3 text-sm"><input type="checkbox" checked={amenities.includes(item.slug)} onChange={() => toggle(item.slug)} className="h-5 w-5 accent-neutral-900" />{item.label}</label>)}</div></section>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4"><button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); setPropertyType(""); setAmenities([]); }} className="text-sm font-semibold underline">Clear all</button><button type="button" onClick={() => onApply({ ...initial, min_price: minPrice ? Math.round(Number(minPrice) * 100) : undefined, max_price: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined, property_type: propertyType || undefined, amenities })} className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700"><SlidersHorizontal size={16} /> Show stays</button></div>
    </section>
  </div>;
}
