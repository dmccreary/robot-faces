# List of Lessons

Each lesson is a short, hands-on walkthrough of one idea, with a complete program you can paste onto your microcontroller and a picture of what it draws on a real 128 by 64 display.

## Getting Oriented

| Lesson | What you'll learn |
|--|--|
| [History of Robot Faces](history-of-robot-faces/index.md) | Where screen-based robot faces came from and why they caught on |
| [Screen Coordinates](screen-coordinates/index.md) | How `x` and `y` map to the display, and why `y` grows downward |
| [Basic Drawing Commands](drawing-commands/index.md) | A tour of every framebuffer command, plus the standard setup preamble |

## The Drawing Primitives

These eight lessons cover every drawing command the MicroPython framebuffer offers. Work through them in order and you will have the complete toolkit.

| Lesson | Command |
|--|--|
| [Pixel](pixel/index.md) | `pixel()` — the single dot everything else is built from |
| [Line](line/index.md) | `hline()`, `vline()`, and `line()` — including the eyebrow rule |
| [Rectangle](rectangle/index.md) | `rect()` and `fill_rect()`, and how to erase with black |
| [Ellipse](ellipse/index.md) | `ellipse()` and the quadrant fill codes |
| [Circle](circle/index.md) | Circles as a special case of the ellipse |
| [Polygon](polygon/index.md) | `poly()` for triangles, stars, and any shape you can list points for |
| [Text](text/index.md) | `text()` and the 8 by 8 font layout math |
| [Scroll](scroll/index.md) | `scroll()` for sliding the whole buffer at once |
| [Blit](blit-commands/index.md) | `blit()` for stamping a finished sprite, with transparency |

## Building Faces

| Lesson | What you'll learn |
|--|--|
| [Basic Face Layouts](basic-face-layouts/index.md) | Placing eyes and a mouth so they read as a face |
| [Eye Scanner](eye-scanner/index.md) | Animating a pupil that sweeps back and forth |
| [Interactions](interactions/index.md) | Responding to buttons and sensors |
| [Eyebrows](eyebrows/index.md) | The single most expressive feature on a robot face |
| [Emotion Types](emotion-types/index.md) | The core expression set and how to draw each one |
| [Winking with a Smile](wink/index.md) | Combining a closed eye and a curved mouth |
| [Sleeping Faces](sleeping-faces/index.md) | Closed eyes, drooping eyebrows, and a drifting `Zzz` |
