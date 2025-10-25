
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, datetime, hashlib, re, sys
from pathlib import Path

import feedparser
import requests

ROOT = Path(__file__).resolve().parents[1]
TRENDS = ROOT / 'assets' / 'data' / 'trends.json'

# Feeds requested by user
FEEDS = [
    # arXiv: Computer Science - Cryptography and Security
    'http://export.arxiv.org/rss/cs.CR',
    # IEEE S&P - Not all pages have RSS; provide a known feed if available or a fallback (skip gracefully)
    'https://ieeexplore.ieee.org/rss/TOC84.XML',  # IEEE Security & Privacy Magazine (fallback RSS)
    # Black Hat (news feed; skip gracefully if unavailable)
    'https://www.blackhat.com/atom.xml',
]

CATEGORIES = {
    'arxiv': '會議',
    'ieee': '會議',
    'blackhat': '會議'
}

def classify(entry_title, entry_summary):
    text = f"{entry_title} {entry_summary}".lower()
    if any(k in text for k in ['jailbreak', 'prompt injection', 'red team', 'attack', 'adversarial']):
        return '攻防'
    if any(k in text for k in ['forensic', 'dfir', 'incident response']):
        return '鑑識'
    if any(k in text for k in ['governance', 'compliance', 'policy']):
        return '法規/治理'
    if any(k in text for k in ['threat', 'hunting', 'detection', 'siem', 'ueba']):
        return '藍隊'
    return '會議'

def _norm_date(dt):
    try:
        # feedparser returns struct_time sometimes
        if isinstance(dt, str):
            return dt[:10]
        if hasattr(dt, 'tm_year'):
            return f"{dt.tm_year:04d}-{dt.tm_mon:02d}-{dt.tm_mday:02d}"
    except Exception:
        pass
    return datetime.datetime.utcnow().strftime('%Y-%m-%d')

def fetch_feed(url):
    try:
        d = feedparser.parse(url)
        return d.entries or []
    except Exception as e:
        print(f"[WARN] feed error {url}: {e}", file=sys.stderr)
        return []

def main():
    existing = []
    if TRENDS.exists():
        try:
            existing = json.loads(TRENDS.read_text(encoding='utf-8'))
        except Exception:
            existing = []

    items = []
    for url in FEEDS:
        entries = fetch_feed(url)
        for e in entries[:30]:  # limit per source
            title = e.get('title', '').strip()
            link = e.get('link', '').strip()
            summary = re.sub('<[^<]+?>', '', e.get('summary', '')).strip()
            date = _norm_date(getattr(e, 'published_parsed', None) or e.get('published', ''))
            cat = classify(title, summary)
            if 'arxiv' in url:
                cat = '會議'
            elif 'ieee' in url:
                cat = '會議'
            elif 'blackhat' in url:
                cat = '會議'
            if not title or not link:
                continue
            items.append({
                "date": date,
                "title": title,
                "summary": summary[:280] + ('…' if len(summary) > 280 else ''),
                "link": link,
                "category": cat
            })

    # merge & dedup by title+link
    by_key = {}
    for it in existing + items:
        key = hashlib.sha1(f"{it['title']}|{it['link']}".encode('utf-8')).hexdigest()
        if key not in by_key:
            by_key[key] = it
        else:
            # prefer newer date
            if it['date'] > by_key[key]['date']:
                by_key[key] = it

    merged = list(by_key.values())
    merged.sort(key=lambda x: x['date'], reverse=True)

    TRENDS.write_text(json.dumps(merged[:300], ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"[OK] trends.json updated with {len(merged[:300])} entries.")

if __name__ == '__main__':
    main()
