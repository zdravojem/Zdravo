import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseConfigError =
  'Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to admin/recipe-admin/.env.local, then restart the dev server.'

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const slovenianCharacters = {
  '\u0161': 's',
  '\u0160': 's',
  '\u010d': 'c',
  '\u010c': 'c',
  '\u017e': 'z',
  '\u017d': 'z',
}

export function slugify(text) {
  return String(text ?? '')
    .replace(
      /[\u0161\u0160\u010d\u010c\u017e\u017d]/g,
      (character) => slovenianCharacters[character],
    )
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError)
  }

  return supabase
}

export function getPublicUrl(bucket, path) {
  const { data } = requireSupabaseClient().storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function uploadImage(bucket, file, path) {
  const { data, error } = await requireSupabaseClient()
    .storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) {
    throw error
  }

  const storedPath = data?.path ?? path

  return {
    publicUrl: getPublicUrl(bucket, storedPath),
    path: storedPath,
  }
}

export async function deleteImage(bucket, path) {
  const { data, error } = await requireSupabaseClient()
    .storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw error
  }

  return data
}
