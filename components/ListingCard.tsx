import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/types";

const placeholderBgs = [
  "linear-gradient(135deg,#FCE3FF,#F3D6FF)",
  "linear-gradient(135deg,#DBFFF3,#B7F5E4)",
  "linear-gradient(135deg,#FFF1CF,#FFE3A8)",
  "linear-gradient(135deg,#FFE3EC,#FFC9DC)",
  "linear-gradient(135deg,#E6E0FF,#D2C4FF)",
];

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending: { label: "Reserved", cls: "bg-butter text-ink" },
  sold: { label: "Sold", cls: "bg-ink text-card" },
};

export default function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const badge = statusBadge[listing.status];

  return (
    <Link
      href={`/listing/${listing.id}`}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className="sticker-card relative block bg-card border-[2.5px] border-ink rounded-chunky overflow-hidden shadow-chunky hover:shadow-chunkyHover"
    >
      <span className="tape" aria-hidden />

      <div
        className="relative h-[150px] flex items-center justify-center text-5xl border-b-[2.5px] border-ink"
        style={listing.image_url ? undefined : { background: placeholderBgs[index % placeholderBgs.length] }}
      >
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width:640px) 50vw, 230px"
            className="object-cover"
          />
        ) : (
          <span className="drop-shadow-sm">{listing.emoji}</span>
        )}

        {badge && (
          <span
            className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 border-ink ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="font-semibold text-[15px] mb-1 line-clamp-1">{listing.title}</p>
        <p className="font-data text-coralDark font-bold text-lg price-tag">₹{listing.price.toLocaleString("en-IN")}</p>
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[11px] bg-mint border border-ink/20 px-2.5 py-0.5 rounded-lg font-semibold">
            {listing.category}
          </span>
          <span className="text-[11px] text-grapeLight font-medium truncate max-w-[90px]">
            {listing.profiles?.avatar_emoji} {listing.profiles?.name ?? "Student"}
          </span>
        </div>
      </div>
    </Link>
  );
}
