const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/js/article-prompts.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'articles/hotel-operations-manager-ai-toolkit/index.html'), 'utf8');
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const prompts = [...html.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map((m) => decode(m[1]));

async function checkCopy(text, missing = false) {
  let copied;
  let listener;
  const status = { textContent: '' };
  const label = { textContent: '' };
  const icon = { textContent: '' };
  const classes = { add() {}, remove() {} };
  const target = missing ? null : { textContent: text, focus() {}, closest: () => null };
  const button = {
    dataset: { copyTarget: 'prompt' }, classList: classes, disabled: false,
    closest: () => ({ querySelector: () => status, classList: classes }),
    setAttribute(name, value) { this[name] = value; },
    querySelector: (selector) => selector === '.copy-action-icon' ? icon : label,
    addEventListener(name, callback) { listener = callback; },
  };
  const document = { querySelectorAll: () => [button], getElementById: () => target };
  vm.runInNewContext(script, { document, navigator: { clipboard: { async writeText(value) { copied = value; } } }, window: { isSecureContext: true, setTimeout() {} } });
  if (missing || !text.trim()) {
    assert.equal(button.disabled, true);
    assert.equal(button['aria-label'], 'Prompt unavailable');
    assert.equal(listener, undefined);
    assert.equal(copied, undefined);
  } else {
    await listener();
    assert.equal(copied, text.trim());
    assert.equal(label.textContent, 'Prompt copied');
    assert.match(status.textContent, /complete prompt/);
  }
}

(async () => {
  assert.equal(prompts.length, 10);
  for (const prompt of prompts) await checkCopy(prompt);
  await checkCopy(' \n ');
  await checkCopy('', true);
  console.log('Ten full prompts copy exactly; empty and missing targets are disabled.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
