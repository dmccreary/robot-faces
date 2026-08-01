---
title: Screen-Based Robot Face Timeline
description: Interactive vis-timeline MicroSim for screen-based robot face timeline.
image: /sims/robot-face-timeline-explorer/robot-face-timeline-explorer.png
og:image: /sims/robot-face-timeline-explorer/robot-face-timeline-explorer.png
twitter:image: /sims/robot-face-timeline-explorer/robot-face-timeline-explorer.png
social:
   cards: false
quality_score: 0
---

# Screen-Based Robot Face Timeline

<iframe src="main.html" height="582px" width="100%" scrolling="no"></iframe>

[Run the Screen-Based Robot Face Timeline MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This timeline lays out thirteen years of screen-faced robot history in a single view. It runs from Anki's founding in 2010 through Miko's steady stream of new models in the 2020s. Each event is color-coded by company, so you can follow one company's story or compare all four robots at once. Your goal is to interpret the order of these milestones and summarize how Anki's 2019 shutdown lines up in time with the other robots' releases.

## How to Use

1. Click **Show All** to see every milestone, or click a company button to show only that company's events.
2. Hover over any event to read a one-sentence preview in a tooltip.
3. Click an event to open its full description and a "Why it matters" note in the panel below the timeline.
4. Drag the timeline sideways to pan, or use the arrow, **+**, and **&minus;** buttons.
5. Click **Fit All** to return to the full 2010-2023 view.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/robot-face-timeline-explorer/main.html"
        height="582px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that a robot face can be an animated screen rather than a set of moving parts, from Chapter 1
- Understanding that a display draws pixels under the control of a program, from Chapter 1
- Comfort reading a horizontal timeline from left to right
- No programming experience is required

### Activities

1. **Exploration** (5 min): Click **Show All**, hover across the events from left to right, and write down the four robots in the order they were released.
2. **Guided Practice** (5 min): Filter to **Anki: Cozmo and Vector** and click each event in order. How much time separated the Vector release from the shutdown? Then filter to **Emotix: Miko** and describe how that company's pattern looks different.
3. **Assessment** (5 min): Click the 2019 shutdown event and the Miko event, read both "Why it matters" notes, then write two sentences summarizing what the timing of Anki's shutdown suggests about shipping a robot versus sustaining a company.

### Assessment

- The student lists Cozmo, Miko, Vector, and Buddy in the correct order of release.
- The student states that Anki shut down less than a year after Vector shipped, not before it.
- The student explains that Vector outlived its parent company because another company acquired and relaunched it.
- The student contrasts Miko's steady release pattern with Buddy's repeated delays, citing events from the timeline.

## References

1. [Anki (company) - Wikipedia](https://en.wikipedia.org/wiki/Anki_(company)) - Background on Anki's founding, its Cozmo and Vector products, and its 2019 shutdown.
2. [Anki Vector - Wikipedia](https://en.wikipedia.org/wiki/Anki_Vector) - Details on the Vector robot, its animated screen face, and what happened to it after Anki closed.
3. [Social robot - Wikipedia](https://en.wikipedia.org/wiki/Social_robot) - Broader context on robots designed to interact with people through expression.
4. [vis-timeline Documentation](https://visjs.github.io/vis-timeline/docs/timeline/) - The JavaScript library used to render this interactive timeline.
