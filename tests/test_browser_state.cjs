const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Node {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.dataset = {}; this.handlers = {}; this.className = ''; this.style = {}; }
  append(...nodes) { nodes.forEach(node => { node.parentElement = this; this.children.push(node); }); }
  appendChild(node) { this.append(node); return node; }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(key, value) { this.attrs[key] = value; }
  addEventListener(type, fn) { this.handlers[type] = fn; }
  focus() { this.focused = true; }
  after(node) { const parent = this.parentElement; node.parentElement = parent; parent.children.splice(parent.children.indexOf(this) + 1, 0, node); }
  remove() { this.parentElement.children = this.parentElement.children.filter(node => node !== this); }
  set innerHTML(value) { this.html = value; if (value.includes('Build a personal reading list')) this.append(new Node('a')); }
  querySelectorAll(selector) {
    const nodes = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
    if (selector === '*') return nodes;
    if (selector === '[data-saved-feedback]') return nodes.filter(node => Object.hasOwn(node.dataset, 'savedFeedback'));
    if (selector === '.saved-reading-card button') return nodes.filter(node => node.tagName === 'BUTTON' && node.parentElement.className === 'saved-reading-card');
    if (selector === '.saved-reading-empty a') return nodes.filter(node => node.tagName === 'A' && node.parentElement.className === 'saved-reading-empty');
    return nodes.filter(node => node.tagName === selector.toUpperCase());
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
const entry = (slug, values = {}) => ({ slug, title: 'Article ' + slug, category: 'Operations', url: '/articles/' + slug + '/index.html', savedAt: '2026-10-08T12:00:00Z', ...values });
function savedReading(stored, blocked = false, bookmark = false) {
  let state = JSON.stringify(stored);
  const body = new Node('body'), list = new Node(), status = new Node(), count = new Node('span'), button = new Node('button');
  body.dataset = bookmark ? { articleSlug: 'new' } : {};
  body.append(list, status, count, button);
  const one = { '[data-saved-reading-list]': list, '[data-saved-reading-status]': status, '[data-article-bookmark]': bookmark ? button : null, '.article-page-header h1': { textContent: 'New article' } };
  const document = { body, documentElement: body, readyState: 'complete', title: 'Test', createElement: tag => new Node(tag), querySelector: selector => one[selector] || null, querySelectorAll: selector => selector === '[data-saved-count]' ? [count] : selector === '[data-saved-feedback]' ? body.querySelectorAll(selector) : [] };
  const location = new URL('https://ahmedqualityops.com/articles/new/index.html');
  vm.runInNewContext(fs.readFileSync('assets/js/saved-reading.js', 'utf8'), { document, location, URL, window: {}, localStorage: { getItem: () => state, setItem(key, value) { if (blocked) throw Error('Quota exceeded'); state = value; } }, MutationObserver: class { observe() {} } });
  return { list, status, count, button, body, state: () => JSON.parse(state) };
}
const clean = savedReading([null, 12, entry('one', { savedAt: 'unknown' }), entry('one'), entry('bad', { url: 'javascript:alert(1)' }), entry('outside', { url: 'https://example.com/' }), entry('two')]);
assert.equal(clean.count.textContent, '2');
assert.equal(clean.list.children.length, 2);
assert.equal(clean.list.children[0].querySelector('time').textContent, 'Saved article');
clean.list.querySelectorAll('.saved-reading-card button')[0].handlers.click();
assert.equal(clean.list.children.length, 1);
assert.equal(clean.list.querySelector('button').focused, true);
clean.list.querySelector('button').handlers.click();
assert.equal(clean.list.querySelector('.saved-reading-empty a').focused, true);
assert.equal(clean.count.textContent, '0');
for (const malformed of [null, {}, false, 10, 'bad']) assert.equal(savedReading(malformed).count.textContent, '0');
const denied = savedReading([entry('one')], true);
denied.list.querySelector('button').handlers.click();
assert.equal(denied.list.children.length, 1);
assert.equal(denied.count.textContent, '1');
assert.match(denied.status.textContent, /could not be updated/);
const deniedBookmark = savedReading([], true, true);
deniedBookmark.button.handlers.click();
assert.equal(deniedBookmark.button.attrs['aria-pressed'], 'false');
assert.match(deniedBookmark.body.querySelector('[data-saved-feedback]').textContent, /could not be updated/);

function learning(saved, blocked = false) {
  let stored = JSON.stringify(saved);
  const text = new Node('span'), bar = { style: {} }, handlers = {};
  const steps = ['first', 'second'].map(slug => { const button = new Node('button'); button.dataset.markRead = slug; return { dataset: { pathStep: slug }, classList: { toggle() {} }, button, querySelector: () => button }; });
  const root = { dataset: { learningPath: 'path' }, querySelectorAll: () => steps, querySelector: selector => selector === '[data-path-progress-text]' ? text : bar, addEventListener(type, fn) { handlers[type] = fn; } };
  const window = { localStorage: { getItem: () => stored, setItem(key, value) { if (blocked) throw Error('Storage blocked'); stored = value; } } };
  vm.runInNewContext(fs.readFileSync('assets/js/learning-progress.js', 'utf8'), { document: { querySelector: () => root }, window });
  return { text, bar, click() { handlers.click({ target: { closest: () => steps[1].button } }); }, stored: () => JSON.parse(stored), allowStorage() { blocked = false; } };
}
for (const malformed of [null, [], false, 42, 'invalid']) { const state = learning(malformed); assert.equal(state.text.textContent, '0 of 2 complete'); state.click(); assert.equal(state.text.textContent, '1 of 2 complete'); }
const progress = learning({ path: ['first', 'first', 'removed', null, 'old-step'] });
assert.equal(progress.text.textContent, '1 of 2 complete');
assert.equal(progress.bar.style.width, '50%');
progress.click();
assert.equal(progress.bar.style.width, '100%');
assert.deepEqual(progress.stored().path, ['first', 'second']);
const unsavedProgress = learning({ path: ['first'] }, true);
unsavedProgress.click();
assert.equal(unsavedProgress.bar.style.width, '100%');
assert.deepEqual(unsavedProgress.stored().path, ['first'], 'Blocked storage retains the previously saved progress');
assert.equal(unsavedProgress.text.attrs.role, 'status', 'The session-only warning is announced');
assert.match(unsavedProgress.text.textContent, /Not saved: these changes last only until this page closes or reloads/);
unsavedProgress.allowStorage();
unsavedProgress.click();
assert.equal(unsavedProgress.text.textContent, '1 of 2 complete', 'A later successful save clears the warning');
assert.deepEqual(unsavedProgress.stored().path, ['first']);
console.log('Saved-list validation, failed storage, removal focus and learning-progress recovery passed (DOM simulation).');
