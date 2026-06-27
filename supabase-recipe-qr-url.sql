-- Run this in the Supabase SQL editor before running npm run recipe-qr:sync.
-- The upload automation writes each generated Cloudflare R2 HTML URL here.

alter table public.recipes
add column if not exists qr_url text;

comment on column public.recipes.qr_url is
'Public URL for the standalone recipe HTML file used by kiosk QR codes.';
