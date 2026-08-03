#!/usr/bin/env python3
"""Run a kit's MicroPython labs against a fake microcontroller.

This is a smoke test, not a simulator. It answers one question -- "does
this program run without exploding?" -- for every numbered lab in a kit,
without a Pico plugged in.

    python3 src/utils/check-labs.py                       # the OLED kit
    python3 src/utils/check-labs.py src/kits/smartwatch   # any other kit
    python3 src/utils/check-labs.py -v --only 26          # one lab, loudly

WHAT IT CATCHES

  * NameError, typos, undefined globals, missing `global` declarations
  * Wrong number of values in a tuple-unpacking table row -- the silent
    killer in any lab that stores expressions as rows of data
  * Wrong argument counts on shared helper functions
  * Drawing calls that land off the edge of the screen

WHAT IT DOES NOT CATCH

  * Whether the face LOOKS right -- every draw call is recorded and
    discarded, nothing is rasterized
  * Anything about timing -- the clock here is fake, so any lab that
    measures microseconds reports meaningless numbers under this harness
  * MicroPython-only failures -- this runs on CPython, and CPython
    accepting your code does not prove MicroPython will
  * Wiring, SPI speed, button bounce, or any other hardware reality

Passing here means a lab is worth uploading. It does not mean the lab
works. Always run it on real hardware before shipping it to students.

HOW IT WORKS

The three modules a lab imports -- `machine`, `utime`, and the display
driver -- are replaced with stubs, then each lab is exec'd as an ordinary
CPython program. The kit's own `config.py` runs unmodified on top of the
stubs, which is what makes the results worth anything.

Labs end in `while True:`, so two escape hatches stop them: a step budget
that counts fake sleeps, and a wall-clock alarm for a lab that manages to
loop without sleeping at all.

ADDING A NEW KIT

Nothing, usually. The screen size is read from whatever the display
driver is constructed with, and every module in the kit's `lib/` folder
is stubbed automatically, so a kit with a different display driver works
without touching this file. If a new kit imports a MicroPython module
that is not stubbed below, add it to STUB_MODULES.
"""

import argparse
import contextlib
import io
import os
import re
import signal
import sys
import traceback
import types

DEFAULT_KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "..", "kits", "oled-2-buttons")

LAB_PATTERN = re.compile(r"^\d\d-.*\.py$")

# A lab containing this marker is allowed to draw off the screen. Labs
# that teach debugging need to be broken on purpose.
ALLOW_OFFSCREEN = "check-labs: allow-offscreen"

# Screen size until a display driver tells us otherwise.
FALLBACK_WIDTH = 128
FALLBACK_HEIGHT = 64


class Budget(Exception):
    """Raised when a lab has slept enough times to prove it loops."""


class Timeout(Exception):
    """Raised when a lab loops without ever sleeping."""


class Bench:
    """Everything the fake microcontroller knows about the current lab."""

    def __init__(self):
        self.steps = 0
        self.step_limit = 8000
        self.clock_us = 0
        self.width = FALLBACK_WIDTH
        self.height = FALLBACK_HEIGHT
        self.saw_display = False
        self.offscreen = []
        self.pin_reads = 0
        self.press_period = 37

    def tick_us(self, us):
        """Advance the fake clock and spend one step of the budget.

        Reading the clock advances it, which is not a hack -- it is the
        one thing about this fake board that IS true of a real one. A lab
        that never sleeps still burns time on every pass, so a program
        like the non-blocking blink lab still reaches its next event
        instead of spinning forever."""
        self.clock_us += max(1, int(us))
        self.steps += 1
        if self.steps > self.step_limit:
            raise Budget()

    def tick(self, ms=1):
        self.tick_us(float(ms) * 1000)

    @property
    def clock_ms(self):
        return self.clock_us // 1000

    def check(self, what, x, y):
        try:
            inside = 0 <= x < self.width and 0 <= y < self.height
        except TypeError:
            self.offscreen.append("%s at non-numeric (%r,%r)" % (what, x, y))
            return
        if not inside:
            self.offscreen.append("%s at (%s,%s)" % (what, x, y))


BENCH = Bench()


# --------------------------------------------------------------- machine

class Pin:
    IN = 0
    OUT = 1
    OPEN_DRAIN = 2
    PULL_UP = 1
    PULL_DOWN = 2
    IRQ_RISING = 1
    IRQ_FALLING = 2

    def __init__(self, pin_id=None, mode=None, pull=None, value=None):
        self.id = pin_id
        self.mode = mode
        self.pull = pull
        self._value = 0 if value is None else value

    def value(self, new=None):
        if new is not None:
            self._value = new
            return None
        if self.mode == Pin.OUT:
            return self._value
        # An input pin. Hand back a short burst of "pressed" every so
        # often so that press handling AND wait-for-release both run.
        BENCH.pin_reads += 1
        return 0 if BENCH.pin_reads % BENCH.press_period < 3 else 1

    def on(self):
        self._value = 1

    def off(self):
        self._value = 0

    def toggle(self):
        self._value = 0 if self._value else 1

    def high(self):
        self.on()

    def low(self):
        self.off()

    def init(self, *a, **k):
        pass

    def irq(self, *a, **k):
        return None

    def __call__(self, *a):
        return self.value(*a)


class _Bus:
    """Stands in for SPI and I2C. Every method is a no-op that returns
    plausible empty data, because no lab should depend on what a bus
    reads back during a smoke test."""

    def __init__(self, *a, **k):
        pass

    def init(self, *a, **k):
        pass

    def deinit(self):
        pass

    def write(self, *a, **k):
        return None

    def read(self, nbytes=1, *a, **k):
        return b"\x00" * nbytes

    def readinto(self, buf, *a, **k):
        return len(buf)

    def write_readinto(self, out, into):
        return len(into)

    def writeto(self, *a, **k):
        return 0

    def readfrom(self, addr, nbytes, *a, **k):
        return b"\x00" * nbytes

    def readfrom_mem(self, addr, memaddr, nbytes, *a, **k):
        return b"\x00" * nbytes

    def writeto_mem(self, *a, **k):
        return None

    def scan(self):
        return []


class _ADC:
    def __init__(self, *a, **k):
        pass

    def read_u16(self):
        return 32768

    def read(self):
        return 2048


class _PWM:
    def __init__(self, *a, **k):
        pass

    def freq(self, *a):
        return 1000

    def duty_u16(self, *a):
        return 32768

    def deinit(self):
        pass


class _Timer:
    PERIODIC = 1
    ONE_SHOT = 0

    def __init__(self, *a, **k):
        pass

    def init(self, *a, **k):
        pass

    def deinit(self):
        pass


def _build_machine():
    mod = types.ModuleType("machine")
    mod.Pin = Pin
    mod.SPI = _Bus
    mod.SoftSPI = _Bus
    mod.I2C = _Bus
    mod.SoftI2C = _Bus
    mod.ADC = _ADC
    mod.PWM = _PWM
    mod.Timer = _Timer
    mod.freq = lambda *a: 125_000_000
    mod.reset = lambda: None
    mod.lightsleep = lambda ms=0: BENCH.tick(ms or 1)
    mod.deepsleep = lambda ms=0: BENCH.tick(ms or 1)
    mod.unique_id = lambda: b"\xde\xad\xbe\xef"
    return mod


# ----------------------------------------------------------------- utime

# How much fake time passes on each clock read. Real programs burn time
# just going round the loop, and modelling that is what stops a lab whose
# loop never sleeps from spinning forever.
MS_PER_READ = 2000       # microseconds added per ticks_ms() call
US_PER_READ = 200        # microseconds added per ticks_us() call


def _read_ms():
    BENCH.tick_us(MS_PER_READ)
    return BENCH.clock_ms


def _read_us():
    BENCH.tick_us(US_PER_READ)
    return BENCH.clock_us


def _build_utime():
    mod = types.ModuleType("utime")
    mod.ticks_ms = _read_ms
    mod.ticks_us = _read_us
    mod.ticks_cpu = _read_us
    mod.ticks_diff = lambda a, b: a - b
    mod.ticks_add = lambda t, d: t + d
    mod.time = lambda: BENCH.clock_ms // 1000
    mod.sleep = lambda s: BENCH.tick(float(s) * 1000)
    mod.sleep_ms = lambda ms: BENCH.tick(ms)
    mod.sleep_us = lambda us: BENCH.tick(max(1, us // 1000))
    mod.localtime = lambda *a: (2026, 8, 3, 12, 0, 0, 0, 215)
    mod.mktime = lambda t: 0
    return mod


# ----------------------------------------------- display driver / framebuf

class DisplayStub:
    """Stands in for any framebuffer-backed display driver.

    Nothing is rasterized. Each call checks that its coordinates land on
    the screen and is then thrown away, which is why this harness can
    tell you a lab CRASHES but never that a face looks wrong.

    Ellipse and rectangle extents are deliberately not checked -- a shape
    that runs off the edge is often intentional, and the driver clips it
    for you. Text and lines ARE checked end to end, because those running
    off the edge is almost always a layout mistake.
    """

    def __init__(self, width=None, height=None, *args, **kwargs):
        if isinstance(width, int) and isinstance(height, int):
            BENCH.width = width
            BENCH.height = height
            BENCH.saw_display = True
        self.width = BENCH.width
        self.height = BENCH.height

    # --- housekeeping ---
    def init_display(self):
        pass

    def poweron(self):
        pass

    def poweroff(self):
        pass

    def contrast(self, value):
        pass

    def invert(self, value):
        pass

    def rotate(self, value):
        pass

    def sleep(self, value):
        pass

    def show(self):
        BENCH.tick(8)          # a full 128x64 SPI push is roughly this

    # --- drawing ---
    def fill(self, colour):
        pass

    def pixel(self, x, y, colour=None):
        BENCH.check("pixel", x, y)

    def hline(self, x, y, w, colour):
        BENCH.check("hline start", x, y)
        BENCH.check("hline end", x + w - 1, y)

    def vline(self, x, y, h, colour):
        BENCH.check("vline start", x, y)
        BENCH.check("vline end", x, y + h - 1)

    def line(self, x1, y1, x2, y2, colour):
        BENCH.check("line start", x1, y1)
        BENCH.check("line end", x2, y2)

    def rect(self, x, y, w, h, colour, fill=0):
        BENCH.check("rect origin", x, y)

    def fill_rect(self, x, y, w, h, colour):
        BENCH.check("fill_rect origin", x, y)
        BENCH.check("fill_rect corner", x + w - 1, y + h - 1)

    def ellipse(self, x, y, xr, yr, colour, fill=0, mask=15):
        BENCH.check("ellipse center", x, y)

    def poly(self, x, y, coords, colour, fill=0):
        BENCH.check("poly origin", x, y)

    def text(self, string, x, y, colour=1):
        BENCH.check("text origin", x, y)
        BENCH.check("text end", x + 8 * len(str(string)) - 1, y + 7)

    def scroll(self, dx, dy):
        pass

    def blit(self, source, x, y, key=-1, palette=None):
        BENCH.check("blit origin", x, y)


def _build_driver_module(name):
    """A fake driver module that hands back DisplayStub for ANY class
    name. That way a kit using SSD1306_SPI, ST7789, or GC9A01 all work
    without this file knowing anything about them."""
    mod = types.ModuleType(name)

    def module_getattr(attr):
        if attr.startswith("__"):
            raise AttributeError(attr)
        return DisplayStub

    mod.__getattr__ = module_getattr
    return mod


def _build_framebuf():
    mod = types.ModuleType("framebuf")
    mod.FrameBuffer = DisplayStub
    mod.MONO_VLSB = 0
    mod.MONO_HLSB = 3
    mod.MONO_HMSB = 4
    mod.RGB565 = 1
    mod.GS2_HMSB = 5
    mod.GS4_HMSB = 2
    mod.GS8 = 6
    return mod


def _build_micropython():
    mod = types.ModuleType("micropython")
    mod.const = lambda x: x
    mod.native = lambda f: f
    mod.viper = lambda f: f
    mod.opt_level = lambda *a: 0
    mod.mem_info = lambda *a: None
    return mod


# MicroPython modules with no CPython equivalent, or where the CPython
# one behaves differently enough to matter. Add to this list if a new kit
# imports something that is not here.
def install_stubs(kit_dir):
    machine = _build_machine()
    utime = _build_utime()

    STUB_MODULES = {
        "machine": machine,
        "umachine": machine,
        "utime": utime,
        "time": utime,
        "framebuf": _build_framebuf(),
        "micropython": _build_micropython(),
    }

    import random as _random
    STUB_MODULES["urandom"] = _random

    # Every module the kit ships in lib/ is a driver the labs import.
    lib_dir = os.path.join(kit_dir, "lib")
    if os.path.isdir(lib_dir):
        for entry in sorted(os.listdir(lib_dir)):
            if entry.endswith(".py") and not entry.startswith("_"):
                name = entry[:-3]
                STUB_MODULES[name] = _build_driver_module(name)

    sys.modules.update(STUB_MODULES)
    return set(STUB_MODULES)


# ------------------------------------------------------------------ run

def _alarm(signum, frame):
    raise Timeout()


def run_lab(path, kit_dir, kit_modules, step_limit, timeout_s, verbose):
    """Run one lab. Returns (status, detail) where status is 'ok',
    'offscreen', or 'failed'."""
    name = os.path.basename(path)
    source = open(path).read()
    allow_offscreen = ALLOW_OFFSCREEN in source

    # Drop anything the kit itself defines (config, face, ...) so each
    # lab starts from a clean import of them.
    for mod in list(sys.modules):
        if mod not in kit_modules and _is_kit_module(mod, kit_dir):
            del sys.modules[mod]

    global BENCH
    BENCH = Bench()
    BENCH.step_limit = step_limit

    captured = io.StringIO()
    namespace = {"__name__": "__main__", "__file__": path}

    signal.signal(signal.SIGALRM, _alarm)
    signal.setitimer(signal.ITIMER_REAL, timeout_s)
    try:
        sink = contextlib.nullcontext() if verbose \
            else contextlib.redirect_stdout(captured)
        with sink:
            exec(compile(source, name, "exec"), namespace)
        detail = "ran to completion"
    except Budget:
        detail = "looped %d times" % step_limit
    except Timeout:
        detail = "still running after %gs (loops without sleeping?)" % timeout_s
    except Exception:
        return "failed", traceback.format_exc()
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)

    if BENCH.offscreen and not allow_offscreen:
        unique = sorted(set(BENCH.offscreen))
        shown = "; ".join(unique[:3])
        if len(unique) > 3:
            shown += " (+%d more)" % (len(unique) - 3)
        return "offscreen", shown

    if BENCH.offscreen:
        detail += ", %d off-screen draw(s) allowed by marker" \
            % len(set(BENCH.offscreen))
    return "ok", detail


def _is_kit_module(name, kit_dir):
    mod = sys.modules.get(name)
    origin = getattr(mod, "__file__", None) or ""
    return origin.startswith(os.path.abspath(kit_dir))


def main():
    parser = argparse.ArgumentParser(
        description="Run a kit's MicroPython labs against a fake board.")
    parser.add_argument("kit", nargs="?", default=DEFAULT_KIT,
                        help="kit directory (default: the OLED two-button kit)")
    parser.add_argument("--only", metavar="TEXT",
                        help="only run labs whose filename contains TEXT")
    parser.add_argument("--steps", type=int, default=8000,
                        help="fake time steps before a lab is declared looping")
    parser.add_argument("--timeout", type=float, default=15.0,
                        help="wall-clock seconds before a lab is killed")
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="show each lab's print() output")
    args = parser.parse_args()

    kit_dir = os.path.abspath(args.kit)
    if not os.path.isdir(kit_dir):
        print("No such kit directory:", kit_dir, file=sys.stderr)
        return 2

    labs = sorted(f for f in os.listdir(kit_dir) if LAB_PATTERN.match(f))
    if args.only:
        labs = [f for f in labs if args.only in f]
    if not labs:
        print("No numbered labs (NN-name.py) found in", kit_dir,
              file=sys.stderr)
        return 2

    kit_modules = install_stubs(kit_dir)
    sys.path.insert(0, kit_dir)

    print("Checking %d lab(s) in %s" % (len(labs), kit_dir))
    print()

    failures = []
    warnings = []
    for name in labs:
        status, detail = run_lab(os.path.join(kit_dir, name), kit_dir,
                                 kit_modules, args.steps, args.timeout,
                                 args.verbose)
        if status == "ok":
            print("  ok       %-26s %s" % (name, detail))
        elif status == "offscreen":
            warnings.append(name)
            print("  OFFSCREEN %-25s %s" % (name, detail))
        else:
            failures.append(name)
            print("  FAILED   %-26s" % name)
            for line in detail.rstrip().splitlines():
                print("      " + line)

    print()
    if not BENCH.saw_display:
        print("note: no display was constructed, so bounds were checked "
              "against the %dx%d fallback" % (FALLBACK_WIDTH, FALLBACK_HEIGHT))
    print("%d ok, %d off-screen, %d failed"
          % (len(labs) - len(failures) - len(warnings),
             len(warnings), len(failures)))
    print()
    print("Reminder: this proves the labs RUN. It does not prove a face "
          "looks right,")
    print("and every timing number a lab reports here comes from a fake "
          "clock. Test")
    print("on real hardware before handing anything to students.")

    return 1 if (failures or warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
