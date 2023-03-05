# demostration of non-framebuffer implementation of animated face expressions
# eye scanner, blink and smile to frown using rect_fill
import random
from machine import Pin, SPI
from time import sleep, ticks_us
import gc9a01 as gc9a01
from gc9a01 import color565

SCL = 2
SDA = 3
DC = 4
CS = 5
RST = 6

spi = SPI(0, baudrate=60000000, sck=Pin(SCL), mosi=Pin(SDA))
tft = gc9a01.GC9A01(spi,dc=Pin(DC,Pin.OUT),cs=Pin(CS,Pin.OUT),reset=Pin(RST,Pin.OUT),rotation=0)


# draw readability
ON = 1
OFF = 0
NO_FILL = 0
FILL = 1
# bit order is blue, red, green
black = 0x0000
green   = color565(0, 255, 0)
blue = color565(0, 0, 255)
red  = color565(255, 0, 0)
white = 0xffff
cyan = color565(0, 255, 255)

purple = color565(255, 0, 255)

gold = color565(200, 200, 0)
yellow = color565(255, 255, 0)
orange  = color565(255, 70, 0)
brown = color565(100, 50, 50)
magenta = color565(50, 0, 50)
pink = color565(255, 150, 150)
olive = color565(25, 100, 25)
gray = color565(50, 50, 50)
lightGreen = color565(25, 255, 25)
darkGreen = color565(25, 50, 25)

ColorList = (red, green, blue, white, yellow, orange, cyan, brown, gold, purple, magenta, pink, olive, gray, lightGreen, darkGreen)
ColorNames = ('red', 'green', 'blue', 'white', 'yellow', 'orange', 'cyan', 'brown', 'gold', 'purple', 'magenta', 'pink', 'olive', 'gray', 'lightGreen', 'darkGreen')

WIDTH = 240
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

bottom_row_text_vpos = 57

def draw_face_grid():
    oled.vline(QUARTER_WIDTH, 0, HEIGHT, 1) # x, y, len, color
    oled.vline(QUARTER_WIDTH*3, 0, HEIGHT, 1)
    oled.hline(0, ONE_THIRD_HEIGHT, WIDTH, 1)

phm = 18 # puple horizontal movement
eye_dist_from_top = 70
eyeWidth = 70
eyeWidth_half = int(eyeWidth/2)
eyeHeight = 40
eyeHeight_half = int(eyeHeight/2)
eyebrow_above_eye = 10

nose_vpos = 140
nose_width = 40
half_nose_width = int(nose_width/2)

mouth_vpos = 170
mouth_width = 100
mouth_height = 10
mwh = int(mouth_width/2) # mouth_width_half
# distance to draw lip edge up or down
lip_curl_dist = 10
lew = 10 # lip_end_width
pupil_width = 20
pupil_width_half = int(pupil_width/2)
pupil_scan_dist = 20

#left_eyebrow  = array('h', [-eyeWidth_half,-1,      15,-5, eyeWidth_half+10,1,  15,-2])
#right_eyebrow = array('h', [-eyeWidth_half-10, 1,  -15,-5, eyeWidth_half,0,    -15,-2])

# x is the horizontal center of the eye
def update_eye(x, pupil_offset, blink_level):
    # x is the center of the eye
    # white eye
    # oled.ellipse(x, eye_dist_from_top, eyeWidth, eyeHeight - blink_level, ON, FILL)
    
    # white eye over a back rectangle
    if blink_level > 0:
        tft.fill_rect(x-eyeWidth_half, eye_dist_from_top, eyeWidth, eyeHeight, black)
        
    tft.fill_rect(x-eyeWidth_half, eye_dist_from_top + blink_level, eyeWidth, eyeHeight - blink_level*2, white)
    
    # draw a blue pupil on the white eye
    tft.fill_rect(x - pupil_width_half + pupil_offset, eye_dist_from_top+10+int(blink_level/2), pupil_width, pupil_width-blink_level, blue)

def update_eyes(pupil_offset, blink_level):
    # left
    update_eye(QUARTER_WIDTH, pupil_offset, blink_level)
    # right
    update_eye(QUARTER_WIDTH*3, pupil_offset, blink_level)
        
# only the lip curls are redrawn
    # lip_curl_dist = 10 is a smile
    # lip_curl_dist = 0 is neutral
    # lip_curl_dist = -10 is a frown
def update_mouth(lip_curl_dist):
    # lib curl up we have a smile
    if lip_curl_dist >= 0:
        # clear left  # x                   y                          w    h   c
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos-10,             lew, 10, black) # left 
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos-10,             lew, 10, black) # right   
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos -lip_curl_dist, lew, lip_curl_dist, red)
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos -lip_curl_dist, lew, lip_curl_dist, red)
    elif lip_curl_dist < 0: # we have a frown
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos+10,             lew, 10, black)
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos+10,             lew, 10, black)
        # the lip curl is negative
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos+10,             lew, -lip_curl_dist, red)
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos+10,             lew, -lip_curl_dist, red)
    if lip_curl_dist == 0:
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos-10,             lew, 1, black) # left 
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos-10,             lew, 1, black) # right   
        tft.fill_rect(HALF_WIDTH - mwh-lew, mouth_vpos+10,             lew, 1, black)
        tft.fill_rect(HALF_WIDTH + mwh,     mouth_vpos+10,             lew, 1, black)

def draw_static_face():
    # static drawing
    tft.fill(black)

    # eyebrows
    tft.hline(QUARTER_WIDTH - eyeWidth_half, eye_dist_from_top - eyebrow_above_eye, eyeWidth, cyan)
    tft.hline(QUARTER_WIDTH*3 - eyeWidth_half, eye_dist_from_top - eyebrow_above_eye, eyeWidth, cyan)
    tft.hline(QUARTER_WIDTH - eyeWidth_half, eye_dist_from_top - eyebrow_above_eye+1, eyeWidth, cyan)
    tft.hline(QUARTER_WIDTH*3 - eyeWidth_half, eye_dist_from_top - eyebrow_above_eye+1, eyeWidth, cyan)

    update_eyes(0,0)
    
    #nose
    tft.hline(HALF_WIDTH - half_nose_width, nose_vpos, nose_width, pink)
    #mouth   
    tft.fill_rect(HALF_WIDTH-mwh, mouth_vpos, mouth_width, mouth_height, red)
    # default smile
    tft.fill_rect(HALF_WIDTH - mwh-10, mouth_vpos - 10, 10, 20, red)
    tft.fill_rect(HALF_WIDTH + mwh, mouth_vpos - 10, 10, 20, red)

eye_scan_delay = 0.05
blink_delay = 0.02
mouth_delay = .1

while True:
    # draw a neutral face
    # puple offset, blink, smile=10
    draw_static_face()
    sleep(1)
    
    # eye scan center to left 
    for i in range(0, -pupil_scan_dist,-1):
        # puple blink, smile curve
        update_eyes(i, 0)
        sleep(eye_scan_delay)

    # eye scan left to right  
    for i in range(-pupil_scan_dist, pupil_scan_dist):
        update_eyes(i, 0)
        sleep(eye_scan_delay)
        
    # look back to center
    for i in range(pupil_scan_dist, 0, -1):
        update_eyes(i, 0)
        sleep(eye_scan_delay)

    # blink
    # 0 is eye open - 7 is eyes closed
    for i in range(0, eyeHeight_half):
        update_eyes(0, i)
        sleep(blink_delay)
    for i in range(eyeHeight_half, 0, -1):
        update_eyes(0, i)
        sleep(blink_delay)

    # smile to neutral to frown and back
    # decreasing smile
    for i in range(lip_curl_dist, 1, -1):
        update_mouth(i)
        sleep(mouth_delay)
    
    # neural to max frown
    for i in range(0, -lip_curl_dist, -1):
        update_mouth(i)
        sleep(mouth_delay)
    
    # frown to smile
    for i in range(-lip_curl_dist, lip_curl_dist, 1):
        update_mouth(i)
        sleep(mouth_delay)