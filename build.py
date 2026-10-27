#!/usr/bin/env python3
"""Build the static site for tanatornbu.com.

Usage:  python3 build.py            -> writes ./dist
Content lives in ./content (JSON), templates in ./templates,
original images in ./images (any size; resized automatically).
"""
import json, shutil, time
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from PIL import Image

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
SITE_URL = 'https://tanatornbu.com'
YEAR = 2026
VERSION = str(int(time.time()))

LANGS = [
    {'key': 'en', 'prefix': ''},
    {'key': 'th', 'prefix': '/th'},
    {'key': 'zh', 'prefix': '/zh'},
    {'key': 'fr', 'prefix': '/fr'},
]
# Home page banner image(s), from series.json works; more than one becomes a slideshow
HOME_BANNER = ['life-and-techno-no2.jpg']
FONT_BASE = 'family=Lora:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700&family=Dosis:wght@400;500'
FONT_EXTRA = {
    'th': '&family=Noto+Serif+Thai:wght@400;500&family=Sarabun:wght@300;400;700',
    'zh': '&family=Noto+Serif+SC:wght@400;500&family=Noto+Sans+SC:wght@300;400;700',
}

i18n = json.loads((ROOT / 'content/i18n.json').read_text(encoding='utf-8'))
series = json.loads((ROOT / 'content/series.json').read_text(encoding='utf-8'))
cv_raw = json.loads((ROOT / 'content/cv.json').read_text(encoding='utf-8'))
for l in LANGS:
    t = i18n[l['key']]
    l.update(code=t['code'], short=t['short'], name=t['langName'])

env = Environment(loader=FileSystemLoader(str(ROOT / 'templates')), autoescape=select_autoescape(['html']))
env.globals['nav_series'] = series


def pick(v, lang):
    if isinstance(v, dict):
        return v.get(lang) or v.get('en', '')
    return v or ''


def build_images():
    out_lg, out_md = DIST / 'assets/img/lg', DIST / 'assets/img/md'
    out_lg.mkdir(parents=True, exist_ok=True)
    out_md.mkdir(parents=True, exist_ok=True)
    Image.MAX_IMAGE_PIXELS = None
    for src in sorted((ROOT / 'images').glob('*')):
        if src.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'):
            continue
        name = src.stem + '.jpg'
        im = Image.open(src)
        im = im.convert('RGB')
        for size, folder, q in ((1800, out_lg, 80), (900, out_md, 78)):
            c = im.copy()
            c.thumbnail((size, size), Image.LANCZOS)
            c.save(folder / name, 'JPEG', quality=q, optimize=True, progressive=True)


def render(tpl, out_path, lang, page_path, **ctx):
    t = i18n[lang]
    prefix = next(l['prefix'] for l in LANGS if l['key'] == lang)
    path = prefix + page_path
    html = env.get_template(tpl).render(
        t=t, lang=lang, langs=LANGS, prefix=prefix, page_path=page_path, path=path,
        site_url=SITE_URL, year=YEAR, version=VERSION,
        fonts_url='https://fonts.googleapis.com/css2?' + FONT_BASE + FONT_EXTRA.get(lang, '') + '&display=swap',
        **ctx)
    dest = DIST / (prefix.lstrip('/')) / out_path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding='utf-8')
    return path


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    build_images()
    shutil.copytree(ROOT / 'static/css', DIST / 'assets/css')
    shutil.copytree(ROOT / 'static/js', DIST / 'assets/js')
    shutil.copytree(ROOT / 'files', DIST / 'files')
    for f in (ROOT / 'static/root').glob('*'):
        shutil.copy(f, DIST / f.name)

    urls = []
    cat_counts = {}
    for s in series:
        cat_counts[s['cat']] = cat_counts.get(s['cat'], 0) + 1
    cat_imgs = {'painting': ('evening-by-the-seashore.jpg', 'center'),
                'sculpture': ('non-relation-of-technology-2024.jpg', 'center 35%'),
                'computer': ('life-and-time.jpg', '20% center'),
                'drawing': ('', 'center')}
    cat_tones = {'painting': '#34474F', 'sculpture': '#4A4038', 'computer': '#3A2318', 'drawing': '#3E3B36'}
    og_default = '/assets/img/lg/life-and-time.jpg'
    person = json.dumps({
        '@context': 'https://schema.org', '@type': 'Person', 'name': 'Tanatorn Buranasinlapin',
        'url': SITE_URL + '/', 'jobTitle': 'Contemporary artist', 'birthDate': '1966-05-24',
        'nationality': 'Thai', 'email': 'mailto:tanatornbu@gmail.com',
        'alumniOf': ['School of Visual Arts', 'Chulalongkorn University'],
    }, ensure_ascii=False)

    for l in LANGS:
        lang = l['key']
        t = i18n[lang]
        name = 'Tanatorn Buranasinlapin'
        cats = []
        for k in ('painting', 'sculpture', 'computer', 'drawing'):
            n = cat_counts.get(k, 0)
            fmt = t['seriesOne'] if n == 1 else t['seriesMany']
            cats.append({'key': k, 'name': t['cat'][k], 'meta': fmt.replace('{n}', str(n)),
                         'img': cat_imgs[k][0], 'pos': cat_imgs[k][1], 'tone': cat_tones[k]})
        slides = []
        for s in series:
            for w in s.get('works', []):
                if w['file'] in HOME_BANNER:
                    slides.append({'file': w['file'], 'title': w['title'], 'series': s['title'], 'cat': t['cat'][s['cat']],
                                   'slug': s['slug'], 'pos': s.get('coverPos', 'center') if w['file'] == s.get('cover') else 'center'})
        urls.append(render('home.html', 'index.html', lang, '/', section='home', overlay=True, cats=cats, slides=slides,
                           page_title=name + ' — ' + t['role'], page_desc=t['siteDesc'], og_image=og_default, jsonld=person))
        urls.append(render('works.html', 'works/index.html', lang, '/works/', section='works', overlay=False, series=series,
                           page_title=t['worksTitle'] + ' — ' + name, page_desc=t['worksIntro'], og_image=og_default, jsonld=None))
        for i, s in enumerate(series):
            nxt = series[(i + 1) % len(series)]
            works = []
            for w in s.get('works', []):
                meta = ' · '.join(x for x in (w.get('year'), pick(w.get('medium'), lang), w.get('size')) if x)
                works.append({**w, 'meta': meta})
            sv = {**s, 'works': works}
            concept = (s.get('concept') or {}).get(lang)
            desc = concept['lead'] if concept else s['title'] + ' — ' + t['cat'][s['cat']] + ' · ' + name
            og = '/assets/img/lg/' + s['cover'] if s.get('cover') else og_default
            urls.append(render('series.html', 'works/%s/index.html' % s['slug'], lang, '/works/%s/' % s['slug'],
                               section='works', overlay=False, s=sv, next=nxt, concept=concept,
                               page_title=s['title'] + ' — ' + name, page_desc=desc, og_image=og, jsonld=None))
        cv = [{'title': t['sec'][gi], 'items': [{'y': it['y'], 't': pick(it['t'], lang), 'd': pick(it.get('d'), lang)} for it in g]}
              for gi, g in enumerate(cv_raw)]
        urls.append(render('bio.html', 'biography/index.html', lang, '/biography/', section='bio', overlay=False, cv=cv,
                           page_title=t['bio'] + ' — ' + name, page_desc=t['bioLead'],
                           og_image='/assets/img/lg/portrait-bw.jpg', jsonld=person))
    # 404 (English + links work from any depth since paths are root-absolute)
    render('404.html', '404.html', 'en', '/404.html', section='', overlay=False,
           page_title='404 — Tanatorn Buranasinlapin', page_desc=i18n['en']['siteDesc'], og_image=og_default, jsonld=None)

    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += ['  <url><loc>%s%s</loc></url>' % (SITE_URL, u) for u in urls]
    sm.append('</urlset>')
    (DIST / 'sitemap.xml').write_text('\n'.join(sm) + '\n', encoding='utf-8')
    (DIST / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % SITE_URL, encoding='utf-8')
    print('Built %d pages into %s' % (len(urls) + 1, DIST))


if __name__ == '__main__':
    main()
