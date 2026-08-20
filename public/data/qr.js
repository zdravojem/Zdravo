// QR rendering. The Electron main process called the same `qrcode` package over
// IPC; public/vendor/qrcode.js is that package bundled for the browser, so the
// codes the kiosk prints are unchanged.

import QRCode from '../vendor/qrcode.js';

export function generateQrSvg(text, options = {}) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Invalid QR payload');
  }

  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#F7F3EC'
    },
    ...options
  });
}
