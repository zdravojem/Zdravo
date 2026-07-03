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
      style="position:fixed; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(43, 31, 18, 0.56);"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Po&#353;lji recept na e-po&#353;to"
        style="width:min(92vw, 520px); background:#fff8ea; border:2px solid #b88445; border-radius:18px; box-shadow:0 20px 70px rgba(0, 0, 0, 0.28); overflow:hidden; font-family:Arial, sans-serif;"
      >
        <div style="background:#6b421f; color:#fff8ea; padding:22px 24px;">
          <h2 style="margin:0; font-size:24px; line-height:1.2; font-weight:800;">Po&#353;lji recept na e-po&#353;to</h2>
          <p style="margin:8px 0 0; font-size:15px; line-height:1.35; color:#f7e8c7;">${escapeHtml(recipeTitle)}</p>
        </div>

        <div style="padding:24px; background:#fff8ea;">
          <label for="recipe-email-input" style="display:block; margin:0 0 8px; color:#5d381b; font-size:14px; font-weight:800;">
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
            style="box-sizing:border-box; width:100%; min-height:52px; border:2px solid #c99a5f; border-radius:12px; padding:0 16px; font-size:18px; color:#3b2413; background:#fffdf8; outline:none;"
          />

          ${loading ? `
            <p style="margin:16px 0 0; color:#6b421f; font-size:15px; font-weight:800;">Po&#353;iljam...</p>
          ` : ''}

          ${success ? `
            <p style="margin:16px 0 0; color:#6b421f; font-size:15px; font-weight:800;">&#9989; Recept poslan! Preverite svoj e-po&#353;tni predal.</p>
          ` : ''}

          ${error ? `
            <p style="margin:16px 0 0; color:#b00020; font-size:15px; font-weight:800;">${escapeHtml(error)}</p>
          ` : ''}

          <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:24px;">
            <button
              type="button"
              data-action="close-email-modal"
              style="min-height:48px; border:2px solid #c99a5f; border-radius:12px; padding:0 18px; background:#fffdf8; color:#6b421f; font-size:16px; font-weight:800;"
            >
              Prekli&#269;i
            </button>
            <button
              type="button"
              data-action="send-recipe-email"
              ${loading || success ? 'disabled' : ''}
              style="min-height:48px; border:2px solid #6b421f; border-radius:12px; padding:0 20px; background:${loading || success ? '#c99a5f' : '#6b421f'}; color:#fff8ea; font-size:16px; font-weight:800;"
            >
              ${loading ? 'Po&#353;iljam...' : 'Po&#353;lji &#128231;'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
