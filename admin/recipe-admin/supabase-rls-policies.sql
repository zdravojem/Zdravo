-- Run this in the Supabase SQL editor for the project used by this admin app.
-- These policies allow any signed-in Supabase user to manage admin data.
-- For a public product, replace these with stricter admin-only checks.

alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_ingredients enable row level security;

drop policy if exists "Authenticated users can manage recipes" on public.recipes;
create policy "Authenticated users can manage recipes"
on public.recipes
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage ingredients" on public.ingredients;
create policy "Authenticated users can manage ingredients"
on public.ingredients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated users can manage recipe ingredients"
on public.recipe_ingredients
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values
  ('ingredient-images', 'ingredient-images', true),
  ('recipe-images', 'recipe-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Anyone can read admin images" on storage.objects;
create policy "Anyone can read admin images"
on storage.objects
for select
to public
using (bucket_id in ('ingredient-images', 'recipe-images'));

drop policy if exists "Authenticated users can upload admin images" on storage.objects;
create policy "Authenticated users can upload admin images"
on storage.objects
for insert
to authenticated
with check (bucket_id in ('ingredient-images', 'recipe-images'));

drop policy if exists "Authenticated users can update admin images" on storage.objects;
create policy "Authenticated users can update admin images"
on storage.objects
for update
to authenticated
using (bucket_id in ('ingredient-images', 'recipe-images'))
with check (bucket_id in ('ingredient-images', 'recipe-images'));

drop policy if exists "Authenticated users can delete admin images" on storage.objects;
create policy "Authenticated users can delete admin images"
on storage.objects
for delete
to authenticated
using (bucket_id in ('ingredient-images', 'recipe-images'));
