# darwin2 README

A `VSCode` extension for converting ANN model built by `Keras` into SNN model that can be run on `brian2` simulator. This extension also have other features, such as image preview, pickle file preview, visualization for data and model(ANN and SNN) and generate necessary files.

## Requirements

- nodejs
- python3.7

There may exists some problems when choosing versions of these three libraries below, the following are the recommended versions.

- tensorflow==2.3.2
- Keras==2.4.3
- Brian2==2.4.2

## ANN Model Requirements

- Individual `InputLayer`
- Only use `ReLU` as activation, and use it in an individual layer, such as `keras.layers.Activation("relu")`
- Recommend using `AveragePooling2D` instead of `MaxPooling2D`
- Model for classification

### Acknowledgement
- SNNtoolbox
- DarwinLang for parsing and generating binary files
