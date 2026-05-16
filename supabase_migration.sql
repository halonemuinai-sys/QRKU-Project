-- 1. Buat Schema Baru
create schema if not exists barcode;

drop table if exists barcode.scan_logs cascade;
drop table if exists barcode.dynamic_links cascade;

-- 2. Buat Table di dalam Schema barcode
create table barcode.dynamic_links (
  id uuid default gen_random_uuid() primary key,
  short_id text unique not null,
  user_id uuid, -- references auth.users(id) - links QR to its creator
  
  -- Data QR (General)
  type text default 'vcard', -- 'vcard', 'link', 'wifi', 'maps'
  raw_data jsonb, -- Store specific data (e.g. WiFi credentials, Maps coords)
  
  -- Data Kontak (vCard specific)
  first_name text,
  last_name text,
  organization text,
  position text,
  phone text,
  email text,
  website text,
  
  -- Desain QR
  dots_color text default '#000000',
  gradient_color text,
  dots_type text default 'rounded',
  corners_square_type text default 'extra-rounded',
  corners_square_color text default '#000000',
  corners_dot_type text default 'dot',
  corners_dot_color text default '#000000',
  background_color text default '#ffffff',
  logo_url text,
  hide_background_dots boolean default true,
  
  -- Metadata
  scan_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. Aktifkan RLS (Row Level Security) agar aman
alter table barcode.dynamic_links enable row level security;

-- 4. Buat Policy agar anon bisa baca (untuk redirect) dan insert (untuk generate)
create policy "Allow anon read dynamic_links" 
on barcode.dynamic_links for select 
using (true);

create policy "Allow anon insert dynamic_links" 
on barcode.dynamic_links for insert 
with check (true);

create policy "Allow anon update dynamic_links" 
on barcode.dynamic_links for update 
using (true);

create policy "Allow anon delete dynamic_links" 
on barcode.dynamic_links for delete 
using (true);

-- 5. Indexing
create index idx_barcode_short_id on barcode.dynamic_links(short_id);
create index idx_barcode_user_id on barcode.dynamic_links(user_id);

-- 6. Grant Permissions (PENTING untuk Schema Baru)
grant usage on schema barcode to anon, authenticated;
grant all on all tables in schema barcode to anon, authenticated;
grant all on all sequences in schema barcode to anon, authenticated;
grant all on all routines in schema barcode to anon, authenticated;
-- 7. Table for Detailed Scan Logs
create table barcode.scan_logs (
  id uuid default gen_random_uuid() primary key,
  link_id uuid references barcode.dynamic_links(id) on delete cascade,
  scanned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_agent text,
  ip_address text,
  city text,
  country text,
  lat float8,
  lon float8,
  os text,
  browser text
);

alter table barcode.scan_logs enable row level security;
create policy "Allow anon insert scan_logs" on barcode.scan_logs for insert with check (true);
create policy "Allow anon read scan_logs" on barcode.scan_logs for select using (true);

grant all on barcode.scan_logs to anon, authenticated;
