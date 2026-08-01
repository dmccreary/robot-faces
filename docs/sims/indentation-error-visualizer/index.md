---
title: Indentation Error Visualizer
description: Interactive p5.js MicroSim for indentation error visualizer.
image: /sims/indentation-error-visualizer/indentation-error-visualizer.png
og:image: /sims/indentation-error-visualizer/indentation-error-visualizer.png
twitter:image: /sims/indentation-error-visualizer/indentation-error-visualizer.png
social:
   cards: false
quality_score: 0
---

# Indentation Error Visualizer

<iframe src="main.html" height="482px" width="100%" scrolling="no"></iframe>

[Run the Indentation Error Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

In MicroPython, the blank space at the start of a line is not decoration. It is how the language decides which lines belong inside a loop, and getting it wrong stops the program before anything prints. This MicroSim shows a three-line loop with every space drawn as a countable gray dot. Move the indent of line 2 one space at a time and watch the status box report exactly what MicroPython would say. Your goal is to explain why consistent indentation is required, and to classify any line as correct, under-indented, or mixing tabs with spaces.

## How to Use

1. Start at the default: line 2 indented four spaces, status **Valid**, output "Blink 0 / Blink 1 / Blink 2".
2. Click **&minus;** to shrink the indent one space at a time, all the way down to zero.
3. Click **+** to grow the indent up to eight spaces, and read each new error message.
4. Check **Use a tab instead of spaces on line 2** to see the TabError that mixing tabs and spaces produces.
5. Click **Reset** to return to the correct four-space version.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/indentation-error-visualizer/main.html"
        height="482px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that a `for` loop repeats a block of code, from earlier in Chapter 3
- Knowing that a line ending in a colon starts a block, from earlier in Chapter 3
- Understanding that `print()` sends text back to your computer, from earlier in Chapter 3
- Recognizing that a program can fail before it produces any output

### Activities

1. **Exploration** (5 min): Step the indent from 4 down to 0, then from 4 up to 8. Write down every different status message you see and the depth that produced it.
2. **Guided Practice** (5 min): Set the depth to 0 and read the error out loud in your own words. Then set it to 6 and explain why MicroPython calls line 3 a mismatch instead of line 2.
3. **Assessment** (5 min): Turn on the tab toggle and explain to a partner why a tab and four spaces can look identical on screen but still break the program.

### Assessment

- The student states that indentation is what marks a block in MicroPython, not just a style choice.
- The student classifies a zero-space line 2 as under-indented and names the "expected an indented block" error.
- The student explains that a mismatch error points at line 3 because line 2 already set the block's depth.
- The student explains that tabs and spaces look alike but are different characters, which is why mixing them raises a TabError.

## References

1. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - Official reference for the MicroPython language and its error messages.
2. [Python Style Guide, PEP 8: Indentation](https://peps.python.org/pep-0008/#indentation) - The convention of four spaces per indentation level, and the rule against mixing tabs with spaces.
3. [Off-side rule - Wikipedia](https://en.wikipedia.org/wiki/Off-side_rule) - The general idea of using indentation to define blocks, which Python and MicroPython both follow.
4. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to draw this MicroSim.
