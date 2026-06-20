import Link from "next/link";
import type { Listing } from "@/lib/types";

const bgs = ["#FBE7FF", "#E0FFF6", "#FFF3D6", "#FFE3EC", "#E6E0FF"];

export default function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="sticker-card block bg-card border-[2.5px] border-ink rounded-chunky overflow-hidden shadow-chunky hover:shadow-chunkyHover transition-transform"
    >
      <div
        className="h-[150px] flex items-center justify-center text-5xl border-b-[2.5px] border-ink"
        style={{ background: bgs[index % bgs.length] }}
      >
        {listing.emoji}
      </div>
      <div className="p-4">
        <p className="font-semibold text-[15px] mb-1 line-clamp-1">{listing.title}</p>
        <p className="font-display text-coralDark font-bold text-lg">₹{listing.price}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[11px] bg-mint px-2.5 py-0.5 rounded-lg font-semibold">
            {listing.category}
          </span>
          <span className="text-[11px] text-grapeLight font-medium">
            {listing.profiles?.name ?? "Student"}
          </span>
        </div>
      </div>
    </Link>
  );
}
