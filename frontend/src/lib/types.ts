export type User = { id: number; name: string; email?: string; role: "guest" | "host"; avatar_url?: string | null };
export type Image = { id: number; url: string; caption: string | null; position: number };
export type Amenity = { id: number; name: string; slug: string; icon_name: string | null };
export type Listing = {
  id: number; host_id: number; title: string; description: string; location: string;
  property_type: string; price_per_night_cents: number; cleaning_fee_cents: number;
  rating: number | null; capacity: number; created_at: string; updated_at: string;
  host: Pick<User, "id" | "name" | "avatar_url">; images: Image[]; amenities: Amenity[];
};
export type ListingPage = { items: Listing[]; total: number; page: number; page_size: number };
export type PriceBreakdown = {
  currency: string; nights: number; nightly_price_cents: number; nightly_subtotal_cents: number;
  cleaning_fee_cents: number; service_fee_cents: number; total_price_cents: number;
};
export type Booking = {
  id: number; guest_id: number; listing_id: number; check_in: string; check_out: string;
  guest_count: number; nightly_price_cents: number; cleaning_fee_cents: number;
  service_fee_cents: number; total_price_cents: number; status: "confirmed" | "cancelled" | "completed";
  created_at: string; payment_confirmation: string;
  listing: { id: number; title: string; location: string; images: Image[] };
};
export type BookingReceipt = { booking: Booking; price_breakdown: PriceBreakdown };
export type Favorite = { id: number; user_id: number; listing_id: number; wishlist_name: string; created_at: string; listing: Listing };
export type Review = { id: number; listing_id: number; guest_id: number; booking_id: number | null; rating: number; comment: string; created_at: string; guest: Pick<User, "id" | "name" | "avatar_url"> };
