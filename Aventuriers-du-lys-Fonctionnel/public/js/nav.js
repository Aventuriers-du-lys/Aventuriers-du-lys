(async function initSiteHeader() {
  if (!window.ADL) return;
  if (ADL.readyI18n) await ADL.readyI18n;

  // CSS is loaded from <head>; keep fallback only if missing
  if (!document.querySelector('link[href="/css/header.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/header.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href="/css/theme.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/theme.css';
    document.head.appendChild(link);
  }
  document.documentElement.style.backgroundColor = '#050612';
  document.body.classList.add('adl-theme');

  const LINKS = [
    { href: '/', key: 'nav.home', match: ['/', '/index'] },
    { href: '/publier', key: 'nav.publish', match: ['/publier'] },
    { href: '/corporatif', key: 'nav.corporate', match: ['/corporatif'] },
    { href: '/grandeur-nature', key: 'nav.larp', match: ['/grandeur-nature'] },
    { href: '/conditions', key: 'nav.conditions', match: ['/conditions'] }
  ];

  let keepMenuOpen = false;

  function currentPath() {
    const p = (location.pathname || '/').replace(/\/+$/, '') || '/';
    return p;
  }

  function isActive(link) {
    const path = currentPath();
    return link.match.some((m) => m === path);
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function ensureMount() {
    let mount = document.querySelector('[data-site-header]');
    if (mount) return mount;
    mount = document.createElement('div');
    mount.setAttribute('data-site-header', '');
    document.body.insertBefore(mount, document.body.firstChild);
    return mount;
  }

  function closeAccountMenus() {
    document.querySelectorAll('.adl-account.is-open').forEach((el) => {
      el.classList.remove('is-open');
      const btn = el.querySelector('[data-account-toggle]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function langSection() {
    const lang = ADL.lang();
    return `
      <div class="adl-account-section">
        <span class="adl-account-section-label" data-i18n="nav.language">${ADL.t('nav.language')}</span>
        <div class="adl-lang-row">
          <button type="button" class="adl-lang-option${lang === 'fr' ? ' is-active' : ''}" data-set-lang="fr">FR</button>
          <button type="button" class="adl-lang-option${lang === 'en' ? ' is-active' : ''}" data-set-lang="en">EN</button>
        </div>
      </div>`;
  }

  async function render() {
    const user = await ADL.me();
    ADL.user = user;
    const mount = ensureMount();

    const navLinks = LINKS.map((link) => {
      const active = isActive(link) ? ' is-active' : '';
      return `<a class="adl-chip${active}" href="${link.href}" data-i18n="${link.key}">${ADL.t(link.key)}</a>`;
    }).join('');

    let panelBody;
    let triggerLabel;
    let avatar;

    if (user) {
      avatar = ADL.escapeHtml(initials(user.display_name));
      triggerLabel = `<span class="adl-account-label">${ADL.escapeHtml(user.display_name)}</span>`;
      panelBody = `
        <div class="adl-account-head">
          <strong>${ADL.escapeHtml(user.display_name)}</strong>
          <span>${ADL.escapeHtml(user.email || '')}</span>
        </div>
        <a class="adl-account-item" href="/profil" data-i18n="nav.profile">${ADL.t('nav.profile')}</a>
        <button type="button" class="adl-account-item is-danger" data-logout data-i18n="nav.logout">${ADL.t('nav.logout')}</button>
        ${langSection()}`;
    } else {
      avatar = '?';
      triggerLabel = `<span class="adl-account-label" data-i18n="nav.login">${ADL.t('nav.login')}</span>`;
      panelBody = `
        <div class="adl-account-head">
          <strong data-i18n="nav.guestTitle">${ADL.t('nav.guestTitle')}</strong>
          <span data-i18n="nav.accountHint">${ADL.t('nav.accountHint')}</span>
        </div>
        <a class="adl-account-item is-primary" href="/compte" data-i18n="nav.login">${ADL.t('nav.login')}</a>
        <a class="adl-account-item is-primary-outline" href="/compte?mode=register" data-i18n="nav.register">${ADL.t('nav.register')}</a>
        ${langSection()}`;
    }

    mount.innerHTML = `
      <header class="adl-header">
        <div class="wrap">
          <div class="adl-topbar">
            <a class="adl-brand" href="/">
              <div class="adl-sigil" aria-hidden="true"></div>
              <div>
                <h1 data-i18n="meta.siteName">${ADL.t('meta.siteName')}</h1>
                <p data-i18n="brand.tagline">${ADL.t('brand.tagline')}</p>
              </div>
            </a>
            <div class="adl-nav">${navLinks}</div>
          </div>
        </div>
      </header>
      <div class="adl-account${keepMenuOpen ? ' is-open' : ''}" data-account-menu>
        <div class="adl-account-backdrop" data-account-close></div>
        <button type="button" class="adl-account-btn" data-account-toggle aria-haspopup="true" aria-expanded="${keepMenuOpen ? 'true' : 'false'}">
          <span class="adl-avatar">${avatar}</span>
          ${triggerLabel}
          <span class="adl-account-caret">▾</span>
        </button>
        <div class="adl-account-panel" role="menu">
          ${panelBody}
        </div>
      </div>`;

    keepMenuOpen = false;
    ADL.applyI18n(mount);

    mount.querySelectorAll('[data-account-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.closest('[data-account-menu]');
        const open = !menu.classList.contains('is-open');
        closeAccountMenus();
        if (open) {
          menu.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    mount.querySelectorAll('[data-account-close]').forEach((el) => {
      el.addEventListener('click', closeAccountMenus);
    });

    mount.querySelectorAll('[data-logout]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await ADL.api('/auth/logout', { method: 'POST', body: {} });
        location.href = '/';
      });
    });

    mount.querySelectorAll('[data-set-lang]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const next = btn.getAttribute('data-set-lang');
        if (!next || next === ADL.lang()) return;
        keepMenuOpen = true;
        await ADL.setLang(next);
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAccountMenus();
  });

  await render();
  if (ADL.onLangChange) ADL.onLangChange(() => render());
})();
