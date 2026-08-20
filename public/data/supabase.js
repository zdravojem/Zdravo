// Minimal PostgREST client.
//
// The Electron app already talked to Supabase over plain REST (supabase-sync.js)
// rather than through @supabase/supabase-js, so the PWA does the same. That
// keeps the renderer a bundler-free set of ES modules — there is nothing to
// compile, and the kiosk ships exactly the files in this folder.

import { config, isSupabaseConfigured } from './config.js';

const PAGE_SIZE = 1000;

function requestHeaders(extra) {
  return {
    apikey: config.supabaseAnonKey,
    authorization: `Bearer ${config.supabaseAnonKey}`,
    ...extra
  };
}

export class SupabaseError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'SupabaseError';
    this.status = status;
  }
}

/**
 * Reads an entire table. PostgREST caps a response at 1000 rows by default, so
 * pages are requested explicitly until a short page comes back — the kiosk must
 * never silently render a truncated catalogue.
 */
export async function selectAll(table, { select = '*', order = '' } = {}) {
  if (!isSupabaseConfigured) {
    throw new SupabaseError('Supabase is not configured.', 0);
  }

  const rows = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = new URL(`${config.supabaseUrl}/rest/v1/${table}`);
    url.searchParams.set('select', select);

    if (order) {
      url.searchParams.set('order', order);
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: requestHeaders({ range: `${offset}-${offset + PAGE_SIZE - 1}` })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new SupabaseError(
        `Supabase request for "${table}" failed (${response.status}): ${detail}`,
        response.status
      );
    }

    const page = await response.json();
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      return rows;
    }
  }
}

export async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: requestHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SupabaseError(
      payload?.error || `Request failed (${response.status})`,
      response.status
    );
  }

  return payload;
}
