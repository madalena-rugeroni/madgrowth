#!/usr/bin/env python3
"""Backfill the newsletter archive from Kit (ConvertKit) v4 API.

Usage:  KIT_API_KEY=kit_xxx python3 tools/kit_archive_backfill.py
Writes: newsletter/<slug>/index.html for every sent broadcast not already present,
        prints sitemap <url> entries to append, and a CSV of subject → suggested title to review.

Kit API: https://developers.kit.com/v4  (X-Kit-Api-Key header; list /v4/broadcasts, get /v4/broadcasts/{id}).
Requires: pip install requests
"""
import os, re, sys, json, html, datetime, csv
import requests

API = "https://api.kit.com/v4"
KEY = os.environ.get("KIT_API_KEY") or sys.exit("Set KIT_API_KEY")
H = {"X-Kit-Api-Key": KEY, "Accept": "application/json"}
SITE = "https://www.madgrowth.io"
TEMPLATE = "newsletter/how-i-ended-up-here/index.html"   # any generated issue page is the template

def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower().replace("€", "eur")).strip("-")
    return s[:70]

def clean(content):
    """Kit email HTML → article HTML: drop styles, tables, buttons, the 'ways I can support' footer."""
    c = re.sub(r"<style.*?</style>", "", content, flags=re.S)
    c = re.sub(r"<!--\[if mso\]>.*?<!\[endif\]-->", "", c, flags=re.S)
    c = re.sub(r"<!--.*?-->", "", c, flags=re.S)
    c = re.sub(r"</?(table|tbody|tr|td|div|span)[^>]*>", "", c)
    c = re.sub(r'<a class="email-button".*?</a>', "", c, flags=re.S)
    cut = re.search(r"<p[^>]*>\s*<strong[^>]*>\s*(In the meantime|Whenever you)", c)
    if cut: c = c[:cut.start()]
    c = re.sub(r"<p[^>]*>\s*(<em>)?\s*\d-minute read.*?</p>", "", c, count=1, flags=re.S)
    c = re.sub(r"<p[^>]*>(\s|​|<br/>|&nbsp;)*</p>", "", c)
    c = c.replace(' class=""', "").replace("​", "")
    return c.strip()

def main():
    tpl = open(TEMPLATE, encoding="utf-8").read()
    bs, page = [], None
    while True:
        r = requests.get(f"{API}/broadcasts", headers=H, params={"per_page": 100, "after": page} if page else {"per_page": 100}).json()
        bs += [b for b in r["broadcasts"] if b["status"] == "completed"]
        if not r["pagination"]["has_next_page"]: break
        page = r["pagination"]["end_cursor"]
    rows, sm = [], []
    for b in bs:
        d = requests.get(f"{API}/broadcasts/{b['id']}", headers=H).json()["broadcast"]
        slug = slugify(d["subject"]); out = f"newsletter/{slug}/index.html"
        if os.path.exists(out) or any(os.path.exists(f"newsletter/{x}/index.html") and d["subject"] in open(f"newsletter/{x}/index.html").read() for x in os.listdir("newsletter") if os.path.isdir(f"newsletter/{x}")):
            continue
        date = d["published_at"][:10]; nice = datetime.date.fromisoformat(date).strftime("%-d %B %Y")
        body = clean(d["content"])
        title = d["subject"].strip().capitalize()   # review these in the CSV; search titles beat subject lines
        desc = re.sub("<[^>]+>", " ", body); desc = re.sub(r"\s+", " ", desc).strip()[:155]
        url = f"{SITE}/newsletter/{slug}/"
        p = tpl
        p = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)} · Madgrowth</title>", p, flags=re.S)
        p = p.replace("how-i-ended-up-here", slug)
        p = re.sub(r'(name="description" content=")[^"]*', lambda m: m.group(1) + html.escape(desc, quote=True), p)
        p = re.sub(r'((?:og|twitter):(?:title|description)" content=")[^"]*', lambda m: m.group(1) + html.escape(title if "title" in m.group(1) else desc, quote=True), p)
        p = re.sub(r"<h1>.*?</h1>", f"<h1>{html.escape(title)}</h1>", p, flags=re.S)
        p = re.sub(r'<time datetime="[^"]*">[^<]*</time>', f'<time datetime="{date}">{nice}</time>', p)
        p = re.sub(r'issue of [^<]*</span>', f'issue of {nice}</span>', p)
        p = re.sub(r'(Originally sent as ")[^"]*', lambda m: m.group(1) + html.escape(d["subject"]), p)
        p = re.sub(r'(<p class="card-sub"><em>.*?</em></p>\n).*?(\n<h2>Get the next issue</h2>)', lambda m: m.group(1) + body + m.group(2), p, flags=re.S)
        # schema
        p = re.sub(r'"headline": "[^"]*"', f'"headline": {json.dumps(title)}', p)
        p = re.sub(r'"alternativeHeadline": "[^"]*"', f'"alternativeHeadline": {json.dumps(d["subject"])}', p)
        p = re.sub(r'"description": "[^"]*"(?=,\n\s+"url")', f'"description": {json.dumps(desc)}', p)
        p = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{date}"', p)
        p = re.sub(r'"keywords": "[^"]*"', '"keywords": ""', p)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, "w", encoding="utf-8").write(p)
        rows.append((d["subject"], title, url)); sm.append(f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{date}</lastmod>\n  </url>")
    with open("newsletter-backfill-review.csv", "w", newline="") as f:
        csv.writer(f).writerows([("email subject", "suggested web title (edit me)", "url")] + rows)
    print("\n".join(sm)); print(f"\n{len(rows)} pages written. Review titles in newsletter-backfill-review.csv, then append the <url> lines above to sitemap.xml.")

if __name__ == "__main__":
    main()
