const $ = (selector) => document.querySelector(selector);
const task = $('#task');
const excuse = $('#excuse');
const status = $('#status');
const diagnostics = $('#diagnostics');
const log = $('#log');
let latest = '';

const TASK_FALLBACK = '这件事';
const pieces = {
  low: ['进入了低功耗模式', '正在等待合适的灵感窗口', '把优先级误判成了装饰性标签'],
  mid: ['触发了跨部门同步延迟', '在自动备份里找到了一个更旧的版本', '被日历提醒的提醒给提醒忘了'],
  high: ['启动了紧急但非常有礼貌的重试流程', '检测到时间线存在轻微的平行宇宙偏移', '为了避免造成更大影响而谨慎地没有开始']
};
const places = {
  home: '家里的 Wi-Fi 正在和微波炉协商', office: '办公室的打印机进入了哲学思考', space: '太空站的重力把截止日期推远了 4.2 厘米', cafe: '咖啡店的背景音乐把时间线混成了爵士乐'
};
const endings = ['我会在系统重新获得勇气后第一时间处理。', '目前没有数据证明这不是一个合理的决定。', '请把这次延迟视为一次免费的流程优化。'];
function pick(array) { return array[Math.floor(Math.random() * array.length)]; }
function cleanTaskValue(value) { return String(value ?? '').trim() || TASK_FALLBACK; }
function buildExcuse(cleanTask, urgency, context) {
  return `关于“${cleanTask}”：我原本准备立刻完成，但${pick(pieces[urgency])}，而且${places[context]}。${pick(endings)}`;
}
function rollConfidence() { return 61 + Math.floor(Math.random() * 36); }
function addLog(target, text, confidence, cleanTask) {
  const empty = target.querySelector('.empty');
  if (empty) empty.remove();
  const entry = document.createElement('article');
  const heading = document.createElement('strong');
  const message = document.createElement('p');
  entry.className = 'log-entry';
  heading.textContent = `${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} · 任务：${cleanTask} · 置信度：${confidence}%`;
  message.textContent = text;
  entry.append(heading, message);
  target.prepend(entry);
  while (target.children.length > 6) target.lastElementChild.remove();
  return entry;
}

// 浏览器直接打开 index.html 时走这段；Node 下只导出纯函数供测试使用。
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pieces, places, endings, pick, cleanTaskValue, buildExcuse, rollConfidence, addLog, TASK_FALLBACK };
}

if ($('#generate')) {
  $('#generate').addEventListener('click', () => {
    const cleanTask = cleanTaskValue(task.value);
    latest = buildExcuse(cleanTask, $('#urgency').value, $('#context').value);
    excuse.textContent = `“${latest}”`;
    const confidence = rollConfidence();
    status.textContent = '已生成 · 仅供甩锅';
    diagnostics.textContent = `核心模块：借口引擎 · 置信度：${confidence}% · 证据链：暂无`;
    $('#copy').disabled = false;
    addLog(log, latest, confidence, cleanTask);
  });

  $('#copy').addEventListener('click', async () => {
    if (!latest) return;
    try { await navigator.clipboard.writeText(latest); status.textContent = '已复制到剪贴板'; }
    catch { status.textContent = '复制失败，请手动选择文本'; }
  });

  $('#clear').addEventListener('click', () => {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '生成结果会出现在这里。';
    log.replaceChildren(empty);
  });
}
