function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderEmailModal({ recipe, share }) {
  if (!share || share.mode !== 'email') {
    return '';
  }

  const recipeTitle = recipe?.title || recipe?.name_sl || 'Recept';
  const email = share.toEmail || '';
  const loading = Boolean(share.loading);
  const success = Boolean(share.success);
  const error = share.error || '';

  return `
    <div
      data-email-modal-backdrop="true"
      style="position:fixed; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(20, 45, 24, 0.58);"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Po&#353;lji recept na e-po&#353;to"
        style="width:min(92vw, 520px); background:#ffffff; border:2px solid #a5d6a7; border-radius:18px; box-shadow:0 20px 70px rgba(0, 0, 0, 0.28); overflow:hidden; font-family:Arial, sans-serif;"
      >
        <div style="background:#2e7d32; color:#ffffff; padding:22px 24px;">
          <h2 style="margin:0; font-size:24px; line-height:1.2; font-weight:800;">Po&#353;lji recept na e-po&#353;to</h2>
          <p style="margin:8px 0 0; font-size:15px; line-height:1.35; color:#f1f8e9;">${escapeHtml(recipeTitle)}</p>
        </div>

        <div style="padding:24px; background:#ffffff;">
          <label for="recipe-email-input" style="display:block; margin:0 0 8px; color:#1b5e20; font-size:14px; font-weight:800;">
            E-po&#353;tni naslov
          </label>
          <input
            id="recipe-email-input"
            data-email-input="true"
            type="email"
            inputmode="email"
            autocomplete="email"
            value="${escapeHtml(email)}"
            placeholder="ime@primer.si"
            ${loading || success ? 'disabled' : ''}
            style="box-sizing:border-box; width:100%; min-height:52px; border:2px solid #a5d6a7; border-radius:12px; padding:0 16px; font-size:18px; color:#1f2d1b; background:#f1f8e9; outline:none;"
          />

          ${loading ? `
            <p style="margin:16px 0 0; color:#2e7d32; font-size:15px; font-weight:800;">Po&#353;iljam...</p>
          ` : ''}

          ${success ? `
            <p style="margin:16px 0 0; color:#2e7d32; font-size:15px; font-weight:800;">&#9989; Recept poslan! Preverite svoj e-po&#353;tni predal.</p>
          ` : ''}

          ${error ? `
            <p style="margin:16px 0 0; color:#b00020; font-size:15px; font-weight:800;">${escapeHtml(error)}</p>
          ` : ''}

          <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:24px;">
            <button
              type="button"
              data-action="close-email-modal"
              style="min-height:48px; border:2px solid #a5d6a7; border-radius:12px; padding:0 18px; background:#ffffff; color:#2e7d32; font-size:16px; font-weight:800;"
            >
              Prekli&#269;i
            </button>
            <button
              type="button"
              data-action="send-recipe-email"
              ${loading || success ? 'disabled' : ''}
              style="min-height:48px; border:2px solid #2e7d32; border-radius:12px; padding:0 20px; background:${loading || success ? '#a5d6a7' : '#2e7d32'}; color:#ffffff; font-size:16px; font-weight:800;"
            >
              ${loading ? 'Po&#353;iljam...' : 'Po&#353;lji &#128231;'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
