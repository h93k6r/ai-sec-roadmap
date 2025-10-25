
(async function() {
  function waitForI18n() {
    return new Promise(resolve => {
      if (window.__I18N) return resolve(window.__I18N);
      const handler = (e) => { document.removeEventListener('i18n:ready', handler); resolve(window.__I18N || e.detail?.dict); };
      document.addEventListener('i18n:ready', handler);
    });
  }

  await waitForI18n();
  const container = document.getElementById('node-resources');
  if (location.protocol === 'file:') {
    const note = document.createElement('div');
    note.className = 'note';
    note.innerHTML = '因以 file:// 開啟，瀏覽器阻擋讀取本地 JSON。請在專案根目錄執行 <code>python3 -m http.server 8000</code> 後以 http:// 連線檢視。';
    container.appendChild(note);
    return;
  }
  const res = await fetch('assets/data/resources.json');
  const data = await res.json();

  const mapping = {
    "數學與 ML 基礎": ["Mathematics for ML", "Hands-On ML"],
    "資料工程 / ETL": ["Data Engineering Zoomcamp"],
    "特徵工程與異常偵測": ["Anomaly Detection with Python", "Isolation Forest Guide", "DeepLog"],
    "威脅獵捕 ML 流程": ["Hunting with ML in SIEM"],
    "行為分析 / UEBA": ["UEBA Concepts"],
    "SIEM 規則 × ML 融合": ["Sigma + ML Patterns"],
    "惡意樣本分析自動化": ["Malware ML Pipeline", "MalwareBazaar API"],
    "圖形化威脅情報 (KG)": ["Knowledge Graph for CTI", "MISP Taxonomies"],
    "深度學習 / 時序模型": ["Time Series with DL"],
    "網路流量與日誌序列建模": ["Log Sequence Modeling", "DeepLog"],
    "自動化 IR 劇本": ["SOAR Playbooks"],
    "AIOps / SOAR 整合": ["AIOps Overview"],
    "生成式 AI 在藍隊": ["GenAI Blue Team", "LLM Guardrails"],
    "自訂檢索 (RAG) 對查核": ["RAG for DFIR"],
    "鑑識報告草擬與比對": ["Report Drafting with LLMs"],
    "AI Red Team / 攻防演練": ["LLM Red Teaming", "Jailbreak Benchmarks"],
    "威脅情報融合 (TIP)": ["Threat Intel Platforms"],
    "攻擊圖譜關聯 (ATT&CK)": ["ATT&CK Mapping"],
    "主動獵捕與風險優先級": ["Risk-Based Hunting"]
  };

  const t = (k, d) => (window.__I18N && window.__I18N[k] !== undefined ? window.__I18N[k] : d);

  const renderList = (items) => {
    const list = document.createElement('div');
    list.className = 'cards';
    for (const key of items) {
      const r = data.find(x => x.title.toLowerCase() === key.toLowerCase() || x.title.includes(key)) || { title: key, desc: t('map.no_mapping', '對應資源待補充。'), link: "#", tags: [] };
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${r.title}</h3>
        <p>${r.desc}</p>
        <p class="muted">${r.tags?.length ? t('labels.tags', '標籤') + '：' + r.tags.join(', ') : ''}</p>
        ${r.link && r.link !== '#' ? `<a class="btn" target="_blank" rel="noopener" href="${r.link}">${t('btn.open', '前往')}</a>` : ''}`;
      list.appendChild(el);
    }
    return list;
  };

  Object.entries(mapping).forEach(([node, items]) => {
    const section = document.createElement('section');
    const h = document.createElement('h4');
    h.textContent = node;
    section.appendChild(h);
    section.appendChild(renderList(items));
    container.appendChild(section);
  });
})();
