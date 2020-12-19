import brian2 as b

try:
    from neuron_group import NeuronGroup
except ImportError:
    from .neuron_group import NeuronGroup


class SpikeMonitor:

    def __init__(self, group: NeuronGroup):
        self.group = group
        self.brian = b.SpikeMonitor(group.brian)

    def summary(self):
        i = self.brian.i
        t = self.brian.t
        spikes = [[] for _ in range(self.group.num)]
        for x in range(len(i)):
            spikes[i[x]].append(int(t[x] / b.ms))
        return spikes
