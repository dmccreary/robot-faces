---
title: Ekman Emotion Feature Map
description: Interactive p5.js MicroSim for ekman emotion feature map.
image: /sims/ekman-emotion-feature-map/ekman-emotion-feature-map.png
og:image: /sims/ekman-emotion-feature-map/ekman-emotion-feature-map.png
twitter:image: /sims/ekman-emotion-feature-map/ekman-emotion-feature-map.png
social:
   cards: false
quality_score: 0
---

# Ekman Emotion Feature Map

<iframe src="main.html" height="552px" width="100%" scrolling="no"></iframe>

[Run the Ekman Emotion Feature Map MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Paul Ekman's seven universal emotions are the research this book's whole expression set is built on. This map turns each one into something you can actually draw: a specific eyebrow position, eye shape, and mouth shape, shown on a small robot face. Click any emotion to explain that combination in your own words, and read which FACS action units psychologists link to it. The colored badges show which emotions viewers recognize reliably and which ones research says get confused.

## How to Use

1. Hover over any of the seven faces to preview its eyebrow, eye, and mouth combination in a tooltip.
2. Click a face to fill the panel below with the full recipe, its FACS action units, and a note on drawing it.
3. Compare the badge colors. Green means viewers read that emotion reliably, and amber means it is often confused.
4. Click **Compare Fear vs. Disgust** to put the two lowest-accuracy emotions side by side.
5. Read the amber callout to see which shared features make those two so easy to mix up.
6. Click **Back to One Emotion** to return to the single-emotion view.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/ekman-emotion-feature-map/main.html"
        height="552px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 9's parameterized face, where eyebrow angle, eye size, and mouth curvature are independent numbers.
- Chapter 9's face state dictionary, which holds one whole expression as a set of values.
- This chapter's Basic Emotion Theory, which separates simple universal emotions from complex blended ones.
- This chapter's Emotion Recognition Accuracy discussion, which explains why some faces read more reliably than others.

### Activities

1. **Exploration** (5 min): Click all seven emotions in order. For each one, say out loud which single feature you think carries the most meaning, then check your answer against the "On a robot face" note.
2. **Guided Practice** (5 min): Pick the two green-badged emotions and write one sentence explaining what their recipes have in common that makes them so easy to read.
3. **Assessment** (5 min): Press Compare Fear vs. Disgust. Write down two features the two share, then propose one change to the disgust recipe that would pull it further away from fear.

### Assessment

- The student can explain, without looking, which eyebrow and mouth combination produces happiness and which produces sadness.
- The student can name at least two FACS action units and say which emotion each belongs to.
- The student can state why fear and disgust score low on recognition accuracy for a simple robot face.
- The student can connect at least three of Ekman's emotions to specific `face_state` parameter values from Chapter 9.

## References

1. [Paul Ekman - Wikipedia](https://en.wikipedia.org/wiki/Paul_Ekman) - background on the psychologist behind the universal emotion research.
2. [Facial Action Coding System - Wikipedia](https://en.wikipedia.org/wiki/Facial_Action_Coding_System) - the full FACS scheme the action-unit names in this map come from.
3. [Emotion classification - Wikipedia](https://en.wikipedia.org/wiki/Emotion_classification) - how basic-emotion models compare with other ways of organizing emotion, including the debate over universality.
4. [Microexpression - Wikipedia](https://en.wikipedia.org/wiki/Microexpression) - related Ekman research on brief, involuntary expressions.
