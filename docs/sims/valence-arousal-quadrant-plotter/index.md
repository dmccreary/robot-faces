---
title: Valence-Arousal Quadrant Plotter
description: Interactive p5.js MicroSim for valence-arousal quadrant plotter.
image: /sims/valence-arousal-quadrant-plotter/valence-arousal-quadrant-plotter.png
og:image: /sims/valence-arousal-quadrant-plotter/valence-arousal-quadrant-plotter.png
twitter:image: /sims/valence-arousal-quadrant-plotter/valence-arousal-quadrant-plotter.png
social:
   cards: false
quality_score: 0
---

# Valence-Arousal Quadrant Plotter

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run the Valence-Arousal Quadrant Plotter MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

The valence-arousal model describes any feeling with two numbers instead of a
name: how pleasant it is, and how energetic it is. This plotter lets you apply
that model yourself. Click anywhere on the grid to drop a point, and the panel
names the quadrant it landed in and lists every expression close enough to be
confused with it. Watching afraid, angry, and disgusted crowd into one corner
is the fastest way to see why simple faces mix them up.

## How to Use

1. Hover any of the thirteen expression markers to see its name and a one-line
   reason for its placement.
2. Click anywhere inside the grid to drop your own point. Your points are
   purple and numbered, so they never look like the presets.
3. Read the panel on the right: it gives the valence and arousal values, the
   quadrant name, and the nearby expressions with their distances.
4. Uncheck **Show all 13 expressions** to blank the grid and practice placing
   expressions from memory.
5. Click **Reset My Points** to clear only your own points.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/valence-arousal-quadrant-plotter/main.html"
        height="502px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- The thirteen named expressions from Chapter 10
- Chapter 10's finding that some emotions are recognized far more reliably
  than others
- This chapter's definition of valence and arousal as two continuous dimensions
- Reading a coordinate pair on a two-axis grid

### Activities

1. **Exploration** (5 min): Hover all thirteen markers and write down which
   quadrant holds the most expressions. Explain why that crowding matters.
2. **Guided Practice** (5 min): Turn the markers off, then place points where
   you think happy, afraid, sad, and sleepy belong. Turn the markers back on
   and measure how close you got.
3. **Assessment** (5 min): Place a point for an emotion not in the set, such as
   bored or proud, name its quadrant, and list which named expressions your
   robot might be confused with if you tried to draw it.

### Assessment

- Correctly names the quadrant for any point placed on the grid
- Identifies afraid, angry, and disgusted as sharing the unpleasant, energetic
  quadrant
- Explains, using grid distance, why afraid and surprised are confused more
  often than happy and sad
- Uses the nearby list to justify a design change that separates two
  confusable expressions

## References

1. [Emotion classification - Wikipedia](https://en.wikipedia.org/wiki/Emotion_classification#Dimensional_models) -
   Dimensional models of emotion, including the valence-arousal circumplex.
2. [Affective computing - Wikipedia](https://en.wikipedia.org/wiki/Affective_computing) -
   The wider field that uses these two dimensions in real systems.
3. [Paul Ekman - Wikipedia](https://en.wikipedia.org/wiki/Paul_Ekman) - The
   named-category approach this grid complements rather than replaces.
4. [p5.js Reference](https://p5js.org/reference/) - The drawing and mouse
   functions behind the grid and its click handling.
