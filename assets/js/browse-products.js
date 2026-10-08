/* Native disclosures work without JavaScript; deep links and invalid fields stay reachable. */
(() => {
  'use strict';
  function reveal(target) {
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }
  function revealHash() {
    try { reveal(document.getElementById(decodeURIComponent(location.hash.slice(1)))); }
    catch (_) { /* An invalid fragment must not break browsing. */ }
  }
  revealHash();
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const address = new URL(link.href, location.href);
    if (address.origin === location.origin && address.pathname === location.pathname && address.hash) {
      try { reveal(document.getElementById(decodeURIComponent(address.hash.slice(1)))); } catch (_) {}
    }
  }, true);
  document.addEventListener('invalid', event => reveal(event.target), true);
  document.querySelectorAll('[data-knowledge-query]').forEach(field => field.addEventListener('keydown', event => {
    if (event.key === 'Enter') document.querySelector('.search-results-link')?.click();
  }));
  const disclosure = document.querySelector('.library-filter-disclosure');
  if (disclosure && new URLSearchParams(location.search).has('series')) disclosure.open = true;
  if (disclosure && new URLSearchParams(location.search).has('type')) disclosure.open = true;
})();
