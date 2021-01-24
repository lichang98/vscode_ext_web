from copy import deepcopy
from sklearn.utils import shuffle
from sklearn.preprocessing import OneHotEncoder
import pickle
import darwin_ii
import keras
import numpy as np
from PIL import Image
import tqdm
import sys
import random
import os

from tensorflow.python.keras.backend import dtype

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'



model = os.path.join(
    'E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\ann_model_descs\\conv_normed_model.h5')
trainningDataset = os.path.join(
    "E:\\courses\\ZJLab\\dataset\\trainingSet\\trainingSet")
num_test_samples=20

def get_neuron_idx(w: int, h: int,channel, x, y):
    """
    get the flatten position with 2d (x,y) of prev layer neuron group
    """
    return channel * (w*h)+y*w+x


def get_prev_layer_conn(stride_y: int, stride_x: int, kernel_y: int, kernel_x: int, x, y):
    """
    Get connected neurons of prev neuron group layer, return is 2d position (x_min, x_max, y_min,y_max)
    """
    return x*stride_x, x*stride_x+kernel_x, y*stride_y, y*stride_y+kernel_y


def conv_connect_conv(prev_h, prev_w, curr_h, curr_w, curr_channel, prev_channel, stride_y, stride_x, kernel_y, kernel_x, weights):
    input_wt = np.array(deepcopy(weights))
    print("func conv_connect_conv, input weight shape={}".format(np.shape(input_wt)))
    conns = []
    for c_curr in range(curr_channel):
        for y in range(curr_h):
            for x in range(curr_w):
                for c_prev in range(prev_channel):
                    x_min, x_max, y_min, y_max = get_prev_layer_conn(
                        stride_y, stride_x, kernel_y, kernel_x, x, y)
                    kernel_window_wt = input_wt[:, :, c_prev, c_curr]
                    kernel_window_wt = kernel_window_wt.flatten()
                    curr_idx = get_neuron_idx(curr_w, curr_h, c_curr,x, y)
                    count = 0
                    for prev_y in range(y_min, y_max):
                        for prev_x in range(x_min, x_max):
                            prev_idx = get_neuron_idx(
                                prev_w, prev_h, c_prev,prev_x, prev_y)
                            conns.append(
                                [prev_idx, curr_idx, kernel_window_wt[count]])
                            count += 1
    return np.array(conns)

def pool_conv_connect(prev_h, prev_w, curr_h, curr_w, curr_channel, prev_channel, stride_y, stride_x, pool_y, pool_x):
    weight = 1.0/(pool_y*pool_x)
    conns = []
    for c_prev in range(prev_channel):
        for y in range(curr_h):
            for x in range(curr_w):
                c_curr = c_prev
                x_min,x_max,y_min,y_max = get_prev_layer_conn(stride_y,stride_x, pool_y,pool_x,x,y)
                curr_idx = get_neuron_idx(curr_w, curr_h, c_curr,x,y)
                for prev_y in range(y_min,y_max):
                    for prev_x in range(x_min,x_max):
                        prev_idx = get_neuron_idx(prev_w,prev_h, c_prev,prev_x,prev_y)
                        conns.append([prev_idx, curr_idx, weight])
    
    return np.array(conns)



images, labels = [], []


if os.path.exists("tmp.pkl"):
    with open("tmp.pkl", "rb") as f:
        test_imgs, test_labels = pickle.load(f)

else:
    for subdir in os.listdir(trainningDataset):
        for file in os.listdir(os.path.join(trainningDataset, subdir)):
            img = Image.open(os.path.join(trainningDataset, subdir, file))
            img = np.array(img)
            img = np.expand_dims(img, axis=-1)
            labels.append(int(subdir))
            images.append(img)

    images = np.array(images, dtype="float32")/255.0
    labels = np.expand_dims(np.array(labels, dtype="int32"), axis=-1)
    onehotEnc = OneHotEncoder()
    onehotEnc.fit(labels)
    labels = np.array(onehotEnc.transform(labels).toarray(), dtype="int32")
    images, labels = shuffle(images, labels)

    test_imgs, test_labels = images[-num_test_samples:], labels[-num_test_samples:]

    with open("tmp.pkl", "wb") as f:
        pickle.dump((test_imgs, test_labels), f)

conv_model: keras.models.Model = keras.models.load_model(model)
conv_model.summary()

beg_index = 0
if conv_model.layers[0].__class__.__name__ == "InputLayer":
    beg_index = 1


neuron_groups = [darwin_ii.NeuronGroup(
    np.prod(conv_model.input_shape[1:]), "input")]
print("input layer output shape={}".format(
    conv_model.layers[0].output_shape[0]))
synapses = []
layer_output_shapes = []
layer_output_shapes.append(conv_model.layers[0].output_shape[0][1:])
for i in range(1, len(conv_model.layers)):
    layer_output_shapes.append(conv_model.layers[i].output_shape[1:])

for i in range(beg_index, len(conv_model.layers)):
    if conv_model.layers[i].__class__.__name__ == "Conv2D":
        print("Conv2D, shape={}".format(
            np.shape(conv_model.layers[i].get_weights())))
        neuron_groups.append(darwin_ii.NeuronGroup(
            np.prod(conv_model.layers[i].output_shape[1:]), 'layer{}'.format(i)))
        kernel_y, kernel_x = conv_model.layers[i].kernel_size
        stride_y, stride_x = conv_model.layers[i].strides
        conns = []
        weights = np.array(conv_model.layers[i].get_weights())[0]
        print("Conv2D, weight shape={}, kernels={},{}  strides={},{}".format(np.shape(weights), kernel_y,kernel_x, stride_y,stride_x))
        prev_h, prev_w, prev_channel = layer_output_shapes[i-1]
        curr_h, curr_w, curr_channel = layer_output_shapes[i]
        conns = conv_connect_conv(prev_h, prev_w, curr_h, curr_w, curr_channel,
                                  prev_channel, stride_y, stride_x, kernel_y, kernel_x, weights)
        synapses.append(darwin_ii.Synapses(neuron_groups[-2], neuron_groups[-1], i=np.array(
            conns[:, 0], dtype="int32"), j=np.array(conns[:, 1], dtype="int32"), w=conns[:, 2]))

    elif conv_model.layers[i].__class__.__name__ == "MaxPooling2D"\
            or conv_model.layers[i].__class__.__name__ == "AvgPooling2D":
        neuron_groups.append(darwin_ii.NeuronGroup(np.prod(conv_model.layers[i].output_shape[1:]), 'layer{}'.format(i)))
        pool_y,pool_x = conv_model.layers[i].pool_size
        stride_y,stride_x = conv_model.layers[i].strides
        print("Pooling2D, shape={}, strides={},{}, pools={},{}".format(
            np.shape(conv_model.layers[i].get_weights()), stride_y,stride_x,pool_y,pool_x))
        prev_h, prev_w, prev_channel = layer_output_shapes[i-1]
        curr_h, curr_w, curr_channel = layer_output_shapes[i]
        conns = pool_conv_connect(prev_h,prev_w,curr_h,curr_w, curr_channel,prev_channel,stride_y,stride_x,pool_y,pool_x)
        synapses.append(darwin_ii.Synapses(neuron_groups[-2], neuron_groups[-1], i=np.array(conns[:,0],dtype="int32"),\
            j=np.array(conns[:,1],dtype="int32"), w=conns[:,2]))
    elif conv_model.layers[i].__class__.__name__ == "Flatten":
        print("Flatten, shape={}".format(
            np.shape(conv_model.layers[i].get_weights())))
        pass
    else:
        # dense layer
        print("Dense, shape={}".format(
            np.shape(conv_model.layers[i].get_weights())))
        input_wt = np.array(deepcopy(conv_model.layers[i].get_weights()[0]))
        neuron_groups.append(darwin_ii.NeuronGroup(
            np.prod(conv_model.layers[i].output_shape[1:]), 'layer{}'.format(i)))
        conns = []
        for y in range(input_wt.shape[0]):
            for x in range(input_wt.shape[1]):
                conns.append([y, x, input_wt[y, x]])

        conns = np.array(conns)
        print("conns shape={}".format(conns.shape))
        synapses.append(darwin_ii.Synapses(neuron_groups[-2], neuron_groups[-1], i=np.array(conns[:, 0], dtype="int32"),
                                           j=np.array(conns[:, 1], dtype="int32"), w=conns[:, 2]))


monitor = darwin_ii.SpikeMonitor(neuron_groups[-1])
network_snn = darwin_ii.Network(neuron_groups, synapses, monitor)
network_snn.store()

for i in range(num_test_samples):
    spikes = test_imgs[i].flatten()
    neuron_groups[0].set_leak(spikes)

    network_snn.run(100)

    output_spike = monitor.summary()
    count = []
    for x in output_spike:
        count.append(len(x))
    print("Test case {}, pred={}, expect={}, counts={}".format(i+1, np.argmax(count), np.argmax(test_labels[i]), count))
