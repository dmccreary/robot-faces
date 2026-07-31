# Rotary Encoder

https://raw.githubusercontent.com/miketeachman/micropython-rotary/master/Examples/example_simple.py

```python
# example for MicroPython rotary encoder based on the Mike Teachman driver 

import sys
from machine import Pin
from rotary_irq_rp2 import RotaryIRQ
import time

PIN_NUM_CLK = 14
PIN_NUM_DATA = 15

# defauls are for pull up input pins and bounded ranges
r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=0,
              max_val=20)

val_old = r.value()

while True:
    val_new = r.value()

    if val_old != val_new:
        val_old = val_new
        print('result =', val_new)

    time.sleep_ms(50)
```

We modified the driver in /lib/rotary.py to start half-way between the min and the max:

```python
def __init__(self, min_val, max_val, incr, reverse, range_mode, half_step, invert):
        self._min_val = min_val
        self._max_val = max_val
        self._incr = incr
        self._reverse = -1 if reverse else 1
        self._range_mode = range_mode
        # change by DGM to make the default value 1/2 the min/max
        self._value = int((max_val - min_val)/2)
        self._state = _R_START
        self._half_step = half_step
        self._invert = invert
        self._listener = []
```

We also modified the default values in /libto reflect our hardware:

```python
# here are all the default values - change as appropriate
class RotaryIRQ(Rotary):
    def __init__(
        self,
        pin_num_clk,
        pin_num_dt,
        min_val=-10,
        max_val=10,
        incr=1,
        reverse=False,
        range_mode=Rotary.RANGE_BOUNDED,
        pull_up=True,
        half_step=False,
        invert=False
    ):
        super().__init```

