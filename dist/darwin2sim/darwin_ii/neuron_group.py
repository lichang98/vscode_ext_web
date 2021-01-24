import brian2 as b


class NeuronGroup:
    """
    Neuron group is a group of neurons having the same behavior.
    Note that the default configuration is exactly an IF model.
    """

    def __init__(self, num: int = 1, name: str = '',
                 neuron_type: int = 0, reset_mode: int = 1, v_th: int = 1, leak: int = 0):
        """
        :param num:
                Number of neurons in this group.
        :param name:
                Name of this neuron group.
        :param neuron_type:
                Type of neurons in this group.
                All neurons in a group have the same type.
                Type 0 (one way) means neurons' voltage will drop towards negative infinity.
                Type 1 (two way) means neurons' voltage will drop towards 0.
                Other type is invalid.
        :param reset_mode:
                Reset mode of neurons in this group.
                All neurons in a group have the same reset mode.
                Reset mode 0 means neurons' voltage will be reset to 0 after firing a spike.
                Reset mode 1 means neurons' voltage will be distracted threshold voltage after firing a spike.
                Other reset mode is invalid.
        :param v_th:
                Threshold voltage.
                Neuron will fire a spike when its voltage exceeds threshold voltage.
        :param leak:
                Leak current.
                Neuron's voltage will leak in every time step.
        """

        # save input parameters
        self.num = num
        self.name = name
        self.neuron_type = neuron_type
        self.reset_mode = reset_mode
        self.v_th = v_th
        self.leak = leak

        # construct equation
        self.eqs='''dv/dt = bias : 1
                      bias : hertz
                      v_th : 1'''
        # if self.neuron_type == 0:
        #     self.eqs = '''
        #         dv/dt = leak/(1*ms) : 1
        #         leak : 1
        #         v_th : 1
        #     '''
        # elif self.neuron_type == 1:
        #     self.eqs = '''
        #         dv/dt = sign(v)*leak/(1*ms) : 1
        #         leak : 1
        #         v_th : 1
        #     '''
        # else:
        #     raise Exception("invalid neuron type")

        # firing threshold
        self.threshold = 'v>=v_th'

        # reset action
        if self.reset_mode == 0:
            self.reset = 'v=0'
        elif self.reset_mode == 1:
            self.reset = 'v=v-v_th'
        else:
            raise Exception("invalid reset mode")

        # construct brian neuron group
        self.brian = b.NeuronGroup(self.num, self.eqs, threshold=self.threshold, method="euler", reset=self.reset, dt=1 * b.ms)
        # self.brian.v_th = self.v_th
        # self.brian.leak = self.leak
        self.brian.bias=0
        self.v_th=1

    # def set_leak(self, leak):
    #     self.leak = leak
    #     self.brian.leak = leak
    def set_bias(self,bias):
        bias = bias.flatten()/b.ms
        self.bias = bias
        self.brian.bias = bias
