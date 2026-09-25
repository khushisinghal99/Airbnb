"use client";

import { useParams } from "next/navigation";
import { ListingDetailPage } from "@/components/listing-detail-page";

export default function ListingRoute() {
  const params = useParams<{ id: string }>();
  return <ListingDetailPage listingId={Number(params.id)} />;
}
