---
title: Old Workaround vs. New ellipse() Call
description: Interactive HTML/CSS/JS MicroSim for old workaround vs. new ellipse() call.
image: /sims/ellipse-workaround-before-after-toggle/ellipse-workaround-before-after-toggle.png
og:image: /sims/ellipse-workaround-before-after-toggle/ellipse-workaround-before-after-toggle.png
twitter:image: /sims/ellipse-workaround-before-after-toggle/ellipse-workaround-before-after-toggle.png
social:
   cards: false
quality_score: 0
---

# Old Workaround vs. New ellipse() Call

<iframe src="main.html" height="712px" width="100%" scrolling="no"></iframe>

[Run the Old Workaround vs. New ellipse() Call MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

The same circle can be drawn two ways, and this MicroSim puts them side by side. One approach is the pre-2023 workaround: import `math`, loop around the circle, and connect points with `fb.line()`. The other is the single `fb.ellipse()` call that MicroPython has shipped since v1.20.0. Your goal is to contrast the two and differentiate exactly what each one costs in code, in memory, and in mental effort. The circle on the display never changes when you toggle, so the only visible difference is the difference that actually matters.

## How to Use

1. Click **Old Workaround** or **New ellipse() Call** to swap the code panel. Watch the display panel stay exactly the same.
2. Watch the counter at the top count between 11 lines and 1 line as you toggle.
3. Hover over the code panel to highlight the single line that draws the circle's edge in each version.
4. Read the colored badge under each code block to see what that approach requires beyond the code itself.
5. Click **Why does this matter?** to reveal a short summary connecting the difference back to one contributor's pull request.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/ellipse-workaround-before-after-toggle/main.html"
        height="712px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Reading a simple Python function definition, a `for` loop, and an `import` statement, from Chapters 3 and 4
- Drawing into a frame buffer with `fb.line()`, from Chapter 6
- Calling `fb.ellipse()` with a center point and two radii, from Chapter 7
- Knowing that a version number such as v1.20.0 identifies one release of MicroPython, from earlier in Chapter 8

### Activities

1. **Exploration** (5 min): Toggle between the two states three or four times, watching only the display panel. Write one sentence describing what changed on the display, and one describing what changed in the code.
2. **Guided Practice** (5 min): Hover over each code panel and find the highlighted line. In the workaround, list every other line that has to run before that highlighted line can work. Then count how many supporting lines the `ellipse()` version needs.
3. **Assessment** (5 min): Using the two badges, write a short comparison of what each approach requires. Then click **Why does this matter?** and decide whether your comparison agrees with the summary.

### Assessment

- The student states that the circle on the display is identical in both states, so the output is not what changed.
- The student identifies the `fb.line()` call as the drawing step in the workaround and the whole `fb.ellipse()` call in the current version.
- The student names at least three costs of the workaround: the `math` import, the loop, the trigonometry, or tracking the previous point.
- The student explains that `ellipse()` became available to everyone only after a contributed change was merged and then shipped in a stable release.

## References

1. [MicroPython framebuf Module Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The official reference for `ellipse()`, `poly()`, and the older drawing methods.
2. [MicroPython Downloads and Releases](https://micropython.org/download/) - Where official stable releases, including v1.20.0 and later, are published.
3. [MicroPython - Wikipedia](https://en.wikipedia.org/wiki/MicroPython) - Background on the project, its history, and its open source development model.
4. [Distributed version control - Wikipedia](https://en.wikipedia.org/wiki/Distributed_version_control) - Context for pull requests, development branches, and how a contributed change reaches a release.
