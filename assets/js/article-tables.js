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
    const filename = `${document.body.querySelector('[data-article-slug]')?.dataset.articleSlug || 'article'}-table-${index + 1}.csv`;
    const toolbar = document.createElement('div');
    toolbar.className = 'article-table-toolbar';
    toolbar.innerHTML = `<strong>${title}</strong><div><button type="button" data-table-fullscreen>Full screen</button><button type="button" data-table-download>Download CSV</button></div>`;
    shell.before(toolbar);

    const dialog = document.createElement('dialog');
    dialog.className = 'article-table-dialog';
    dialog.setAttribute('aria-label', title);
    dialog.innerHTML = `<header><strong>${title}</strong><div><button type="button" data-dialog-download>Download CSV</button><button type="button" data-dialog-close>Close</button></div></header><div class="article-table-dialog-scroll"></div>`;
    dialog.querySelector('.article-table-dialog-scroll').appendChild(table.cloneNode(true));
    document.body.appendChild(dialog);

    toolbar.querySelector('[data-table-download]').addEventListener('click', () => downloadCsv(table, filename));
    dialog.querySelector('[data-dialog-download]').addEventListener('click', () => downloadCsv(table, filename));
    toolbar.querySelector('[data-table-fullscreen]').addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      dialog.querySelector('[data-dialog-close]').focus();
    });
    dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  });
})();
