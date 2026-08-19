# GalaxyCore GC9B72 Circular Color 360x360 Display

## Pins from Display

Reading the pin labels from left to right

Name - color of wire, name, GPIO

1. GND - black, ground GND
2. VCC - red power 3.3 OUT
3. SDA - yellow data GPIO2
4. SCL - orange clock GPIO3
5. RST - green reset GPIO4
6. DC - blue Data Command GPIO5
   (ground pin on BB)
7. CS - purple - Chip Select GPIO6
8. BL - gray Backlight GPIO7
9. SDO - white ?? GPIO8
10. TE - brown ?? GPIO9


## References

- [AliExpress Listing for $6.12 USD](https://www.aliexpress.us/item/3256812369957516.html)
![](./aliexpress-listing-6-dollars.png)

### Datasheet

GalaxyCore has never published an official public datasheet for the
GC9B72. The closest thing that exists is the register-level init
sequence in this reference driver, which is what our own
[MicroPython driver](../../../src/kits/sw-gc9b72/lib/gc9b72.py) was
ported from:

- [xboot/xstar `fb-gc9b72.c`](https://github.com/xboot/xstar/blob/main/xstar/driver/framebuffer/fb-gc9b72.c) --
  a Linux framebuffer driver, and (per the credit below) "the only
  known-good public GC9B72 init" anyone has found.
- [MaliosDark/Arduino_GC9B72](https://github.com/MaliosDark/Arduino_GC9B72) --
  an Arduino_GFX driver that ports the same init sequence to C++, and
  documents the panel's silkscreen ID (`VER:TFT 2.1 0_10`,
  `Driver IC: GC9B72`, `Resolution: 360x360`) and pinout.