-- Run this in the Supabase SQL editor for the project used by the admin app.
-- It moves existing ingredient rows to the current category keys used by
-- both recipe-admin and Zdravo Jem.

begin;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.ingredients'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%category%'
  loop
    execute format(
      'alter table public.ingredients drop constraint if exists %I',
      constraint_record.conname
    );
  end loop;
end $$;

create or replace function public.normalize_ingredient_category(raw_category text)
returns text
language sql
immutable
as $$
  select coalesce(
    (
      select normalized_categories.category
      from (
        values
          ('sadje', 'sadje'),
          ('Sadje', 'sadje'),
          ('zelenjava', 'zelenjava'),
          ('Zelenjava', 'zelenjava'),
          ('meso_in_mesni_izdelki', 'meso_in_mesni_izdelki'),
          ('Meso in mesni izdelki', 'meso_in_mesni_izdelki'),
          ('meso_ribe', 'meso_in_mesni_izdelki'),
          ('ribe', 'ribe'),
          ('Ribe', 'ribe'),
          ('jajca', 'jajca'),
          ('Jajca', 'jajca'),
          ('mlecni_izdelki', 'mlecni_izdelki'),
          (U&'Mle\010Dni izdelki', 'mlecni_izdelki'),
          ('mlecni', 'mlecni_izdelki'),
          ('strocnice', 'strocnice'),
          (U&'Stro\010Dnice', 'strocnice'),
          ('gobe', 'gobe'),
          ('Gobe', 'gobe'),
          ('vlozena_kisana_zelenjava', 'vlozena_kisana_zelenjava'),
          (U&'Vlo\017Eena / kisana zelenjava', 'vlozena_kisana_zelenjava'),
          ('zita_kase_zdrobi', 'zita_kase_zdrobi'),
          (U&'\017Dita, ka\0161e in zdrobi', 'zita_kase_zdrobi'),
          ('zita', 'zita_kase_zdrobi'),
          ('moka', 'moka'),
          ('Moka', 'moka'),
          ('pekovski_izdelki_testo_kvas', 'pekovski_izdelki_testo_kvas'),
          ('Pekovski izdelki, testo, kvas', 'pekovski_izdelki_testo_kvas'),
          ('olja_in_mascobe', 'olja_in_mascobe'),
          (U&'Olja in ma\0161\010Dobe', 'olja_in_mascobe'),
          ('zacimbe_in_zelisca', 'zacimbe_in_zelisca'),
          (U&'Za\010Dimbe in zeli\0161\010Da', 'zacimbe_in_zelisca'),
          ('zacimbe', 'zacimbe_in_zelisca'),
          ('omake_kis_dodatki', 'omake_kis_dodatki'),
          ('Omake, kis in dodatki', 'omake_kis_dodatki'),
          ('sladila', 'sladila'),
          ('Sladila', 'sladila'),
          ('juhe_in_osnove', 'juhe_in_osnove'),
          ('Juhe in osnove', 'juhe_in_osnove'),
          ('semena', 'semena'),
          ('Semena', 'semena'),
          ('pijace_alkohol_za_kuhanje', 'pijace_alkohol_za_kuhanje'),
          (U&'Pija\010De / alkohol (za kuhanje)', 'pijace_alkohol_za_kuhanje')
      ) as normalized_categories(old_category, category)
      where lower(trim(raw_category)) = lower(trim(normalized_categories.old_category))
      limit 1
    ),
    raw_category
  );
$$;

create or replace function public.set_normalized_ingredient_category()
returns trigger
language plpgsql
as $$
begin
  new.category = public.normalize_ingredient_category(new.category);
  return new;
end;
$$;

drop trigger if exists normalize_ingredient_category_before_write on public.ingredients;

create trigger normalize_ingredient_category_before_write
before insert or update of category on public.ingredients
for each row
execute function public.set_normalized_ingredient_category();

with named_category_updates(name_sl, category) as (
  values
    (U&'Fi\017Eol', 'strocnice'),
    ('Jagode', 'sadje'),
    ('Jajca', 'jajca'),
    (U&'Jur\010Dki', 'gobe'),
    ('Kruh', 'pekovski_izdelki_testo_kvas'),
    (U&'Le\010Da', 'strocnice'),
    ('Maslo', 'olja_in_mascobe'),
    ('Med', 'sladila'),
    (U&'Olj\010Dno olje', 'olja_in_mascobe'),
    ('Postrv', 'ribe'),
    (U&'P\0161eni\010Dna moka', 'moka')
)
update public.ingredients as ingredient
set
  category = named_category_updates.category,
  updated_at = now()
from named_category_updates
where lower(ingredient.name_sl) = lower(named_category_updates.name_sl);

update public.ingredients as ingredient
set
  category = public.normalize_ingredient_category(ingredient.category),
  updated_at = now()
where ingredient.category is distinct from public.normalize_ingredient_category(ingredient.category);

alter table public.ingredients
add constraint ingredients_category_check
check (
  category in (
    'sadje',
    'zelenjava',
    'meso_in_mesni_izdelki',
    'ribe',
    'jajca',
    'mlecni_izdelki',
    'strocnice',
    'gobe',
    'vlozena_kisana_zelenjava',
    'zita_kase_zdrobi',
    'moka',
    'pekovski_izdelki_testo_kvas',
    'olja_in_mascobe',
    'zacimbe_in_zelisca',
    'omake_kis_dodatki',
    'sladila',
    'juhe_in_osnove',
    'semena',
    'pijace_alkohol_za_kuhanje'
  )
);

commit;

-- Verify the updated categories:
select category, count(*) as ingredient_count
from public.ingredients
group by category
order by category;

-- Optional detailed check:
select name_sl, category
from public.ingredients
order by name_sl;
