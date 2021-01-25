import os
import sys
import numpy as np
from importlib import import_module

from numpy.core.records import record
import darwin_ii
import tqdm
import brian2
from sklearn.utils import shuffle
import json
import pickle
import shutil

baseDirPath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(baseDirPath, "snntoolbox"))
# model_path = os.path.join(
#     'E:\\courses\\ZJLab\\IDE-related-docs\\darwin2sim\\target\\mnist_cnn.h5')
model_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "target", "mnist_cnn.h5")

config_path = os.path.join(baseDirPath, "snntoolbox","config")
dir_name = baseDirPath
outputPath = os.path.join(baseDirPath, "model_out")

from snntoolbox.parsing.model_libs.keras_input_lib import load
from snntoolbox.bin.utils import import_target_sim, update_setup
from snntoolbox.conversion.utils import normalize_parameters

# testX = np.load("testX.npz")["arr_0"]
# testY = np.load("testY.npz")["arr_0"]
# valX = np.load("valX.npz")["arr_0"]
# valY = np.load("valY.npz")["arr_0"]

testX = np.load(os.path.join(os.path.dirname(model_path), "x_test.npz"))["arr_0"]
testY = np.load(os.path.join(os.path.dirname(model_path), "y_test.npz"))["arr_0"]
valX = np.load(os.path.join(os.path.dirname(model_path), "x_test.npz"))["arr_0"]
valY = np.load(os.path.join(os.path.dirname(model_path), "y_test.npz"))["arr_0"]

def fixpt(weights,bit_width=8):
    range_pos = (2**(bit_width-1))-1
    range_neg = -(2**(bit_width-1))

    max_pos_wt = np.max([np.max(wt) for wt in weights])
    min_pos_wt = np.min([np.min(wt[wt >=0]) for wt in weights if len(wt[wt >=0]) > 0])
    near0_neg_wt = np.max([np.max(wt[wt <0]) for wt in weights if len(wt[wt < 0]) > 0])
    far0_neg_wt = np.min([np.min(wt[wt <0]) for wt in weights if len(wt[wt < 0]) > 0])
    print("max_pos_wt={}, min_pos_wt={}, near0 neg wt={}, far0_neg_wt={}".format(max_pos_wt, min_pos_wt, near0_neg_wt, far0_neg_wt))
    scale_fac_pos = range_pos / (max_pos_wt-min_pos_wt)
    scale_fac_neg = range_neg/(far0_neg_wt - near0_neg_wt)
    for i in range(len(weights)):
        weights[i][weights[i] >=0] = scale_fac_pos * (weights[i][weights[i] >=0]-min_pos_wt)
        weights[i][weights[i] <0] = scale_fac_neg * (weights[i][weights[i] <0]-near0_neg_wt)
        weights[i] = np.floor(weights[i])
        # weights[i][weights[i] >=0] = np.floor(weights[i][weights[i] >=0])
        # weights[i][weights[i] <0] = np.ceil(weights[i][weights[i] <0])

    return weights

    

model_lib = import_module("snntoolbox.parsing.model_libs.keras_input_lib")
input_model = model_lib.load(os.path.dirname(model_path), os.path.basename(model_path))

acc = model_lib.evaluate(input_model['val_fn'], batch_size=1,num_to_test=20, x_test=testX[:20],y_test=testY[:20])

config = update_setup(config_path)
config.set("paths", "path_wd", os.path.dirname(model_path))
config.set("paths", "dataset_path", os.path.dirname(model_path))
config.set("paths", "filename_ann", os.path.basename(model_path))
model_parser = model_lib.ModelParser(input_model['model'],config)
model_parser.parse()
parsed_model = model_parser.build_parsed_model()

# Normalize
norm_data = {'x_norm':testX}
normalize_parameters(parsed_model, config,**norm_data)

score_norm = model_parser.evaluate(batch_size=1,num_to_test=20,x_test=testX[:20],y_test=testY[:20])

print("score norm = {}".format(score_norm))
parsed_model.save(os.path.join(dir_name, "parsed_model.h5"))
# convert

target_sim = import_module('snntoolbox.simulation.target_simulators.brian2_target_sim')
spiking_model = target_sim.SNN(config)
spiking_model.build(parsed_model)
spiking_model.save(dir_name, "spike_snn")

# simulate
test_set = {"x_test":testX[:20],"y_test":testY[:20]}
accu = spiking_model.run(**test_set)

spiking_model.end_sim()
print("accu={}".format(accu))

print("layers count={}, layers={}".format(len(spiking_model.layers), spiking_model.layers))
print("connections len={}, conns={}".format(len(spiking_model.connections), spiking_model.connections))
print("spike monitor len={}, monitors={}".format(len(spiking_model.spikemonitors), spiking_model.spikemonitors))

for i in range(len(spiking_model.connections)):
    print("connections weights={},{}".format(spiking_model.connections[i].i,\
        spiking_model.connections[i].j))


br2_neurons = []
for i in range(len(spiking_model.layers)):
    num_neuron = spiking_model.layers[i].N
    model_eqs = spiking_model.layers[i].equations
    print("build layer={}, num neurons={}, model eqs={}".format(i, num_neuron, model_eqs))
    br2_neurons.append(brian2.NeuronGroup(num_neuron, model_eqs, method="euler",threshold="v >= v_thresh", reset="v = v - v_thresh",dt=0.1*brian2.ms))

br2_synapses=[]
all_wts=[]
for i in range(len(spiking_model.connections)):
    br2_synapses.append(brian2.Synapses(br2_neurons[i],br2_neurons[i+1],model="w:1",\
        on_pre="v+=w",dt=0.1*brian2.ms))
    br2_synapses[-1].connect(i=np.array(spiking_model.connections[i].i,dtype="int32"),\
        j=np.array(spiking_model.connections[i].j, dtype="int32"))

    all_wts.append(np.array(spiking_model.connections[i].w, dtype="float32"))
    br2_synapses[-1].w = np.array(spiking_model.connections[i].w, dtype="float32")
    print("build synapse={},i={},j={},w{}".format(i,np.array(spiking_model.connections[i].i,dtype="int32"),\
        np.array(spiking_model.connections[i].j, dtype="int32"),\
            np.array(spiking_model.connections[i].w, dtype="float32")))
    print("----max weight={}, min weight={}".format(np.max(np.array(spiking_model.connections[i].w)),\
        np.min(np.array(spiking_model.connections[i].w))))

all_wts = fixpt(all_wts)
for i in range(len(br2_synapses)):
    br2_synapses[i].w = all_wts[i]
    print("wweights={}".format(all_wts[i]))
    
br2_monitor = brian2.SpikeMonitor(br2_neurons[-1])
br2_state_mon = brian2.StateMonitor(br2_neurons[-1], 'v', record=0)
br2_net = brian2.Network(br2_neurons, br2_synapses, br2_monitor, br2_state_mon)
br2_net.store()

br2_net.store(filename=os.path.join(baseDirPath, "snn_brian2.model"))

# all_accus=[]
# v_th_range=list(range(1,33))
# for v_th in v_th_range:
#     acc = 0
#     for i in range(20):
#         sample = testX[i].flatten()/brian2.ms
#         br2_neurons[0].bias = sample
#         br2_net.run(100*brian2.ms,namespace={'v_thresh': v_th})
#         output_spike = br2_monitor.spike_trains()
#         print("Processing sample #{}".format(i))
#         counts=[len(list(x)) for x in output_spike.values()]
#         print("counts={}, one hot labels={}".format(counts,testY[i]))
#         if np.argmax(counts) == np.argmax(testY[i]):
#             acc +=1
#         br2_net.restore()

#     print("searching={}".format(acc/20))
#     all_accus.append([v_th, acc/20])

# print(all_accus)

# best_vthresh = all_accus[np.argmax([e[1] for e in all_accus])][0]
# print("choose best vthreshold={}".format(best_vthresh))

best_vthresh = 17

acc = 0
for i in range(20):
    br2_net.restore()
    sample = valX[i].flatten()/brian2.ms
    br2_neurons[0].bias = sample
    br2_net.run(100*brian2.ms,namespace={'v_thresh': best_vthresh})
    output_spike = br2_monitor.spike_trains()
    print("Processing sample #{}".format(i))
    counts=[len(list(x)) for x in output_spike.values()]
    print("counts={}, one hot labels={}".format(counts,valY[i]))
    if np.argmax(counts) == np.argmax(valY[i]):
        acc +=1

print("Accuracy={}".format(acc/20))

# save snn model as the DarwinLang format
snn_model_darlang = {
    "projectName":"snn_digit",
    "version":"0.0.1",
    "target":"darwin2",
    "netDepth":len(spiking_model.layers),
    "delayType":[0,0],
    "leakSign":-1,
    "neuronGroups":[
        {
            "layerName":"input",
            "neuronSize":spiking_model.layers[0].N
        }
    ],
    "connectConfig":[]
}

# add neuron groups to darlang
for i in range(1, len(spiking_model.layers)-1):
    snn_model_darlang["neuronGroups"].append({
        "layerName":"layer_"+str(i),
        "neuronSize":spiking_model.layers[i].N,
        "neuronType":"IF",
        "leakMode":0,
        "leakValue":0,
        "resetMode":1,
        "vThreshold":best_vthresh
    })

snn_model_darlang["neuronGroups"].append({
    "layerName":"out",
    "neuronSize":spiking_model.layers[-1].N,
    "neuronType":"IF",
    "leakMode":0,
    "leakValue":0,
    "resetMode":1,
    "vThreshold":best_vthresh
})
# add connection config
for i in range(len(br2_synapses)):
    snn_model_darlang["connectConfig"].append({
        "name":snn_model_darlang["neuronGroups"][i]["layerName"],
        "src":snn_model_darlang["neuronGroups"][i]["layerName"],
        "dst":snn_model_darlang["neuronGroups"][i+1]["layerName"],
        "synapses":"{}_to_{}".format(snn_model_darlang["neuronGroups"][i]["layerName"], \
                                    snn_model_darlang["neuronGroups"][i+1]["layerName"])
    })


with open(os.path.join(outputPath, "snn_digit_darlang.json"),"w+") as f:
    f.write(json.dumps(snn_model_darlang))

# save weights files, each synapses a file, [(src index, dest index, weight, delay),...]
print("save weights file, total {} synapses".format(len(br2_synapses)))
for i in range(len(br2_synapses)):
    info = list(zip(br2_synapses[i].i, br2_synapses[i].j, br2_synapses[i].w, [0.1]*len(br2_synapses[i].w)))
    info = np.array(info)
    # np.save("{}.txt".format(snn_model_darlang["connectConfig"][i]["synapses"]), info)
    # with open(os.path.join(outputPath, "{}.txt".format(snn_model_darlang["connectConfig"][i]["synapses"])), "w+") as f:
    #     # f.write(json.dumps(info.tolist()))
    #     pickle.dump(json.dumps(info.tolist()), f)
    with open(os.path.join(outputPath, "{}.pickle".format(snn_model_darlang["connectConfig"][i]["synapses"])), "wb") as f:
        pickle.dump(info.tolist(), f)


# save neuronsgroup info list, each item  (neuron count, neuron v_thresh, min_weight, max_weight)
neurons_info=[]
for i in range(len(br2_neurons)):
    print("neuron count={}, method={}, events={}, vthresh={} ".format(br2_neurons[i].N,br2_neurons[i].method_choice, br2_neurons[i].events,best_vthresh))
    neurons_info.append({"idx":i,"neuron_count":br2_neurons[i].N, "method":br2_neurons[i].method_choice, "vthresh":best_vthresh})

# for display weights distributes 
wt_labels = set()
for i in range(len(br2_synapses)):
    wts = np.array(br2_synapses[i].w).flatten().tolist()
    wts = [int(x) for x in wts]
    wt_labels |= set(wts)

wt_counts=[0]*len(wt_labels)
wt_labels = list(sorted(wt_labels))
for i in range(len(br2_synapses)):
    wts = np.array(br2_synapses[i].w).flatten().tolist()
    for w in wts:
        wt_counts[wt_labels.index(w)] +=1

wt_labels = [str(x) for x in wt_labels]
layer_weights = {"wt_label": wt_labels, "wt_count": wt_counts}


# Last layer spike counts info
print("spike_monitor vals={}".format([list(e/brian2.ms) for e in br2_monitor.spike_trains().values()]))
last_layer_spikes =[list(e/brian2.ms) for e in br2_monitor.spike_trains().values()]
spike_tuples=[]
for cls in range(len(last_layer_spikes)):
    for i in range(len(last_layer_spikes[cls])):
        spike_tuples.append([cls, int(last_layer_spikes[cls][i])])

output_spike_info ={"cls_names":[str(x) for x in range(len(last_layer_spikes))], "spike_tuples":spike_tuples}

# last layer state v info
layer_conn_info = []
for i in range(len(br2_synapses)):
    prev_layer_neuron_count = br2_neurons[i].N
    current_layer_neuron_count = br2_neurons[i+1].N
    connect_ratio = np.prod(np.shape(br2_synapses[i].w)) / (prev_layer_neuron_count*current_layer_neuron_count)
    curr_layer_avg_conn = len(list(br2_synapses[i].j))/len(set(list(br2_synapses[i].j)))
    print(" layer {} ratio ={}, avg neuron connect count={}".format(i, connect_ratio, curr_layer_avg_conn))
    layer_conn_info.append({"idx":i, "ratio": connect_ratio, "avg_conn":curr_layer_avg_conn})

brian2_snn_info = {
    "neurons_info":neurons_info,
    "layers_weights":layer_weights,
    "spikes":output_spike_info,
    "layer_conns": layer_conn_info
}

with open(os.path.join(baseDirPath, "brian2_snn_info.json"), "w+") as f:
    f.write(json.dumps(brian2_snn_info))

# move to ../inner_scripts directory
shutil.move(os.path.join(baseDirPath, "brian2_snn_info.json"), os.path.join(baseDirPath, "..", "inner_scripts","brian2_snn_info.json"))

# TODO add darwinlang
