# Test of the micropython ellipse function
# display.ellipse(x, y, HORZ_RADIUS, VERT_RADIUS, COLOR, FILL_FLAG, QUAD_CODE)

from machine import Pin
from utime import sleep
import ssd1306

WIDTH = 128
HEIGHT = 64

clock=Pin(2) #SCL
data=Pin(3) #SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)

# center the ellipse in the middle of the display
x = int(WIDTH / 2)
y = int(HEIGHT / 2)

HORZ_RADIUS = 30 # 30 over for the left and 30 to the right 
VERT_RADIUS = 20 # 20 up and 20 down
COLOR = 1 # 0 or 1
FILL = 1 # 0 for no fill, 1 for fill

# draw an ellipse wihout the fill

while True:
    for quad in range(0, 16):
        oled.fill(0)
        oled.ellipse(x, y, HORZ_RADIUS, VERT_RADIUS, COLOR, FILL, quad)
        oled.text(str(quad), 0, 55)
        oled.show()
        sleep(1)
