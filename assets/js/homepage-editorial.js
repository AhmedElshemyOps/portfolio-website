(() => {
  const dialog = document.getElementById('travel-desk-details');
  let trigger;
  document.querySelectorAll('[data-travel-desk-open]').forEach(link => {
    link.addEventListener('click', event => {
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault(); trigger = link; dialog.showModal();
    });
  });
  document.querySelector('[data-travel-desk-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger?.focus());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
})();
(() => {
  const data = document.getElementById('homepage-article-data');
  const grid = document.getElementById('homepage-articles');
  const controls = document.querySelector('[data-article-controls]');
  if (!data || !grid || !controls) return;
  let articles;
  try { articles = JSON.parse(data.textContent); } catch (_) { return; }
  if (!Array.isArray(articles) || !articles.length) return;
  const selectionCount = Math.ceil(articles.length / 4);
  let selection = 0;
  function show(direction) {
    selection = (selection + direction + selectionCount) % selectionCount;
    const batch = Array.from({ length: Math.min(4, articles.length) }, (_, index) => articles[(selection * 4 + index) % articles.length]);
    grid.replaceChildren(...batch.map(item => {
      const link = document.createElement('a'); link.className = 'article'; link.href = item.url;
      const content = document.createElement('div');
      const topic = document.createElement('span'); topic.className = 'article-topic';
      topic.textContent = item.pillar.replace('Hotel & Serviced Apartment AI', 'AI for Hotel Apartments');
      const title = document.createElement('h3'); title.textContent = item.title;
      const description = document.createElement('p'); description.textContent = item.description;
      content.append(topic, title, description);
      const arrow = document.createElement('span'); arrow.className = 'direction'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      link.append(content, arrow); return link;
    }));
    controls.querySelector('[data-article-status]').textContent = 'Reading selection ' + (selection + 1) + '. ' + batch.length + ' article' + (batch.length === 1 ? '' : 's') + ' shown.';
  }
  controls.hidden = false;
  controls.querySelector('[data-article-prev]').addEventListener('click', () => show(-1));
  controls.querySelector('[data-article-next]').addEventListener('click', () => show(1));
})();
