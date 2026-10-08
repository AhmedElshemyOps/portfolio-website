/* Exercise production handlers with a small DOM; no browser packages are required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const discovery = fs.readFileSync('assets/js/discovery.js', 'utf8');
const reader = fs.readFileSync('assets/js/article-reader.js', 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

function environment() {
  const document = { activeElement: null, handlers: {}, addEventListener(type, callback) { this.handlers[type] = callback; } };
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this.dataset = {}; this.handlers = {}; this.value = ''; this.hidden = false; this.open = false; this.textContent = ''; }
    appendChild(child) { this.children.push(child); child.parentElement = this; return child; }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key]; }
    hasAttribute(key) { return key in this.attrs; }
    removeAttribute(key) { delete this.attrs[key]; }
    addEventListener(type, callback) { this.handlers[type] = callback; }
    focus() { document.activeElement = this; }
    contains(node) { return this === node || this.children.some(child => child.contains?.(node)); }
    showModal() { this.open = true; }
    close() { this.open = false; this.handlers.close?.(); }
    querySelector(selector) { return this.named?.[selector] || this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) {
      return this.children.flatMap(child => [
        ...((selector === '[data-search-result]' && child.dataset?.searchResult !== undefined) || child.tagName === selector ? [child] : []),
        ...(child.querySelectorAll?.(selector) || []),
      ]);
    }
    set innerHTML(value) {
      this.html = value;
      this.named = {};
      if (value.includes('data-global-search-input')) {
        for (const name of ['input', 'groups', 'status', 'close']) this.named[`[data-global-search-${name}]`] = this.appendChild(new Element(name === 'input' ? 'input' : 'div'));
      } else if (value.includes('article-section-map-toggle')) {
        for (const name of ['toggle', 'panel']) this.named[`.article-section-map-${name}`] = this.appendChild(new Element(name === 'toggle' ? 'button' : 'div'));
        this.named['.article-section-map-panel'].hidden = true;
        this.named['[data-section-current]'] = this.appendChild(new Element('strong'));
      } else if (value === '<strong></strong><span></span><small></small>') {
        for (const tag of ['strong', 'span', 'small']) this.appendChild(new Element(tag));
      }
    }
  }
  document.createElement = tag => new Element(tag);
  document.createTextNode = text => ({ textContent: text });
  document.body = new Element('body');
  return { document, Element };
}

function searchHarness(fetch) {
  const env = environment();
  const context = vm.createContext({ ...env, fetch, console, localStorage: { getItem() { return '[]'; }, setItem() {} }, window: { setTimeout(callback) { callback(); }, clearTimeout() {} } });
  const source = discovery.slice(0, discovery.indexOf('  var filters =')) + '\n globalThis.search = { loadIndex, renderSearch, openSearch, closeSearch, get dialog() { return dialog; }, get input() { return input; }, get groups() { return groups; }, get status() { return status; } };\n}());';
  vm.runInContext(source, context);
  return { ...env, search: context.search };
}

async function searchTests() {
  let fetches = 0;
  const entries = [{ title: 'Dispatch handover', description: 'Shift notes', category: 'Operations', type: 'Article', url: '/articles/dispatch/index.html' }];
  const harness = searchHarness(async () => { fetches += 1; return { ok: true, json: async () => entries }; });
  const { search, document, Element } = harness;
  const trigger = new Element('button'); trigger.focus();
  search.openSearch();
  search.input.value = 'dispatch'; search.renderSearch(search.input.value); await settle();
  let results = search.groups.querySelectorAll('[data-search-result]');
  assert.equal(results.length, 1);
  assert.equal(search.status.textContent, '1 result for “dispatch”.');
  const key = (value, extra = {}) => { const event = { key: value, prevented: false, preventDefault() { this.prevented = true; }, ...extra }; search.dialog.handlers.keydown(event); return event; };
  for (const value of ['Home', 'End', 'ArrowUp']) { search.input.focus(); assert.equal(key(value).prevented, false); assert.equal(document.activeElement, search.input); }
  search.input.focus(); assert.equal(key('ArrowDown', { shiftKey: true }).prevented, false);
  assert.equal(key('ArrowDown').prevented, true); assert.equal(document.activeElement, results[0]);
  assert.equal(key('Home').prevented, true); assert.equal(key('End').prevented, true);
  assert.equal(key('ArrowUp').prevented, true); assert.equal(document.activeElement, search.input);
  search.closeSearch(); assert.equal(document.activeElement, trigger);
  search.openSearch(); await settle();
  assert.equal(search.input.value, 'dispatch');
  assert.equal(search.groups.querySelectorAll('[data-search-result]').length, 1);
  assert.equal(search.status.textContent, '1 result for “dispatch”.');
  search.openSearch(); search.closeSearch(); assert.equal(document.activeElement, trigger, 'Shortcut inside an open search must not replace its return focus.');
  assert.equal(fetches, 1, 'Successful index is reused.');

  let attempts = 0;
  const retry = searchHarness(async () => { attempts += 1; if (attempts === 1) throw new Error('offline'); return { ok: true, json: async () => entries }; }).search;
  await assert.rejects(retry.loadIndex(), /offline/);
  assert.equal((await retry.loadIndex()).length, 1); assert.equal(attempts, 2, 'A failed load must be retried.');
}

function sectionTests() {
  const { document, Element } = environment();
  const headings = ['First section', 'Second section'].map(text => { const node = new Element('h2'); node.textContent = text; node.scrollIntoView = () => {}; return node; });
  const context = vm.createContext({ document, headings, reducedMotion: { matches: true }, window: { setTimeout(callback) { callback(); } } });
  const begin = reader.indexOf("  const sectionMap = document.createElement('nav');");
  const end = reader.indexOf('\n  headings.forEach((heading) => {', begin);
  vm.runInContext(reader.slice(begin, end) + '\nglobalThis.sections = { sectionMap, sectionToggle, sectionPanel, sectionButtons };', context);
  const { sectionMap, sectionToggle, sectionPanel, sectionButtons } = context.sections;
  assert.match(sectionMap.html, /aria-controls="article-section-map-panel"/);
  assert.match(sectionMap.html, /id="article-section-map-panel"/);
  sectionToggle.handlers.click(); assert.equal(sectionPanel.hidden, false);
  sectionMap.handlers.keydown({ key: 'Escape', preventDefault() {} }); assert.equal(sectionPanel.hidden, true); assert.equal(document.activeElement, sectionToggle);
  sectionToggle.handlers.click(); sectionMap.handlers.focusout({ relatedTarget: sectionButtons[0] }); assert.equal(sectionPanel.hidden, false);
  const outside = new Element('a'); sectionMap.handlers.focusout({ relatedTarget: outside }); assert.equal(sectionPanel.hidden, true);
  sectionToggle.handlers.click(); document.handlers.click({ target: outside }); assert.equal(sectionPanel.hidden, true);
  sectionToggle.handlers.click(); sectionButtons[1].handlers.click(); assert.equal(sectionPanel.hidden, true); assert.equal(document.activeElement, headings[1]); assert.equal(headings[1].attrs.tabindex, '-1');
}

function mobileTocTests() {
  const { document, Element } = environment();
  const toc = new Element('details');
  const link = new Element('a'); link.setAttribute('href', '#control-loop');
  document.getElementById = id => id === 'control-loop' ? new Element('h2') : null;
  const mobileToc = { matches: true };
  const context = vm.createContext({ toc, tocLinks: [link], document, mobileToc });
  const begin = reader.indexOf("  tocLinks.forEach(link => link.addEventListener('click', event => {");
  const end = reader.indexOf('\n  }));', begin) + '\n  }));'.length;
  vm.runInContext(reader.slice(begin, end), context);
  const click = overrides => { toc.open = true; const event = { button: 0, defaultPrevented: false, preventDefault() { throw Error('Native navigation must remain intact'); }, ...overrides }; link.handlers.click(event); return toc.open; };
  assert.equal(click({}), false, 'Collapse synchronously, before native anchor scrolling.');
  assert.equal(link.getAttribute('href'), '#control-loop');
  for (const key of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey', 'defaultPrevented']) assert.equal(click({ [key]: true }), true);
  assert.equal(click({ button: 1 }), true);
  link.setAttribute('target', '_blank'); assert.equal(click({}), true); link.removeAttribute('target');
  link.setAttribute('download', ''); assert.equal(click({}), true); link.removeAttribute('download');
  link.setAttribute('href', '/another-page.html#control-loop'); assert.equal(click({}), true);
  link.setAttribute('href', '#missing'); assert.equal(click({}), true);
  link.setAttribute('href', '#control-loop'); mobileToc.matches = false; assert.equal(click({}), true, 'Desktop contents stay expanded.');
}

(async () => {
  await searchTests();
  sectionTests();
  mobileTocTests();
  console.log('Search editing, reopen results, index recovery, section dismissal and native mobile contents links passed (DOM simulation).');
})().catch(error => { console.error(error); process.exitCode = 1; });
