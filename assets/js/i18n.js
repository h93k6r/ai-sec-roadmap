
(function() {
  function setDocumentLang(lang) {
    document.documentElement.lang = (lang === 'en') ? 'en' : 'zh-Hant';
  }

  function applyI18n(dict) {
    // text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });
    // title
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const key = titleEl.getAttribute('data-i18n');
      if (dict[key] !== undefined) titleEl.textContent = dict[key];
      document.title = titleEl.textContent;
    }
  }

  async function loadDict(lang) {
    const path = `assets/i18n/${lang}.json`;
    const res = await fetch(path);
    if (!res.ok) throw new Error('i18n load failed: ' + path);
    return res.json();
  }

  async function applyLang(lang) {
    let dict = {};
    try {
      // Avoid fetch under file:// due to browser restrictions
      if (location.protocol !== 'file:') {
        dict = await loadDict(lang);
      }
    } catch (err) {
      console.error(err);
    }
    // Apply whatever we have (empty dict keeps inline zh-Hant text)
    try {
      applyI18n(dict);
    } catch (e) { /* no-op */ }
    setDocumentLang(lang);
    const sel = document.getElementById('lang');
    if (sel) sel.value = lang;
    window.__I18N = dict;
    document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang, dict } }));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const sel = document.getElementById('lang');
    const urlLang = new URLSearchParams(location.search).get('lang');
    const initLang = (urlLang || localStorage.getItem('lang') || 'zh');
    await applyLang(initLang);
    if (sel) {
      sel.value = initLang;
      sel.addEventListener('change', async () => {
        const lang = sel.value;
        localStorage.setItem('lang', lang);
        // Update URL param without reloading
        const sp = new URLSearchParams(location.search);
        sp.set('lang', lang);
        history.replaceState({}, '', `${location.pathname}?${sp.toString()}`);
        await applyLang(lang);
      });
    }
  });
})();
