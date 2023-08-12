'''

FrameBuffer.ellipse(x, y, xr, yr, c)

FrameBuffer.ellipse(x, y, xr, yr, c[, f, m])¶
Draw an ellipse at the given location. Radii xr and yr define the geometry; equal values cause 
a circle to be drawn. The c parameter defines the color.

The optional f parameter can be set to True to fill the ellipse. Otherwise just a one 
pixel outline is drawn.

The optional m parameter enables drawing to be restricted to certain quadrants of the ellipse. 
The LS four bits determine which quadrants are to be drawn, with bit 0 specifying Q1, b1 Q2, b2 Q3 
and b3 Q4. 
Quadrants are numbered counterclockwise with Q1 being top right.
'''

from machine import Pin
from utime import sleep
from math import sqrt
import framebuf
import ssd1306

WIDTH = 128
HALF_WIDTH = int(WIDTH/2)
HEIGHT = 64
HALF_HEIGHT = int(HEIGHT/2)

clock=Pin(2) #SCL
data=Pin(3) #SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)

# draw the elipse ring in the center of the display
oled.fill(0)
oled.ellipse(HALF_WIDTH, HALF_HEIGHT, 30, 20, 1)
oled.show()