import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="bg-card border border-line rounded-chunky shadow-chunkyHover p-10 max-w-sm w-full">
        <h1 className="font-display text-2xl text-grape mb-1">Can't find that</h1>
        <p className="text-sm text-grapeLight mb-5">
          This page may have sold out, been deleted, or never existed.
        </p>
        <Link
          href="/"
          className="inline-block bg-coral text-white border border-line px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-btn btn-press"
        >
          Back to browse
        </Link>
      </div>
    </div>
  );
}
