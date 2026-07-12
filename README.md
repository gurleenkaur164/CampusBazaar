# Campus Bazaar 
Deployed : https://campusbazaar-pi.vercel.app/

A free peer-to-peer marketplace built exclusively for students. Campus Bazaar lets students buy, sell, and connect with each other using their university email IDs. It includes real-time chat, notifications, secure authentication, and a clean marketplace experience powered by **Next.js** and **Supabase**.



##  Getting Started

### Step 1: Create a Supabase Project

First, create a free project on Supabase.

1. Visit https://supabase.com
2. Create a new project
3. Once the project is ready, copy the following values from **Settings → API**:

   * Project URL
   * Anon Public Key
   * Service Role Key

For authentication, go to **Authentication → Providers** and enable **Email OTP (Magic Link)**. You can disable password-based authentication if you want a completely passwordless experience.

---

## Setting Up the Database

The database schema is already provided in `supabase/schema.sql`.

### Option 1: Using the Supabase Dashboard

1. Open the **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the script

### Option 2: Using the Supabase CLI


npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push --file supabase/schema.sql


This will automatically create:

* User profiles
* Marketplace listings
* Purchase requests
* Messaging system
* Notifications
* Row Level Security (RLS) policies
* Real-time updates
* Storage bucket for listing images



## Environment Configuration

Create a local environment file:


cp .env.local.example .env.local


Add your project credentials:


NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=university.edu


> **Important:** Replace `university.edu` with your institution's email domain (for example, `thapar.edu`). This ensures that only verified students can access the marketplace.

---

##  Running the Project

Install dependencies:


npm install


Start the development server:


npm run dev


Open:


http://localhost:3000


You'll be redirected to the login page where you can sign in using your university email address. A magic login link will be sent directly to your inbox.

---

## Features

### Secure Student Authentication

* Passwordless login using Magic Links
* Restricted access through university email domains

### Marketplace Listings

* Create and browse listings
* Search items easily
* Filter by categories

### Buy Requests

* Interested buyers can send purchase requests
* Sellers can manage incoming requests

### Real-Time Chat

* Direct communication between buyers and sellers
* Instant message updates

### Notifications

* Get notified when someone interacts with your listings
* Real-time notification updates

---

## Project Structure

| Feature                      | Main Files                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Authentication               | `app/login/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`                         |
| Marketplace Feed             | `app/page.tsx`, `components/ListingCard.tsx`                                                |
| Create Listing               | `app/post/page.tsx`                                                                         |
| Listing Details & Requests   | `app/listing/[id]/page.tsx`, `components/RequestButton.tsx`, `components/OwnerRequests.tsx` |
| Real-Time Chat               | `app/chat/[requestId]/page.tsx`, `components/ChatWindow.tsx`                                |
| Notifications                | `components/NotificationBell.tsx`, `components/Navbar.tsx`                                  |
| Database & Security Policies | `supabase/schema.sql`                                                                       |

---

## Deployment

The project can be deployed for free using Vercel.


npm install -g vercel
vercel


After deployment:

1. Open your Vercel project dashboard
2. Add the same environment variables used locally
3. Redeploy the application

Your marketplace is now live 

---

##  Future Enhancements

The following features can be added without exceeding the free tier:

* Image uploads for listings using Supabase Storage
* Mark listings as sold
* Buyer and seller ratings
* Advanced full-text search with PostgreSQL `tsvector`
* Browser push notifications for inactive tabs
* Wishlist and saved items
* Report and moderation system

---

##  Tech Stack

* **Frontend:** Next.js, React
* **Backend & Database:** Supabase
* **Authentication:** Supabase Auth (Magic Links)
* **Storage:** Supabase Storage
* **Realtime:** Supabase Realtime
* **Deployment:** Vercel



Built to make buying and selling within a campus community simple, secure, and accessible for every student.
