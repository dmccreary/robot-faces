import random
from machine import Pin, SPI
from time import sleep
import gc9a01 as gc9a01
from gc9a01 import color565

SCL = 2
SDA = 3
DC = 4
CS = 5
RST = 6

spi = SPI(0, baudrate=60000000, sck=Pin(SCL), mosi=Pin(SDA))
tft = gc9a01.GC9A01(spi,dc=Pin(DC,Pin.OUT),cs=Pin(CS,Pin.OUT),reset=Pin(RST,Pin.OUT),rotation=0)

WIDTH = 240

def wheel(pos):
    # Input a value 0 to 255 to get a color value.
    # The colors are a transition r - g - b - back to r.
    if pos < 0 or pos > 255:
        return (0, 0, 0)
    if pos < 85:
        return (255 - pos * 3, pos * 3, 0)
    if pos < 170:
        pos -= 85
        return (0, 255 - pos * 3, pos * 3)
    pos -= 170
    return (pos * 3, 0, 255 - pos * 3)

while True:
    for i in range(0, 255):
        my_color = wheel(i)
        print(i, my_color)
        tft.fill_rect(0, 0, WIDTH, WIDTH, color565(my_color))
        sleep(.05)
