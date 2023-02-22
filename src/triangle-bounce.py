from machine import Pin
from utime import sleep, ticks_us
from array import array
import framebuf
import ssd1306

WIDTH = 128
HEIGHT = 64


# draw readability
ON = 1
OFF = 0
NO_FILL = 0
FILL = 1

clock=Pin(2) #SCL
data=Pin(3) #SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)

t = array('B', [30,10, 100,20, 50,60])
t_len = len(t)
print(t_len)
# our point directions
d = array('B', [1,1, 1,-1, -1,1])
while True:
    oled.fill(0)
    # draw three points in a triangle to be filled
    for i in (0, 2, 4):
        t[i] += d[i]
        if t[i] <= 0 or t[i] >= 128:
            d[i] = - d[i]
    for i in (1, 3, 5):
        t[i] += d[i]
        if t[i] <= 0 or t[i] >= 63:
            d[i] = - d[i]
    # at poing (0,0) draw a polygon with on bits and filled
    oled.poly(0,0, t, 1, 1)
    oled.show()
    sleep(.1)
