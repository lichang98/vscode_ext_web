from collections import Iterable

import brian2 as b


class Network:

    def __init__(self, *args):

        def flatten(obj):
            if isinstance(obj, Iterable):
                array = []
                for x in obj:
                    array.extend(flatten(x))
                return array
            else:
                return [obj]

        self.brian_items = [x.brian for x in flatten(list(args))]
        self.brian = b.Network(self.brian_items)

    def run(self, time_step):
        self.brian.run(time_step * b.ms)

    def store(self):
        self.brian.store()

    def restore(self):
        self.brian.restore()
