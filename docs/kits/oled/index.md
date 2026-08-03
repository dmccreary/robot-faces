# Robot Faces - OLED Kit - List of Hands on Labs

Each lesson is a short, hands-on walkthrough of one idea, with a complete program you can paste onto your microcontroller and a picture of what it draws on a real 128 by 64 display.

## Getting Oriented

| Lesson | What you'll learn |
|--|--|
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
| [Eyebrows](eyebrows/index.md) | The single most expressive feature on a robot face |
| [Winking with a Smile](wink/index.md) | Combining a closed eye and a curved mouth |
| [Blinking](blinking/index.md) | Reading a push button and reacting with both eyes |
| [Emotion Types](emotion-types/index.md) | The core expression set and how to draw each one |
| [Sleeping Faces](sleeping-faces/index.md) | Closed eyes, drooping eyebrows, and a drifting `Zzz` |

## Thinking About Your Code

The lessons above teach you how to make the hardware do something. These eight teach you how to
think about the code you just wrote — the four habits that transfer to every program you will
ever write, taught on code you already understand.

Work them in order, and only after you have finished the lessons above. Each one solves a
problem you have already felt, which is what makes it stick.

| Lesson | Thinking skill | What you'll learn |
|--|--|--|
| [The Face Module](face-module/index.md) | Decomposition, abstraction | Move the duplicated face parts into one shared file |
| [The Emotion Table](emotion-table/index.md) | Pattern recognition | Seven emotions become seven rows of data and one function |
| [Five Broken Faces](broken-faces/index.md) | Debugging | Five planted bugs, a method for finding them, and a symptom table |
| [Trace and Watch](trace-and-watch/index.md) | Debugging by measurement | An on-screen instrument panel for bugs you cannot photograph |
| [Keyframes](keyframes/index.md) | Algorithms | An animation is a list of poses, and one player runs them all |
| [A Face With a Memory](state-machine/index.md) | Abstraction, modeling | States and transitions as tables, instead of tangled if-statements |
| [Only Redraw What Changed](partial-redraw/index.md) | Decomposition, measurement | Redraw just the moving part, then measure whether it helped |
| [Design Your Own Emotion](design-your-own/index.md) | All four | Invent an expression and test whether a stranger can read it |
| [How Fast Is a Face?](draw-speed-timing/index.md) | Measurement, algorithms | Race a hand-written `ellipse()` against the built-in, and explain the gap |

## Kit Packaging & Accessories

| Resource | Description |
|--|--|
| [Box Cover Guide & Overview](box-cover/index.md) | Printable box cover specifications and instructions |
| [9" × 6" Box Cover (1 per Sheet)](box-cover.html) | Printable 9" × 6" box cover formatted for 8.5" × 11" landscape paper |
| [6" × 4" Dual Box Covers (2 per Sheet)](box-cover-2.html) | Printable 6" × 4" dual box covers formatted on a single 8.5" × 11" portrait sheet |

