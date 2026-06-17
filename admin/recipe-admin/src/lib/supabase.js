import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const recipeQrWebhookSecret = import.meta.env.VITE_RECIPE_QR_WEBHOOK_SECRET

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

export async function syncRecipeQr(payload) {
  const client = requireSupabaseClient()
  const { data: sessionData } = await client.auth.getSession()
  const accessToken = sessionData?.session?.access_token || supabaseAnonKey

  const headers = {
    apikey: supabaseAnonKey,
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  }

  if (recipeQrWebhookSecret) {
    headers['x-zdravo-webhook-secret'] = recipeQrWebhookSecret
  }

  const response = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/functions/v1/recipe-qr-sync`, {
    body: JSON.stringify(payload),
    headers,
    method: 'POST',
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(body?.error || `Recipe QR sync failed (${response.status})`)
  }

  return body
}
