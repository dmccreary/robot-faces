'''
Test of the MicroPython framebuf poly drawing function

    from array import array

    my_array = array('h', [60,10, 50,60, 40,30])
    display.poly(0,0, my_array, ON, FILL)

'''

from machine import Pin
from utime import sleep, ticks_us
from array import array
from rotary_irq_rp2 import RotaryIRQ
import ssd1306

WIDTH = 128
# bit shifting only works when the numbers are a power of 2
HALF_WIDTH = WIDTH >> 1
QUARTER_WIDTH = HALF_WIDTH >> 1
HEIGHT = 64
HALF_HEIGHT = HEIGHT >> 1
QUARTER_HEIGHT = HALF_HEIGHT >> 1
ONE_THIRD_HEIGHT = int(HEIGHT/3)

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

PIN_NUM_CLK = 14
PIN_NUM_DATA = 15

# defauls are for pull up input pins and bounded ranges
r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=0,
              max_val=12)

val_old = r.value()

bottom_row_text_vpos = 57


phm = 18 # puple horizontal movement
eye_dist_from_top = 25
eyeWidth = 27
eyeWidth_half = int(eyeWidth/2)
eyeHeight = 7
mouth_vpos = 40
mouth_width = 40
pupil_width = 5

# map the input x from an input range to an output range
# // is an integer divide
def map_range(x, in_min, in_max, out_min, out_max):
  return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

def draw_eye(x):
    oled.ellipse(x, eye_dist_from_top, eyeWidth, eyeHeight, ON, FILL)
    # draw a black pupil on the white eye
    oled.ellipse(x, eye_dist_from_top, pupil_width, pupil_width, OFF, FILL)

def draw_face(browHeight):
    # scaled brow height
    sbh = map_range(browHeight, 0, 10, 1, 10)

    left_eyebrow  = array('h', [-eyeWidth_half,-1,      15,-sbh, eyeWidth_half+10,1,  15,-2])
    right_eyebrow = array('h', [-eyeWidth_half-10, 1,  -15,-sbh, eyeWidth_half,0,    -15,-2])

    # draw_face_grid()
    oled.fill(0)
    # left eye
    draw_eye(QUARTER_WIDTH)

    # eyebrow
    oled.poly(QUARTER_WIDTH,eye_dist_from_top-10, left_eyebrow, ON, FILL)

    # right eye
    draw_eye(QUARTER_WIDTH*3)
    oled.poly(QUARTER_WIDTH*3,eye_dist_from_top-10, right_eyebrow, ON, FILL)

    # draw mouth
    # draw bottom half by doing a bitwise and of 8 and 4
    oled.ellipse(HALF_WIDTH, mouth_vpos, mouth_width, 10, ON, NO_FILL, 12)
    
    oled.text(str(browHeight), 0, 54)
    oled.text(str(sbh), 64, 54)
    oled.show()

# outline box

oled.fill(0)
while True:
    val_new = r.value()

    if val_old != val_new:
        val_old = val_new
        print('result =', val_new)
    draw_face(val_new)

