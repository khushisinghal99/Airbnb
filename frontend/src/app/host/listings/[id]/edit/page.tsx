"use client";

import { useParams } from "next/navigation";
import { ListingEditor } from "@/components/listing-editor";

export default function Page() {
  const params = useParams<{ id: string }>();
  return <ListingEditor listingId={Number(params.id)} />;
}
