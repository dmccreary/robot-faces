# Lab 4: Drawing Lines

`hline()` and `vline()` take a start point and a length; `line()` takes two full end points and walks a diagonal. Reach for `hline`/`vline` whenever a line is perfectly horizontal or vertical — they skip the angle math, and because they send one run of pixels instead of walking a diagonal dot by dot, they're also the faster call on this display.

## Sample Program Code

A box built from lines on top, an angry face built entirely out of lines on the bottom:

```py
# Lab 04: Drawing Lines
# hline() and vline() take a start point plus a length; line() takes two
# full end points. Reach for hline/vline when you can -- they skip the
# angle math, and on this display they also send one run of pixels
# instead of walking the line a dot at a time.

import config

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK

display.fill(BLACK)

# top: a box built from two hlines and two vlines, with an X of general
# lines inside. It is centered, because a box in the corner of a round
# screen is a box you cannot see.
BOX_X = 70
BOX_Y = 30
BOX_W = 100
BOX_H = 70
display.hline(BOX_X, BOX_Y, BOX_W, WHITE)
display.hline(BOX_X, BOX_Y + BOX_H, BOX_W, WHITE)
display.vline(BOX_X, BOX_Y, BOX_H, WHITE)
display.vline(BOX_X + BOX_W - 1, BOX_Y, BOX_H, WHITE)
display.line(BOX_X, BOX_Y, BOX_X + BOX_W - 1, BOX_Y + BOX_H, WHITE)
display.line(BOX_X, BOX_Y + BOX_H, BOX_X + BOX_W - 1, BOX_Y, WHITE)

# bottom: an angry face made only of lines
# eyebrows angled down toward the nose -- the eyebrow rule
display.line(50, 120, 96, 145, WHITE)
display.line(190, 120, 144, 145, WHITE)
# eyes as short vertical lines
display.vline(72, 155, 26, WHITE)
display.vline(168, 155, 26, WHITE)
# a flat, unimpressed mouth
display.hline(78, 200, 84, WHITE)

# Things to try:
#
# 1. Every line above stays inside the circle. Move the mouth down to
#    y=228 and run it again -- the ends vanish under the bezel before the
#    middle does, which is the round screen's signature failure.
#
# 2. Draw the same box out at the very edge of the square (x from 0 to
#    239). You will get four arcs instead of a box, because only the
#    middles of the sides fall inside the glass.
```

Here's what that program draws:

![Simulated output of 04-lines.py](sample-output.png)

## Lines Have Opinions About Direction

Look at the eyebrows in the angry face: they angle down toward the nose. That's not a coincidence — eyebrows angled down and inward read as angry or focused on every face this kit draws, human or robot. It's one of the cheapest, most reliable moves in the whole book: two straight lines, tilted the right way, do more emotional work than almost anything else you can draw.

Every line in this lab stays safely inside the visible circle. Try moving the mouth's `hline()` down toward y=228 and running it again — the ends disappear under the bezel before the middle does, because the screen gets narrower the further a shape sits from the vertical center. That's the round screen's signature failure mode, and it's worth seeing once on purpose.
