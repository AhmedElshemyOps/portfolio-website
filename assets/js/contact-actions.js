/* Copy public contact details; native email and phone links remain available. */
(() => {
  'use strict';
  const buttons = document.querySelectorAll('[data-contact-copy]');
  const status = document.querySelector('[data-contact-copy-status]');
  if (!navigator.clipboard?.writeText || !status) return;
  buttons.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const email = button.dataset.contactCopy === 'email';
      const link = document.querySelector('#contact a[href^="' + (email ? 'mailto:' : 'tel:') + '"]');
      const value = email ? link?.getAttribute('href').slice(7) : link?.textContent.trim();
      if (!value) return;
      try { await navigator.clipboard.writeText(value); status.textContent = email ? 'Email copied.' : 'Phone number copied.'; }
      catch (_) { status.textContent = 'Copy was unavailable. Select the contact detail above to copy it.'; }
    });
  });
})();
