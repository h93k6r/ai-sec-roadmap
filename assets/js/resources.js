
function waitForI18n() {
  return new Promise(resolve => {
    if (window.__I18N) return resolve(window.__I18N);
    const handler = (e) => { document.removeEventListener('i18n:ready', handler); resolve(window.__I18N || e.detail?.dict); };
    document.addEventListener('i18n:ready', handler);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await waitForI18n();
  const results = document.getElementById('results');
  if (location.protocol === 'file:') {
    results.innerHTML = '<p class="muted">因以 file:// 開啟，瀏覽器阻擋讀取本地 JSON。請在專案根目錄執行 <code>python3 -m http.server 8000</code> 後以 http:// 連線檢視。</p>';
    return;
  }
  const res = await fetch('assets/data/resources.json');
  const data = await res.json();
  const tagSel = document.getElementById('tag');
  const q = document.getElementById('q');
  // results 已於前方定義

  const tags = [...new Set(data.flatMap(d => d.tags))].sort((a,b)=>a.localeCompare(b));
  for (const t of tags) {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    tagSel.appendChild(opt);
  }

  const t = (k, d) => (window.__I18N && window.__I18N[k] !== undefined ? window.__I18N[k] : d);

  const render = () => {
    const kw = (q.value || '').toLowerCase();
    const tag = tagSel.value;
    results.innerHTML = '';
    const filtered = data.filter(d =>
      (!tag || d.tags.includes(tag)) &&
      (!kw || (d.title + d.desc + d.link).toLowerCase().includes(kw))
    );
    for (const d of filtered) {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${d.title}</h3>
        <p>${d.desc}</p>
        <p class="muted">${t('labels.tags', '標籤')}：${d.tags.join(', ')}</p>
        <a class="btn" target="_blank" rel="noopener" href="${d.link}">${t('btn.open', '前往')}</a>`;
      results.appendChild(el);
    }
    if (filtered.length === 0) {
      results.innerHTML = `<p class="muted">${t('resources.empty', '無符合結果，請更換關鍵字或標籤。')}</p>`;
    }
  };

  q.addEventListener('input', render);
  tagSel.addEventListener('change', render);
  render();
});
