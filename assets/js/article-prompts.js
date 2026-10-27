/* PremiumAIPromptToolkit: progressive enhancement, no prompt-data persistence. */
(function (global, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (global && global.document) { global.PremiumAIPromptToolkit = api; api.mount(global.document, global); }
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const CHATGPT_URL = 'https://chatgpt.com/';
  const EVENTS = new Set(['ai_prompt_view','ai_prompt_copy','ai_prompt_share','ai_prompt_chatgpt_open','ai_prompt_customize','ai_prompt_reset']);
  function resolveTemplate(template, variables, values, active, validate = true) {
    if (!active) return template;
    const replacements = new Map(); const missing = [];
    variables.forEach(variable => {
      const value = String(values[variable.key] ?? variable.defaultValue ?? '');
      if (value.length > 12000) throw new Error('Keep each input under 12,000 characters.');
      if (variable.required && !value.trim()) missing.push(variable.key);
      if (replacements.has(variable.placeholder)) throw new Error('Ambiguous prompt variable.');
      if (template.split(variable.placeholder).length !== 2) throw new Error('Prompt variable must identify exactly one original placeholder.');
      replacements.set(variable.placeholder, value.trim() ? value : variable.placeholder);
    });
    if (validate && missing.length) {
      const error = new Error('Complete the required inputs, or turn off “Use my inputs” to copy the original template.');
      error.missing = missing; throw error;
    }
    // One pass: replacement text is never interpreted or substituted again.
    return template.replace(/\[[^\[\]\n]+\]/g, token => replacements.get(token) ?? token);
  }
  async function copyText(text, env) {
    if (!text || !text.trim()) throw new Error('The complete prompt is unavailable.');
    if (env.navigator?.clipboard?.writeText && env.isSecureContext !== false) {
      try { await env.navigator.clipboard.writeText(text); return; } catch (_) { /* Try the legacy browser fallback. */ }
    }
    const doc = env.document;
    if (!doc?.createElement || typeof doc.execCommand !== 'function') throw new Error('Copy was blocked. Select the complete prompt and copy it manually.');
    const field = doc.createElement('textarea'); const focus = doc.activeElement;
    field.value = text; field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0';
    try {
      doc.body.appendChild(field); field.select();
      if (!doc.execCommand('copy')) throw new Error('Copy was blocked. Select the complete prompt and copy it manually.');
    } finally { field.remove(); focus?.focus?.({ preventScroll: true }); }
  }
  function shareUrl(canonical, targetId) {
    const url = new URL(canonical);
    if (!/^https?:$/.test(url.protocol) || !targetId) throw new Error('The original prompt link is unavailable.');
    url.search = ''; url.hash = targetId; return url.href;
  }
  async function sharePrompt(title, url, env) {
    if (typeof env.navigator?.share === 'function') {
      try { await env.navigator.share({ title, url }); return 'native'; }
      catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
    }
    await copyText(url, env); return 'link_copied';
  }
  async function openChatGPT(text, env) {
    await copyText(text, env);
    let initiated = false;
    try { if (typeof env.open === 'function') { env.open(CHATGPT_URL, '_blank', 'noopener,noreferrer'); initiated = true; } } catch (_) { /* The explicit external link remains available. */ }
    return { copied: true, initiated };
  }
  function track(name, metadata, adapter, interaction) {
    if (!EVENTS.has(name) || typeof adapter?.event !== 'function') return;
    // An explicit allowlist: never forward inputs, prompt text or clipboard data.
    const payload = { prompt_id: metadata.id, prompt_category: metadata.category, article_id: metadata.articleId, prompt_version: metadata.version };
    if (['native','link_copied','initiated'].includes(interaction)) payload.interaction_type = interaction;
    adapter.event(name, payload); // Existing adapter owns consent and production-host gating.
  }
  function mount(doc, env) {
    const roots = [...doc.querySelectorAll('[data-ai-toolkit]')];
    roots.forEach(root => {
      if (root.dataset.aiReady === 'true') return;
      const originalRegion = root.querySelector('[data-ai-source]');
      const originalNode = originalRegion?.querySelector('pre');
      const template = originalNode?.textContent.trim();
      const status = root.querySelector('[data-copy-status],.copy-status,.article-copy-status');
      const output = root.querySelector('[data-ai-preview]');
      const enabled = root.querySelector('[data-ai-customize]');
      const fields = [...root.querySelectorAll('[data-ai-variable]')];
      const fieldRegion = root.querySelector('[data-ai-fields]');
      const buttons = [...root.querySelectorAll('[data-ai-action]')];
      if (!template || !status || !output) return;
      root.dataset.aiReady = 'true';
      const metadata = { id: root.dataset.aiPromptId, category: root.dataset.aiCategory, articleId: root.dataset.aiArticle, version: root.dataset.aiVersion };
      const title = root.querySelector('.ai-toolkit-intro strong')?.textContent || doc.title;
      const canonical = doc.querySelector('link[rel="canonical"]')?.href || env.location.href;
      const variables = fields.map(field => ({ key: field.dataset.aiVariable, placeholder: field.dataset.aiPlaceholder, required: field.dataset.aiRequired === 'true', defaultValue: '' }));
      let busy = false; let customized = false;
      buttons.forEach(button => { button.disabled = false; });
      const values = () => Object.fromEntries(fields.map(field => [field.dataset.aiVariable, field.value]));
      const resolve = (validate = true) => resolveTemplate(template, variables, values(), Boolean(enabled?.checked), validate);
      function refresh() {
        const active = Boolean(enabled?.checked);
        if (fieldRegion) fieldRegion.hidden = !active;
        fields.forEach(field => { field.disabled = !active; field.removeAttribute('aria-invalid'); });
        originalRegion.hidden = active; output.hidden = !active;
        if (active) output.textContent = resolve(false);
      }
      function reset() {
        if (enabled) enabled.checked = false;
        fields.forEach(field => { field.value = ''; });
        customized = false; refresh(); status.textContent = 'Original prompt restored. Your inputs have been cleared.';
        track('ai_prompt_reset', metadata, env.AhmedAnalytics);
      }
      root.addEventListener('input', event => {
        if (!event.target.matches('[data-ai-variable]')) return;
        try { refresh(); } catch (error) { status.textContent = error.message; }
        if (!customized) { customized = true; track('ai_prompt_customize', metadata, env.AhmedAnalytics); }
      });
      enabled?.addEventListener('change', () => { refresh(); status.textContent = enabled.checked ? 'Fill the required inputs below. Your original prompt remains available when customization is turned off.' : 'Using the original prompt template.'; });
      root.addEventListener('click', async event => {
        const button = event.target.closest('[data-ai-action]');
        if (!button || button.closest('[data-ai-toolkit]') !== root || busy) return;
        const action = button.dataset.aiAction;
        if (action === 'reset') { reset(); return; }
        busy = true; root.setAttribute('aria-busy','true'); buttons.forEach(b => { b.disabled = true; });
        try {
          if (action === 'share') {
            const result = await sharePrompt(title, shareUrl(canonical, root.dataset.aiTarget), env);
            status.textContent = result === 'cancelled' ? 'Sharing cancelled. Nothing was copied or shared by this page.' : result === 'native' ? 'The share service completed its handoff for the original prompt link.' : 'Original prompt link copied. Your inputs are not included.';
            if (result !== 'cancelled') track('ai_prompt_share', metadata, env.AhmedAnalytics, result);
          } else if (action === 'copy') {
            await copyText(resolve(), env); status.textContent = 'Prompt copied. The complete prompt is ready to paste; verify the output before operational use.';
            track('ai_prompt_copy', metadata, env.AhmedAnalytics);
          } else if (action === 'chatgpt') {
            const result = await openChatGPT(resolve(), env);
            let link = root.querySelector('[data-ai-chatgpt-link]');
            if (!link) {
              link = doc.createElement('a'); link.dataset.aiChatgptLink = 'true'; link.href = CHATGPT_URL; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Go to ChatGPT ↗'; root.querySelector('.ai-toolkit-actions').after(link);
            }
            status.textContent = 'Prompt copied. Paste it into ChatGPT. If no new tab opens, use the “Go to ChatGPT” link. The prompt has not been inserted or sent automatically.';
            if (result.initiated) track('ai_prompt_chatgpt_open', metadata, env.AhmedAnalytics, 'initiated');
          }
        } catch (error) {
          status.textContent = error.message || 'The action could not be completed. Try copying the prompt manually.';
          if (error.missing?.length) {
            const first = fields.find(field => error.missing.includes(field.dataset.aiVariable));
            fields.filter(field => error.missing.includes(field.dataset.aiVariable)).forEach(field => field.setAttribute('aria-invalid','true'));
            first?.focus();
          } else { originalRegion.hidden = false; originalRegion.focus(); }
        } finally { busy = false; root.removeAttribute('aria-busy'); buttons.forEach(b => { b.disabled = false; }); }
      });
      refresh();
    });
    if (typeof env.IntersectionObserver === 'function' && !doc.documentElement.dataset.aiViewsReady) {
      doc.documentElement.dataset.aiViewsReady = 'true';
      const seen = new WeakSet(); const timers = new WeakMap();
      const observer = new env.IntersectionObserver(entries => entries.forEach(entry => {
        const root = entry.target;
        if (!entry.isIntersecting || entry.intersectionRatio < .35) { if (timers.has(root)) env.clearTimeout(timers.get(root)); timers.delete(root); return; }
        if (seen.has(root) || timers.has(root)) return;
        timers.set(root, env.setTimeout(() => {
          timers.delete(root);
          if (doc.visibilityState === 'hidden') return;
          seen.add(root); observer.unobserve(root);
          track('ai_prompt_view', { id: root.dataset.aiPromptId, category: root.dataset.aiCategory, articleId: root.dataset.aiArticle, version: root.dataset.aiVersion }, env.AhmedAnalytics);
        }, 750));
      }), { threshold: [.35] });
      roots.filter(root => root.dataset.aiReady === 'true').forEach(root => observer.observe(root));
    }
  }
  return { resolveTemplate, copyText, shareUrl, sharePrompt, openChatGPT, track, mount, CHATGPT_URL };
});
