from rotary_irq_rp2 import RotaryIRQ
import utime as time
from machine import Pin

from machine import Pin
from utime import sleep
import ssd1306

# this is the built-in LED on the Pico
led = Pin('LED', Pin.OUT)

WIDTH = 128
HALF_WIDTH = int(WIDTH/2)
HEIGHT = 64
HALF_HEIGHT = int(HEIGHT/2)

clock=Pin(2)
data=Pin(3)
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)
   
PIN_NUM_CLK = 14
PIN_NUM_DATA = 15
# defauls are for pull up input pins and bounded ranges
# note there is a bug in the ellipse() function that hangs if a radius is 0
r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=1,
              max_val=45)

val_old = HALF_WIDTH

def update_display(counter, rotary_val):
    oled.fill(0)
    
    if rotary_val > 32:
        color = 0
    else:
        color = 1
    oled.ellipse(HALF_WIDTH, HALF_HEIGHT, int(rotary_val*2), rotary_val, 1, 1)
    oled.text('Rotary Lab', 0, 0, color)
    oled.text(str(rotary_val), 0, 10, color)
    oled.text(str(counter), 0, 54, color)
    oled.show()

counter = 0
while True:
    rotary_val = r.value()
    if val_old != rotary_val:
        val_old = rotary_val
        print('result =', rotary_val)
    update_display(counter, rotary_val)
    led.toggle()
    sleep(.1)
    counter += 1