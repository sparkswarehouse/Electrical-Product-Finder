-- TradeFind AI database schema
-- Run this in Supabase SQL Editor when you create the project.

create extension if not exists pgcrypto;

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  status text not null default 'listed',
  commercial_status text not null default 'standard',
  supplier_type text,
  website text,
  api_status text not null default 'not_connected',
  api_contact text,
  feed_options jsonb not null default '[]'::jsonb,
  sponsored boolean not null default false,
  priority integer not null default 50,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  brand text,
  name text not null,
  category text,
  price text,
  tags jsonb not null default '[]'::jsonb,
  icon text,
  rating text,
  voltage text,
  product_range text,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supplier_product_links (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  price text,
  stock text,
  url text not null,
  url_type text not null check (url_type in ('exact-product', 'supplier-search', 'supplier-homepage')),
  confidence text not null default 'Low',
  last_checked date,
  sponsored boolean not null default false,
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text,
  email text,
  phone text,
  postcode text,
  required_by text,
  message text,
  products jsonb not null default '[]'::jsonb,
  source text not null default 'tradefind-ai',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists supplier_clicks (
  id uuid primary key default gen_random_uuid(),
  supplier_name text,
  product_code text,
  product_name text,
  url text,
  url_type text,
  source text not null default 'product-detail',
  created_at timestamptz not null default now()
);

create index if not exists idx_products_code on products(code);
create index if not exists idx_products_category on products(category);
create index if not exists idx_supplier_links_product_id on supplier_product_links(product_id);
create index if not exists idx_quote_leads_created_at on quote_leads(created_at desc);
create index if not exists idx_supplier_clicks_created_at on supplier_clicks(created_at desc);
