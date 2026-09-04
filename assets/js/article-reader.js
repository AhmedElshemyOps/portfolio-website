/* Accessible reading controls shared by every generated editorial article. */
'use strict';

(function setupArticleReader() {
  const article = document.getElementById('article');
  if (!article) return;

  const body = document.body;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileToc = window.matchMedia('(max-width: 900px)');
  const control = document.querySelector('[data-back-to-top]');
  const progressBar = document.querySelector('[data-article-progress]');
  const toc = document.querySelector('[data-reader-toc]');
  const resume = document.querySelector('[data-reader-resume]');
  const storageKey = `ahmed-reader:${window.location.pathname}`;
  const preferenceKey = 'ahmed-reader-preferences';
  let ticking = false;
  let saveTimer = 0;

  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_error) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (_error) { /* Optional enhancement. */ } },
    remove(key) { try { window.localStorage.removeItem(key); } catch (_error) { /* Optional enhancement. */ } },
  };
  const analytics = (name, parameters = {}) => window.AhmedAnalytics?.event(name, parameters);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const savedPreferences = (() => {
    try { return JSON.parse(storage.get(preferenceKey) || '{}'); } catch (_error) { return {}; }
  })();
  let readerScale = clamp(Number(savedPreferences.scale) || 1, .9, 1.25);
  let highContrast = savedPreferences.contrast === true;
  let darkReading = savedPreferences.dark === true;

  function savePreferences() {
    storage.set(preferenceKey, JSON.stringify({ scale: readerScale, contrast: highContrast, dark: darkReading }));
  }

  function applyPreferences() {
    root.style.setProperty('--reader-scale', readerScale);
    body.classList.toggle('reader-high-contrast', highContrast);
    body.classList.toggle('reader-dark', darkReading);
    const contrastButton = document.querySelector('[data-reader-contrast]');
    const themeButton = document.querySelector('[data-reader-theme]');
    contrastButton?.setAttribute('aria-pressed', String(highContrast));
    themeButton?.setAttribute('aria-pressed', String(darkReading));
    if (contrastButton) contrastButton.textContent = highContrast ? 'Standard contrast' : 'High contrast';
    if (themeButton) themeButton.textContent = darkReading ? 'Light reading' : 'Dark reading';
  }
  applyPreferences();
  analytics('article_opened', { article_path: window.location.pathname });

  document.querySelectorAll('[data-reader-font]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.readerFont;
      readerScale = action === 'increase' ? clamp(readerScale + .1, .9, 1.25) : action === 'decrease' ? clamp(readerScale - .1, .9, 1.25) : 1;
      applyPreferences();
      savePreferences();
      analytics('reader_text_size', { reader_scale: readerScale });
    });
  });
  document.querySelector('[data-reader-contrast]')?.addEventListener('click', () => {
    highContrast = !highContrast;
    applyPreferences();
    savePreferences();
    analytics('reader_contrast', { enabled: highContrast });
  });
  document.querySelector('[data-reader-theme]')?.addEventListener('click', () => {
    darkReading = !darkReading;
    applyPreferences();
    savePreferences();
    analytics('reader_theme', { theme: darkReading ? 'dark' : 'light' });
  });

  function updateTocMode() { if (toc) toc.open = !mobileToc.matches; }
  updateTocMode();
  mobileToc.addEventListener?.('change', updateTocMode);

  const headings = [...document.querySelectorAll('.article-body h2[id]')].filter((heading) => !heading.closest('.article-read-time-card') && !/estimated article reading time/i.test(heading.textContent || ''));
  const tocLinks = [...document.querySelectorAll('[data-toc-link]')];
  const sectionMap = document.createElement('nav');
  sectionMap.className = 'article-section-map';
  sectionMap.setAttribute('aria-label', 'Article section navigation');
  sectionMap.innerHTML = `<button class="article-section-map-toggle" type="button" aria-expanded="false"><span>Section</span><strong data-section-current>1</strong><span>of ${headings.length}</span><b>Sections</b></button><div class="article-section-map-panel" hidden></div>`;
  const sectionToggle = sectionMap.querySelector('.article-section-map-toggle');
  const sectionPanel = sectionMap.querySelector('.article-section-map-panel');
  const sectionCurrent = sectionMap.querySelector('[data-section-current]');
  const sectionButtons = headings.map((heading, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><b>${heading.textContent?.replace('#', '').trim() || `Article section ${index + 1}`}</b>`;
    button.addEventListener('click', () => {
      heading.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => heading.querySelector('.heading-anchor')?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 500);
      sectionPanel.hidden = true;
      sectionToggle.setAttribute('aria-expanded', 'false');
    });
    sectionPanel.appendChild(button);
    return button;
  });
  sectionToggle?.addEventListener('click', () => {
    const open = sectionPanel.hidden;
    sectionPanel.hidden = !open;
    sectionToggle.setAttribute('aria-expanded', String(open));
  });
  if (sectionButtons.length > 1) document.body.appendChild(sectionMap);
  if ('IntersectionObserver' in window && headings.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      sectionButtons.forEach((button, index) => {
        const active = headings[index] === visible.target;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current');
        if (active && sectionCurrent) sectionCurrent.textContent = String(index + 1);
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
  }

  headings.forEach((heading) => {
    if (!/how to|steps|process|workflow|roadmap|checklist|implementation|method/i.test(heading.textContent || '')) return;
    let sibling = heading.nextElementSibling;
    while (sibling && sibling.tagName !== 'H2') {
      if (sibling.tagName === 'OL' && sibling.children.length >= 3 && sibling.children.length <= 12) {
        sibling.classList.add('article-step-sequence');
        [...sibling.children].forEach((item, index) => item.style.setProperty('--step-number', `'${String(index + 1).padStart(2, '0')}'`));
        break;
      }
      sibling = sibling.nextElementSibling;
    }
  });

  function savePosition() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      storage.set(storageKey, JSON.stringify({ y: Math.round(window.scrollY), ratio: window.scrollY / maximum, savedAt: Date.now() }));
    }, 250);
  }
  function updateProgress() {
    const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const readingColumn = document.querySelector('.article-reading-column') || article;
    const readingStart = readingColumn.getBoundingClientRect().top + window.scrollY;
    const readingEnd = readingStart + readingColumn.offsetHeight - window.innerHeight;
    const progress = clamp((window.scrollY - readingStart) / Math.max(1, readingEnd - readingStart), 0, 1);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (control) {
      control.style.setProperty('--reader-progress', `${progress * 360}deg`);
      control.classList.toggle('is-visible', window.scrollY > Math.min(700, window.innerHeight * .72));
    }
    savePosition();
    ticking = false;
  }
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }
  control?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    window.setTimeout(() => article.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 550);
    analytics('article_back_to_top');
  });

  const savedPosition = (() => {
    try { return JSON.parse(storage.get(storageKey) || 'null'); } catch (_error) { return null; }
  })();
  if (resume && savedPosition?.y > 700 && savedPosition.ratio < .92) resume.hidden = false;
  document.querySelector('[data-reader-resume-action]')?.addEventListener('click', () => {
    window.scrollTo({ top: savedPosition.y, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    resume.hidden = true;
    analytics('reader_resume', { saved_ratio: Math.round(savedPosition.ratio * 100) });
  });
  document.querySelector('[data-reader-resume-dismiss]')?.addEventListener('click', () => {
    storage.remove(storageKey);
    resume.hidden = true;
  });

  const searchDialog = document.querySelector('[data-article-search]');
  const searchInput = document.querySelector('[data-article-search-input]');
  const searchResults = document.querySelector('[data-article-search-results]');
  const searchStatus = document.querySelector('[data-article-search-status]');
  const searchData = (() => {
    try { return JSON.parse(document.getElementById('article-search-data')?.textContent || '[]'); } catch (_error) { return []; }
  })();
  function renderSearch(query = '') {
    if (!searchResults || !searchStatus) return;
    const needle = query.trim().toLowerCase();
    searchResults.replaceChildren();
    if (needle.length < 2) {
      searchStatus.textContent = `Enter at least two characters to search ${searchData.length} original articles.`;
      return;
    }
    const matches = searchData.filter((item) => `${item.title} ${item.category} ${item.summary}`.toLowerCase().includes(needle)).slice(0, 8);
    searchStatus.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} shown for “${query.trim()}”.`;
    matches.forEach((item) => {
      const link = document.createElement('a');
      link.href = `/articles/${item.slug}/index.html`;
      const meta = document.createElement('small');
      meta.textContent = item.category;
      const title = document.createElement('strong');
      title.textContent = item.title;
      const summary = document.createElement('span');
      summary.textContent = item.summary;
      link.append(meta, title, summary);
      searchResults.appendChild(link);
    });
  }
  document.querySelector('[data-article-search-open]')?.addEventListener('click', () => {
    if (!searchDialog) return;
    if (typeof searchDialog.showModal === 'function') searchDialog.showModal(); else searchDialog.setAttribute('open', '');
    window.setTimeout(() => searchInput?.focus(), 0);
    analytics('article_search_open');
  });
  document.querySelector('[data-article-search-close]')?.addEventListener('click', () => searchDialog?.close());
  searchDialog?.addEventListener('click', (event) => { if (event.target === searchDialog) searchDialog.close(); });
  searchInput?.addEventListener('input', () => renderSearch(searchInput.value));

  document.querySelectorAll('.heading-anchor').forEach((anchor) => anchor.addEventListener('click', () => analytics('article_heading_link', { heading_id: anchor.getAttribute('href')?.slice(1) || '' })));
  document.querySelectorAll('.article-related-card').forEach((card) => card.addEventListener('click', () => analytics('related_article_click')));

  const completionButton = document.querySelector('[data-article-mark-complete]');
  if (completionButton) {
    const learningStorageKey = 'ahmed-learning-progress-v1';
    const learningPath = completionButton.dataset.learningPath;
    const articleSlug = document.querySelector('[data-article-slug]')?.dataset.articleSlug;
    const readLearningState = () => { try { return JSON.parse(storage.get(learningStorageKey) || '{}'); } catch (_error) { return {}; } };
    const renderCompletion = () => {
      const state = readLearningState();
      const complete = new Set(Array.isArray(state[learningPath]) ? state[learningPath] : []);
      const done = complete.has(articleSlug);
      completionButton.setAttribute('aria-pressed', String(done));
      completionButton.textContent = done ? 'Completed in this learning path' : `Mark this article complete in ${completionButton.textContent.replace(/^Mark this article complete in\s*/i, '')}`;
    };
    completionButton.addEventListener('click', () => {
      const state = readLearningState();
      const complete = new Set(Array.isArray(state[learningPath]) ? state[learningPath] : []);
      if (complete.has(articleSlug)) complete.delete(articleSlug); else complete.add(articleSlug);
      state[learningPath] = [...complete];
      storage.set(learningStorageKey, JSON.stringify(state));
      completionButton.setAttribute('aria-pressed', String(complete.has(articleSlug)));
      completionButton.textContent = complete.has(articleSlug) ? 'Completed in this learning path' : 'Mark this article complete';
      analytics('learning_step_updated', { learning_path: learningPath, step_slug: articleSlug, completed: complete.has(articleSlug) });
    });
    renderCompletion();
  }

  const feedbackPanel = document.querySelector('[data-article-feedback]');
  if (feedbackPanel) {
    const articleSlug = feedbackPanel.dataset.articleSlug || window.location.pathname;
    const articleTitle = feedbackPanel.dataset.articleTitle || document.title;
    const feedbackKey = `ahmed-article-feedback-v1:${articleSlug}`;
    const feedbackButtons = [...feedbackPanel.querySelectorAll('[data-feedback-value]')];
    const reasonPanel = feedbackPanel.querySelector('[data-feedback-reasons]');
    const reasonButtons = [...feedbackPanel.querySelectorAll('[data-feedback-reason]')];
    const feedbackStatus = feedbackPanel.querySelector('[data-feedback-status]');
    const shareStatus = feedbackPanel.querySelector('[data-share-status]');
    const nativeShare = feedbackPanel.querySelector('[data-share="native"]');
    const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split('#')[0];

    const readFeedback = () => {
      try { return JSON.parse(storage.get(feedbackKey) || '{}'); } catch (_error) { return {}; }
    };
    const renderFeedback = (state = readFeedback()) => {
      feedbackButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.feedbackValue === state.value)));
      reasonButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.feedbackReason === state.reason)));
      if (reasonPanel) reasonPanel.hidden = !state.value;
      if (feedbackStatus) feedbackStatus.textContent = state.value ? 'Thank you. Your response has been saved on this device.' : '';
    };
    feedbackButtons.forEach((button) => button.addEventListener('click', () => {
      const state = { value: button.dataset.feedbackValue, reason: '', savedAt: new Date().toISOString() };
      storage.set(feedbackKey, JSON.stringify(state));
      renderFeedback(state);
      reasonPanel?.querySelector('button')?.focus();
      analytics('article_helpfulness_submitted', { article_slug: articleSlug, helpfulness: state.value });
    }));
    reasonButtons.forEach((button) => button.addEventListener('click', () => {
      const state = { ...readFeedback(), reason: button.dataset.feedbackReason, savedAt: new Date().toISOString() };
      storage.set(feedbackKey, JSON.stringify(state));
      renderFeedback(state);
      if (feedbackStatus) feedbackStatus.textContent = 'Thank you. Your response and optional reason have been saved on this device.';
      analytics('article_feedback_reason', { article_slug: articleSlug, reason: state.reason, helpfulness: state.value || 'unknown' });
    }));
    renderFeedback();

    if (nativeShare && typeof navigator.share === 'function') nativeShare.hidden = false;
    const shareTargets = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${canonical}`)}`,
      email: `mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(`I thought you might find this useful: ${canonical}`)}`,
    };
    const copyUrl = async () => {
      try {
        await navigator.clipboard.writeText(canonical);
      } catch (_error) {
        const input = document.createElement('textarea');
        input.value = canonical;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      if (shareStatus) shareStatus.textContent = 'Article URL copied.';
      analytics('article_url_copied', { article_slug: articleSlug });
    };
    feedbackPanel.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', async () => {
      const platform = button.dataset.share;
      if (platform === 'copy') return copyUrl();
      if (platform === 'native' && typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: articleTitle, text: articleTitle, url: canonical });
          if (shareStatus) shareStatus.textContent = 'Share options opened.';
          analytics('article_shared', { article_slug: articleSlug, platform: 'native' });
        } catch (error) {
          if (error?.name !== 'AbortError' && shareStatus) shareStatus.textContent = 'Sharing was not completed. You can copy the URL instead.';
        }
        return;
      }
      const target = shareTargets[platform];
      if (!target) return;
      if (platform === 'email') window.location.href = target;
      else window.open(target, '_blank', 'noopener,noreferrer,width=720,height=640');
      if (shareStatus) shareStatus.textContent = `${platform.charAt(0).toUpperCase()}${platform.slice(1)} sharing opened.`;
      analytics('article_shared', { article_slug: articleSlug, platform });
    }));
  }

  updateProgress();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('pagehide', savePosition);
})();
