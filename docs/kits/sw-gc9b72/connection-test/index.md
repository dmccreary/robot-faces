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
    Hi, I'm Pixel! Before we draw a single eye on this bigger screen, let's make sure your board can talk to your computer. One blinking light is all the proof we need. Every pixel tells a story!

## Sample Program Code

`Pin(25, Pin.OUT)` grabs GPIO 25 and sets it up as an output, and `toggle()` flips it between on
and off every quarter second — a full on-off cycle every half second, so the LED blinks twice a
second.

```py
from machine import Pin
import time

# Pin 25 is the onboard LED on a regular Raspberry Pi Pico
led = Pin(25, Pin.OUT)

while True:
    led.toggle()           # Switches LED on if off, or off if on
    time.sleep(0.25)       # Wait 0.25 seconds (half a full blink cycle)
```

There is no screenshot for this lab, because it does not draw anything. The output is a light.

## GP25 Is Simple Here

This kit ships wired one way only: a plain Raspberry Pi Pico next to a separate GC9B72 display
module on a breadboard. There is no all-in-one board option the way the smaller 1.2" kit offers,
so GP25 never has a second job to confuse you with. It is always the Pico's onboard LED, full
stop — the display's backlight lives on its own pin, GP7, and is a real, software-controlled
signal rather than something wired to a general-purpose pin.

| Kit | Board | What GP25 does |
|---|---|---|
| This kit (2.1", GC9B72) | Raspberry Pi Pico + separate display module | Always the onboard LED — the backlight has its own pin, GP7 |
| 1.2" kit (GC9A01) | Raspberry Pi Pico | The onboard LED |
| 1.2" kit (GC9A01) | Waveshare RP2040-LCD-1.28 | The display's backlight — that board has no user LED |

!!! mascot-tip "One Pin, One Job"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    On the smaller kit's optional all-in-one board, this exact pin doubles as the screen's backlight, and it catches people off guard. Here you get to skip that puzzle entirely — GP25 only ever means the LED.

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

1. **Change the blink rate.** Set `time.sleep(0.01)` and run it again. Past a certain speed your
   eye stops seeing separate blinks and starts seeing a dim, steady light. Find that number — you
   just measured your own visual system with a microcontroller.
2. **Replace `toggle()` with `value(1)` and `value(0)`** and two separate sleeps. Same blink, more
   lines, and now you can make the on time and the off time different.
3. **Wire up the display, then run this lab by itself and watch it.** Nothing on the screen should
   change. That is the point: GP25 and the backlight's GP7 are completely separate wires on this
   kit, so blinking one genuinely cannot strobe the other — unlike the 1.2" kit's Waveshare board,
   where it can.

## References

- [Hello World](../hello/index.md) — the next lab, and the first one that needs the display wired
- [Connection Test on the 1.2" kit](../../smartwatch/connection-test/index.md) — the same lab, where GP25 can mean two different things depending on the board
- [MicroPython machine.Pin Documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html)
