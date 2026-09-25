import { apiRequest } from "@/lib/api/client";
import type { Amenity, Booking, BookingReceipt, Favorite, Listing, ListingPage, PriceBreakdown, Review } from "@/lib/types";

export type ListingFilters = {
  location?: string; check_in?: string; check_out?: string; guests?: number;
  min_price?: number; max_price?: number; property_type?: string; amenities?: string[];
  page?: number; page_size?: number;
};

export function getListings(filters: ListingFilters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else query.set(key, String(value));
  });
  return apiRequest<ListingPage>(`/listings${query.size ? `?${query}` : ""}`);
}

export const getListing = (id: number) => apiRequest<Listing>(`/listings/${id}`);
export const getAmenities = () => apiRequest<Amenity[]>("/amenities");
export const getReviews = (id: number) => apiRequest<Review[]>(`/listings/${id}/reviews`);
export const getFavorites = () => apiRequest<Favorite[]>("/favorites");
export const addFavorite = (listing_id: number, wishlist_name = "Wish List") => apiRequest<Favorite>("/favorites", { method: "POST", body: JSON.stringify({ listing_id, wishlist_name }) });
export const removeFavorite = (listing_id: number) => apiRequest<void>(`/favorites/${listing_id}`, { method: "DELETE" });
export const getMyBookings = () => apiRequest<Booking[]>("/bookings/mine");
export const getHostListings = () => apiRequest<Listing[]>("/host/listings");
export const getHostBookings = () => apiRequest<Booking[]>("/host/bookings");
export const getBooking = (id: number) => apiRequest<Booking>(`/bookings/${id}`);

export function getBookingQuote(data: { listing_id: number; check_in: string; check_out: string; guest_count: number }) {
  return apiRequest<PriceBreakdown>("/bookings/quote", { method: "POST", body: JSON.stringify(data) });
}

export function createBooking(data: { listing_id: number; check_in: string; check_out: string; guest_count: number }) {
  return apiRequest<BookingReceipt>("/bookings", { method: "POST", body: JSON.stringify(data) });
}

export function saveListing(data: Record<string, unknown>, id?: number) {
  return apiRequest<Listing>(id ? `/listings/${id}` : "/listings", {
    method: id ? "PUT" : "POST", body: JSON.stringify(data),
  });
}

export const deleteListing = (id: number) => apiRequest<void>(`/listings/${id}`, { method: "DELETE" });
