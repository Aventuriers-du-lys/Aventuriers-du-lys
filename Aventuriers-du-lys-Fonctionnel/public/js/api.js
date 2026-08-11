window.ADL = window.ADL || {};

ADL.api = async function api(path, options = {}) {
  const opts = {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': (ADL.lang && ADL.lang()) || 'fr',
      ...(options.headers || {})
    },
    ...options
  };
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch('/api' + path, opts);
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) {
    const code = data && data.errorCode;
    const err = new Error(code || (data && data.error) || 'network');
    err.status = res.status;
    err.data = data || {};
    err.errorCode = code;
    throw err;
  }
  return data;
};

ADL.escapeHtml = function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
};

ADL.me = async function me() {
  try {
    const data = await ADL.api('/auth/me');
    ADL.user = data.user || null;
    return ADL.user;
  } catch {
    ADL.user = null;
    return null;
  }
};
