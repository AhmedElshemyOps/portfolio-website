"""Validate static navigation and article TOC targets without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.toc = set(), [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
            if "data-toc-link" in attrs:
                self.toc.append(attrs["href"])


errors, pages, sections = [], 0, 0
for path in ROOT.rglob("*.html"):
    page = Page()
    page.feed(path.read_text())
    pages += 1
    for href in page.toc:
        sections += 1
        if href.removeprefix("#") not in page.ids:
            errors.append(f"{path.relative_to(ROOT)}: missing TOC target {href}")
    for href in page.links:
        url = urlparse(href)
        if url.scheme or href.startswith("//") or not url.path:
            continue
        target = ROOT / unquote(url.path.lstrip("/")) if url.path.startswith("/") else path.parent / unquote(url.path)
        if target.is_dir():
            target /= "index.html"
        if not target.exists():
            errors.append(f"{path.relative_to(ROOT)}: missing file {href}")

if errors:
    raise SystemExit("\n".join(errors))
print(f"PASS: {pages} HTML pages, {sections} TOC links, no missing local destinations.")
