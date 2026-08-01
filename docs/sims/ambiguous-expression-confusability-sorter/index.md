---
title: Ambiguous Expression Confusability Sorter
description: Interactive p5.js MicroSim for ambiguous expression confusability sorter.
image: /sims/ambiguous-expression-confusability-sorter/ambiguous-expression-confusability-sorter.png
og:image: /sims/ambiguous-expression-confusability-sorter/ambiguous-expression-confusability-sorter.png
twitter:image: /sims/ambiguous-expression-confusability-sorter/ambiguous-expression-confusability-sorter.png
social:
   cards: false
quality_score: 0
---

# Ambiguous Expression Confusability Sorter

<iframe src="main.html" height="542px" width="100%" scrolling="no"></iframe>

[Run the Ambiguous Expression Confusability Sorter MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Some robot faces honestly support more than one reading, and a designer has to
be able to say exactly why. This sorter loads five faces built from deliberately
ambiguous parameter sets and asks you to judge which two named emotions each
one could plausibly be. After you submit your pair, the feedback panel always
explains which eyebrow, eye, and mouth values the two readings share. Naming
that overlap out loud is the skill this chapter is really after.

## How to Use

1. Study the face on the left and the short parameter summary printed under it.
2. Click two expression-name chips to move them into the answer zone. Clicking
   a chip again takes it back.
3. Press **Submit** once both slots are filled. Your pair is compared with the
   reference pair, and the result is marked as a full match, a partial match, or
   a different reading.
4. Read the justification, which appears whether or not your pair matched.
5. Press **New Ambiguous Face** to load the next case. **Clear Answer** empties
   both slots before you submit.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/ambiguous-expression-confusability-sorter/main.html"
        height="542px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- The thirteen named expressions and their parameter recipes from Chapter 10
- Chapter 10's finding that recognition accuracy is uneven across emotions
- This chapter's ideas of expression intensity and expression ambiguity
- The valence-arousal model, which explains why some pairs sit close together

### Activities

1. **Exploration** (5 min): Work through all five cases. Before you place any
   chip, write one sentence naming the feature that makes each face unclear.
2. **Guided Practice** (5 min): Run the cases again. For every reference pair,
   name the one parameter you would change to break the tie, and say which of
   the two emotions your change would push the face toward.
3. **Assessment** (5 min): Pick the case you found hardest and write a short
   critique: the two readings, the shared features, and your recommended fix.

### Assessment

- Places a defensible pair for at least four of the five cases
- Cites specific parameters, not general impressions, when justifying a pair
- Explains why afraid and surprised overlap more than happy and sad do
- Proposes a concrete parameter change that would make one case unambiguous

## References

1. [Emotion classification - Wikipedia](https://en.wikipedia.org/wiki/Emotion_classification) -
   How researchers group emotions, including the models this chapter compares.
2. [Facial expression - Wikipedia](https://en.wikipedia.org/wiki/Facial_expression) -
   Background on how faces signal emotion and where signals overlap.
3. [Human-robot interaction - Wikipedia](https://en.wikipedia.org/wiki/Human%E2%80%93robot_interaction) -
   The research field that studies how people read a robot's expressions.
4. [p5.js Reference](https://p5js.org/reference/) - The drawing functions used
   to render each ambiguous face.
