/* Reading aids enhance the canonical document without changing its words. */
(() => {
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  const title = document.querySelector('.article-page-header h1');
  if (title) document.body.dataset.titleLength = title.textContent.length > 85 ? 'long' : 'normal';
  const utilities = document.querySelector('.reader-utilities');
  if (utilities) {
    const options = el('details', '', 'reader-options');
    options.append(el('summary', 'Accessibility'));
    const panel = el('div', '', 'reader-options-panel');
    utilities.querySelectorAll('.reader-font-controls,[data-reader-contrast],[data-reader-theme]').forEach(node => panel.append(node));
    const savedLink = utilities.querySelector('a[href="/saved/index.html"]'); if (savedLink) panel.append(savedLink);
    options.append(panel); utilities.prepend(options);
    utilities.querySelector('[data-global-search-open]').textContent = 'Search';
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && options.open) { options.open = false; options.querySelector('summary').focus(); } });
    document.addEventListener('click', event => { if (!options.contains(event.target)) options.open = false; });
  }

  // One modal per page; the natural-size view keeps diagram labels readable.
  let viewer;
  const view = (img, minimumFont = 16) => {
    if (!viewer) {
      viewer = el('dialog', '', 'media-dialog');
      viewer.setAttribute('aria-label', 'Diagram viewer');
      const header = el('header'); const name = el('strong'); name.id = 'media-viewer-title';
      viewer.setAttribute('aria-labelledby', name.id);
      const actions = el('div');
      ['Fit view', 'Readable size', 'Close'].forEach((label, index) => { const button = el('button', label); button.type = 'button'; button.dataset.mediaAction = String(index); actions.append(button); });
      header.append(name, actions); viewer.append(header, el('div', '', 'media-canvas')); document.body.append(viewer);
      viewer.querySelector('[data-media-action="2"]').onclick = () => viewer.close();
      viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    }
    const canvas = viewer.querySelector('.media-canvas'); canvas.replaceChildren();
    const copy = img.cloneNode(); copy.removeAttribute('loading'); copy.removeAttribute('srcset'); copy.removeAttribute('sizes'); canvas.append(copy);
    viewer.querySelector('strong').textContent = img.alt || 'Article diagram';
    const readable = () => { copy.style.width = `${Math.max(img.naturalWidth || Number(img.width), (img.naturalWidth || Number(img.width)) * 16 / Math.max(1,minimumFont))}px`; };
    viewer.querySelector('[data-media-action="0"]').onclick = () => { copy.style.width = '100%'; };
    viewer.querySelector('[data-media-action="1"]').onclick = readable;
    copy.onload = readable; readable(); viewer.showModal(); viewer.querySelector('[data-media-action="2"]').focus();
  };
  const figures = [...document.querySelectorAll('.article-visual')];
  figures.forEach(figure => {
    const img = figure.querySelector('img'); if (!img) return;
    if(img.getAttribute('width') && img.getAttribute('height')) img.style.aspectRatio=`${img.getAttribute('width')} / ${img.getAttribute('height')}`;
    let minFont = 16;
    const actions = el('div', '', 'figure-actions');
    const zoom = el('button', 'View readable diagram'); zoom.type = 'button'; zoom.onclick = () => view(img, minFont);
    actions.append(zoom); figure.append(actions);
    img.style.cursor = 'zoom-in'; img.addEventListener('click', () => view(img,minFont));
    if (!new URL(img.src).pathname.endsWith('.svg')) return;
    // Load a text alternative only when the figure is close to the viewport.
    const load = async () => {
      try {
        const response = await fetch(img.src); if (!response.ok) return;
        const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const nodes = [...svg.querySelectorAll('text')];
        const sizes = nodes.map(n => Number(n.getAttribute('font-size'))).filter(n => n > 0);
        svg.querySelectorAll('style').forEach(style=>{for(const match of style.textContent.matchAll(/font-size\s*:\s*([\d.]+)px/g))sizes.push(Number(match[1]));});
        if (sizes.length) minFont = Math.min(...sizes);
        const texts = [...new Set(nodes.map(n => n.textContent.trim()).filter(Boolean))];
        if (!texts.length) return;
        const details = el('details', '', 'figure-transcript'); details.append(el('summary', 'Read diagram text'));
        texts.forEach(text => details.append(el('p', text))); figure.append(details);
      } catch { /* The image and full-size viewer still work if text is unavailable. */ }
    };
    if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); load(); } },{rootMargin:'400px'}); observer.observe(figure); } else load();
  });
  document.querySelectorAll('.has-table-tools').forEach(shell => {
    shell.tabIndex = 0; shell.setAttribute('role','region'); shell.setAttribute('aria-label', shell.querySelector('table')?.getAttribute('aria-label') || 'Scrollable article table');
    const hint = el('p','Swipe or scroll horizontally to view all columns.','table-scroll-hint'); shell.before(hint);
    const update = () => { const overflow = shell.scrollWidth > shell.clientWidth + 2; hint.hidden = !overflow; shell.dataset.overflow = String(overflow); };
    new ResizeObserver(update).observe(shell); update();
  });
  document.querySelectorAll('.article-body pre').forEach(pre => {
    const code = pre.querySelector('code') || pre;
    const text = code.textContent;
    const fragment = document.createDocumentFragment();
    text.split(/(^(?:ROLE|TASK|DECISION\/TASK|CONTEXT|INPUTS?|METHOD|CONSTRAINTS|OUTPUT(?: FORMAT)?|VERIFICATION)\s*$)/gm).forEach(part => {
      fragment.append(/^(?:ROLE|TASK|DECISION\/TASK|CONTEXT|INPUTS?|METHOD|CONSTRAINTS|OUTPUT(?: FORMAT)?|VERIFICATION)\s*$/.test(part) ? el('span',part,'prompt-label') : document.createTextNode(part));
    });
    code.replaceChildren(fragment);
  });
  const body = document.querySelector('.article-body');
  const headings = body ? [...body.querySelectorAll('h2[id]')].filter(h => !h.closest('.article-read-time-card') && !/estimated article reading time/i.test(h.textContent)) : [];
  headings.forEach((heading,index) => {
    const content = []; let next = heading.nextElementSibling;
    while (next && next.tagName !== 'H2') { content.push(next); next = next.nextElementSibling; }
    const prose = content.filter(n => n.matches('p,ul,ol'));
    const words = prose.map(n=>n.textContent).join(' ').trim().split(/\s+/).length;
    if (words < 60) return;
    heading.after(el('small',`${Math.max(1,Math.ceil(words/225))} min · section ${index+1} of ${headings.length}`,'section-reading-time'));
    const paragraph = [...prose].reverse().find(n => n.matches('p') && n.textContent.length > 60 && n.textContent.length < 2000);
    if (paragraph) {
      const sentences = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('en',{granularity:'sentence'}).segment(paragraph.textContent)].map(s=>s.segment) : paragraph.textContent.match(/[^.!?]+[.!?]+(?:\s|$)/g);
      const quote = sentences?.filter(s=>s.trim().length>30 && s.length<500).at(-1)?.trim();
      if (quote) { const checkpoint = el('details','','section-checkpoint'); checkpoint.append(el('summary','Key takeaway · passage from this section'),el('p',quote)); (content.at(-1)||heading).after(checkpoint); }
    }
  });
  document.querySelectorAll('.toc-group').forEach(group => {
    const first = group.querySelector('a'); const summary = group.querySelector('summary');
    if (first && summary) { const label = first.textContent.replace(/^\d+\s*/, '').trim(); summary.textContent += ` · ${label}`; }
  });

  // Reusable searchable resource and visual collections.
  function filterCollection(grid, items, classify) {
    const form = el('div','','library-filter');
    const searchLabel = el('label','Search this collection'); const search = el('input'); search.type = 'search'; search.placeholder = 'Search titles and descriptions'; searchLabel.append(search);
    const typeLabel = el('label','Type or topic'); const select = el('select'); select.append(new Option('All',''));
    const types = [...new Set(items.map(classify))].sort(); types.forEach(type => select.append(new Option(type,type))); typeLabel.append(select);
    const status = el('p','','library-status'); status.setAttribute('aria-live','polite'); form.append(searchLabel,typeLabel,status); grid.before(form);
    let limit = grid.classList.contains('visual-grid') ? 24 : Infinity;
    const more = el('button','Show more diagrams'); more.type='button'; more.className='library-more'; grid.after(more);
    const update = () => { let matches = 0; let visible = 0; items.forEach(item => { const match = item.textContent.toLowerCase().includes(search.value.toLowerCase()) && (!select.value || classify(item) === select.value); if(match)matches++; item.hidden = !match || matches > limit; if(!item.hidden)visible++; }); status.textContent = matches ? `Showing ${visible} of ${matches} results` : 'No matches. Try another search or choose All.'; more.hidden=visible>=matches; };
    const reset = () => {limit=grid.classList.contains('visual-grid')?24:Infinity;update();};
    more.onclick=()=>{limit+=24;update();}; search.addEventListener('input', reset); select.addEventListener('change',reset); update();
  }
  const resources = document.querySelector('.resource-grid');
  if (resources) filterCollection(resources,[...resources.children],card => { const title=card.querySelector('h2')?.textContent||''; return /\bCV\b/.test(title) ? 'CV' : /credentials/i.test(title) ? 'Credentials' : /workbook/i.test(card.textContent) ? 'Workbook' : /diagram/i.test(card.textContent) ? 'Diagram' : 'Interactive tool'; });
  const visualGrid = document.querySelector('.visual-grid');
  if (visualGrid) filterCollection(visualGrid,[...visualGrid.children],card => card.dataset.topic);
  const artifacts = document.querySelector('.artifact-grid');
  if (artifacts) {
    const details = el('details','','artifact-controls'); details.append(el('summary','View chapter files'));
    artifacts.before(details); details.append(artifacts);
    const primary = el('div','','artifact-primary'); const workbook = artifacts.querySelector('a[href$=".xlsx"]');
    if (workbook) primary.append(workbook.cloneNode(true));
    const bundle = el('a','Download complete evidence bundle'); bundle.href='/resources/amsterdam-product-discovery/evidence-library.zip'; bundle.download=''; primary.append(bundle); details.before(primary);
    filterCollection(artifacts,[...artifacts.children],card => { const href = card.getAttribute('href') || ''; const match=href.match(/article(\d+)/); return match ? `Article ${match[1]}` : 'Research foundations'; });
  }
})();
