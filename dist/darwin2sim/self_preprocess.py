# -*- coding:utf-8 -*-
import keras
import numpy as np


def normalize_parameters(model:keras.models.Model, np_data:np.ndarray):
	"""
	NN weights normalization
	
	Spiking neural network is driving with sparsely firing, and the weights from ANN needed to be processed
	to minimize the lossin the conversion process.
	You should implement your own method to normalize synapses' weights, after finishing it, you can run it and
	see the performance.
	-----------------------
	
	Parameters:
	---------
	model: keras model, you can get layer weights by calling 'model.layers[i].get_weights()'. Note that some layers, such as pooling, do not have weights
	np_data: N x M or N x M x K np array, it can be directly feed into this model. You can use it for necessary computation.
	"""
	layer_weights = []
	for i in range(len(model.layers)):
		if np.array(model.layers[i].get_weights()).shape[0] == 0:
			continue
		layer_weights.append(np.array(model.layers[i].get_weights()))
	
	# Implement your algorithm
	

	idx = 0
	for i in range(len(model.layers)):
		if np.array(model.layers[i].get_weights()).shape[0] == 0:
			continue
		model.layers[i].set_weights(layer_weights[idx])
		idx += 1
					
