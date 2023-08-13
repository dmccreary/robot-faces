# MIT License (MIT)
# Copyright (c) 2021 Mike Teachman
# https://opensource.org/licenses/MIT

# example for MicroPython rotary encoder

import sys
from machine import Pin
from rotary_irq_rp2 import RotaryIRQ
import time

PIN_NUM_CLK = 14
PIN_NUM_DATA = 15

# we need to set the pull-up resistors
dt_pin = Pin(PIN_NUM_DATA, Pin.IN, Pin.PULL_UP)
clk_pin = Pin(PIN_NUM_CLK, Pin.IN, Pin.PULL_UP)
# this can 

r = RotaryIRQ(pin_num_clk=PIN_NUM_CLK,
              pin_num_dt=PIN_NUM_DATA,
              min_val=-10,
              max_val=10,
              reverse=False,
              range_mode=RotaryIRQ.RANGE_BOUNDED)

val_old = r.value()
val_new = 0

while True:
    val_new = r.value()

    if val_old != val_new:
        val_old = val_new
        print('result =', val_new)

    time.sleep_ms(50)