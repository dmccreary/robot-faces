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

# bit order is blue, red, green
red  = color565(255, 0, 0)
orange  = color565(255, 70, 0)
yellow = color565(255, 255, 0)
gold = color565(200, 200, 0)
lightGreen = color565(25, 255, 25)
green   = color565(0, 255, 0)
olive = color565(25, 100, 25)
darkGreen = color565(25, 50, 25)
cyan = color565(0, 255, 255)
blue = color565(0, 0, 255)
pink = color565(255, 150, 150)
purple = color565(255, 0, 255)
magenta = color565(50, 0, 50)
white = color565(255, 255, 255)
brown = color565(100, 50, 50)
gray = color565(100, 100, 100)
black = color565(0, 0, 0)

ColorList = (red, orange, yellow, gold, lightGreen, green, olive, darkGreen, blue, brown, pink, purple, magenta, brown, gray, white, black)

width = 240

while True:
    for i in range(0, len(ColorList)):
        print(ColorList[i])
        tft.fill_rect(0, 0, width, width, ColorList[i])
        sleep(1)
