---
title: FrameBuf Version Timeline
description: Interactive vis-timeline MicroSim for framebuf version timeline.
image: /sims/framebuf-version-timeline-explorer/framebuf-version-timeline-explorer.png
og:image: /sims/framebuf-version-timeline-explorer/framebuf-version-timeline-explorer.png
twitter:image: /sims/framebuf-version-timeline-explorer/framebuf-version-timeline-explorer.png
social:
   cards: false
quality_score: 0
---

# FrameBuf Version Timeline

<iframe src="main.html" height="612px" width="100%" scrolling="no"></iframe>

[Run the FrameBuf Version Timeline MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This timeline lays out how `framebuf` grew from basic shapes into the drawing toolkit this book uses. It runs from the years before v1.17, through the August 2022 development-branch merge, to the v1.20.0 stable release in April 2023 and the v1.24.1 bug fix in 2024. Your goal is to interpret that sequence and summarize why the eight-month gap between the merge and the release matters when you pick a MicroPython version to install. The color coding separates official stable releases from development-branch activity that no ordinary user could install yet.

## How to Use

1. Hover over any milestone to read a one-sentence preview in a tooltip.
2. Click a milestone to open its full description and a "Why it matters" note in the panel below the timeline.
3. Check **Show only stable releases** to hide the development-branch merge and the nightly-build period, then compare that tidy story with the full one.
4. Drag the timeline sideways to pan, or use the arrow, **+**, and **&minus;** buttons.
5. Click **Fit All** to return to the complete 2015-2026 view.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/framebuf-version-timeline-explorer/main.html"
        height="612px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that `framebuf` is the MicroPython module that holds a drawing buffer in memory, from Chapter 4
- Familiarity with `ellipse()` and `poly()` and what they can draw, from Chapter 7
- Understanding that a pull request is a proposed code change a maintainer must review, from earlier in Chapter 8
- Comfort reading a horizontal timeline from left to right

### Activities

1. **Exploration** (5 min): Hover across every milestone from left to right and write the six events down in order, noting the color of each one.
2. **Guided Practice** (5 min): Click the August 2022 merge and then the April 2023 release. Read both "Why it matters" notes and calculate how many months separated them. Then explain what a programmer's only option was during those months.
3. **Assessment** (5 min): Check **Show only stable releases** and describe in two sentences what the story looks like without the amber events. Then explain which version you would install today and why.

### Assessment

- The student states that `ellipse()` and `poly()` were merged in August 2022 but did not reach a stable release until April 2023, about eight months later.
- The student explains that a nightly build was the only way to use `ellipse()` during that gap, and names at least one risk of using one.
- The student identifies v1.20.0 as the earliest stable version that supports the drawing code in this book.
- The student explains that v1.24.1 is a patch release, so it fixed a bug in `ellipse()` rather than adding a new feature.

## References

1. [MicroPython framebuf Module Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The official reference for every `framebuf` drawing method, including `ellipse()` and `poly()`.
2. [MicroPython Downloads and Releases](https://micropython.org/download/) - Where official stable release firmware, including v1.20.0 and later, is published.
3. [Software versioning - Wikipedia](https://en.wikipedia.org/wiki/Software_versioning) - Background on major, minor, and patch numbers such as the three parts of v1.24.1.
4. [vis-timeline Documentation](https://visjs.github.io/vis-timeline/docs/timeline/) - The JavaScript library used to render this interactive timeline.
