# CampusBazaar — Analysis & Fixes

A walkthrough of what was wrong in the prototype and what changed in this corrected build.

## 🔴 Critical bugs fixed

### 1. Login was completely broken (routing)
The `middleware.ts` matcher ran on **every** path, and only `/login` was treated as
public. The magic-link callback at `/auth/callback?code=…` was therefore caught by the
"not signed in → redirect to /login" rule, which **stripped the `code`** before the
session could be exchanged. No one could ever finish signing in.
**Fix:** `/auth` is now treated as a public prefix, cookies are written back to the same
response (proper SSR session refresh), and an already-authenticated user hitting `/login`
is bounced home.

### 2. Declined buyers hit a silent dead-end
`requests` has a `unique (listing_id, buyer_id)` constraint. A buyer whose request was
declined could press "Request to Buy" again, the insert failed silently, and nothing
happened. **Fix:** `RequestButton` now **upserts** on that constraint, the button reads
"Ask again", and declined/sold/reserved states are handled explicitly.

### 3. No way back to your chats
Buyers could only reach a conversation through a transient notification. Lose the
notification, lose the chat. **Fix:** a new **/inbox** route lists every active
conversation (with last-message preview and a buying/selling tag), linked from the navbar.

## 🟠 Logic & UX fixes
- **Seller could only Accept, never decline.** Added a "Pass" action that updates the
  request and notifies the buyer.
- **Chat felt laggy / could double-post.** Messages now show optimistically and the
  realtime echo is de-duplicated by id. Failed sends restore your text.
- **Chat access wasn't guarded.** The chat page now explicitly 404s anyone who isn't the
  buyer or the listing's seller.
- **`profile!` could crash the home page.** Home now uses the same self-healing
  `getOrCreateProfile` helper as every other page.
- **Image upload never existed** despite a storage bucket and `image_url` column in the
  schema. The post form now uploads a photo (≤5 MB) and listings render it; emoji is the
  fallback.
- **Manage your listings:** new **/my-listings** route to mark sold / relist / delete.

## 🟣 Build / correctness
- **`px-4.5` / `py-4.5` did nothing** (not in Tailwind's default scale). Replaced with real
  values and a `4.5` spacing token.
- Bumped **Next.js 14.2.5 → 14.2.35** (the pinned version had a published security advisory).
- Verified with a clean `next build` — all routes compile and types pass.

## 🎨 UI refresh (GenZ, cute, modern)
Kept the existing "chunky sticker" identity but tightened it into a cohesive system:
- **Type trio:** Baloo 2 (display) · Plus Jakarta Sans (body) · Space Grotesk (prices/data).
- **Signature:** sticker-cards "pinned" with washi-tape, a price-tag motif, gentle stagger
  on load, and pop-in chat bubbles.
- Tightened pastel palette, glassy sticky navbar, skeletons, friendly empty states, status
  badges, profile menu, mobile-friendly grid, focus-visible rings, and reduced-motion support.

## 🧭 Production pass — refined design + live notifications

### Design: from "sticker board" to a refined campus marketplace
The playful identity stayed, but the busy, AI-looking scaffolding came off:
- **Dropped the gimmicks** — washi-tape strips, random per-card rotation, and the
  price-tag dot that read as a stray "o".
- **Depth over outlines** — hard 3 px black borders + offset shadows became a single
  hairline + soft, layered shadows. Buttons press with a subtle settle, not a hard shift.
- **Calmer palette** — the neon lavender/mint/coral mesh is now warm paper with one
  confident coral accent and a restrained mint support; headings tuned for hierarchy.
- **Quieter heroes** — fewer, softer floating props and much lower-opacity backdrop
  glows on the landing and login pages.

### Real-time notifications (Supabase Realtime = WebSocket)
- New **toast** stack: notifications now pop in-app the instant they arrive over the
  websocket, de-duplicated against the bell, auto-dismissing and tappable.
- **Native browser push** when the tab is backgrounded (permission requested politely
  after sign-in), so students don't miss a message or accepted request.

### Correctness & production polish
- Declined-request notifications used the wrong `type` (`request_accepted`) — fixed to
  `request_declined`, with the type union updated to match.
- Added a global **error boundary** (`app/error.tsx`) with a friendly recover/return UI.
- Per-listing **metadata / Open Graph** so shared listing links preview with title,
  price, and photo.
- Re-verified with a clean `next build` — all routes compile and types pass.

## Setup
Copy `.env.example` to `.env.local`, fill in your Supabase values, run `supabase/schema.sql`,
then `npm install && npm run dev`.
