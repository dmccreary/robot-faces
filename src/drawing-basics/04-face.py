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
HALF_WIDTH = int(WIDTH / 2)
QUARTER_WIDTH = int(WIDTH / 4)
HALF_HEIGHT = int(HEIGHT / 2)
QUARTER_HEIGHT = int(HEIGHT / 4)

# if our screen is 128 pixels wide, make the face be 100 wide
FACE_WIDTH = 50 # 50 over for the left and 50 to the right
# if our screen is 64 pixels high, make our face be 60 high 
FACE_HEIGHT = 30 # 20 up and 20 down
# radius of the eye
EYE_SIZE = 10
WHITE = 1 # 0 or 1
BLACK = 0
FILL = 1 # 0 for no fill, 1 for fill
NO_FILL = 0
BOTTOM_HALF = 12

# draw an ellipse wihout the fill

while True:
        oled.fill(0)
        oled.ellipse(HALF_WIDTH, HALF_HEIGHT, FACE_WIDTH, FACE_HEIGHT, WHITE, FILL)
        oled.show()
        sleep(1)
        
        oled.fill(0)
        # face
        oled.ellipse(HALF_WIDTH, HALF_HEIGHT, FACE_WIDTH, FACE_HEIGHT, WHITE, FILL)
        # eyes
        oled.ellipse(QUARTER_WIDTH+10, QUARTER_HEIGHT+10, EYE_SIZE, EYE_SIZE, 0, FILL)
        oled.ellipse(QUARTER_WIDTH*3-10, QUARTER_HEIGHT+10, EYE_SIZE, EYE_SIZE, 0, FILL)
        oled.show()
        sleep(1)
        
        oled.fill(0)
        # face
        oled.ellipse(HALF_WIDTH, HALF_HEIGHT, FACE_WIDTH, FACE_HEIGHT, WHITE, FILL)
        
        # eyes - black on a white face
        oled.ellipse(QUARTER_WIDTH+10, QUARTER_HEIGHT+10, EYE_SIZE, EYE_SIZE, BLACK, FILL)
        oled.ellipse(QUARTER_WIDTH*3-10, QUARTER_HEIGHT+10, EYE_SIZE, EYE_SIZE, BLACK, FILL)
        
        # mouth - black on a white face
        oled.ellipse(HALF_WIDTH, HALF_HEIGHT+10, 30, 10, BLACK, FILL, BOTTOM_HALF)
        oled.show()
        sleep(4)
        
        # clear the screen
        oled.fill(0)
        oled.show()
        sleep(1)
        
