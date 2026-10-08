/* Progressive enhancement: links remain available when JavaScript is disabled. */
(() => {
  'use strict';
  const header = document.querySelector('.masthead');
  const nav = header?.querySelector('[aria-label="Primary navigation"]');
  const toggle = header?.querySelector('[data-navigation-toggle]');
  if (!nav || !toggle) return;

  const narrowScreen = window.matchMedia('(max-width: 760px)');
  const icon = toggle.querySelector('[data-menu-icon]');
  const label = toggle.querySelector('[data-menu-label]');
  toggle.hidden = false;
  header.setAttribute('data-navigation-ready', '');

  function setOpen(open, restoreFocus = false) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    icon.textContent = open ? '×' : '☰';
    label.textContent = open ? 'Close' : 'Menu';
    if (open) nav.querySelector('a, button')?.focus();
    else if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
    else if (event.target.closest('[data-global-search-open]')) setOpen(false, narrowScreen.matches);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) && nav.classList.contains('is-open')) setOpen(false);
  });
  narrowScreen.addEventListener('change', () => setOpen(false));
})();
