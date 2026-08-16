# GMAT Quant Flash — 项目规范

## 定位

GMAT 数学概念英文→中文映射闪卡工具（多邻国式），供 Kai 在 iPhone 碎片时间刷词，
目标：看到 GMAT 题目中的英文数学概念词瞬间反应出它考什么。**10 天考试窗口（2026-08-26 前后）。**

## 技术约定

- **纯静态单页**：`index.html`（UI + 引擎内联）+ `words.js`（词库数据）。无构建、无框架、无依赖
- 部署 GitHub Pages，iPhone Safari 添加到主屏幕使用
- 数据存 localStorage，键名前缀 `gqf_`；刷词进度/Leitner box 均在其中
- **不要 Service Worker 缓存**：10 天窗口内词库会频繁更新，缓存会导致手机拿不到新版

## 词库数据结构（words.js）

```js
{ en: "consecutive integers", cn: "连续整数", hint: "…", example: "…", cat: "number" }
```

- `en` 英文概念词；`cn` 中文概念名；`hint` 一句话概念本质/速记；`example` GMAT 风格题目例句；`cat` 六大专题之一
- 专题：`number`（数论与算术）｜`algebra`（代数）｜`geometry`（几何）｜`stats`（统计与集合）｜`prob`（概率与组合）｜`word`（文字题表达）
- 词库更新只动 `words.js`，不动 index.html

## 交互原则

- 移动端优先：打开即刷，无需选择、无启动页；单手拇指可完成全部操作
- 反馈即时：答对绿色自动下一题；答错红色 + 展示正确项，必须手动点「继续」
- 重复机制：答错当日重练；答对进 Leitner box（1/3/7 天后复现）
- 进度可见：顶部轻量进度（今日已刷/词库掌握度），不打断刷题流

## 修改纪律

- 改完必须本地验证：`node --check words.js` 语法 + 起本地服务 curl 验证 200
- 部署前先在桌面浏览器手机视口过一遍主链路
