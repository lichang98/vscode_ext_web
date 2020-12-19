try:
    from neuron_group import NeuronGroup
    from synapses import Synapses
    from spike_monitor import SpikeMonitor
    from network import Network
except ImportError:
    from .neuron_group import NeuronGroup
    from .synapses import Synapses
    from .spike_monitor import SpikeMonitor
    from .network import Network
