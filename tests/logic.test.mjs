// 核心逻辑冒烟测试：用极简 DOM stub 执行 index.html 里的真实引擎代码
// 运行：node tests/logic.test.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// ---------- DOM stub ----------
class El {
  constructor(id) {
    this.id = id; this.tagName = "div";
    this.innerHTML = ""; this.textContent = ""; this.hidden = false;
    this.style = {}; this.dataset = {}; this.onclick = null;
    this._classes = new Set(); this.children = []; this.parent = null;
    this.value = "";
  }
  get classList() {
    return {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      contains: (c) => this._classes.has(c),
      toggle: (c, force) => { if (force === undefined) force = !this._classes.has(c); force ? this._classes.add(c) : this._classes.delete(c); },
    };
  }
  set className(v) { this._classes = new Set(String(v).split(/\s+/).filter(Boolean)); }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  querySelectorAll() { return []; }
}

const registry = {};
globalThis.document = {
  getElementById: (id) => (registry[id] ??= new El(id)),
  createElement: (tag) => { const e = new El(); e.tagName = tag; return e; },
  querySelectorAll: () => [],
};
globalThis.registry = registry;

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};

// 同步执行 setTimeout，便于跑完整个状态机
globalThis.setTimeout = (fn) => { fn(); return 0; };
globalThis.confirm = () => true;
const document = globalThis.document;
const localStorage = globalThis.localStorage;

// ---------- 载入 words.js 与 inline script ----------
const wordsSrc = fs.readFileSync(path.join(ROOT, "words.js"), "utf8")
  .replace(/^const WORDS =/m, "globalThis.WORDS =")
  .replace(/^const CATEGORIES =/m, "globalThis.CATEGORIES =");
(0, eval)(wordsSrc);
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n")
  + "\n;globalThis.__t = { get state(){return state;}, set state(v){state=v;}, get queue(){return queue;}, get current(){return current;}, get sessionWrong(){return sessionWrong;}, buildQueue, nextQuestion, renderStats, renderChips, defaultState };";
(0, eval)(inline);
const T = globalThis.__t;
const state = T.state;
const buildQueue = T.buildQueue, nextQuestion = T.nextQuestion;
const cur = () => T.current, q = () => T.queue;

// ---------- 断言 ----------
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("✗ FAIL:", msg); }
}

// 1. 词库字段完整、启动后队列 = 全部词（全新 box 0）
assert(WORDS.length === 130, `词库 130 词，实际 ${WORDS.length}`);
for (const w of WORDS) {
  assert(w.en && w.cn && w.hint && w.example && w.cat, `词条字段完整: ${w.en}`);
  assert(CATEGORIES[w.cat], `cat 合法: ${w.en} → ${w.cat}`);
}
assert(Object.keys(state.box).length === 0, "初始 box 为空");
assert(cur() !== null && q().length === WORDS.length - 1, `首题已出，队列剩 ${q().length}`);

// 2. 出题：4 选项、恰一个正确、题目内容匹配
const optsEl = registry["options"];
assert(optsEl.children.length === 4, `4 个选项，实际 ${optsEl.children.length}`);
const correctIdx = optsEl.children.findIndex((b) => b.textContent === WORDS[cur()].cn);
assert(correctIdx >= 0, "正确选项存在");
assert(registry["en"].textContent === WORDS[cur()].en, "英文概念显示正确");
assert(registry["example"].innerHTML.includes("<b>"), "例句高亮生效");

// 3. 答对：box → 1，doneToday → 1，自动下一题
const firstWord = cur();
optsEl.children[correctIdx].onclick();
assert(state.box[firstWord] === 1, `答对后 box=1，实际 ${state.box[firstWord]}`);
assert(state.doneToday === 1, `doneToday=1，实际 ${state.doneToday}`);
assert(!(firstWord in state.wrongToday), "答对不进 wrongToday");
assert(cur() !== firstWord, "已自动进入下一题");

// 4. 再答对一题
{
  const o2 = registry["options"];
  const c2 = o2.children.findIndex((b) => b.textContent === WORDS[cur()].cn);
  const w2 = cur();
  o2.children[c2].onclick();
  assert(state.box[w2] === 1 && state.doneToday === 2, "连续答对累计正确");
}

// 5. 答错：box → 0，wrongToday +1，词重回队列，出现「继续」按钮
let w3 = null;
{
  w3 = cur();
  const o3 = registry["options"];
  const wrongBtn = o3.children.find((b) => b.textContent !== WORDS[w3].cn);
  wrongBtn.onclick();
  assert(state.box[w3] === 0, `答错后 box=0，实际 ${state.box[w3]}`);
  assert(state.wrongToday[w3] === 1, "wrongToday 记录 +1");
  assert(q().includes(w3), "错词重新排回队列");
  assert(registry["feedback"].innerHTML.includes("继续"), "答错出现继续按钮");
  // 点击继续 → 出下一题
  registry["contBtn"].onclick();
  assert(!registry["quiz"].hidden, "继续后仍在答题界面");
}

// 6. 持久化：state 已写入 localStorage，重新 parse 与内存一致
{
  const saved = JSON.parse(localStorage.getItem("gqf_state_v1"));
  assert(saved.box[w3] === undefined || saved.box[w3] === 0, "持久化的 box 正确");
  assert(saved.doneToday === 3, `持久化 doneToday=3，实际 ${saved.doneToday}`);
  assert(saved.wrongToday[String(w3)] === 1, "持久化 wrongToday 正确");
}

// 7. 掌握度统计渲染
{
  const m = registry["masteryVal"].textContent;
  assert(/^\d+ \/ \d+$/.test(m), `掌握度格式正确：${m}`);
}

// 8. 全部答对直到队列空 → showDone（快速路径：直接把 box 全设 4 并重建队列）
{
  // 模拟「全掌握」：全部词 box=4
  for (let i = 0; i < WORDS.length; i++) { state.box[i] = 4; }
  buildQueue();
  nextQuestion();
  assert(q().length === 0 && registry["doneWrap"].hidden === false, "队列空时进入完成页");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
