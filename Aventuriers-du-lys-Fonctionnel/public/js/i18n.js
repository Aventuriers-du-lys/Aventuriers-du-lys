window.ADL = window.ADL || {};

(function () {
  const STORAGE_KEY = 'adl_lang';
  const SUPPORTED = ['fr', 'en'];
  const DEFAULT_LANG = 'fr';

  let dict = {};
  let lang = DEFAULT_LANG;
  const listeners = [];

  function detectLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : DEFAULT_LANG;
  }

  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
  }

  function format(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : '{' + k + '}'));
  }

  ADL.t = function t(key, vars) {
    const value = getByPath(dict, key);
    if (value == null) return key;
    return format(value, vars);
  };

  ADL.lang = function () {
    return lang;
  };

  ADL.supportedLangs = function () {
    return SUPPORTED.slice();
  };

  ADL.onLangChange = function (fn) {
    listeners.push(fn);
  };

  ADL.applyI18n = function applyI18n(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = ADL.t(key);
      if (el.dataset.i18nHtml === 'true') el.innerHTML = val;
      else el.textContent = val;
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', ADL.t(el.getAttribute('data-i18n-placeholder')));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      document.title = ADL.t(el.getAttribute('data-i18n-title'));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', ADL.t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-lang-content]').forEach((el) => {
      const forLang = el.getAttribute('data-lang-content');
      el.hidden = forLang !== lang;
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-label]').forEach((btn) => {
      btn.textContent = lang.toUpperCase();
    });
  };

  async function loadDict(nextLang) {
    const res = await fetch('/locales/' + nextLang + '.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('locale_load_failed');
    dict = await res.json();
    lang = nextLang;
    localStorage.setItem(STORAGE_KEY, lang);
  }

  ADL.setLang = async function setLang(nextLang) {
    if (!SUPPORTED.includes(nextLang)) return;
    await loadDict(nextLang);
    ADL.applyI18n();
    listeners.forEach((fn) => {
      try { fn(lang); } catch (_) {}
    });
  };

  ADL.toggleLang = async function toggleLang() {
    const idx = SUPPORTED.indexOf(lang);
    const next = SUPPORTED[(idx + 1) % SUPPORTED.length];
    await ADL.setLang(next);
  };

  ADL.errorMessage = function errorMessage(err) {
    const code = err && (err.data && err.data.errorCode || err.errorCode);
    if (code) return ADL.t('errors.' + code);
    if (err && err.message && getByPath(dict, 'errors.' + err.message)) {
      return ADL.t('errors.' + err.message);
    }
    return (err && err.message) || ADL.t('errors.network');
  };

  ADL.readyI18n = (async function boot() {
    lang = detectLang();
    try {
      await loadDict(lang);
    } catch {
      await loadDict(DEFAULT_LANG);
    }
    ADL.applyI18n();
    if (!window.__adlLangDelegation) {
      window.__adlLangDelegation = true;
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lang-toggle]');
        if (!btn) return;
        e.preventDefault();
        ADL.toggleLang();
      });
    }
    return lang;
  })();
})();
