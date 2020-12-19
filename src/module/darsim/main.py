import os

from tensorflow.python.platform.tf_logging import flush

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import random
import sys

import tqdm
from PIL import Image
import numpy as np
import keras
import darwin_ii
import pickle

# file path
model = os.path.join(sys.path[0], 'E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\ann_model_descs\\fcn_normed_model.h5')
model = "E:\\courses\\ZJLab\\ANN-SNN Conversion\\fcn_norm_fixed.h5"
# model = os.path.join(sys.path[0], 'C:\\Users\\32344\\Downloads\\model\\mnist_normalized.h5')
# data = os.path.join(sys.path[0], 'C:\\Users\\32344\\Downloads\\dataset\\mnist\\trainingSet\\trainingSet')
# data = "E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\stage1_tmp.pkl"
data="stage1_tmp.pkl" # for integration
test_ratio = 0.0025  # 42000 in total

model = sys.argv[1]
# data = sys.argv[2]

images,labels=[],[]
with open(data,"rb") as f:
    images,labels = pickle.load(f)

labels = np.argmax(labels,axis=-1) # change from one-hot to labels
images = images[-100:]
labels = labels[-100:]
print("images shape={}, labels shape={}".format(np.shape(images), np.shape(labels)))

# load model
m = keras.models.load_model(model)
m.summary()

# create network: neuron groups
neuron_groups = [darwin_ii.NeuronGroup(np.prod(m.input_shape[1:]), 'input')]
print("model input shape={}".format(m.input_shape[1:]))
beg_index=0
if m.layers[0].__class__.__name__ == "InputLayer":
    beg_index=1
for i in range(beg_index,len(m.layers)):
    if i == len(m.layers) - 1:
        neuron_groups.append(darwin_ii.NeuronGroup(np.prod(m.layers[i].output_shape[1:]), 'output'))
    else:
        neuron_groups.append(darwin_ii.NeuronGroup(np.prod(m.layers[i].output_shape[1:]), 'layer' + str(i + 1)))

# create network: connections
synapses = []
for k in tqdm.tqdm(range(beg_index,len(m.layers)), 'create network'):
    i, j, w = [], [], []
    weight = m.layers[k].get_weights()[0]
    print("layer k={}, weights shape={}".format(k, np.shape(m.layers[k].get_weights())))
    for x in range(weight.shape[0]):
        for y in range(weight.shape[1]):
            i.append(x)
            j.append(y)
            w.append(weight[x][y])
    synapses.append(darwin_ii.Synapses(neuron_groups[k-beg_index], neuron_groups[k+1-beg_index], i=i, j=j, w=w))

# create network: monitor
mon = darwin_ii.SpikeMonitor(neuron_groups[-1])

# create network: store
n = darwin_ii.Network(neuron_groups, synapses, mon)
n.store()

# test
correct = 0
time_step = 100
import time
for i in range(len(images)):
    # input
    spikes = images[i]
    neuron_groups[0].set_leak(spikes)

    # run
    n.run(time_step)

    # print
    output_spike = mon.summary()
    count = []
    for x in output_spike:
        count.append(len(x))
    if np.argmax(count) == labels[i]:
        correct += 1
    print("Total {}, Current solved {}, current total currect count {}".format(len(images),i+1, correct))
    if i % 10 == 0:
        sys.stdout.flush()
    # reset
    n.restore()

# result
print("acc: {:.2%}".format(correct / len(images)))
