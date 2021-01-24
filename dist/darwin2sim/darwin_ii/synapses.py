from typing import List

import brian2 as b

try:
    from neuron_group import NeuronGroup
except ImportError:
    from .neuron_group import NeuronGroup


class Synapses:
    """
    Synapses is a group of synapse connections having the same behavior.
    """

    def __init__(self, src: NeuronGroup, tar: NeuronGroup, name: str = '', delay: int = 1,
                 i: List[int] = None, j: List[int] = None, w: List[int] = None):
        """
        :param src:
                Neuron group before the synapse.
        :param tar:
                Neuron group after the synapse.
        :param name:
                Name of this synapse.
        :param delay:
                Number of time steps needed that spike can transfer from pre-synapse neuron to post-synapse neuron.
                It can be 0, 1 or 2.
        :param i:
                A list of indexes of pre-synapse neurons.
                The length of this must be equal to the length of j and w.
        :param j:
                A list of indexes of post-synapse neurons.
                The length of this must be equal to the length of i and w.
        :param w:
                A list of weight of each synapse connection.
                The length of this must be equal to the length of i and j.
        """

        # save parameters
        self.src = src
        self.tar = tar
        self.name = name
        self.delay = delay
        self.i = i
        self.j = j
        self.w = w

        # check delay
        if self.delay < 0 or self.delay > 2:
            raise Exception("invalid delay value")

        # check length of i, j, w
        if len(self.i) != len(self.j) or len(self.i) != len(self.w):
            raise Exception("mismatch of length of i, j and w")

        # construct brain synapse
        self.brian = b.Synapses(self.src.brian, self.tar.brian, 'w : 1', 'v+=w', dt=self.delay * b.ms)
        self.brian.connect(i=self.i, j=self.j)
        self.brian.w = self.w
