/* Site-wide responsive table enhancer — v16 */
(() => {
  'use strict';

  const WRAPPER_SELECTOR = [
    '.site-table-shell', '.article-table-wrap', '.content-table-wrap',
    '.air-connectivity-table-wrap', '.table-scroll', '.scorecard-table-wrap',
    '.rfp-table-wrap', '.cluster-table-wrap', '.library-table', '.sky-table-wrap',
    '.table-wrap', '.import-preview-wrap'
  ].join(',');

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  function columnCount(table) {
    const rows = [...table.rows];
    return rows.reduce((max, row) => {
      const count = [...row.cells].reduce((sum, cell) => sum + Number(cell.colSpan || 1), 0);
      return Math.max(max, count);
    }, 0);
  }

  function headerLabels(table, columns) {
    const headRow = table.tHead?.rows?.[table.tHead.rows.length - 1];
    if (!headRow) return [];
    const labels = [];
    [...headRow.cells].forEach((cell) => {
      const label = clean(cell.textContent) || 'Details';
      const span = Number(cell.colSpan || 1);
      for (let i = 0; i < span; i += 1) labels.push(label);
      cell.setAttribute('scope', 'col');
    });
    return labels.slice(0, columns);
  }

  function accessibleName(table) {
    const caption = clean(table.caption?.textContent);
    if (caption) return caption;
    const heading = table.closest('section, article, main, div')?.querySelector('h2, h3, h4');
    return clean(heading?.textContent) || 'Data table';
  }

  function ensureWrapper(table) {
    let wrapper = table.parentElement?.closest(WRAPPER_SELECTOR);
    if (!wrapper || !wrapper.contains(table)) {
      wrapper = document.createElement('div');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    wrapper.classList.add('site-table-shell');
    if (!wrapper.hasAttribute('tabindex')) wrapper.tabIndex = 0;
    if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'region');
    if (!wrapper.hasAttribute('aria-label')) wrapper.setAttribute('aria-label', accessibleName(table));
    return wrapper;
  }

  function labelRows(table, labels) {
    if (!labels.length) return;
    [...table.tBodies, table.tFoot].filter(Boolean).forEach((section) => {
      [...section.rows].forEach((row) => {
        let index = 0;
        [...row.cells].forEach((cell) => {
          if (!cell.hasAttribute('data-label')) cell.setAttribute('data-label', labels[index] || 'Details');
          if (cell.tagName === 'TH' && !cell.hasAttribute('scope')) cell.setAttribute('scope', 'row');
          index += Number(cell.colSpan || 1);
        });
      });
    });
  }

  function enhance(table) {
    if (!(table instanceof HTMLTableElement)) return;
    const columns = columnCount(table);
    if (!columns) return;

    table.classList.add('site-responsive-table', `site-table--${Math.min(columns, 10)}`);
    const labels = headerLabels(table, columns);
    if (labels.length) {
      table.classList.add('site-table--stackable');
      if (columns >= 3) table.classList.add('site-table--stack-wide');
      if (columns === 2) table.classList.add('site-table--stack-phone');
      labelRows(table, labels);
    }
    ensureWrapper(table);
    table.dataset.tableEnhanced = 'v16';
  }

  function scan(root = document) {
    root.querySelectorAll?.('table:not([data-table-enhanced="v16"])').forEach(enhance);
    if (root.matches?.('table')) enhance(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
  } else {
    scan();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
      });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
