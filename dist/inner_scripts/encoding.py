# -*- coding:utf-8 -*-
###############################################################################
#  做图像预处理、脉冲编码操作，脚本运行后输出input.txt和row.txt。
#  脚本运行需要三个参数：
#  inputImgFile = sys.argv[1]  # 用户上传的年龄检测照片文件，绝对路径（包含文件名）
#  configDir = sys.argv[2]     # xx.dat解包后的配置文件保存路径
#  outputDir = sys.argv[3]     # 最后生成的编码文件保存路径
#
###############################################################################

import sys
from os import path
import brian2
import pickle
from PIL import Image
import numpy as np
import gen_input

inputImgFile = sys.argv[1]
configDir = sys.argv[2]
outputDir = sys.argv[3]

F_LAYER_WIDTH = path.join(configDir, "layerWidth1_1")
F_NODE_LIST = path.join(configDir, "nodelist1_1")
F_INPUT_LAYER1 = path.join(configDir, "input_to_layer_1.pickle")
F_BR = path.join(configDir, "br2.pkl")

F_INPUT_TXT = path.join(outputDir, "input.txt")
F_ROW_TXT = path.join(outputDir, "row.txt")


assert path.exists(F_LAYER_WIDTH)
assert path.exists(F_NODE_LIST)
assert path.exists(F_INPUT_LAYER1)
assert path.exists(F_BR)

assert path.exists(outputDir)

with open(F_BR, "rb") as f:
    snn_model = pickle.load(f)

print("Initialization started...")
br2_neurons=[]
br2_synapses=[]
model_eqs="""
    dv/dt = bias : 1
    bias : Hz
"""
for i in range(len(snn_model["neurons"])):
    br2_neurons.append(brian2.NeuronGroup(snn_model["neurons"][i], model_eqs, method="euler", threshold="v >= v_thresh", reset="v = v - v_thresh", dt=1*brian2.ms))

for i in range(len(snn_model["synapses_i"])):
    br2_synapses.append(brian2.Synapses(br2_neurons[i], br2_neurons[i+1], model="w : 1", on_pre="v += w", dt=1*brian2.ms))
    br2_synapses[-1].connect(i=snn_model["synapses_i"][i], j=snn_model["synapses_j"][i])
    br2_synapses[-1].w = snn_model["synapses_w"][i]

br2_input_spike_monitor = brian2.SpikeMonitor(br2_neurons[0])
br2_net = brian2.Network(br2_neurons, br2_synapses, br2_input_spike_monitor)
br2_net.store()
print("Initialization finish.")

with open(F_LAYER_WIDTH, "rb") as f:
    layerWidth = pickle.load(f)

with open(F_NODE_LIST, "rb") as f:
    nodeList = pickle.load(f)

with open(F_INPUT_LAYER1, "rb") as f:
    in_layer1 = pickle.load(f)


img = Image.open(inputImgFile)
img = img.convert("L").resize((32, 32))
img = np.array(img, dtype="float32") / 255.0

br2_neurons[0].bias = img.flatten() / brian2.ms
br2_net.run(50*brian2.ms, namespace={"v_thresh": snn_model["v_thresh"]})

input_spike_seq = []
for i in range(len(br2_input_spike_monitor.spike_trains().items())):
    input_spike_seq.append([i, [int(tm/brian2.ms) for tm in list(br2_input_spike_monitor.spike_trains()[i])]])
br2_net.restore()
# Encode binary
input_node_map = {}
neuron_num = int(np.math.ceil(layerWidth[1] / len(nodeList[0])))
for line in in_layer1:
    dst = int(line[1])
    node_x = nodeList[0][dst // neuron_num][0]
    node_y = nodeList[0][dst // neuron_num][1]
    node_number = node_x * 64 + node_y
    if not node_number in input_node_map.keys():
        input_node_map[node_number] = {}
    
    input_node_map[node_number].update({dst % neuron_num : dst})

gen_input.change_format(in_layer1)
gen_input.gen_inputdata(in_layer1, input_spike_seq, input_node_map, 50, F_INPUT_TXT, F_ROW_TXT)
