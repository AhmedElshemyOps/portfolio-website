/* Accessible table controls shared by every generated article. */
'use strict';

(function setupArticleTables() {
  const tables = [...document.querySelectorAll('.article-body table')];
  if (!tables.length) return;

  const csvValue = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const tableCsv = (table) => [...table.rows]
    .map((row) => [...row.cells].map((cell) => csvValue(cell.textContent.trim())).join(','))
    .join('\n');
  const downloadCsv = (table, filename) => {
    const blob = new Blob([`\uFEFF${tableCsv(table)}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  // Build one viewer only when requested, rather than cloning every table on load.
  let viewer;
  let returnFocus;
  let activeDownload;
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const button = (label) => { const node = element('button', label); node.type = 'button'; return node; };
  const openViewer = (table, title, filename, trigger, index) => {
    if (!viewer) {
      const dialog = element('dialog', '', 'article-table-dialog');
      const header = element('header');
      const name = element('strong');
      const actions = element('div');
      const download = button('Download CSV');
      const close = button('Close');
      const hint = element('p', 'Scroll horizontally to read every column. Keyboard: focus the table, then use the arrow keys.', 'article-table-dialog-hint');
      const scroll = element('div', '', 'article-table-dialog-scroll');
      hint.id = 'article-table-viewer-hint';
      scroll.tabIndex = 0;
      scroll.setAttribute('role', 'region');
      scroll.setAttribute('aria-describedby', hint.id);
      actions.append(download, close); header.append(name, actions);
      dialog.append(header, hint, scroll); document.body.appendChild(dialog);
      download.addEventListener('click', () => activeDownload?.());
      const restoreFocus = () => { if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); };
      const dismiss = () => {
        if (typeof dialog.close === 'function') dialog.close();
        else { dialog.removeAttribute('open'); restoreFocus(); }
      };
      close.addEventListener('click', dismiss);
      dialog.addEventListener('close', restoreFocus);
      dialog.addEventListener('click', event => { if (event.target === dialog) dismiss(); });
      viewer = { dialog, name, scroll, close };
    }
    const copy = table.cloneNode(true);
    // Authored IDs/headers must stay unique while the original table remains present.
    const ids = new Map();
    [copy, ...copy.querySelectorAll('[id]')].forEach(node => {
      if (node.id) { const original = node.id; node.id = `table-viewer-${index}-${original}`; ids.set(original, node.id); }
    });
    [copy, ...copy.querySelectorAll('[headers],[aria-labelledby],[aria-describedby]')].forEach(node => {
      ['headers', 'aria-labelledby', 'aria-describedby'].forEach(attribute => {
        if (node.hasAttribute(attribute)) node.setAttribute(attribute, node.getAttribute(attribute).split(/\s+/).map(id => ids.get(id) || id).join(' '));
      });
    });
    viewer.name.textContent = title;
    viewer.dialog.setAttribute('aria-label', title);
    viewer.scroll.setAttribute('aria-label', title);
    viewer.scroll.replaceChildren(copy);
    viewer.scroll.scrollTop = 0;
    viewer.scroll.scrollLeft = 0;
    returnFocus = trigger;
    activeDownload = () => downloadCsv(table, filename);
    if (typeof viewer.dialog.showModal === 'function') viewer.dialog.showModal(); else viewer.dialog.setAttribute('open', '');
    viewer.close.focus();
  };

  tables.forEach((table, index) => {
    if (table.dataset.enhancedTable === 'true') return;
    table.dataset.enhancedTable = 'true';
    const headers = [...table.querySelectorAll('thead th, tr:first-child th')];
    headers.forEach((header) => { if (!header.hasAttribute('scope')) header.scope = 'col'; });
    const columns = Math.max(headers.length, ...[...table.rows].map((row) => row.cells.length));
    table.classList.add(columns <= 2 ? 'article-table-simple' : 'article-table-wide');
    [...table.tBodies].flatMap((body) => [...body.rows]).forEach((row) => [...row.cells].forEach((cell, cellIndex) => {
      if (headers[cellIndex]) cell.dataset.label = headers[cellIndex].textContent.trim();
    }));

    let shell = table.parentElement;
    if (!shell?.matches('.article-table-wrap, [class*="-table-wrap"], .site-table-shell')) {
      shell = document.createElement('div');
      shell.className = 'article-table-wrap article-table-enhanced';
      table.before(shell);
      shell.appendChild(table);
    }
    shell.classList.add('has-table-tools');
    const title = table.caption?.textContent.trim() || `Article table ${index + 1}`;
    if (!table.hasAttribute('aria-label')) table.setAttribute('aria-label', title);
    shell.tabIndex = 0;
    shell.setAttribute('role', 'region');
    shell.setAttribute('aria-label', title);
    const filename = `${document.body.querySelector('[data-article-slug]')?.dataset.articleSlug || 'article'}-table-${index + 1}.csv`;
    const toolbar = document.createElement('div');
    toolbar.className = 'article-table-toolbar';
    const fullScreen = button('Full screen'); fullScreen.setAttribute('data-table-fullscreen', '');
    const download = button('Download CSV'); download.setAttribute('data-table-download', '');
    const actions = element('div'); actions.append(fullScreen, download);
    toolbar.append(element('strong', title), actions);
    shell.before(toolbar);
    download.addEventListener('click', () => downloadCsv(table, filename));
    fullScreen.addEventListener('click', () => openViewer(table, title, filename, fullScreen, index));
  });
})();
