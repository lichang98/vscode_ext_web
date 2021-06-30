# -*- coding:utf-8 -*-
# Validation for ANN model
import keras
import numpy as np
from tensorflow.python.keras.optimizers import get
import sys

model_path = sys.argv[1]

MAX_NEURON_COUNT = 20000

model = keras.models.load_model(model_path)

neu_count = 0

def get_name(layer):
    return layer.__class__.__name__

assert len(model.layers) > 1 and get_name(model.layers[0]) == "InputLayer", "Assert contain input layer!"
assert model.layers[0].output_shape[0][0] == 1, "Assert batch_size == 1!"
for i in range(len(model.layers)):
    layer = model.layers[i]
    if get_name(layer) == "InputLayer":
        neu_count += np.prod(layer.output_shape[0][1:])
    elif get_name(layer) == "Conv2D" or get_name(layer) == "Flatten" or get_name(layer) == "Dense":
        neu_count += np.prod(layer.output_shape[1:])
    

if (neu_count > MAX_NEURON_COUNT):
    raise Exception("ANN模型规模超过最大限制！")