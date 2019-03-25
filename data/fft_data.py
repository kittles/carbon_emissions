import numpy as np
import matplotlib.pyplot as plt
from scipy import fftpack
import json
import itertools as itr

data = json.load(open('hourly.json'))
data = data['data']
xs = np.array([d['total'] for d in data])

# sample data with one cycle
cycle = itr.cycle([0,2,5])
cycle_2 = itr.cycle([0,2,5,8])
cycle_3 = itr.cycle(range(40))
xs = [next(cycle) + next(cycle_2) + next(cycle_3) for i in range(24 * 365 * 10)]
# corresponds to 0.14


ft = np.fft.rfft(xs*np.hanning(len(xs)))
mgft = abs(ft)
xVals = np.fft.fftfreq(len(xs), d=1/10060) # in hours, or d=1.0/24 in days
plt.plot(xVals[:len(mgft)], mgft)
plt.show()
