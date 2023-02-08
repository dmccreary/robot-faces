# Drawing Polygons

Since v1.19.1-724 MicroPython includes a flexible way to draw any polygon of any
number of points either in outline or filled mode.

To use it you must pass it an [array](https://docs.micropython.org/en/latest/library/array.html#module-array) of points.  The syntax for short array initialization is
as follows:

```
my_array = array('h', [30,10, 100,20, 50,60])
```

The letter "h" signals that each element will be a short integer.


```py
from machine import Pin
from array import array
import ssd1306

clock=Pin(2) #SCL
data=Pin(3) #SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi=machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(128, 64, spi, DC, RES, CS)

oled.fill(0)
# draw three points in a triangle to be filled
my_array = array('h', [30,10, 100,20, 50,60])
# at poing (0,0) draw a polygon with on bits and filled
oled.poly(0,0, my_array, 1, 1)
oled.show()
```

## References

[MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html)
[MicroPython Array](https://docs.micropython.org/en/latest/library/array.html#module-array)