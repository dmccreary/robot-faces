# Lab 0: Blink Something

Before any display, any driver, any font, run this. It answers one question: is the board itself alive, and is Thonny actually talking to it? Nothing here depends on the GC9A01, the fonts, or even `config.py` — if the round screen turns out to be miswired, this lab still tells you the board is fine, which is exactly the information you need to keep looking in the right place.

GP25 means two different things depending on which board is on your desk. On a plain Raspberry Pi Pico it is the onboard LED. On a Waveshare RP2040-LCD-1.28 it is the display's **backlight** — that board has no separate LED at all. Either way, this program blinks it, and either way that tells you the same thing: the board is running MicroPython and Thonny can reach it.

## Sample Program Code

This program imports nothing from the kit on purpose — no `config`, no driver, no fonts — so it still works even if one of those is broken or missing:

```py
# Lab 00: Blink Something
# Use this to test that the board is correctly connected to Thonny and
# running the MicroPython runtime.
#
# This is the one lab that imports NOTHING from the kit -- no config.py,
# no driver, no fonts. That is deliberate. If the very first program you
# run depends on the display library being installed correctly, then a
# missing file and a dead board look exactly the same, and you have
# learned nothing. This lab needs no breadboard, no jumper wires, and no
# display.
#
# GP25 means different things on the two boards this kit supports, and
# either way this program tells you the board is alive:
#
#   Raspberry Pi Pico            GP25 is the onboard LED. It blinks.
#   Waveshare RP2040-LCD-1.28    GP25 is the display's BACKLIGHT -- that
#                                board has no user LED. The whole screen
#                                pulses on and off instead.
#
# Watch out for this pin on the Waveshare board. Any code you bring over
# from a plain Pico that toggles GP25 "to blink the LED" will strobe your
# screen there.

from machine import Pin
import time

led = Pin(25, Pin.OUT)   # onboard LED on a Pico; LCD_BL on the Waveshare

while True:
    led.toggle()           # switches it on if off, or off if on
    time.sleep(0.5)        # wait half a second (half a full blink cycle)
```

> This lab never constructs a display — there is nothing to screenshot. See the explanation below for what it does instead.

## Why No Display Import

If the very first program you run needs the display driver installed correctly, then a missing file and a dead board look identical — both show you nothing. Cutting the display out of the loop entirely means this lab can only fail one way: the board isn't there, or Thonny isn't connected to it. Every later lab builds on the assumption that this one already passed.

**On a Waveshare board, watch GP25.** Any code carried over from a plain Pico that toggles pin 25 "to blink the LED" will strobe the screen there instead, since that pin drives the backlight. It is a harmless surprise the first time you meet it, and a useful one to meet here rather than in the middle of a face you are trying to debug.

!!! mascot-welcome "Welcome"
    ![Pixel](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every kit in this book starts the same way — one blink, to prove the board is listening before we ask it to draw a single pixel.
