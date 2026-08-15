const COOKIE_NAME = 'googtrans';
const ENGLISH_TRANSLATION_VALUE = '/auto/en';
const WIDGET_CONTAINER_ID = 'google-translate-element';
const CALLBACK_NAME = 'googleTranslateElementInit';
const SCRIPT_ID = 'google-translate-script';
let chromeObserver;
let pendingTranslationState = null;

function readCookie(name) {
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
}

function cookieDomainVariants() {
  const hostname = window.location.hostname;
  if (!hostname || hostname === 'localhost' || /^\d+(?:\.\d+){3}$/.test(hostname)) {
    return [];
  }
  return [hostname, `.${hostname}`];
}

function writeTranslationCookie(value, expires) {
  const attributes = `path=/;SameSite=Lax${expires ? `;expires=${expires}` : ''}`;

  // Host-only cookie plus explicit bare-domain variants keep the widget state
  // consistent across browsers and deployments with subdomains.
  document.cookie = `${COOKIE_NAME}=${value};${attributes}`;
  cookieDomainVariants().forEach((domain) => {
    document.cookie = `${COOKIE_NAME}=${value};${attributes};domain=${domain}`;
  });
}

export function isEnglishTranslationActive() {
  return readCookie(COOKIE_NAME) === ENGLISH_TRANSLATION_VALUE;
}

export function setEnglishTranslation(enabled) {
  if (enabled) {
    writeTranslationCookie(ENGLISH_TRANSLATION_VALUE);
  } else {
    writeTranslationCookie('', 'Thu, 01 Jan 1970 00:00:00 GMT');
  }
  pendingTranslationState = enabled;
  applyTranslationState();
}

export function toggleEnglishTranslation() {
  setEnglishTranslation(!isEnglishTranslationActive());
}

function applyTranslationState() {
  if (pendingTranslationState == null) return false;

  const select = document.querySelector(`#${WIDGET_CONTAINER_ID} .goog-te-combo`);
  if (!select) return false;

  const desiredValue = pendingTranslationState ? 'en' : '';
  if (select.value !== desiredValue) {
    select.value = desiredValue;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  pendingTranslationState = null;
  return true;
}

function mountHiddenWidgetContainer() {
  let container = document.getElementById(WIDGET_CONTAINER_ID);
  if (container) return container;

  container = document.createElement('div');
  container.id = WIDGET_CONTAINER_ID;
  container.className = 'notranslate';
  container.setAttribute('translate', 'no');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);pointer-events:none;opacity:0;';
  document.body.appendChild(container);
  return container;
}

function suppressTranslatorChrome() {
  const hideChrome = () => {
    document
      .querySelectorAll([
        '.goog-te-banner-frame',
        'iframe.goog-te-banner-frame',
        'iframe[src*="translate.google"]',
        'iframe[title="Language Translate Widget"]',
        '.VIpgJd-ZVi9od-ORHb-OEVmcd',
        '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
        '.VIpgJd-ZVi9od-aZ2wEe',
        '[class*="VIpgJd-ZVi9od-aZ2wEe"]',
        '.goog-te-gadget-icon',
        '.goog-te-gadget-simple',
        'body > .skiptranslate'
      ].join(','))
      .forEach((element) => {
        if (
          element.style.getPropertyValue('display') !== 'none' ||
          element.style.getPropertyPriority('display') !== 'important'
        ) {
          element.style.setProperty('display', 'none', 'important');
        }
        element.setAttribute('aria-hidden', 'true');
      });

    // Current widget versions can inject the toolbar as an obfuscated,
    // top-level iframe without the legacy goog-te-banner-frame class.
    document.querySelectorAll('body > iframe').forEach((iframe) => {
      const title = iframe.getAttribute('title') || '';
      const className = String(iframe.className || '');
      const rect = iframe.getBoundingClientRect();
      const looksLikeTranslateBanner =
        /translate/i.test(title) ||
        /goog|VIpgJd|skiptranslate/i.test(className) ||
        (rect.top <= 1 && rect.width >= window.innerWidth * 0.8 && rect.height > 0 && rect.height <= 100);

      if (looksLikeTranslateBanner) {
        iframe.style.setProperty('display', 'none', 'important');
        iframe.style.setProperty('visibility', 'hidden', 'important');
        iframe.setAttribute('aria-hidden', 'true');
      }
    });

    document.querySelectorAll('body > div').forEach((element) => {
      const className = String(element.className || '');
      const containsGoogleControl = element.querySelector(
        '[class*="VIpgJd-ZVi9od-aZ2wEe"], .goog-te-gadget-icon, img[src*="gstatic.com/translate"]'
      );
      if (/VIpgJd-ZVi9od-aZ2wEe|goog-te-gadget/i.test(className) || containsGoogleControl) {
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.setAttribute('aria-hidden', 'true');
      }
    });

    [document.documentElement, document.body].forEach((element) => {
      if (element.style.getPropertyValue('top')) element.style.removeProperty('top');
      if (element.style.getPropertyValue('margin-top')) element.style.removeProperty('margin-top');
    });
  };

  hideChrome();
  if (chromeObserver) return;

  let scheduled = false;
  chromeObserver = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      hideChrome();
      applyTranslationState();
    });
  });
  chromeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  });
}

export function initializeGoogleWebsiteTranslator() {
  suppressTranslatorChrome();
  mountHiddenWidgetContainer();

  window[CALLBACK_NAME] = () => {
    if (!window.google?.translate?.TranslateElement) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'auto',
        includedLanguages: 'en',
        autoDisplay: false
      },
      WIDGET_CONTAINER_ID
    );
    window.setTimeout(applyTranslationState, 0);
  };

  if (window.google?.translate?.TranslateElement) {
    window[CALLBACK_NAME]();
    return;
  }
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `https://translate.google.com/translate_a/element.js?cb=${CALLBACK_NAME}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
