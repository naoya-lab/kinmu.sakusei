const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('removing the old worker preserves other apps on the same origin', async () => {
  const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
  const script = html.match(/if\("serviceWorker" in navigator\)\{[\s\S]*?\n\}/)[0];
  const removed = [];
  const scopes = ['https://example.test/', 'https://example.test/dqm-3-haigo/',
    'https://example.test/kinmu.sakusei/', 'https://example.test/kinmu.sakusei-other/'];
  vm.runInNewContext(script, {
    URL, location: { href: 'https://example.test/kinmu.sakusei/?shortcut=1' }, console,
    navigator: { serviceWorker: { getRegistrations: async () => scopes.map(scope => ({
      scope, unregister: async () => { removed.push(scope); },
    })) } },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(removed, ['https://example.test/kinmu.sakusei/']);
});
