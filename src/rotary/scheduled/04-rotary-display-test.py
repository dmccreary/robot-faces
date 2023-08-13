from rotary_irq_rp2 import RotaryIRQ
from machine import Pin
from utime import sleep
import ssd1306

# this is the built-in LED on the Pico
led = Pin('LED', Pin.OUT)

WIDTH = 128
HALF_WIDTH = int(WIDTH/2)
HEIGHT = 64
clock=Pin(2)
data=Pin(3)
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)
   
# GPIO Pins 16 and 17 are for the encoder pins. 22 is the button press switch.

PIN_NUM_CLK = 14
PIN_NUM_DATA = 15
# defauls are for pull up input pins and bounded ranges
r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=0,
              max_val=HALF_WIDTH)

val_old = HALF_WIDTH

def update_display(counter, rotary_val):
    oled.fill(0)
    oled.text('Rotary Lab', 0, 0)
    oled.text(str(rotary_val), 0, 10)
    oled.fill_rect(0,20,rotary_val, 10, 1)
    oled.text(str(counter), 0, 54)
    oled.show()

counter = 0

while True:
    rotary_val = r.value()
    if val_old != rotary_val:
        val_old = rotary_val
        print('result =', rotary_val)
    # start in the center
    update_display(counter, int(rotary_val*2))
    led.toggle()
    sleep(.1)
    counter += 1