# Drawing Commands

All of our drawing commands come from the MicroPython [FrameBuf](https://docs.micropython.org/en/latest/library/framebuf.html) drawing primitives.  These are simple drawing operations that are designed to work on microcontrollers with limited memory.

Because these commands are all functions associated with the framebuffer class, they are called **methods** in the documentation.

A typical drawing sequence has the following steps:

```py
# clear the entire display
display.fill(0)
# Draw white (1) text starting at x=0 and y = 10 
display.text('Hello World!', 0, 10, 1)
# draw a horizontal like starting at x=0 and y=20 that is 128 pixels long
display.hline(0, 20, 128, 1)
# this triggers the copy of the entire frame buffer in memory to the display
display.show()
```

## Preamble for Drawing

All our programs will have approximately the same preamble or setup that appears before our drawing.  Here
is a sample of this preamble:

```python
from machine import Pin
import ssd1306

WIDTH = 128
HEIGHT = 64

clock=Pin(2) #SCL
data=Pin(3) #SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
display = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)
```

You may have to modify the pin numbers if you are not using our standard layout.

## Fill

```display.fill(color)```

A color of 0 will be a blank screen.  A fill of 1 will be a white screen.
We typically erase an old screen at the top of an animation loop with ```fill(0)```

## Rectangles

```rect(x, y, width, color)```

## Lines

### Horizontal Line

Draw a horizontal line starting a the point (x,y) of width pixels.

```display.hline(x, y, width, color)```

### Vertical Line

Draw a vertical line starting a the point (x,y) of height pixels.

```display.vline(x, y, height, color)```

### General Line

Draw a line from a set of coordinates using the given color and a thickness of 1 pixel. 
The line method draws the line up to a second set of coordinates

```display.line(x1, y1, x2, y2, color)```

### Rectangle

```rect(x, y, w, h, c[, f])```

## Circles and Ellipse

```display.ellipse(x, y, HORZ_RADIUS, VERT_RADIUS, COLOR, FILL_FLAG, QUAD_CODE)```

There is a detailed lesson [here](./ellipse.md)

## Polygons

```py
## draw a filled in triangle
my_array = array('B', [10,0, 20,10, 0,10])
oled.poly(0,0, my_array, ON, FILL)
```

There is a detailed lesson [here](./polygon.md)

## Scroll

```display.scroll(xstep, ystep)```

Shift the contents of the FrameBuffer by the given vector. This may leave a footprint of the previous colors in the FrameBuffer.

## BLIT

```blit(fbuf, x, y, key=- 1, palette=None)```

Draw another FrameBuffer on top of the current one at the given coordinates. If key is specified then it should be a color integer and the corresponding color will be considered transparent: all pixels with that color value will not be drawn. (If the palette is specified then the key is compared to the value from palette, not to the value directly from fbuf.)

The palette argument enables blitting between FrameBuffers with differing formats. Typical usage is to render a monochrome or grayscale glyph/icon to a color display. The palette is a FrameBuffer instance whose format is that of the current FrameBuffer. The palette height is one pixel and its pixel width is the number of colors in the source FrameBuffer. The palette for an N-bit source needs 2**N pixels; the palette for a monochrome source would have 2 pixels representing background and foreground colors. The application assigns a color to each pixel in the palette. The color of the current pixel will be that of that palette pixel whose x position is the color of the corresponding source pixel.