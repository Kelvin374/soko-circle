-- SokoCircle — Supabase schema

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  business_type text,
  location text,
  bio text,
  community_posts int default 0,
  helpful_upvotes int default 0,
  wallet_balance int default 12400,
  tier text default 'tier1',
  created_at timestamptz default now()
);

-- ============ suppliers ============
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  rating numeric(2,1),
  is_new boolean default false,
  verified_date text not null,
  description text not null,
  price text not null,
  image_url text,
  featured boolean default false,
  location text,
  verified boolean default true,
  created_at timestamptz default now()
);

-- ============ categories (Explore) ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  icon text not null,
  icon_color text,
  icon_bg text,
  label text not null,
  label_color text,
  label_border text,
  subtitle text,
  members int default 0,
  badge text,
  height int,
  image_url text,
  dark boolean default false,
  simple boolean default false,
  sort_order int default 0
);

-- ============ networks (Explore join cards) ============
create table if not exists public.networks (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  member_count int default 0,
  location text
);

-- ============ posts (Home feed) ============
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  author_avatar text,
  is_verified boolean default false,
  is_mentor boolean default false,
  created_at timestamptz default now(),
  category text,
  title text not null,
  body text not null,
  image_url text,
  likes int default 0,
  comments int default 0
);

-- ============ post_likes ============
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

-- ============ post_comments ============
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz default now()
);

-- ============ gap_reports ============
create table if not exists public.gap_reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  location text not null,
  tag text not null,
  icon text not null,
  title text not null,
  description text not null,
  report_type text not null, -- 'demographics' | 'competitor'
  preview_image_url text,
  is_unlocked boolean default false,
  price_ksh int default 500
);

-- ============ gap_analytics ============
create table if not exists public.gap_analytics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  location text not null,
  consumer_demand_pct int default 0,
  market_saturation_pct int default 0
);

-- Seed data -------------------------------------------------------------

insert into public.categories (slug, title, icon, label, subtitle, members, badge, image_url, dark, simple, sort_order) values
  ('mitumba', 'Second-hand Apparel', 'shopping-bag', 'Mitumba', null, 12450, 'Top in Nairobi', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx5VpI7cL84OEtzCB2bjLpbuSW1eI_LAv-axAJngMH0A2SEEkcpaFv02cDEV3qITlaww6xjBc0shdzUwSE3JKpY8-Jw1qtosErAEBvuKE7KmIqAJqXY6mtLJSF7PcYNsXAEHB_pJnuq7g1Gaa9wKYKjlDCsEkXTi33x4LRJ1pjPg9IwAzHwDyNgINBzcfInlMkTt9CAMx6XovGRlTZzOwar-2uoxem6kjIipb35zakh3BS97f7IL34', true, false, 1),
  ('kinyozi', 'Kinyozi', 'scissors', 'Kinyozi', 'Barbers & Salons', 5120, null, null, false, true, 2),
  ('duka', 'Duka', 'building-storefront', 'Duka', 'Retail Kiosks', 22000, null, null, false, true, 3),
  ('electronics', 'Gadgets & Repairs', 'device-phone-mobile', 'Electronics', null, 8200, 'Top in Mombasa', null, false, false, 4),
  ('hardware', 'Construction Supply', 'wrench-screwdriver', 'Hardware', null, 4300, 'Top in Kiambu', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLeh0uuK1glzWY0fgaGv4Jc-FfaPcD2pz6Ad0FmfRqNN_RMp8-mUgmOUMf6gNywXtTRlEGFL7naeygX5jI3hojt0bNnmfNJbpwyd7PSZmEX7_gUAfKzH6qTSfDUrkAzWzNXlPPHj1WqF5HmZLxo-Fap1sUbxcsahKFXiqf7alyIzTbgvR_EDJmoEr1wPR1jEqJ75JU3Xuea0D7Zby3aSrc7gKPnbEJMFo4cmsR-pitHoWPVm0JW1pZ', true, false, 5)
on conflict (slug) do nothing;

insert into public.suppliers (name, category, rating, is_new, verified_date, description, price, image_url, featured, location) values
  ('Rift Valley Agro-Processors Ltd', 'Agriculture', 4.8, false, 'Oct 2022', 'Premium processors of organic grains and legumes. High-capacity facility supporting regional supply chains with international quality standards.', 'Ksh 45k - 120k / order', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI7dMwVaOBTvmLspze81mWeplkxip9galeESXzX3Ae7ktFyg8UgW-CNX8ssiQ5eIcW9RLyc6MNIcKcpb0cFf591WYgB9W0v1ewvDOlHuQA-6oZjKWlG2hNdutFTbun34AKuerrVBEyq_AmjJvzYmyv93fNcHwB45Lgb8PQTs7ywIPJupCkxJQlo4ALyMdDCKFHxlIbZ54dR6VkM7IfyjilGCR9IzR68QP6NS1i7IsE8Kt3jDimAoSF', true, 'Nakuru County'),
  ('Nairobi Weavers Coop', 'Textiles', 4.9, false, 'Mar 2023', 'Specialized in high-durability uniform fabrics and commercial linens. Capacity for bulk institutional orders.', 'Ksh 800 - 2k / unit', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbylvmIgrztB8Th16eWZ0ZE7zIZ_2ia23I-WT4ZKXJu0NMPmJ_nxAMBx2w_logFDv2i9mfHwsyFRZ-vgkm3sqehtkqhZaQkB6JP-9YLHd8Px1e95U4AcRAYPKGVc9q88TlMtHfi3VMka6vkFW7cTWDuJCfAijDPHIaWpROiu25CcwUdPnPZ_seksGa7o2abS0k96teYNFUwT1WESc__NkgL9et9_GSYVBGHVrtNltkMQvRgLCXZqZh', false, 'Nairobi'),
  ('Zanzibar Spices & Preserves', 'FMCG Food', null, true, 'Aug 2024', 'Export-grade spice blends and fruit preserves. KEBS certified production facility.', 'Ksh 250 - 1.2k / unit', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcv7SHZPcotksaaWgSG1Qk3-KULvTUTdM948dK8oWkM-HmrDjndWXHI-wtjZHZd5mAWxtKjAG7t4HgoRiIIidWwnM_rTvsUed4RPkFP2_9NslL2oe82jcvjQF4GpDG7GPFO46d8401GwJExmDbmT0arFQ5p5oaTSIdUFCUGZ3YJywWqFdO04Z8Qs1IOUXNP9fS-q-rJxIT4CgpDxCyWVhG2wI4ZIiU72i1yBSyWT8igzEzP5hu-7Yj', false, 'Zanzibar'),
  ('Kigali Smart Systems', 'Tech Hardware', 4.7, false, 'Jan 2024', 'Assembling point-of-sale IoT devices and customized business hardware solutions for retail chains.', 'Ksh 15k - 40k / unit', null, false, 'Kigali')
on conflict (id) do nothing;

insert into public.gap_reports (slug, category, location, tag, icon, title, description, report_type, preview_image_url, is_unlocked) values
  ('demographics-electronics', 'Electronics', 'Kayole, Nairobi', 'Demographics', 'chart-bar', 'Target Audience Spending Power', 'Detailed breakdown of disposable income for electronics within a 5km radius of central Kayole, Nairobi.', 'demographics', null, false),
  ('competitor-electronics', 'Electronics', 'Kayole, Nairobi', 'Competitor Map', 'building-storefront', 'Existing Supplier Footprint', 'Geospatial mapping of current electronic shops, their estimated sizes, and operational hours.', 'competitor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCohyOJtyaJQYw537wjNZP8HALKtBj6Ag6sFZwSsQ4OD_jaOTNnNREqCXNIfGCo8k6aqDd-zLjikMANj8WokbAqn0gelRtZNNvg-d8MwFgaIMxuSIyLYaLW5b4KCCID7AT_FIuvAUo6YjS5zi48Nn6AdBBxsjS87sMmjpX3XwmnqdwmNlhDtvktayJHzl-C_FF1CL8zFruMonL7_wEi1j1NzPtj2n8AqIyMW8afLgSAY8s9chr6FHXM', false)
on conflict (slug) do nothing;

insert into public.gap_analytics (slug, category, location, consumer_demand_pct, market_saturation_pct) values
  ('electronics-kayole', 'Electronics', 'Kayole, Nairobi', 84, 32)
on conflict (slug) do nothing;

insert into public.posts (author_id, author_name, author_avatar, is_verified, is_mentor, created_at, category, title, body, image_url, likes, comments) values
  (null, 'Wanjiru K.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaslFb-4iZgN108C0BJhJ9AoC37XdXneB7bGLzd1bqnmyuuwXl5Rr2ChLIIEApXRDxAMJlcSKPYhO9mbyqbAWyMsOLWRlt5m5OaDszGHgedsPD2LidUeChZRif7J3thxeZEZGUW_M7nceGs4omRvagdfGwPQ1AvU4bOQio24Gk2y6Sl4BKAKpoKUXbgaVer59SXhELBJr9cuyeaQWyv1evR1Iu6Dl1Y9WXgslOtyyrSsYfqxI1-5F', true, true, now() - interval '2 hours', 'Supply Chain', 'Where to source quality mtumba bales in Gikomba (2025 prices)', 'Navigating Gikomba can be overwhelming for new traders. I''ve compiled an updated list of the most reliable suppliers for grade A bales, including current market rates and negotiation tactics...', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbofzpPuMtTMM7WrKM83Hev0X32XUzSdm0vtT68Yj7KG5uNbQ8aHghIaghaBgAjQrxHwhOwH1MjgWKCSS3vrs8tl4Qk4Hg7mtEPI0OXWcxIOzIt5GSCnoQmgrA_CSrkNQ3tRtzpqC6fxdZfIG8QoG-SYHE_oJVJ3HTYCXQTewma_Gu6CPVbfPD4rdzFwwLRLxK9u5nYPpWEndquC10sqko7s4ipkvTdAOwFJoEEm3Zu2ZOUve265hD', 245, 42)
on conflict (id) do nothing;

-- Row Level Security ----------------------------------------------------

alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.categories enable row level security;
alter table public.networks enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.gap_reports enable row level security;
alter table public.gap_analytics enable row level security;

-- Public read policies (client apps use anon key)
create policy "Public profiles read" on public.profiles for select using (true);
create policy "Public suppliers read" on public.suppliers for select using (true);
create policy "Public categories read" on public.categories for select using (true);
create policy "Public networks read" on public.networks for select using (true);
create policy "Public posts read" on public.posts for select using (true);
create policy "Public gap_reports read" on public.gap_reports for select using (true);
create policy "Public gap_analytics read" on public.gap_analytics for select using (true);

-- Insert policies: any authenticated user can interact
create policy "Authenticated profiles write" on public.profiles for insert with check (auth.uid() = auth_uid);
create policy "Authenticated posts write" on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Authenticated likes write" on public.post_likes for insert with check (auth.role() = 'authenticated');
create policy "Authenticated comments write" on public.post_comments for insert with check (auth.role() = 'authenticated');