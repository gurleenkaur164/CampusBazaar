export type Profile = {
  id: string;
  name: string;
  hostel: string | null;
  avatar_emoji: string;
  rating: number;
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  emoji: string;
  status: "available" | "pending" | "sold";
  created_at: string;
  profiles?: Profile;
};

export type BuyRequest = {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  listings?: Listing;
  buyer?: Profile;
};

export type Message = {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: "new_request" | "request_accepted" | "new_message";
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};
