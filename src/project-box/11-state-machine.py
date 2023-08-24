# use a momentary push button to change the display mode
# use a differt update_display function for each mode
from rotary_irq_rp2 import RotaryIRQ
from machine import Pin
from utime import sleep, ticks_ms
from array import array

import ssd1306

# Setup Code
# this is the built-in LED on the Pico
led = Pin('LED', Pin.OUT)

WIDTH = 128
HALF_WIDTH = int(WIDTH/2)
QUARTER_WIDTH = HALF_WIDTH >> 1

HEIGHT = 64
HALF_HEIGHT = int(HEIGHT/2)
# bit shifting only works on numbers that are powers of 2
HALF_HEIGHT = HEIGHT >> 1
QUARTER_HEIGHT = HALF_HEIGHT >> 1
ONE_THIRD_HEIGHT = int(HEIGHT/3)

# draw readability
ON = 1
OFF = 0
NO_FILL = 0
FILL = 1

clock=Pin(2)
data=Pin(3)
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)

# these are the pins in the lower-left corner (USB on top)
PIN_NUM_CLK = 14
PIN_NUM_DATA = 15
# defauls are for pull up input pins and bounded ranges
# note there is a bug in the ellipse() function that hangs if a radius is 0
r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=1,
              max_val=40)

# these are the two pins above (USB on top)
BUTTON_PIN_A = 12
BUTTON_PIN_B = 13

button_presses = 0 # the count of times the button has been pressed.  A is +1, B is -1
last_time = 0 # the last time we pressed the button

# we toggle the builtin LED to get visual feedback
builtin_led = machine.Pin(25, Pin.OUT)

# The lower left corner of the Pico has a wire that goes through the buttons upper left and the lower right goes to the 3.3 rail
button_a = machine.Pin(BUTTON_PIN_A, machine.Pin.IN, machine.Pin.PULL_UP)
button_b = machine.Pin(BUTTON_PIN_B, machine.Pin.IN, machine.Pin.PULL_UP)

modeList = ('menu', 'sleepy', 'smile', 'eye scanner', 'eyebrows')
modeCount = len(modeList)

# this is the interrupt callback handler
# get in and out quickly
def button_callback(pin):
    global mode, last_time
    new_time = ticks_ms()
    # if it has been more that 1/5 of a second since the last event, we have a new event
    if (new_time - last_time) > 300:
        # print(pin)
        if '12' in str(pin):
            mode +=1
        else:
            mode -= 1
        # cycle through the modes
        if mode < 0:
            mode = modeCount
        if mode >= modeCount:
            mode = 0
        last_time = new_time

# now we register the handler functions when either of the buttons is pressed
button_a.irq(trigger=machine.Pin.IRQ_FALLING, handler = button_callback)
button_b.irq(trigger=machine.Pin.IRQ_FALLING, handler = button_callback)

# global variables
eye_dist_from_top = 30
eyeWidth = 27
eyeWidth_half = int(eyeWidth/2)
eyeHeight = 10
# distance from the top
mouth_vpos = 50
mouth_width = 40

def menu(counter, rotary_val, fill_indicator):
    oled.fill(0)
    oled.text('Modes:', 0, 0)
    oled.text('1: Sleepy', 0, 10)
    oled.text('2: Smile', 0, 20)
    oled.text('3: Eye Scanner', 0, 30)
    oled.text('4: Eyebrowns', 0, 40)
    # oled.text(str(counter), 0, 54)
    oled.show()

# map the input x from an input range to an output range
# // is an integer divide
def map_range(x, in_min, in_max, out_min, out_max):
  return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

def sleepy(counter, rotary_val, fill_indicator):    
    oled.fill(0)
    oled.text('1: Sleepy', 0, 0)
    # map to reasonable eye size
    eyeSize = map_range(rotary_val, 1, 40, 1, 30)
    # oled.text(str(rotary_val), 0, 10)
    # oled.text(str(fill_indicator), 0, 20)
    # oled.ellipse(HALF_WIDTH, HALF_HEIGHT, int(rotary_val*2), rotary_val, NO_FILL, fill_indicator%2)
    draw_eyes(eyeSize, 0)
    draw_mouth(25)
    # oled.text(str(counter), 0, 54)
    oled.show()

def draw_mouth(happiness):
    mouthCurve = map_range(happiness, 0, 40, 0, 10)
    # draw bottom half by doing a bitwise and of 8 and 4
    oled.ellipse(HALF_WIDTH, mouth_vpos, mouth_width, mouthCurve, ON, NO_FILL, 12)

def draw_eyes(sleepyness, angle):
    # map the input sleepyness which is 0 to 20 to 0 to 10
    eyeHeight = map_range(sleepyness, 0, 20, 0, 5)
    eyeAngle = map_range(angle, 0, 40, -10, 10)
    
    # left eye
    # Outer eye
    oled.ellipse(32, eye_dist_from_top, eyeWidth, eyeHeight, ON, FILL)
    # Pupil
    oled.ellipse(32+angle, eye_dist_from_top, 5, 5, OFF, FILL)

    # right eye
    oled.ellipse(94, eye_dist_from_top, eyeWidth, eyeHeight, ON, FILL)
    # Pupil
    oled.ellipse(94+angle, eye_dist_from_top, 5, 5, OFF, FILL)

def smile(counter, rotary_val, fill_indicator):
    oled.fill(0)
    oled.text('2: Smiley', 0, 0)
    # height and angle
    draw_eyes(25, 0)
    draw_mouth(rotary_val)
    oled.text(str(rotary_val), 0, 54)
    #oled.text(str(counter), 0, 54)
    oled.show()

def eye_scanner(counter, rotary_val, fill_indicator):
    eyeAngle = map_range(rotary_val, 0, 40, -20, 20)
    oled.fill(0)
    oled.text('3: Eye Scanner', 0, 0)
    # height and angle
    draw_eyes(25, eyeAngle)
    draw_mouth(20)
    # oled.text(str(counter), 0, 54)
    oled.show()

def draw_eyebrows(browHeight):
    # scaled brow height
    sbh = map_range(browHeight, 1, 40, 0, 14)
    # brow raised
    br = map_range(browHeight, 1, 40, 3, 10)

    left_eyebrow  = array('h', [-eyeWidth_half   ,-1,      15,-sbh,   eyeWidth_half+10,1,  15,-2])
    right_eyebrow = array('h', [-eyeWidth_half-10, 1,     -15,-sbh,   eyeWidth_half,0,    -15,-2])

    # left eyebrow
    oled.poly(QUARTER_WIDTH,  eye_dist_from_top-5-br, left_eyebrow, ON, FILL)
    oled.poly(QUARTER_WIDTH*3,eye_dist_from_top-5-br, right_eyebrow, ON, FILL)

def eyebrows(counter, rotary_val, fill_indicator):
    browHeight = map_range(rotary_val, 0, 40, 1, 20)
    oled.fill(0)
    oled.text('4: Eyebrows', 0, 0)
    draw_eyebrows(browHeight)
    draw_mouth(25)
    draw_eyes(25, 0)
    # oled.text(str(counter), 0, 54)
    oled.show()

counter = 0

rotary_val = 0
mode = 0
lastMode = 1
fill_indicator = 1
while True:
    # print mode only upon a change
    if mode != lastMode:
        print('New Mode:', modeList[mode])
        lastMode = mode
    
    # get the latest value of the rotary knob
    rotary_val = r.value()
    
    if mode == 0:
        menu(counter, rotary_val, fill_indicator)
    elif mode == 1:
        sleepy(counter, rotary_val, fill_indicator)
    elif mode == 2:
        smile(counter, rotary_val, fill_indicator)
    elif mode == 3:
        eye_scanner(counter, rotary_val, fill_indicator)
    elif mode == 4:
        eyebrows(counter, rotary_val, fill_indicator)
    
    led.toggle()
    sleep(.1)
    counter += 1