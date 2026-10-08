const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const full = fs.readFileSync('assets/js/homepage-editorial.js', 'utf8');
const source = full.slice(full.indexOf('(() => {\n  const data'));
function run(count, invalid = false) {
  const node = () => ({ children: [], attrs: {}, handlers: {}, append(...children) { this.children.push(...children); }, replaceChildren(...children) { this.children = children; }, setAttribute(key, value) { this.attrs[key] = value; }, addEventListener(type, fn) { this.handlers[type] = fn; } });
  const grid = node(), previous = node(), next = node(), status = node();
  const controls = { hidden: true, querySelector: selector => ({ '[data-article-status]': status, '[data-article-prev]': previous, '[data-article-next]': next })[selector] };
  const articles = Array.from({ length: count }, (_, index) => ({ url: '/articles/article-' + index + '/index.html', title: 'Article ' + index, description: 'Example description', pillar: 'Operations' }));
  const document = { getElementById: id => id === 'homepage-article-data' ? { textContent: invalid ? '{invalid' : JSON.stringify(articles) } : grid, querySelector: () => controls, createElement: node };
  vm.runInNewContext(source, { document });
  return { grid, controls, previous, next, status };
}
for (const count of [4, 5, 127, 128, 129, 133]) {
  const page = run(count);
  assert.equal(page.controls.hidden, false);
  page.previous.handlers.click();
  assert.equal(page.grid.children.length, 4, 'The final selection remains a full reading group');
  assert.equal(page.status.textContent, `Reading selection ${Math.ceil(count / 4)}. 4 articles shown.`);
  assert.equal(page.grid.children[0].href, '/articles/article-' + (Math.ceil(count / 4) - 1) * 4 + '/index.html');
  page.next.handlers.click();
  assert.equal(page.grid.children[0].href, '/articles/article-0/index.html');
  assert.equal(page.status.textContent, 'Reading selection 1. 4 articles shown.');
}
for (const count of [1, 2, 3]) { const page = run(count); page.next.handlers.click(); assert.equal(page.grid.children.length, count); assert.equal(new Set(page.grid.children.map(node => node.href)).size, count); }
assert.equal(run(0).controls.hidden, true);
assert.equal(run(4, true).controls.hidden, true);
console.log('Homepage reading selections wrap correctly after publication, with complete groups and valid labels (DOM simulation).');
