# Lab 09: Blitting Buffers
# blit(source_buffer, x, y, key) stamps a whole FrameBuffer onto the
# display at once. Draw a sprite once into an off-screen buffer, then
# copy it wherever (and however many times) you need it.

import config
import framebuf

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT
TRANSPARENT = 0

# build one eye in an off-screen 32 x 24 buffer
EYE_WIDTH = 32
EYE_HEIGHT = 24
eye_bytes = bytearray(EYE_WIDTH * EYE_HEIGHT // 8)
eye = framebuf.FrameBuffer(eye_bytes, EYE_WIDTH, EYE_HEIGHT, framebuf.MONO_HLSB)

eye.fill(BLACK)
eye.ellipse(16, 12, 15, 11, WHITE, FILL)
eye.ellipse(16, 12, 6, 6, BLACK, FILL)

oled.fill(BLACK)

# top: stamp the same eye buffer twice to get a matching pair
oled.blit(eye, 14, 3)
oled.blit(eye, 82, 3)

# bottom: a striped background so you can see what each blit covers up
for y in range(32, HEIGHT, 3):
    oled.hline(0, y, WIDTH, WHITE)

# left, no key: the eye's black background paints over the stripes
oled.blit(eye, 12, 36)

# right, key=0: black pixels are skipped so the stripes show through
oled.blit(eye, 84, 36, TRANSPARENT)

oled.show()
