const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function run(url, consent) {
  const scripts = [];
  const location = new URL(url);
  const win = { AHMED_SITE_CONFIG: { gaMeasurementId: 'G-TEST', analyticsAllowedHosts: ['ahmedqualityops.com'] },
    localStorage: { getItem: () => consent }, location, addEventListener() {} };
  const doc = { title: 'Article', referrer: '', querySelector: () => null,
    head: { appendChild: node => scripts.push(node) }, addEventListener() {},
    createElement: () => ({ dataset: {}, style: {}, addEventListener() {} }) };
  vm.runInNewContext(fs.readFileSync('assets/js/analytics.js', 'utf8'), { window: win, document: doc, URL });
  return { win, scripts };
}
for (const host of ['127.0.0.1', 'localhost', 'preview.chatgpt.site', 'ahmedqualityops.com.example.org']) {
  const result = run('https://' + host + '/', 'granted');
  assert.equal(result.win.AhmedAnalytics.configured, false);
  assert.equal(result.scripts.length, 0);
  assert.equal(result.win.dataLayer.filter(entry => entry[0] === 'event').length, 0);
}
const denied = run('https://ahmedqualityops.com/', 'denied');
assert.equal(denied.scripts.length, 0);
assert.equal(denied.win.dataLayer.filter(entry => entry[0] === 'event').length, 0);
const production = run('https://ahmedqualityops.com/articles/example/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=hotel_ai&utm_content=worked_example&email=private@example.com&token=secret', 'granted');
assert.equal(production.scripts.length, 1);
const config = production.win.dataLayer.find(entry => entry[0] === 'config')[2];
assert.equal(config.campaign_source, 'linkedin');
assert.equal(config.campaign_medium, 'organic_social');
assert.equal(config.campaign_name, 'hotel_ai');
assert(!config.page_location.includes('?'));
assert(!JSON.stringify(production.win.dataLayer).includes('private@example.com'));
assert(!JSON.stringify(production.win.dataLayer).includes('secret'));
assert.equal(production.win.dataLayer.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
const unsafe = run('https://ahmedqualityops.com/?utm_campaign=private@example.com', 'granted');
assert.equal(unsafe.win.dataLayer.find(entry => entry[0] === 'config')[2].campaign_name, undefined);
console.log('Production host guard, denied consent, single page view and safe campaign labels passed.');
