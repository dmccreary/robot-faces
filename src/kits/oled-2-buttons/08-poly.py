# Lab 08: Drawing Polygons
# poly(x, y, point_array, color, fill_flag) draws any shape you can list
# points for. point_array is an array('B', [x0,y0, x1,y1, ...]) of
# unsigned bytes, which is plenty of range for a 128x64 display.

import config
from array import array

oled = config.init_display()
ON = config.WHITE
NO_FILL = config.NO_FILL
FILL = config.FILL

oled.fill(config.BLACK)

# basic filled and outlined triangles
oled.poly(0, 0, array('B', [10, 0, 20, 10, 0, 10]), ON, FILL)
oled.poly(0, 0, array('B', [30, 0, 40, 10, 20, 10]), ON, NO_FILL)

# filled and outlined pentagons
oled.poly(0, 0, array('B', [50, 0, 60, 10, 55, 20, 45, 20, 40, 10]), ON, FILL)
oled.poly(0, 0, array('B', [70, 0, 80, 10, 75, 20, 65, 20, 60, 10]), ON, NO_FILL)

# filled and outlined hexagons
oled.poly(0, 0, array('B', [85, 0, 95, 0, 100, 10, 95, 20, 85, 20, 80, 10]), ON, FILL)
oled.poly(0, 0, array('B', [105, 0, 115, 0, 120, 10, 115, 20, 105, 20, 100, 10]), ON, NO_FILL)

# filled and outlined octagons
oled.poly(0, 0, array('B', [5, 20, 15, 20, 20, 25, 20, 35, 15, 40, 5, 40, 0, 35, 0, 25]), ON, FILL)
oled.poly(0, 0, array('B', [25, 20, 35, 20, 40, 25, 40, 35, 35, 40, 25, 40, 20, 35, 20, 25]), ON, NO_FILL)

# filled and outlined five-point stars
oled.poly(0, 0, array('B', [50, 20, 53, 27, 60, 30, 53, 33, 55, 40, 50, 35, 45, 40, 47, 33, 40, 30, 47, 27]), ON, FILL)
oled.poly(0, 0, array('B', [70, 20, 73, 27, 80, 30, 73, 33, 75, 40, 70, 35, 65, 40, 67, 33, 60, 30, 67, 27]), ON, NO_FILL)

# a filled rocket and an outlined house
oled.poly(0, 0, array('B', [0, 45, 5, 50, 20, 50, 20, 45, 25, 53, 20, 60, 20, 55, 5, 55, 0, 60]), ON, FILL)
oled.poly(0, 0, array('B', [80, 40, 89, 49, 89, 60, 70, 60, 70, 50]), ON, NO_FILL)

oled.show()
