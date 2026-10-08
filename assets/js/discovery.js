(function setupKnowledgeDiscovery() {
  "use strict";
  var indexPromise;
  var dialog;
  var input;
  var groups;
  var status;
  var previousFocus;
  var activeIndex = -1;
  var searchRequest = 0;
  var recentSearchKey = "ahmed-recent-searches-v1";
  var analytics = function (name, params) { window.AhmedAnalytics?.event(name, params || {}); };
  var suggestions = ["Tourism Operations", "MICE", "AI", "Quotation", "Product Operations", "Quality & SOP"];
  function recentSearches() { try { var values = JSON.parse(localStorage.getItem(recentSearchKey) || "[]"); return Array.isArray(values) ? values.slice(0, 5) : []; } catch (_error) { return []; } }
  function rememberSearch(value) { try { var values = recentSearches().filter(function (item) { return normalize(item) !== normalize(value); }); values.unshift(value); localStorage.setItem(recentSearchKey, JSON.stringify(values.slice(0, 5))); } catch (_error) { /* Optional browser feature. */ } }

  function loadIndex() {
    if (!indexPromise) indexPromise = fetch("/content/discovery-index.json", { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json();
    });
    return indexPromise;
  }

  function normalize(value) {
    return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function searchTokens(value) {
    return normalize(value).trim().split(/\s+/).filter(Boolean);
  }

  function score(item, query) {
    var tokens = searchTokens(query);
    if (!tokens.length) return 0;
    var title = normalize(item.title);
    var category = normalize(item.category);
    var text = normalize(topicLabel(item.searchText || [item.title, item.description, item.category].concat(item.tags || [], item.headings || []).join(" ")) + " " + (item.searchText || ""));
    var total = 0;
    tokens.forEach(function (token) {
      if (title === token) total += 18;
      if (title.startsWith(token)) total += 10;
      if (title.includes(token)) total += 7;
      if (category.includes(token)) total += 4;
      if (text.includes(token)) total += 2;
    });
    if (tokens.every(function (token) { return text.includes(token); })) total += 6;
    if (total > 0 && item.type === "Article") total += 1;
    return total;
  }

  function appendHighlighted(target, value, tokens) {
    var source = String(value || "");
    var unique = tokens.filter(function (token, index) { return token && tokens.indexOf(token) === index; });
    if (!unique.length) { target.textContent = source; return; }
    var expression = new RegExp("(" + unique.map(function (token) { return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
    source.split(expression).forEach(function (part) {
      if (unique.includes(normalize(part))) {
        var mark = document.createElement("mark"); mark.textContent = part; target.appendChild(mark);
      } else target.appendChild(document.createTextNode(part));
    });
  }

  function topicLabel(value) { return (value || "").replace(/Hotel & Serviced Apartment AI/gi, "AI for Hotel Apartments"); }
  function resultLink(item, tokens) {
    var link = document.createElement("a");
    link.href = item.url;
    link.dataset.searchResult = "";
    link.innerHTML = "<strong></strong><span></span><small></small>";
    appendHighlighted(link.querySelector("strong"), item.title, tokens);
    appendHighlighted(link.querySelector("span"), item.description, tokens);
    link.querySelector("small").textContent = topicLabel(item.category || item.type);
    link.addEventListener("click", function () {
      analytics("search_result_clicked", { result_type: item.type, result_id: item.id });
    });
    return link;
  }

  function suggestionButtons(values, label) {
    var region = document.createElement("section"); region.className = "search-suggestion-group";
    var heading = document.createElement("h3"); heading.textContent = label; region.appendChild(heading);
    var list = document.createElement("div"); list.className = "search-suggestions";
    values.forEach(function (suggestion) { var button = document.createElement("button"); button.type = "button"; button.textContent = suggestion; button.addEventListener("click", function () { input.value = suggestion; renderSearch(suggestion); }); list.appendChild(button); });
    region.appendChild(list); return region;
  }
  function renderSuggestions(includeMessage) {
    groups.replaceChildren();
    var empty = document.createElement("div");
    empty.className = "search-empty";
    if (includeMessage) empty.innerHTML = "<strong>No exact match found.</strong><p>Try another keyword or explore a common topic.</p>";
    var recent = recentSearches();
    if (recent.length) empty.appendChild(suggestionButtons(recent, "Recent searches"));
    empty.appendChild(suggestionButtons(suggestions, "Suggested topics"));
    groups.appendChild(empty);
  }

  function renderSearch(query) {
    var cleaned = query.trim();
    var request = ++searchRequest;
    activeIndex = -1;
    if (cleaned.length < 2) {
      status.textContent = "Enter at least two characters to search articles, projects, learning paths and resources.";
      renderSuggestions(false);
      groups.removeAttribute("aria-busy");
      return;
    }
    groups.setAttribute("aria-busy", "true");
    loadIndex().then(function (items) {
      if (request !== searchRequest) return;
      var tokens = searchTokens(cleaned);
      var matches = items.map(function (item) { return { item: item, score: score(item, cleaned) }; })
        .filter(function (match) { return match.score > 0; })
        .sort(function (a, b) { return b.score - a.score || a.item.title.localeCompare(b.item.title); });
      groups.replaceChildren();
      if (!matches.length) {
        status.textContent = "No results for “" + cleaned + "”.";
        renderSuggestions(true);
        groups.removeAttribute("aria-busy");
        analytics("search_no_results", { query_length: cleaned.length });
        return;
      }
      var grouped = {};
      matches.forEach(function (match) {
        var type = match.item.type || "Other";
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(match.item);
      });
      var shown = 0;
      Object.keys(grouped).forEach(function (type) {
        var section = document.createElement("section");
        section.className = "search-group";
        var heading = document.createElement("h3");
        heading.textContent = type === "Article" ? "Articles" : type === "Series index" ? "Series" : type + (type.endsWith("s") ? "" : "s");
        section.appendChild(heading);
        grouped[type].forEach(function (item) { section.appendChild(resultLink(item, tokens)); shown += 1; });
        groups.appendChild(section);
      });
      status.textContent = shown + " result" + (shown === 1 ? "" : "s") + (shown < matches.length ? " shown from " + matches.length + " matches" : "") + " for “" + cleaned + "”.";
      rememberSearch(cleaned);
      groups.removeAttribute("aria-busy");
      analytics("search_performed", { query_length: cleaned.length, result_count: matches.length });
    }).catch(function () {
      if (request !== searchRequest) return;
      groups.removeAttribute("aria-busy");
      status.textContent = "Search is temporarily unavailable. Please use the Knowledge Hub filters.";
    });
  }

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.className = "global-search";
    dialog.setAttribute("aria-labelledby", "global-search-title");
    dialog.innerHTML = '<div class="global-search-panel"><header><div><span class="eyebrow">Knowledge discovery</span><h2 id="global-search-title">Search the platform</h2></div><button type="button" data-global-search-close aria-label="Close search">×</button></header><label><span>Search articles, tools, research and resources</span><input type="search" autocomplete="off" placeholder="Try dispatch, MICE, quotation or SOP" data-global-search-input/></label><p class="global-search-status" data-global-search-status aria-live="polite">Enter at least two characters to begin.</p><div class="global-search-groups" data-global-search-groups></div></div>';
    document.body.appendChild(dialog);
    input = dialog.querySelector("[data-global-search-input]");
    groups = dialog.querySelector("[data-global-search-groups]");
    status = dialog.querySelector("[data-global-search-status]");
    input.setAttribute("aria-describedby", "global-search-status");
    status.id = "global-search-status";
    dialog.querySelector("[data-global-search-close]").addEventListener("click", closeSearch);
    dialog.addEventListener("click", function (event) { if (event.target === dialog) closeSearch(); });
    dialog.addEventListener("close", function () { previousFocus?.focus(); });
    input.addEventListener("input", function () { window.clearTimeout(input.searchTimer); input.searchTimer = window.setTimeout(function () { renderSearch(input.value); }, 120); });
    dialog.addEventListener("keydown", function (event) {
      var links = Array.from(dialog.querySelectorAll("[data-search-result]"));
      if (!links.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      var current = links.indexOf(document.activeElement);
      if (event.key === "Home") { activeIndex = 0; links[0].focus(); return; }
      if (event.key === "End") { activeIndex = links.length - 1; links[activeIndex].focus(); return; }
      if (event.key === "ArrowUp" && current <= 0) { activeIndex = -1; input.focus(); return; }
      activeIndex = event.key === "ArrowDown" ? Math.min(links.length - 1, current + 1) : Math.max(0, current - 1);
      links[activeIndex]?.focus();
    });
  }

  function openSearch() {
    ensureDialog();
    previousFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    window.setTimeout(function () { input.focus(); }, 0);
    loadIndex().catch(function () {});
    renderSuggestions(false);
    analytics("global_search_opened");
  }

  function closeSearch() {
    if (!dialog) return;
    window.clearTimeout(input?.searchTimer);
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest?.("[data-global-search-open]")) openSearch();
  });
  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    if (event.key === "Escape" && dialog?.open) closeSearch();
  });

  var filters = Array.from(document.querySelectorAll("[data-knowledge-filter]"));
  var knowledgeQueries = Array.from(document.querySelectorAll("[data-knowledge-query]"));
  var knowledgeQuery = knowledgeQueries[0];
  var knowledgeCards = Array.from(document.querySelectorAll("[data-knowledge-card]"));
  var moreButton = document.querySelector('[data-knowledge-more]');
  var pageStatus = document.querySelector('[data-knowledge-page-status]');
  var sort = document.querySelector('[data-knowledge-sort]');
  var limit = 12;
  var matched = [];
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('ahmed-library-browse-v1') || 'null'); } catch (_) {}
  var initialFilters = new URLSearchParams(location.search);
  var explicit = ['pillar', 'topic', 'series', 'type', 'q', 'sort'].some(function (key) { return initialFilters.has(key); });
  filters.forEach(function (filter) {
    var value = explicit ? (initialFilters.get(filter.dataset.knowledgeFilter) || (filter.dataset.knowledgeFilter === 'pillar' ? initialFilters.get('topic') : '')) : saved?.filters?.[filter.dataset.knowledgeFilter];
    if (value && Array.from(filter.options).some(function (option) { return option.value === value; })) filter.value = value;
  });
  knowledgeQueries.forEach(function (field) { field.value = explicit ? initialFilters.get('q') || '' : saved?.query || ''; });
  if (sort) sort.value = (explicit ? initialFilters.get('sort') : saved?.sort) || 'recommended';
  if (saved?.limit && saved.query === (knowledgeQuery?.value || '') && saved.sort === (sort?.value || 'recommended') && filters.every(function (field) { return (saved.filters?.[field.dataset.knowledgeFilter] || '') === field.value; })) limit = Math.max(12, Math.min(knowledgeCards.length, Number(saved.limit) || 12));
  function filterKnowledge(resetBatch) {
    if (!knowledgeCards.length) return;
    if (resetBatch === true) limit = 12;
    var selected = Object.fromEntries(filters.map(function (filter) { return [filter.dataset.knowledgeFilter, filter.value]; }));
    var query = (knowledgeQuery?.value || '').trim().toLowerCase();
    matched = knowledgeCards.filter(function (card) {
      return (!selected.pillar || card.dataset.pillar === selected.pillar) && (!selected.series || card.dataset.series === selected.series) && (!selected.type || card.dataset.type === selected.type) && (!query || (card.dataset.search + ' ' + topicLabel(card.dataset.search + ' ' + card.dataset.pillar)).toLowerCase().includes(query));
    });
    if (sort?.value === 'title') matched.sort(function (a, b) { return a.querySelector('h2').textContent.localeCompare(b.querySelector('h2').textContent); });
    if (sort?.value === 'updated') matched.sort(function (a, b) { return (b.dataset.updated || '').localeCompare(a.dataset.updated || ''); });
    var visible = moreButton ? matched.slice(0, limit) : matched;
    knowledgeCards.forEach(function (card) { card.hidden = !visible.includes(card); });
    var grid = document.querySelector('.knowledge-grid');
    if (grid && sort) matched.forEach(function (card) { grid.appendChild(card); });
    filters.forEach(function (filter) { filter.closest('label')?.classList.toggle('is-active', Boolean(filter.value)); });
    knowledgeQueries.forEach(function (field) { field.closest('label')?.classList.toggle('is-active', Boolean(query)); });
    document.querySelector('[data-knowledge-status]').textContent = matched.length ? 'Showing ' + visible.length + (visible.length < matched.length ? ' results. More articles are available below.' : ' matching results.') : 'No matching articles.';
    document.querySelector('[data-knowledge-empty]').hidden = matched.length !== 0;
    if (moreButton) moreButton.hidden = visible.length >= matched.length;
    if (pageStatus) pageStatus.textContent = visible.length < matched.length ? 'Continue exploring this selection.' : matched.length ? 'You have reached the end of this selection.' : '';
    var address = new URL(location.href);
    address.searchParams.delete('topic');
    Object.entries(selected).forEach(function (entry) { if (entry[1]) address.searchParams.set(entry[0], entry[1]); else address.searchParams.delete(entry[0]); });
    if (query) address.searchParams.set('q', knowledgeQuery.value); else address.searchParams.delete('q');
    if (sort?.value && sort.value !== 'recommended') address.searchParams.set('sort', sort.value); else address.searchParams.delete('sort');
    window.history.replaceState(window.history.state, '', address);
    try { sessionStorage.setItem('ahmed-library-browse-v1', JSON.stringify({ filters: selected, query: knowledgeQuery?.value || '', sort: sort?.value || 'recommended', limit: limit })); } catch (_) {}
  }
  filterKnowledge();
  filters.forEach(function (filter) { filter.addEventListener('change', function () { filterKnowledge(true); }); });
  sort?.addEventListener('change', function () { filterKnowledge(true); });
  knowledgeQueries.forEach(function (field) { field.addEventListener('input', function () { knowledgeQueries.forEach(function (other) { other.value = field.value; }); filterKnowledge(true); }); });
  moreButton?.addEventListener('click', function () { var next = matched[limit]; limit += 12; filterKnowledge(); next?.querySelector('a')?.focus(); });
  document.querySelector('[data-knowledge-reset]')?.addEventListener('click', function () { filters.forEach(function (filter) { filter.value = ''; }); knowledgeQueries.forEach(function (field) { field.value = ''; }); if (sort) sort.value = 'recommended'; filterKnowledge(true); });

}());
