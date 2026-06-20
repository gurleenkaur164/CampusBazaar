

-- 1. PROFILES ---------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  hostel text,
  avatar_emoji text default '🙂',
  rating numeric default 5.0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);


-- 2. LISTINGS -----------------------------------------------------
create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null,
  image_url text,
  emoji text default '📦',
  status text not null default 'available' check (status in ('available','pending','sold')),
  created_at timestamptz default now()
);

alter table listings enable row level security;

create policy "Listings are viewable by everyone"
  on listings for select using (true);

create policy "Users can insert their own listings"
  on listings for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
  on listings for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on listings for delete using (auth.uid() = seller_id);


-- 3. BUY REQUESTS ---------------------------------------------------
create table requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz default now(),
  unique (listing_id, buyer_id)
);

alter table requests enable row level security;

create policy "Buyer or seller can view a request"
  on requests for select using (
    auth.uid() = buyer_id
    or auth.uid() = (select seller_id from listings where listings.id = listing_id)
  );

create policy "Buyers can create requests"
  on requests for insert with check (auth.uid() = buyer_id);

create policy "Buyer or seller can update a request"
  on requests for update using (
    auth.uid() = buyer_id
    or auth.uid() = (select seller_id from listings where listings.id = listing_id)
  );


-- 4. MESSAGES ---------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Participants can view messages"
  on messages for select using (
    auth.uid() in (
      select buyer_id from requests where requests.id = request_id
      union
      select seller_id from listings
        join requests on requests.listing_id = listings.id
        where requests.id = request_id
    )
  );

create policy "Participants can send messages"
  on messages for insert with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select buyer_id from requests where requests.id = request_id
      union
      select seller_id from listings
        join requests on requests.listing_id = listings.id
        where requests.id = request_id
    )
  );


-- 5. NOTIFICATIONS ---------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can insert notifications for others"
  on notifications for insert with check (true); -- any signed-in user can notify another (e.g. buyer notifies seller)

create policy "Users can update their own notifications"
  on notifications for update using (auth.uid() = user_id);


-- 6. AUTO-NOTIFY ON NEW MESSAGE (trigger, server-side & reliable) -----
create or replace function notify_on_new_message()
returns trigger as $$
declare
  recipient_id uuid;
  sender_name text;
begin
  select buyer_id into recipient_id from requests where id = new.request_id;
  if recipient_id = new.sender_id then
    select seller_id into recipient_id
      from listings join requests on requests.listing_id = listings.id
      where requests.id = new.request_id;
  end if;

  select name into sender_name from profiles where id = new.sender_id;

  insert into notifications (user_id, type, message, link)
  values (recipient_id, 'new_message', sender_name || ' sent you a message 💬', '/chat/' || new.request_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_on_new_message
  after insert on messages
  for each row execute function notify_on_new_message();


-- 7. REALTIME: enable replication for live chat & notifications -----
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;


-- 8. STORAGE: bucket for listing photos -----
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');
