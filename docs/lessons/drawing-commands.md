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

## Polygons

```py
## draw a filled in triangle
my_array = array('B', [10,0, 20,10, 0,10])
oled.poly(0,0, my_array, ON, FILL)
```
