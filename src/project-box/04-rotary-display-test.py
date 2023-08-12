from rotary import Rotary
import utime as time
from machine import Pin

from machine import Pin
from utime import sleep
import ssd1306

# this is the built-in LED on the Pico
led = Pin('LED', Pin.OUT)

WIDTH = 128
HEIGHT = 64
clock=Pin(2)
data=Pin(3)
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)
   
# GPIO Pins 16 and 17 are for the encoder pins. 22 is the button press switch.
rotary = Rotary(14, 15, 13)
rotary_val = int(WIDTH/2)

def rotary_changed(change):
    global rotary_val
    if change == Rotary.ROT_CW:
        rotary_val += 4
        print('+ ', rotary_val)
    elif change == Rotary.ROT_CCW:
        rotary_val -= 4
        print('- ', rotary_val)
    elif change == Rotary.SW_PRESS:
        print('PRESS')
    elif change == Rotary.SW_RELEASE:
        print('RELEASE')
    if rotary_val < 0:
        rotary_val = 0
    if rotary_val > WIDTH:
        rotary_val = WIDTH

rotary.add_handler(rotary_changed)

def update_display(counter, rotary_val):
    oled.fill(0)
    oled.text('Rotary Lab', 0, 0)
    oled.text(str(rotary_val), 0, 10)
    oled.fill_rect(0,20,rotary_val, 10, 1)
    oled.text(str(counter), 0, 54)
    oled.show()

counter = 0
while True:
    update_display(counter, rotary_val)
    led.toggle()
    sleep(.1)
    counter += 1