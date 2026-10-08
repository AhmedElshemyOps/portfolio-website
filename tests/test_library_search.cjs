/* Exercise the production library handlers with the published card records. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/discovery.js', 'utf8');
const registry = JSON.parse(fs.readFileSync('content/article-registry.json', 'utf8'));

function library(address = 'https://ahmedqualityops.com/knowledge/index.html', saved = null) {
  const events = () => ({ handlers: {}, addEventListener(type, handler) { this.handlers[type] = handler; } });
  const field = (value = '') => ({ ...events(), value, closest() { return { classList: { toggle() {} } }; } });
  const filters = ['pillar', 'series', 'type'].map(key => ({
    ...field(), dataset: { knowledgeFilter: key },
    options: [{ value: '', textContent: 'All' }, ...[...new Set(registry.map(row => key === 'type' ? row.type === 'Series index' ? row.type : row.contentType : row[key]))].map(value => ({ value, textContent: value }))]
  }));
  const query = field();
  const sort = { ...field('recommended'), options: [{ value: 'recommended', textContent: 'Recommended order' }, { value: 'title', textContent: 'Title · A–Z' }, { value: 'updated', textContent: 'Recently updated' }] };
  const cards = registry.map(row => ({
    dataset: { pillar: row.pillar, series: row.series, type: row.type === 'Series index' ? row.type : row.contentType, updated: row.updated || '', search: [row.title, row.description, ...row.tags].join(' ').toLowerCase() },
    row, hidden: false, link: { focus() { this.focused = true; } },
    querySelector(selector) { return selector === 'h2' ? { textContent: row.title } : this.link; }
  }));
  const more = events(), resets = [events(), events(), events()];
  const summary = {}, active = {}, selection = {}, status = {}, empty = {}, page = {};
  const heading = { focus() { this.focused = true; } };
  const grid = { appendChild() {} };
  let location = { href: address, search: new URL(address).search };
  let stored = saved && JSON.stringify(saved);
  const many = { '[data-knowledge-filter]': filters, '[data-knowledge-query]': [query], '[data-knowledge-card]': cards, '[data-knowledge-reset]': resets };
  const one = { '[data-knowledge-more]': more, '[data-knowledge-page-status]': page, '[data-knowledge-sort]': sort, '[data-knowledge-selection]': active, '[data-knowledge-selection-text]': selection, '.library-filter-disclosure summary': summary, '[data-knowledge-status]': status, '[data-knowledge-empty]': empty, '.knowledge-grid': grid };
  const document = { addEventListener() {}, querySelectorAll(selector) { return many[selector] || []; }, querySelector(selector) { return one[selector] || null; }, getElementById(id) { return id === 'all-knowledge-title' ? heading : null; } };
  const window = { history: { state: null, replaceState(state, title, url) { location.href = String(url); location.search = new URL(url).search; } } };
  vm.runInNewContext(source, { document, window, location, URL, URLSearchParams, sessionStorage: { getItem() { return stored; }, setItem(key, value) { stored = value; } } });
  return { query, filters, sort, cards, more, resets, summary, active, selection, status, empty, page, heading, location,
    search(value) { query.value = value; query.handlers.input(); },
    matches() { return cards.filter(card => !card.hidden); }
  };
}

for (const [query, expected] of [['Amsterdam research', 4], ['research Amsterdam', 4], ['MICE airport', 4], ['quotation margin', 2], ['reservations corporate', 1]]) {
  const page = library(); page.search(query);
  assert.equal(page.matches().length, expected, query);
  assert.equal(page.empty.hidden, true);
  assert(page.selection.textContent.includes(query));
  assert.equal(page.active.hidden, false);
}
const normalized = library();
normalized.cards[0].dataset.search += ' café';
normalized.search('  CAFE   ');
assert.equal(normalized.matches().length, 1, 'Accent and whitespace normalization');
normalized.search('airport impossibleword');
assert.equal(normalized.matches().length, 0, 'Every query token must match');
assert.equal(normalized.empty.hidden, false);

const restored = library('https://ahmedqualityops.com/knowledge/index.html?utm_source=review#all-knowledge-title', {
  filters: { pillar: 'MICE & Event Operations' }, query: 'airport', sort: 'title', limit: 12
});
assert.equal(restored.summary.textContent, 'Filter articles (1 active)');
assert.match(restored.selection.textContent, /Topic: MICE & Event Operations/);
assert.match(restored.selection.textContent, /Search: “airport”/);
assert.match(restored.selection.textContent, /Sort: Title · A–Z/);
assert.equal(restored.active.hidden, false, 'Restored filters remain visible outside the disclosure');
restored.search('nothing-could-match-this');
assert.equal(restored.empty.hidden, false);
restored.resets[2].handlers.click();
assert.equal(restored.empty.hidden, true);
assert.equal(restored.active.hidden, true);
assert.equal(restored.matches().length, 12);
assert.equal(restored.heading.focused, true, 'Focus moves out of the now-hidden reset button');
assert.equal(restored.summary.textContent, 'Filter articles');
const url = new URL(restored.location.href);
assert.equal(url.searchParams.get('utm_source'), 'review');
assert.equal(url.hash, '#all-knowledge-title');
for (const key of ['q', 'pillar', 'series', 'type', 'sort']) assert.equal(url.searchParams.has(key), false);

const deepLink = library('https://ahmedqualityops.com/knowledge/index.html?pillar=MICE%20%26%20Event%20Operations&q=airport');
assert(deepLink.matches().length > 0);
assert(deepLink.matches().every(card => card.dataset.pillar === 'MICE & Event Operations'));
deepLink.resets[0].handlers.click();
assert.equal(deepLink.matches().length, 12);
const before = deepLink.matches().length;
deepLink.more.handlers.click();
assert.equal(deepLink.matches().length, before + 12);
assert(deepLink.cards.some(card => card.link.focused), 'Show more keeps keyboard readers in the results');

const html = fs.readFileSync('knowledge/index.html', 'utf8');
assert.equal((html.match(/data-knowledge-reset/g) || []).length, 3);
assert(html.indexOf('data-knowledge-selection') < html.indexOf('<details class="library-filter-disclosure"'));
console.log('Library word matching, restored filters, empty-state recovery, focus, pagination and URL preservation passed (DOM simulation).');
