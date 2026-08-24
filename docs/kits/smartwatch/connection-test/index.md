# Connection Test

Before you wire up a single display pin, prove the board itself is alive. This first lab imports
nothing from the kit — no `config.py`, no display driver, no fonts. That is on purpose, and it is
the whole reason the lab exists.

If your very first program depended on the display library being installed correctly, then a
missing file and a dead board would look exactly the same, and you would have learned nothing
from the silence. This program cannot fail that way. It needs no breadboard, no jumper wires, and
no display.

!!! mascot-welcome "Start with a heartbeat"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Hi, I'm Pixel! Before we draw a single eye, let's make sure your board can talk to your computer. One blinking light is all the proof we need. Every pixel tells a story!

## Sample Program Code

`Pin(25, Pin.OUT)` grabs GPIO 25 and sets it up as an output, and `toggle()` flips it between on
and off every half second.

```py
# Lab 00: Blink Something
# Use this to test that the board is correctly connected to Thonny and
# running the MicroPython runtime.

from machine import Pin
import time

led = Pin(25, Pin.OUT)   # onboard LED on a Pico; LCD_BL on the Waveshare

while True:
    led.toggle()           # switches it on if off, or off if on
    time.sleep(0.5)        # wait half a second (half a full blink cycle)
```

There is no screenshot for this lab, because it does not draw anything. The output is a light.

## GP25 Means Two Different Things

This kit runs on two boards, and pin 25 has a completely different job on each one. Either way,
this program tells you the board is alive:

| Board | What GP25 is | What you see |
|---|---|---|
| Raspberry Pi Pico | The onboard LED | A small green LED blinks twice a second |
| Waveshare RP2040-LCD-1.28 | The display's backlight — that board has no user LED | The whole round screen pulses on and off |

!!! mascot-warning "GP25 Is the Backlight on the Waveshare Board"
    ![Pixel warns you](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Any code you bring over from a plain Pico that toggles GP25 "to blink the LED" will strobe your screen instead. And a backlight accidentally left low is the classic "my display is dead" report — the pixels are set correctly and there is no light to see them by.

## When Nothing Blinks

Work down this list in order. Each row rules out a different thing, which is what makes it faster
than guessing:

| What you see | What it means | What to try |
|---|---|---|
| The LED blinks | The board, the USB cable, and Thonny's connection are all fine | Move on to the [Hello World](../hello/index.md) lab |
| Thonny can see the board but nothing blinks | The code is not running | Press **Stop/Restart**, then **Run** again |
| Thonny cannot see the board at all | The cable or the interpreter | Try a different USB cable — many cheap ones are charge-only and carry no data |
| Thonny sees a port but reports no MicroPython | Firmware | MicroPython may not be installed on the board yet |

## Things to Try

1. **Change the blink rate.** Set `time.sleep(0.05)` and run it again. Past a certain speed your
   eye stops seeing separate blinks and starts seeing a dim, steady light. Find that number — you
   just measured your own visual system with a microcontroller.
2. **Replace `toggle()` with `value(1)` and `value(0)`** and two separate sleeps. Same blink, more
   lines, and now you can make the on time and the off time different.
3. **On a Waveshare board, watch the screen instead of an LED.** That pulsing is the backlight,
   and it is the single most useful fact in this kit for diagnosing a "dead" display.

## References

- [Hello World](../hello/index.md) — the next lab, and the first one that needs the display wired
- [MicroPython machine.Pin Documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html)
