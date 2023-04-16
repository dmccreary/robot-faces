from machine import Pin
from utime import sleep, ticks_ms, ticks_us
from math import sqrt
import framebuf
import ssd1306

# these are the pins in the lower-left corner (USB on top)
BUTTON_PIN_A = 14
BUTTON_PIN_B = 15

eye_position = 0 # the count of times the button has been pressed.  A is +1, B is -1
last_time = 0 # the last time we pressed the button

# we toggle the builtin LED to get visual feedback
builtin_led = machine.Pin(25, Pin.OUT)

# The lower left corner of the Pico has a wire that goes through the buttons upper left and the lower right goes to the 3.3 rail
button_a = machine.Pin(BUTTON_PIN_A, machine.Pin.IN, machine.Pin.PULL_DOWN)
button_b = machine.Pin(BUTTON_PIN_B, machine.Pin.IN, machine.Pin.PULL_DOWN)

# this is the interrupt callback handler
# get in and out quickly
def button_callback(pin):
    global eye_position, last_time
    new_time = ticks_ms()
    # if it has been more that 1/5 of a second since the last event, we have a new event
    if (new_time - last_time) > 200:
        # print(pin)
        if '14' in str(pin):
            eye_position +=1
        else:
            eye_position -= 1
        last_time = new_time
    
# now we register the handler functions when either of the buttons is pressed
button_a.irq(trigger=machine.Pin.IRQ_FALLING, handler = button_callback)
button_b.irq(trigger=machine.Pin.IRQ_FALLING, handler = button_callback)

# This is for only printing when a new button press count value happens
old_eye_position = 0

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

phm = 18 # pupal horizontal movement range 
eye_dist_from_top = 21
eyeWidth = 27
eyeHeight = 10
mouth_vpos = 45
mouth_width = 40

def draw_face(i):
    oled.fill(0)

    # left eye
    oled.ellipse(32, eye_dist_from_top, eyeWidth, eyeHeight, ON, FILL)
    oled.ellipse(32+i, eye_dist_from_top, 5, 5, OFF, FILL)

    # right eye
    oled.ellipse(94, eye_dist_from_top, eyeWidth, eyeHeight, ON, FILL)
    oled.ellipse(94+i, eye_dist_from_top, 5, 5, OFF, FILL)

    # draw mouth
    # draw bottom half by doing a bitwise and of 8 and 4
    oled.ellipse(HALF_WIDTH, mouth_vpos, mouth_width, 10, ON, NO_FILL, 12)

    oled.show()

delay = .02
old_eye_position = 0
print(eye_position)
while True:
    draw_face(eye_position)
    if eye_position != old_eye_position:
        print(eye_position)
        old_eye_position = eye_position
    print(eye_position)
    sleep(delay)

