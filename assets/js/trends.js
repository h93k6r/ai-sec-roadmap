
function waitForI18n() {
  return new Promise(resolve => {
    if (window.__I18N) return resolve(window.__I18N);
    const handler = (e) => { document.removeEventListener('i18n:ready', handler); resolve(window.__I18N || e.detail?.dict); };
    document.addEventListener('i18n:ready', handler);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await waitForI18n();
  const list = document.getElementById('tlist');
  if (location.protocol === 'file:') {
    list.innerHTML = '<li class="muted">因以 file:// 開啟，瀏覽器阻擋讀取本地 JSON。請在專案根目錄執行 <code>python3 -m http.server 8000</code> 後以 http:// 連線檢視。</li>';
    return;
  }
  const res = await fetch('assets/data/trends.json');
  const data = await res.json();
  const q = document.getElementById('tq');
  const cat = document.getElementById('tcat');
  // list 已於前方定義

  const t = (k, d) => (window.__I18N && window.__I18N[k] !== undefined ? window.__I18N[k] : d);

  const render = () => {
    const kw = (q.value || '').toLowerCase();
    const c = cat.value;
    list.innerHTML = '';
    const filtered = data.filter(d =>
      (!c || d.category === c) &&
      (!kw || (d.title + d.summary).toLowerCase().includes(kw))
    );
    for (const d of filtered) {
      const li = document.createElement('li');
      li.innerHTML = `<div class="item">
        <div>
          <h3>${d.title}</h3>
          <p class="muted">${d.date} · ${d.category}</p>
          <p>${d.summary}</p>
        </div>
        <div class="actions">
          <a class="btn" target="_blank" rel="noopener" href="${d.link}">${t('btn.open', '前往')}</a>
        </div>
      </div>`;
      list.appendChild(li);
    }
    if (filtered.length === 0) {
      list.innerHTML = `<li class="muted">${t('trends.empty', '尚無資料或未命中查詢。')}</li>`;
    }
  };
  q.addEventListener('input', render);
  cat.addEventListener('change', render);
  render();
});
