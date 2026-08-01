---
title: Capstone Rubric Scoring Tool
description: Interactive p5.js MicroSim for capstone rubric scoring tool.
image: /sims/capstone-rubric-scoring-tool/capstone-rubric-scoring-tool.png
og:image: /sims/capstone-rubric-scoring-tool/capstone-rubric-scoring-tool.png
twitter:image: /sims/capstone-rubric-scoring-tool/capstone-rubric-scoring-tool.png
social:
   cards: false
quality_score: 0
---

# Capstone Rubric Scoring Tool

<iframe src="main.html" height="722px" width="100%" scrolling="no"></iframe>

[Run the Capstone Rubric Scoring Tool MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Reading a rubric is easy. Using one on somebody else's real project is where the
skill actually lives. This tool hands you four sample capstone plans of very
different quality and asks you to judge each one against the full twelve-criterion
capstone rubric: Chapter 11's original seven, plus five that only make sense once
a whole project is under review. Every rating needs a written justification, and
once all twelve are done the tool assembles your own sentences into a single peer
review summary ready to hand to the presenter.

## How to Use

1. Pick a plan from the **Load Sample Plan** menu. The card on the left shows the
   full plan: expression list with parameter notes, target display, control
   scheme, and idle animation description.
2. Read the criterion name on each rubric row, and its guiding question in the
   panel on the right.
3. Choose one of the four ratings for that row: **Needs Work**, **Developing**,
   **Solid**, or **Excellent**. Your choice stays colored so the row reads at a
   glance.
4. Type a justification in the box beside the ratings. Name the criterion, point
   at specific evidence in the plan, and suggest a next step.
5. Press **Next Criteria** to move through all twelve rows. The progress readout
   tells you how many rows have both a rating and a reason.
6. **Compose Peer Feedback** unlocks only when all twelve rows are complete. It
   assembles your justifications, in rubric order, into one written summary.
7. Press **Select All Text** to copy the summary, or **Back to Review** to keep
   editing. **Start New Review** clears everything and begins again.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/capstone-rubric-scoring-tool/main.html"
        height="722px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 11's Emotional Design Rubric and its seven criteria, which make up the
  first seven rows here.
- Confusable-neighbor reasoning from Chapter 11, especially how surprised and
  afraid crowd each other.
- The idle animation and `ticks_ms()` timing ideas from Chapter 12.
- The capstone requirement checklist from this chapter, which the five new
  criteria are drawn from.

### Activities

1. **Exploration** (5 min): Load Plan A, the rough draft, and rate just the two
   criteria you feel most confident about. Compare your wording with a partner's.
   Whose justification would be more useful to the person who wrote the plan?
2. **Guided Practice** (5 min): Complete a full twelve-row review of Plan A, then
   compose the feedback. Read it back and mark any justification that could apply
   to any project. Those are the ones to rewrite with specific evidence.
3. **Assessment** (5 min): Switch to Plan C, the very ambitious one, and review
   it. Plan C has far more expressions than the requirement asks for, so decide
   whether that helps or hurts each criterion and say why in writing. Plans B and
   D are both complete but in opposite ways, so they are worth comparing too.

### Assessment

- All twelve rows carry a rating and a justification before feedback is composed.
- Justifications name specific evidence from the plan rather than a general
  impression.
- Ratings are defensible: a plan with six expressions does not earn Excellent on
  expression set completeness.
- The composed summary would be genuinely useful to the plan's author, including
  at least one concrete next step.

## References

1. [Rubric (academic) - Wikipedia](https://en.wikipedia.org/wiki/Rubric_(academic)) -
   Why scoring against named criteria beats one overall impression.
2. [Peer review - Wikipedia](https://en.wikipedia.org/wiki/Peer_review) -
   The wider practice this classroom design review is a small version of.
3. [Design review - Wikipedia](https://en.wikipedia.org/wiki/Design_review) -
   How engineering teams check a design before it is built.
4. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   The drawing surface each reviewed plan will eventually be built on.
