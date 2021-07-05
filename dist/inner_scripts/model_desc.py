# -*- coding:utf-8 -*-
"""
This file generates description of model and 
intermediate images of extracted features
"""
import keras
import sys
import json
import numpy as np
from PIL import Image
import os
import shutil

from tensorflow.python.keras.backend import dtype

base_path = os.path.dirname(os.path.abspath(__file__))

x_norm_file = sys.argv[1]
x_test_file = sys.argv[2]
y_test_file = sys.argv[3]

task_type = 0 # task_type 3: fatigue detection

if len(sys.argv) > 5:
    task_type = int(sys.argv[5])   


x_norm = np.load(x_norm_file)["arr_0"]
x_test = np.load(x_test_file)["arr_0"]
y_test = np.load(y_test_file)["arr_0"]

model_file = sys.argv[4]
print("py script get model file path [{}]".format(model_file))
model = keras.models.load_model(model_file)

total_num_layers = len(model.layers)
total_num_units = 0

for i in range(len(model.layers)):
    total_num_units += np.prod(model.layers[i].output_shape[1:])

model.summary()
print("total layers={}, num params={}, num units={}".format(total_num_layers, model.count_params(), total_num_units))

model_layers_info=[]
# desc each layer of model
# layer name, output shape, params
for layer in model.layers:
    if layer.__class__.__name__ == "InputLayer":
        model_layers_info.append({"name":layer.__class__.__name__, "shape":model.input_shape[1:], "params":layer.count_params()})
    else:
        model_layers_info.append({"name":layer.__class__.__name__, "shape":layer.output_shape[1:], "params":layer.count_params()})
    
# save basic info
with open(os.path.join(base_path,"model_general_info.json"),"w+",encoding="utf-8") as f:
    f.write(json.dumps({"total_num_layers":total_num_layers,"total_params":model.count_params(), "total_units":int(total_num_units)}))

# save info of each layer
with open(os.path.join(base_path, "model_layers_info.json"),"w+",encoding="utf-8") as f:
    f.write(json.dumps(model_layers_info))


# visualize the conv and activation layers
layer_vis_data=[]
idx=0
max_vis_each_layer=5

selected_idxs = list(np.random.randint(20, size=max_vis_each_layer))

for layer in model.layers:
    if layer.__class__.__name__ == "Conv2D" or layer.__class__.__name__ == "InputLayer" or layer.__class__.__name__ == "AveragePooling2D"\
                    or layer.__class__.__name__ == "MaxPooling2D" or layer.__class__.__name__ == "Dropout" or layer.__class__.__name__ == "Dense":
        idx +=1
    if layer.__class__.__name__ == "Conv2D" or (task_type == 3 and layer.__class__.__name__ == "Dense"):
        if task_type == 0:
            layer_output = keras.models.Model(inputs=model.input, outputs=layer.output).predict(x_norm[0:1])
            layer_output = layer_output[0]
            print("shape of layer output={}".format(np.shape(layer_output)))
            layer_vis_img_paths=[]
            for i in range(min(np.shape(layer_output)[-1], max_vis_each_layer)):
                img = np.array(layer_output[:,:,i],dtype="float32")*255.0
                img = np.array(img, dtype="uint8")
                img = Image.fromarray(img)
                img = img.resize((32,32))
                img.save(os.path.join(base_path,"layer_vis_imgs", "layer_{}_{}_vis.png".format(idx,i)))
                layer_vis_img_paths.append("http://127.0.0.1:6003/img/layer_{}_{}_vis.png".format(idx,i))
            
            layer_vis_data.append({"layer_name": layer.__class__.__name__, "layer_index":idx, \
                "layer_vis_img_paths": layer_vis_img_paths})
        elif task_type == 1:
            layer_vis_img_paths=[]
            for i in range(max_vis_each_layer):
                layer_output = keras.models.Model(inputs=model.input, outputs=layer.output).predict(x_norm[selected_idxs[i]: selected_idxs[i]+1])
                layer_output = layer_output[0]
                print('shape of layer output={}'.format(np.shape(layer_output)))
                img = np.array(layer_output[:,:,0], dtype='float32')*255.0
                img = np.array(img, dtype='uint8')
                img = Image.fromarray(img)
                img = img.resize((32,32))
                img.save(os.path.join(base_path, 'layer_vis_imgs', 'layer_{}_{}_vis.png'.format(idx,i)))
                layer_vis_img_paths.append("http://127.0.0.1:6003/img/layer_{}_{}_vis.png".format(idx, i))
            
            layer_vis_data.append({'layer_name':layer.__class__.__name__, "layer_index":idx, 'layer_vis_img_paths': layer_vis_img_paths})

        elif task_type == 3:
            layer_vis_img_paths=[]
            for i in range(max_vis_each_layer):
                layer_output = keras.models.Model(inputs=model.input, outputs=layer.output).predict(x_norm[selected_idxs[i]: selected_idxs[i]+1])
                layer_output = layer_output[0]
                print('shape of layer output={}'.format(np.shape(layer_output)))
                img = np.array(layer_output, dtype='float32')*255.0
                img = np.array(img, dtype='uint8')
                img = Image.fromarray(img)
                img = img.resize((32,32))
                img.save(os.path.join(base_path, 'layer_vis_imgs', 'layer_{}_{}_vis.png'.format(idx,i)))
                layer_vis_img_paths.append("http://127.0.0.1:6003/img/layer_{}_{}_vis.png".format(idx, i))
            
            layer_vis_data.append({'layer_name':layer.__class__.__name__, "layer_index":idx, 'layer_vis_img_paths': layer_vis_img_paths})

                
                
# save layer images info
with open(os.path.join(base_path, "layer_vis_info.json"),"w+") as f:
    f.write(json.dumps(layer_vis_data))


# extract info for model vis
conv_sizes=[]
conv_channels=[]
kernel_sizes=[]
dense_sizes=[]
model.summary()

for layer in model.layers:
    if layer.__class__.__name__ == "InputLayer":
        conv_sizes.append(layer.output_shape[0][1:-1])
        conv_channels.append(layer.output_shape[0][-1])
    elif layer.__class__.__name__ == "Conv2D":
        conv_sizes.append(layer.output_shape[1:-1])
        conv_channels.append(layer.output_shape[-1])
        kernel_sizes.append(layer.kernel_size)

        print("layer name={}, output shape={}, channel size={}, kernel_size={}".format(layer.__class__.__name__,\
                layer.output_shape[1:-1],layer.output_shape[-1],layer.kernel_size))
    elif layer.__class__.__name__ == "AveragePooling2D":
        conv_sizes.append(layer.output_shape[1:-1])
        conv_channels.append(layer.output_shape[-1])
        kernel_sizes.append(layer.pool_size)

        print("layer name={}, output shape={}, channel size={}, pool_size={}".format(layer.__class__.__name__,\
                layer.output_shape[1:-1],layer.output_shape[-1],layer.pool_size))
    elif layer.__class__.__name__ == "Flatten":
        dense_sizes.append(layer.output_shape[-1])
    elif layer.__class__.__name__ == "Dense":
        dense_sizes.append(layer.output_shape[-1])

        print("layer size={}".format(layer.output_shape[-1]))
# draw model graph
print("convsize list={}, conv num list={}, kernel size list={}, dense size list={}".format(conv_sizes, conv_channels, kernel_sizes, dense_sizes))
import draw_convnet
draw_convnet.run_draw(conv_size_list=conv_sizes,
                    conv_num_list=conv_channels,
                    kernel_size_list=kernel_sizes,
                    dense_size_list=dense_sizes,
                    save_fig_path=os.path.join(base_path, "ann_model_vis.png"),task_type=task_type)

shutil.move(os.path.join(base_path, "ann_model_vis.png"), os.path.join(base_path, "layer_vis_imgs","ann_model_vis.png"))
model_vis_img_info = {"model_vis_img_path":os.path.join(base_path, "layer_vis_imgs","ann_model_vis.png")}
with open(os.path.join(base_path, "model_vis_info.json"),"w+") as f:
    f.write(json.dumps(model_vis_img_info))
