-- Run this in Supabase SQL editor if Row Level Security is enabled.
-- The Electron kiosk app syncs with the anon key, so it needs read access.
-- Keep writes restricted to your admin/authenticated policies.

drop policy if exists "Kiosk can read recipes" on public.recipes;
create policy "Kiosk can read recipes"
on public.recipes
for select
to anon
using (true);

drop policy if exists "Kiosk can read ingredients" on public.ingredients;
create policy "Kiosk can read ingredients"
on public.ingredients
for select
to anon
using (true);

drop policy if exists "Kiosk can read recipe ingredients" on public.recipe_ingredients;
create policy "Kiosk can read recipe ingredients"
on public.recipe_ingredients
for select
to anon
using (true);

drop policy if exists "Kiosk can read synced images" on storage.objects;
create policy "Kiosk can read synced images"
on storage.objects
for select
to anon
using (bucket_id in ('ingredient-images', 'recipe-images'));
