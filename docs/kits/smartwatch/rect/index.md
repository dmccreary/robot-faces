# Drawing Rectangles

Rectangles are the workhorse shape of this kit — not because robot faces are boxy, but because a
filled rectangle is how you **erase** on a display with no frame buffer. Almost every animation in
these labs is built on that one idea.

This driver splits what `framebuf` combined into a single call:

```py
display.rect(x, y, w, h, color)        # outline only -- no fill flag
display.fill_rect(x, y, w, h, color)   # solid block
```

There is no separate "erase" command anywhere in this kit. Drawing in black *is* erasing, and
`fill_rect(..., BLACK)` is the fastest eraser you have, because it is the one call that sends long
runs of identical pixels.

!!! mascot-thinking "The Fastest Eraser You Have"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Wiping my whole screen means sending 115,200 bytes. Wiping just the box around my mouth might be 8,000. Same result on the glass, one-fourteenth of the work — and that is the difference between a smooth animation and a flicker.

## Sample Program Code

This program draws a border pulled well inside the safe radius, a retro blocky face with square
eye sockets, and a mouth bar with teeth **erased** out of it in black.

```py
# Lab 05: Drawing Rectangles

import config

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK

display.fill(BLACK)

# a border. On a round screen a rectangular border gets its corners
# clipped, so this one is pulled well inside the safe radius.
display.rect(40, 40, 160, 160, WHITE)

# a retro blocky face: square eye sockets with a filled pupil inside each
display.rect(60, 80, 48, 40, WHITE)
display.fill_rect(76, 92, 16, 16, WHITE)

display.rect(132, 80, 48, 40, WHITE)
display.fill_rect(148, 92, 16, 16, WHITE)

# a wide filled mouth bar with black teeth erased out of it
display.fill_rect(66, 150, 108, 24, WHITE)
for tooth_x in range(88, 174, 20):
    display.fill_rect(tooth_x, 150, 6, 24, BLACK)
```

Here's what that program draws on the display:

![A square border containing a blocky robot face: two rectangular eye sockets each holding a small filled square pupil, and below them a wide white mouth bar broken into five teeth by black gaps](sample-output.png)

## The Teeth Are the Lesson

Those teeth were never drawn. The program painted one solid white bar and then painted four black
bars on top of it, and what is left over reads as a mouthful of teeth.

That is the same layering trick as the catchlight in the [pixel lab](../pixel/index.md), and it is
how nearly every detail in this kit gets made: draw the big shape, then take pieces back out with
black.

| Goal | Approach |
|---|---|
| Solid block of color | `fill_rect(x, y, w, h, color)` |
| Outline | `rect(x, y, w, h, color)` — no fill flag exists |
| Erase a region | `fill_rect(x, y, w, h, BLACK)` |
| Carve detail out of a shape | Draw the shape, then draw black on top |
| Erase everything | `display.fill(BLACK)` — the most expensive call in the kit |

!!! mascot-tip "One Call Takes the Mouth Back"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Add `display.fill_rect(66, 150, 108, 24, BLACK)` at the end. The mouth disappears and nothing else on screen moves. That single line is the trick the [Only Redraw What Changed](../partial-redraw/index.md) lab is built on.

## Things to Try

1. **Widen the border** to `display.rect(10, 10, 220, 220, WHITE)` and run it again. The corners
   disappear and you are left with four disconnected arcs.
2. **Erase just the mouth**, as in the tip above, and confirm that the eyes are untouched.
3. **Change the tooth spacing** in the `range(88, 174, 20)` step from 20 to 14. More teeth, no new
   code — the loop does the counting.
4. **Time the two erasers.** Compare `display.fill(BLACK)` against the mouth-sized `fill_rect()`
   with `ticks_us()`. Write both numbers down; you will want them again at lab 29.

## References

- [Drawing Pixels](../pixel/index.md) — the same layering idea, at the smallest possible scale
- [Only Redraw What Changed](../partial-redraw/index.md) — where erasing one box instead of the screen becomes a measured optimization
- [Eye Scanner](../eye-scanner/index.md) — the first animation that depends on erasing a box
