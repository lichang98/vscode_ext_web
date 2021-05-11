# darwin2 README

A `VSCode` extension for converting ANN model built by `Keras` into SNN model that can be run on `brian2` simulator. This extension also has other features, such as image preview, pickle file preview, visualization for data and model(ANN and SNN), and generate necessary files.

## Requirements

- Node.js
- python3.7

There may exist some problems when choosing versions of these three libraries below, the followings are the recommended versions.

- tensorflow==2.3.2
- Keras==2.4.3
- Brian2==2.4.2

## ANN Model Requirements

- Individual `InputLayer`
- Only use `ReLU` as activation, and use it in an individual layer, such as `keras.layers.Activation("relu")`
- Recommend using `AveragePooling2D` instead of `MaxPooling2D`
- Model for classification

## Conversion Procedure

### 1. Preprocessing

The original ANN model may not meet the requirements of model conversion. For example, the activation functions should be replaced with ReLU, and
Max-pooling layers should be replaced with Average-poolings.

### 2. Model Conversion

Currently, the conversion methods are mainly based on the paper *Diehl, Peter U., et al. "Fast-classifying, high-accuracy spiking deep networks through weight and threshold balancing." 2015 International joint conference on neural networks (IJCNN). ieee, 2015.*. And Rueckauer developed the SNN Toolbox for model conversion. The tool supports conversion for commonly used convolution neural-network for classification tasks.

### 3. Quantization

Quantization is needed to run a spiking-neural network on low-power devices. A simple way of quantization is to calculate the low and high limit of the weight distribution and calculate the scale factor with the target fixpoint range, and then use the scale factor to convert the float weights into integer weights.

However, different from ANN, SNN relies on discretely distributed spiking signals, and the voltage threshold of each neuron determines when the neuron will trigger a spike. It is hard to find the voltage threshold for each neuron. Instead, we determine the voltage threshold for each layer. The paper *Al-Hamid, Ali A., and HyungWon Kim. "Optimization of Spiking Neural Networks Based on Binary Streamed Rate Coding." Electronics 9.10 (2020): 1599.* proposed a method called integer threshold compensation which can find suitable voltage thresholds for each layer with dedicated formula.

### 4. Compiling

After finishing the above procedures, you've got a spiking neural network ready to be deployed onto neuromorphic hardware. The last step is to call the compilation library to make the spiking neural network a deployable binary one. The compilation may engage the distribution of logical neurons on hardware cores and the routes on a chip.

### Acknowledgement
- SNNtoolbox
- DarwinLang for parsing and generating binary files
