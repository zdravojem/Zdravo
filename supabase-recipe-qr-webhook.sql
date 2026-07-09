-- Database Webhook -> Edge Function -> R2 recipe QR page sync.
--
-- 1. Deploy the Edge Function:
--      supabase functions deploy recipe-qr-sync
--
-- 2. Set the same RECIPE_QR_WEBHOOK_SECRET in the Edge Function secrets and
--    in the x-zdravo-webhook-secret headers below.
--
-- 3. Replace PROJECT_REF and REPLACE_WITH_WEBHOOK_SECRET below before running.
--
-- You can also create these in the Supabase Dashboard under
-- Database -> Webhooks. The SQL form is kept here so the setup is repeatable.

alter table public.recipes
add column if not exists qr_url text;

drop trigger if exists recipe_qr_sync_recipes_webhook on public.recipes;
create trigger recipe_qr_sync_recipes_webhook
after insert or update on public.recipes
for each row
execute function supabase_functions.http_request(
  'https://PROJECT_REF.functions.supabase.co/recipe-qr-sync',
  'POST',
  '{"Content-Type":"application/json","x-zdravo-webhook-secret":"REPLACE_WITH_WEBHOOK_SECRET"}',
  '{}',
  '5000'
);

drop trigger if exists recipe_qr_sync_recipe_ingredients_webhook on public.recipe_ingredients;
create trigger recipe_qr_sync_recipe_ingredients_webhook
after insert or update or delete on public.recipe_ingredients
for each row
execute function supabase_functions.http_request(
  'https://PROJECT_REF.functions.supabase.co/recipe-qr-sync',
  'POST',
  '{"Content-Type":"application/json","x-zdravo-webhook-secret":"REPLACE_WITH_WEBHOOK_SECRET"}',
  '{}',
  '5000'
);

drop trigger if exists recipe_qr_sync_ingredients_webhook on public.ingredients;
create trigger recipe_qr_sync_ingredients_webhook
after update on public.ingredients
for each row
execute function supabase_functions.http_request(
  'https://PROJECT_REF.functions.supabase.co/recipe-qr-sync',
  'POST',
  '{"Content-Type":"application/json","x-zdravo-webhook-secret":"REPLACE_WITH_WEBHOOK_SECRET"}',
  '{}',
  '5000'
);

drop trigger if exists recipe_qr_sync_storage_objects_upsert_webhook on storage.objects;
create trigger recipe_qr_sync_storage_objects_upsert_webhook
after insert or update on storage.objects
for each row
when (new.bucket_id in ('recipe-images', 'ingredient-images'))
execute function supabase_functions.http_request(
  'https://PROJECT_REF.functions.supabase.co/recipe-qr-sync',
  'POST',
  '{"Content-Type":"application/json","x-zdravo-webhook-secret":"REPLACE_WITH_WEBHOOK_SECRET"}',
  '{}',
  '5000'
);

drop trigger if exists recipe_qr_sync_storage_objects_delete_webhook on storage.objects;
create trigger recipe_qr_sync_storage_objects_delete_webhook
after delete on storage.objects
for each row
when (old.bucket_id in ('recipe-images', 'ingredient-images'))
execute function supabase_functions.http_request(
  'https://PROJECT_REF.functions.supabase.co/recipe-qr-sync',
  'POST',
  '{"Content-Type":"application/json","x-zdravo-webhook-secret":"REPLACE_WITH_WEBHOOK_SECRET"}',
  '{}',
  '5000'
);
