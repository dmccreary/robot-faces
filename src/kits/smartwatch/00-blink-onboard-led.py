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
