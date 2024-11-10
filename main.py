def on_forever():
    radio.set_group(1)
    radio.set_frequency_band(0)
basic.forever(on_forever)
