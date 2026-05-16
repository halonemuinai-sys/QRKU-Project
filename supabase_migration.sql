-- 1. Buat Schema Baru
create schema if not exists barcode;

-- 2. Buat Table di dalam Schema barcode
create table barcode.dynamic_links (
  id uuid default gen_random_uuid() primary key,
  short_id text unique not null,
  
  -- Data Kontak
  first_name text not null,
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
  logo_url text,
  
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

-- 5. Indexing
create index idx_barcode_short_id on barcode.dynamic_links(short_id);

-- 6. Grant Permissions (PENTING untuk Schema Baru)
grant usage on schema barcode to anon, authenticated;
grant all on all tables in schema barcode to anon, authenticated;
grant all on all sequences in schema barcode to anon, authenticated;
grant all on all routines in schema barcode to anon, authenticated;
