# GMAT Quant Flash

A Duolingo-style flashcard app for building instant recognition of GMAT Quant math terminology — English concept → Chinese concept mapping, trained in real GMAT question contexts. Built for fragmented-time practice on a phone (add to Home Screen as a PWA).

## What it does

- **130+ concept cards** across 6 domains: Number Properties & Arithmetic, Algebra, Geometry, Statistics & Sets, Probability & Counting, Word-Problem Expressions
- Each card: English concept + a **GMAT-style question sentence** + one-line essence of the concept
- **Multiple-choice drilling**: pick the Chinese concept for the shown English term; correct answers flash green and auto-advance, wrong answers are re-queued the same day until you get them right
- **Spaced repetition**: correct answers graduate through 1 / 3 / 7-day boxes; 4 consecutive corrects = mastered
- **Progress persists** in localStorage; open it, drill, leave, come back anytime

## Why this design

The goal is not vocabulary memorization but **reading speed on real questions**: the moment you see "consecutive integers" or "hypotenuse" in a GMAT problem, you should instantly know what it's testing. That's why every card is trained inside a GMAT-style sentence rather than as a bare dictionary entry, and why wrong answers resurface aggressively the same day (Duolingo-style short loops).

## Run

Static site, zero build, zero dependencies.

```bash
python3 -m http.server 8787    # then open http://127.0.0.1:8787
```

Deployed to GitHub Pages. On iPhone: open the URL in Safari → Share → Add to Home Screen.

## Test

```bash
node tests/logic.test.mjs      # 282 assertions: engine state machine + word bank integrity
```

## Structure

```
index.html        # UI + engine (single file, inline JS/CSS)
words.js          # word bank (the content lives here)
tests/logic.test.mjs  # DOM-stub smoke tests of the real engine code
docs/problem.md   # problem definition & design decisions
```
