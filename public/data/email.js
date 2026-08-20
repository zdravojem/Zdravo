// Sending the recipe by email.
//
// This ran in the Electron main process, which could hold Gmail credentials and
// speak SMTP. A browser can do neither, so the identical logic now lives in the
// `send-recipe-email` Supabase Edge Function and the kiosk posts the same
// payload to it. The response shape ({ success, error }) is unchanged, so the
// detail screen's states still work as they did.

import { config } from './config.js';
import { postJson, SupabaseError } from './supabase.js';

const OFFLINE_MESSAGE =
  'Trenutno ni povezave z internetom. Poskusite znova čez nekaj trenutkov.';

// fetch() rejects with a TypeError for everything that stops the request before
// a response exists: no network, DNS failure, a blocked CORS preflight, or an
// Edge Function that was never deployed. Reporting all of those as "no
// internet" sends whoever is standing at the kiosk looking for a network fault
// that is not there — which is exactly what happened when this endpoint was
// missing. `navigator.onLine` is what actually distinguishes the two.
const UNREACHABLE_MESSAGE =
  'Storitev za pošiljanje e-pošte trenutno ni dosegljiva. Obvestite upravitelja kioska.';

export async function sendRecipeEmail(toEmail, recipe) {
  if (!config.emailEndpoint) {
    return {
      success: false,
      error: 'Pošiljanje e-pošte ni nastavljeno.'
    };
  }

  if (navigator.onLine === false) {
    return { success: false, error: OFFLINE_MESSAGE };
  }

  try {
    const result = await postJson(config.emailEndpoint, { toEmail, recipe });

    return result?.success
      ? { success: true }
      : { success: false, error: result?.error || 'Recepta ni bilo mogoče poslati.' };
  } catch (error) {
    if (error instanceof SupabaseError) {
      // The endpoint answered. A 404 here means the function is not deployed,
      // which no amount of retrying fixes, so say so rather than echoing
      // Supabase's wording at a member of the public.
      if (error.status === 404) {
        console.error(
          `The send-recipe-email Edge Function is not deployed at ${config.emailEndpoint}. ` +
            'Deploy it with: supabase functions deploy send-recipe-email'
        );
        return { success: false, error: UNREACHABLE_MESSAGE };
      }

      console.error('Recipe email failed', error.status, error.message);
      return { success: false, error: error.message };
    }

    console.error(
      `Could not reach ${config.emailEndpoint}. The function may be undeployed, or its CORS ` +
        'preflight may be rejecting the request.',
      error
    );

    return { success: false, error: navigator.onLine === false ? OFFLINE_MESSAGE : UNREACHABLE_MESSAGE };
  }
}
