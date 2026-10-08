/* Keep both planning workspaces available without JavaScript; preserve existing deep links. */
(() => {
  'use strict';
  document.querySelectorAll('.demo-product-picker a').forEach(link => link.addEventListener('click', () => {
    link.closest('details').open = false;
  }));
  const panels = [...document.querySelectorAll('[data-country-panel]')];
  const buttons = [...document.querySelectorAll('[data-country-select]')];
  if (!panels.length || !buttons.length) return;
  const note = document.querySelector('[data-country-note]');
  function select(country, updateAddress = false) {
    if (!panels.some(panel => panel.dataset.countryPanel === country)) return;
    panels.forEach(panel => { panel.hidden = panel.dataset.countryPanel !== country; });
    window.dispatchEvent(new CustomEvent('planningcountrychange', { detail: { country } }));
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.countrySelect === country)));
    if (note) note.textContent = country === 'netherlands'
      ? 'Netherlands workspace · Amsterdam and other Dutch locations.'
      : 'Original UAE workspace · Abu Dhabi and regional operating scenarios.';
    if (updateAddress) {
      // Use established section fragments; paths, queries and canonical addresses stay unchanged.
      const address = new URL(window.location.href);
      address.hash = country === 'netherlands' ? 'netherlands' : 'planner';
      window.history.replaceState(window.history.state, '', address);
    }
  }
  function reveal(target) {
    const panel = target?.closest('[data-country-panel]');
    if (panel) select(panel.dataset.countryPanel);
  }
  function hashTarget(hash) {
    try { return document.getElementById(decodeURIComponent(hash.replace(/^#/, ''))); }
    catch (_) { return null; }
  }
  select('netherlands');
  reveal(hashTarget(window.location.hash));
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.countrySelect, true)));
  // Reveal before existing anchor handlers try to scroll to a hidden planner.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const address = new URL(link.href, window.location.href);
    if (address.origin === window.location.origin && address.pathname === window.location.pathname && address.search === window.location.search)
      reveal(hashTarget(address.hash));
  }, true);
  window.addEventListener('hashchange', () => reveal(hashTarget(window.location.hash)));
})();
