# GMAT Quant Flash

多邻国式 GMAT 数学概念闪卡：英文概念 → 中文概念映射，全部放在 GMAT 真题语境里练。为手机碎片时间刷题设计（iPhone Safari 添加到主屏幕即可全屏使用）。

## 功能

- **130+ 概念卡**，覆盖六大专题：数论与算术、代数、几何、统计与集合、概率与组合、文字题表达
- 每张卡 = 英文概念 + **GMAT 风格题目例句** + 一句话概念本质
- **四选一刷题**：看到英文概念选中文；答对绿色自动下一题，答错当天反复重见直到答对
- **间隔重复**：答对进 1/3/7 天复习箱，连续 4 次答对算掌握
- **进度自动保存**（localStorage），随时退出随时回来

## 设计动机

目标不是背单词表，而是**看题反应速度**：看到 "consecutive integers"、"hypotenuse" 的瞬间就知道题目在考什么。所以每个词都放在 GMAT 风格句子里练，而不是裸词条；错词当天高频重见（多邻国式短循环）。

## 运行

纯静态，零构建零依赖：

```bash
python3 -m http.server 8787    # 打开 http://127.0.0.1:8787
```

已部署 GitHub Pages。iPhone：Safari 打开网址 → 分享 → 添加到主屏幕。

## 测试

```bash
node tests/logic.test.mjs      # 282 断言：引擎状态机 + 词库完整性
```

## 结构

```
index.html        # UI + 引擎（单文件，内联 JS/CSS）
words.js          # 词库（内容都在这）
tests/logic.test.mjs  # DOM stub 冒烟测试（跑真实引擎代码）
docs/problem.md   # 问题定义与设计决策
```
