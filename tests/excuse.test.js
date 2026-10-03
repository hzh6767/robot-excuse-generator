// 依赖零安装：app.js 在 Node 下导出纯函数，这里用一个最小假 DOM 驱动它们。
const assert = require('node:assert');
const path = require('node:path');

let passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log('ok - ' + name); }
  catch (error) { console.error('not ok - ' + name); console.error(error.message); process.exitCode = 1; }
}

// --- 最小假 DOM ---------------------------------------------------------
function makeElement(tag) {
  const el = {
    tagName: tag,
    className: '',
    textContent: '',
    children: [],
    parent: null,
    append(...nodes) { for (const node of nodes) { node.parent = el; el.children.push(node); } },
    prepend(node) { node.parent = el; el.children.unshift(node); },
    remove() { const parent = el.parent; if (parent) parent.children = parent.children.filter((child) => child !== el); },
    querySelector(selector) {
      const wanted = selector.replace(/^\./, '');
      return el.children.find((child) => child.className === wanted) || null;
    },
    get lastElementChild() { return el.children[el.children.length - 1] || null; }
  };
  return el;
}
globalThis.document = {
  querySelector: () => null,
  createElement: (tag) => makeElement(tag)
};

const logic = require(path.join(__dirname, '..', 'app.js'));
const { pieces, places, endings, pick, cleanTaskValue, buildExcuse, rollConfidence, addLog } = logic;

function emptyLog() {
  const log = makeElement('div');
  const empty = makeElement('p');
  empty.className = 'empty';
  log.append(empty);
  return log;
}

// --- 测试 ---------------------------------------------------------------
test('pick 只返回数组内元素', () => {
  for (let i = 0; i < 200; i += 1) assert.ok(endings.includes(pick(endings)));
});

test('cleanTaskValue：空、空白、null 都归一到同一个回退词', () => {
  assert.strictEqual(cleanTaskValue(''), '这件事');
  assert.strictEqual(cleanTaskValue('   '), '这件事');
  assert.strictEqual(cleanTaskValue(null), '这件事');
  assert.strictEqual(cleanTaskValue(undefined), '这件事');
  assert.strictEqual(cleanTaskValue('  忘记回消息  '), '忘记回消息');
});

test('buildExcuse：正文与日志标题使用同一个任务名（空输入不再自相矛盾）', () => {
  const cleanTask = cleanTaskValue('');
  const text = buildExcuse(cleanTask, 'mid', 'office');
  assert.ok(text.startsWith('关于“这件事”：'), text);
  assert.ok(!text.includes('未命名任务'), '正文不该出现另一种回退叫法');
  assert.ok(text.includes(places.office), text);
  assert.ok(endings.some((ending) => text.includes(ending)), text);
});

test('buildExcuse：所有紧急程度与场景组合都产出完整句式', () => {
  for (const urgency of Object.keys(pieces)) {
    for (const context of Object.keys(places)) {
      const text = buildExcuse('写周报', urgency, context);
      assert.ok(pieces[urgency].some((piece) => text.includes(piece)), urgency + '/' + context + ': ' + text);
      assert.ok(text.includes(places[context]), urgency + '/' + context + ': ' + text);
      assert.ok(text.endsWith('。'), text);
    }
  }
});

test('rollConfidence：始终落在 61-96 的信度区间', () => {
  for (let i = 0; i < 500; i += 1) {
    const value = rollConfidence();
    assert.ok(Number.isInteger(value), String(value));
    assert.ok(value >= 61 && value <= 96, String(value));
  }
});

test('addLog：首次写入移除占位、新条目置顶、标题带上置信度', () => {
  const log = emptyLog();
  addLog(log, '借口正文', 85, '忘记回消息');
  assert.strictEqual(log.querySelector('.empty'), null, '占位文本应被移除');
  assert.strictEqual(log.children.length, 1);
  const heading = log.children[0].children[0].textContent;
  assert.strictEqual(log.children[0].children[1].textContent, '借口正文');
  assert.ok(heading.includes('任务：忘记回消息'), heading);
  assert.ok(heading.includes('置信度：85%'), heading);
  assert.ok(/^\d{2}:\d{2} · /.test(heading), heading);

  addLog(log, '第二条', 70, '写周报');
  assert.strictEqual(log.children[0].children[1].textContent, '第二条', '最新条目应在最上面');
});

test('addLog：日志最多保留 6 条，最旧的被裁掉', () => {
  const log = emptyLog();
  for (let i = 1; i <= 9; i += 1) addLog(log, '第 ' + i + ' 条', 60 + i, '任务' + i);
  assert.strictEqual(log.children.length, 6);
  assert.strictEqual(log.children[0].children[1].textContent, '第 9 条');
  assert.strictEqual(log.children[5].children[1].textContent, '第 4 条');
});

test('addLog：没有占位文本时也能正常写入', () => {
  const log = makeElement('div');
  addLog(log, '冷启动', 88, '直接生成');
  assert.strictEqual(log.children.length, 1);
  assert.ok(log.children[0].children[0].textContent.includes('置信度：88%'));
});

console.log('\n' + passed + ' passing');
