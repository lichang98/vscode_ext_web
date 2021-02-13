import os
os.environ["TF_CPP_MIN_LOG_LEVEL"]='3'
import sys
import numpy as np
from importlib import import_module

from numpy.core.records import record
from tensorflow.python.platform.tf_logging import flush
import darwin_ii
import tqdm
import brian2
brian2.BrianLogger.log_level_error()
from sklearn.utils import shuffle
import json
import pickle
import shutil
from PIL import Image
import time
import copy

baseDirPath = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(baseDirPath, "snntoolbox"))
# model_path = os.path.join(
#     'E:\\courses\\ZJLab\\IDE-related-docs\\darwin2sim\\target\\mnist_cnn.h5')
target_proj_name = "new"
if len(sys.argv) > 6:
    target_proj_name = sys.argv[6]

model_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "target", target_proj_name, "mnist_cnn")

config_path = os.path.join(baseDirPath, "snntoolbox","config")
dir_name = baseDirPath
outputPath = os.path.join(baseDirPath, "model_out", target_proj_name, "darlang_out")

if not os.path.exists(os.path.join(baseDirPath, "model_out", target_proj_name)):
    os.mkdir(os.path.join(baseDirPath, "model_out", target_proj_name))
if not os.path.exists(os.path.join(baseDirPath, "model_out", target_proj_name, "darlang_out")):
    os.mkdir(os.path.join(baseDirPath, "model_out", target_proj_name, "darlang_out"))

from snntoolbox.parsing.model_libs.keras_input_lib import load
from snntoolbox.bin.utils import import_target_sim, update_setup
from snntoolbox.conversion.utils import normalize_parameters
from snntoolbox.utils.utils import import_configparser

# testX = np.load("testX.npz")["arr_0"]
# testY = np.load("testY.npz")["arr_0"]
# valX = np.load("valX.npz")["arr_0"]
# valY = np.load("valY.npz")["arr_0"]

testX = np.load(os.path.join(os.path.dirname(model_path), "x_test.npz"))["arr_0"]
testY = np.load(os.path.join(os.path.dirname(model_path), "y_test.npz"))["arr_0"]
valX = np.load(os.path.join(os.path.dirname(model_path), "x_test.npz"))["arr_0"]
valY = np.load(os.path.join(os.path.dirname(model_path), "y_test.npz"))["arr_0"]

sys_param_vthresh = None
sys_param_neurondt = None
sys_param_synapsedt = None
sys_param_delay = None
sys_param_total_dura = None

if len(sys.argv) > 5:
    sys_param_vthresh = int(sys.argv[1])
    sys_param_neurondt = float(sys.argv[2])
    sys_param_synapsedt = float(sys.argv[3])
    sys_param_delay = float(sys.argv[4])
    sys_param_total_dura = int(sys.argv[5])
else:
    sys_param_vthresh = 5
    sys_param_neurondt = 1
    sys_param_synapsedt = 0.1
    sys_param_delay = 1
    sys_param_total_dura = 100

start_time = time.time()
wt_statics=[]
spike_statics=[0]*len(valY[0])

stage1_time_use=0
stage2_time_use=0
stage3_time_use=0
stage4_time_use=0


def fixpt(weights,bit_width=8):
    range_pos = (2**(bit_width-1))-1
    range_neg = -(2**(bit_width-1))

    max_pos_wt = np.max([np.max(wt) for wt in weights])
    min_pos_wt = np.min([np.min(wt[wt >=0]) for wt in weights if len(wt[wt >=0]) > 0])
    near0_neg_wt = np.max([np.max(wt[wt <0]) for wt in weights if len(wt[wt < 0]) > 0])
    far0_neg_wt = np.min([np.min(wt[wt <0]) for wt in weights if len(wt[wt < 0]) > 0])
    print("max_pos_wt={}, min_pos_wt={}, near0 neg wt={}, far0_neg_wt={}".format(max_pos_wt, min_pos_wt, near0_neg_wt, far0_neg_wt),flush=True)
    scale_fac_pos = range_pos / (max_pos_wt-min_pos_wt)
    scale_fac_neg = range_neg/(far0_neg_wt - near0_neg_wt)
    for i in range(len(weights)):
        weights[i][weights[i] >=0] = scale_fac_pos * (weights[i][weights[i] >=0]-min_pos_wt)
        weights[i][weights[i] <0] = scale_fac_neg * (weights[i][weights[i] <0]-near0_neg_wt)
        weights[i] = np.floor(weights[i])
        # weights[i][weights[i] >=0] = np.floor(weights[i][weights[i] >=0])
        # weights[i][weights[i] <0] = np.ceil(weights[i][weights[i] <0])
        wt_statics.extend(np.array(copy.deepcopy(weights[i]), dtype="int32").flatten())

    return weights

    

model_lib = import_module("snntoolbox.parsing.model_libs.keras_input_lib")
input_model = model_lib.load(os.path.dirname(model_path), os.path.basename(model_path))

acc = model_lib.evaluate(input_model['val_fn'], batch_size=1,num_to_test=50, x_test=testX[:50],y_test=testY[:50])

# set path
with open(os.path.join(os.path.dirname(__file__), "snntoolbox", "config"), "r") as f:
    config_file_content = f.read()

config_file_content = [e for e in config_file_content.split('\n')]
for i in range(len(config_file_content)):
    if 'path_wd' in config_file_content[i]:
        config_file_content[i] = "path_wd = {}".format(os.path.join(os.path.dirname(__file__), "target", target_proj_name))
    if 'dataset_path' in config_file_content[i]:
        config_file_content[i] = "dataset_path = {}".format(os.path.join(os.path.dirname(__file__), "target", target_proj_name))

with open(os.path.join(os.path.dirname(__file__), "snntoolbox", "config"), "w+") as f:
    f.write('\n'.join(config_file_content))

config = update_setup(config_path)
config.set("paths", "path_wd", os.path.dirname(model_path))
config.set("paths", "dataset_path", os.path.dirname(model_path))
config.set("paths", "filename_ann", os.path.basename(model_path))
model_parser = model_lib.ModelParser(input_model['model'],config)
model_parser.parse()
parsed_model = model_parser.build_parsed_model()
print(flush=True)
# Normalize
norm_data = {'x_norm':testX}
normalize_parameters(parsed_model, config,**norm_data)

score_norm = model_parser.evaluate(batch_size=1,num_to_test=50,x_test=testX[:50],y_test=testY[:50])

parsed_model.save(os.path.join(dir_name, "parsed_model.h5"))
print(flush=True)
# convert

target_sim = import_module('snntoolbox.simulation.target_simulators.brian2_target_sim')
spiking_model = target_sim.SNN(config)
spiking_model.build(parsed_model)
spiking_model.save(dir_name, "spike_snn")

print("CONVERT_FINISH...",flush=True)
stage1_time_use = time.time()
# simulate
test_set = {"x_test":testX[:50],"y_test":testY[:50]}
accu = spiking_model.run(**test_set)

spiking_model.end_sim()
print("accu={}".format(accu),flush=True)

# print("layers count={}, layers={}".format(len(spiking_model.layers), spiking_model.layers))
# print("connections len={}, conns={}".format(len(spiking_model.connections), spiking_model.connections))
# print("spike monitor len={}, monitors={}".format(len(spiking_model.spikemonitors), spiking_model.spikemonitors))

# for i in range(len(spiking_model.connections)):
#     print("connections weights={},{}".format(spiking_model.connections[i].i,\
#         spiking_model.connections[i].j))


br2_neurons = []
for i in range(len(spiking_model.layers)):
    num_neuron = spiking_model.layers[i].N
    model_eqs = spiking_model.layers[i].equations
    print("build layer={}, num neurons={}, model eqs={}".format(i, num_neuron, model_eqs),flush=True)
    br2_neurons.append(brian2.NeuronGroup(num_neuron, model_eqs, method="euler",threshold="v >= v_thresh", reset="v = v - v_thresh",dt=sys_param_neurondt*brian2.ms))

br2_synapses=[]
all_wts=[]
for i in range(len(spiking_model.connections)):
    br2_synapses.append(brian2.Synapses(br2_neurons[i],br2_neurons[i+1],model="w:1",\
        on_pre="v+=w",dt=sys_param_synapsedt*brian2.ms))
    br2_synapses[-1].connect(i=np.array(spiking_model.connections[i].i,dtype="int32"),\
        j=np.array(spiking_model.connections[i].j, dtype="int32"))

    all_wts.append(np.array(spiking_model.connections[i].w, dtype="float32"))
    br2_synapses[-1].w = np.array(spiking_model.connections[i].w, dtype="float32")
    print("build synapse={},i={},j={},w{}".format(i,np.array(spiking_model.connections[i].i,dtype="int32"),\
        np.array(spiking_model.connections[i].j, dtype="int32"),\
            np.array(spiking_model.connections[i].w, dtype="float32")), flush=True)
    print("----max weight={}, min weight={}".format(np.max(np.array(spiking_model.connections[i].w)),\
        np.min(np.array(spiking_model.connections[i].w))), flush=True)

all_wts = fixpt(all_wts)
for i in range(len(br2_synapses)):
    br2_synapses[i].w = all_wts[i]
    print("fix point weights of synapse {} = {}".format(i,all_wts[i]), flush=True)
    
br2_monitor = brian2.SpikeMonitor(br2_neurons[-1])
br2_input_monitor = brian2.SpikeMonitor(br2_neurons[0]) # monitor for input
br2_state_mon = brian2.StateMonitor(br2_neurons[-1], 'v', record=0)
# all_layer_state_mon = [brian2.StateMonitor(br2_neurons[e], 'v', record=True) for e in range(len(br2_neurons))]
# only record state of input and output state
all_layer_state_mon = []
all_layer_state_mon.append(brian2.StateMonitor(br2_neurons[0], 'v',record=True))
all_layer_state_mon.append(brian2.StateMonitor(br2_neurons[-1], 'v', record=True))
all_layer_spike_mon = [brian2.SpikeMonitor(br2_neurons[e]) for e in range(len(br2_neurons))]
br2_net = brian2.Network(br2_neurons, br2_synapses, br2_monitor, br2_input_monitor,br2_state_mon)
for i in range(len(all_layer_state_mon)):
    br2_net.add(all_layer_state_mon[i])
for i in range(len(all_layer_spike_mon)):
    br2_net.add(all_layer_spike_mon[i])
br2_net.store()


print("PREPROCESS_FINISH...",flush=True)
stage2_time_use = time.time()
# all_accus=[]
# v_th_range=list(range(1,24,1))
# for v_th in v_th_range:
#     acc = 0
#     for i in range(50):
#         sample = testX[i].flatten()/brian2.ms
#         br2_neurons[0].bias = sample
#         br2_net.run(100*brian2.ms,namespace={'v_thresh': v_th},report=None)
#         output_spike = br2_monitor.spike_trains()
#         print("Processing sample #{}".format(i))
#         counts=[len(list(x)) for x in output_spike.values()]
#         print("counts={}, one hot labels={}".format(counts,testY[i]))
#         if np.argmax(counts) == np.argmax(testY[i]):
#             acc +=1
#         br2_net.restore()

#     print("searching v_thres={}, {}".format(v_th, acc/50))
#     all_accus.append([v_th, acc/50])

# print(all_accus)

# best_vthresh = all_accus[np.argmax([e[1] for e in all_accus])][0]
# print("choose best vthreshold={}".format(best_vthresh))

# best_vthresh = 16
best_vthresh = sys_param_vthresh

br2_model = {
    "neurons":[e.N for e in br2_neurons],
    "synapses_i":[list(e.i) for e in br2_synapses],
    "synapses_j":[list(e.j) for e in br2_synapses],
    "synapses_w":[list(e.w) for e in br2_synapses],
    "v_thresh": best_vthresh,
    "run_dura": sys_param_total_dura
}
if not os.path.exists(os.path.join(baseDirPath, "model_out","br2_models")):
    os.mkdir(os.path.join(baseDirPath, "model_out","br2_models"))
if not os.path.exists(os.path.join(baseDirPath, "model_out","br2_models", target_proj_name)):
    os.mkdir(os.path.join(baseDirPath, "model_out","br2_models", target_proj_name))

with open(os.path.join(baseDirPath, "model_out","br2_models", target_proj_name, "br2.pkl"), "wb+") as f:
    pickle.dump(br2_model, f)

snn_test_img_uris = []
snn_test_output_spikes = []
snn_test_input_spikes = []
last_layer_spikes= []
first_layer_spikes=[]
acc = 0
if not os.path.exists(os.path.join(baseDirPath, "model_out",target_proj_name)):
    os.mkdir(os.path.join(baseDirPath, "model_out",target_proj_name))
if not os.path.exists(os.path.join(baseDirPath, "model_out",target_proj_name, "bin_darwin_out")):
    os.mkdir(os.path.join(baseDirPath, "model_out",target_proj_name, "bin_darwin_out"))
if not os.path.exists(os.path.join(baseDirPath, "model_out",target_proj_name, "bin_darwin_out", "inputs")):
    os.mkdir(os.path.join(baseDirPath, "model_out",target_proj_name, "bin_darwin_out", "inputs"))

for i in range(50):
    br2_net.restore()
    sample = valX[i].flatten()/brian2.ms
    br2_neurons[0].bias = sample
    br2_net.run(sys_param_total_dura*brian2.ms,namespace={'v_thresh': best_vthresh},report=None)
    input_spike = br2_input_monitor.spike_trains()
    output_spike = br2_monitor.spike_trains()
    input_spike_arrs=[]
    for k,v in input_spike.items():
        input_spike_arrs.append([k,np.array(v/brian2.ms, dtype="int32").tolist()])
    # save input and corresponding img
    with open(os.path.join(baseDirPath, "model_out",target_proj_name, "bin_darwin_out", "inputs", "input_{}.pickle".format(i)), "wb+") as f:
        pickle.dump(input_spike_arrs, f)
        # f.write(json.dumps(input_spike_arrs))
    img = np.array(np.squeeze(valX[i])*255, dtype="uint8")
    Image.fromarray(img).save(os.path.join(baseDirPath, "model_out", target_proj_name, "bin_darwin_out", "inputs", "img_idx_{}_label_{}.png"
                                .format(i, np.argmax(valY[i]))))
    snn_test_img_uris.append("http://localhost:6003/snn_imgs/img_idx_{}_label_{}.png".format(i,np.argmax(valY[i])))
    last_layer_spikes = [list(e/brian2.ms) for e in br2_monitor.spike_trains().values()]
    first_layer_spikes = [list(e/brian2.ms) for e in br2_input_monitor.spike_trains().values()]
    for idx_, spk_lst_ in enumerate(last_layer_spikes):
        spike_statics[idx_] += len(spk_lst_)
    spike_tuples = []
    for cls in range(len(last_layer_spikes)):
        for j in range(len(last_layer_spikes[cls])):
            spike_tuples.append([cls, int(last_layer_spikes[cls][j])])

    input_spike_tuples =  []
    for cls in range(len(first_layer_spikes)):
        for j in range(len(first_layer_spikes[cls])):
            input_spike_tuples.append([cls, int(first_layer_spikes[cls][j])])
    
    snn_test_output_spikes.append({
        "cls_names":[str(x) for x in range(len(last_layer_spikes))],
        "spike_tuples": spike_tuples
    })

    snn_test_input_spikes.append({
        "cls_names": [str(x) for x in range(len(first_layer_spikes))],
        "spike_tuples": input_spike_tuples
    })

    counts=[len(list(x)) for x in output_spike.values()]
    print("Processing sample #{}, output spike counts={}, real one hot labels={}".format(i,counts,valY[i]), flush=True)
    if np.argmax(counts) == np.argmax(valY[i]):
        acc +=1

print("Accuracy={}".format(acc/50))
print("SEARCH_FINISH...",flush=True)
stage3_time_use = time.time()

# get state monitor of layers
record_layer_v_vals=[]
record_layer_v_tms=[]
min_spike_input_idx = np.argmin([len(e) for e in first_layer_spikes])
max_spike_input_idx = np.argmax([len(e) for e in first_layer_spikes])

record_layer_v_tms.append(list(all_layer_state_mon[0].t/brian2.ms))
record_layer_v_vals.append(list(all_layer_state_mon[0].v[min_spike_input_idx]))
record_layer_v_vals.append(list(all_layer_state_mon[0].v[max_spike_input_idx]))

min_spike_output_idx = np.argmin([len(e) for e in last_layer_spikes])
max_spike_output_idx = np.argmax([len(e) for e in last_layer_spikes])

record_layer_v_tms.append(list(all_layer_state_mon[-1].t/brian2.ms))
record_layer_v_vals.append(list(all_layer_state_mon[-1].v[min_spike_output_idx]))
record_layer_v_vals.append(list(all_layer_state_mon[-1].v[max_spike_output_idx]))


# calc avg and std of spike out for each layer
record_layers_spike_avg=[]
record_layers_spike_std=[]
for i in range(len(all_layer_spike_mon)):
    counts = [len(e) for e in all_layer_spike_mon[i].spike_trains().values()]
    record_layers_spike_avg.append("{:.3f}".format(np.mean(counts)))
    record_layers_spike_std.append("{:.3f}".format(np.std(counts)))


# calc avg and std of weights for each layer
record_layers_wt_avg = []
record_layers_wt_std = []
for i in range(len(br2_synapses)):
    record_layers_wt_avg.append("{:.3f}".format(np.mean(br2_synapses[i].w)))
    record_layers_wt_std.append("{:.3f}".format(np.std(br2_synapses[i].w)))

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
        "synapses":"{}_to_{}.pickle".format(snn_model_darlang["neuronGroups"][i]["layerName"], \
                                    snn_model_darlang["neuronGroups"][i+1]["layerName"])
    })


with open(os.path.join(outputPath, "snn_digit_darlang.json"),"w+") as f:
    f.write(json.dumps(snn_model_darlang))

# save weights files, each synapses a file, [(src index, dest index, weight, delay),...]
print("save weights file, total {} synapses".format(len(br2_synapses)),flush=True)
for i in range(len(br2_synapses)):
    info = list(zip(br2_synapses[i].i, br2_synapses[i].j, br2_synapses[i].w, [1]*len(br2_synapses[i].w)))
    info = np.array(info)
    # np.save("{}.txt".format(snn_model_darlang["connectConfig"][i]["synapses"]), info)
    # with open(os.path.join(outputPath, "{}.txt".format(snn_model_darlang["connectConfig"][i]["synapses"])), "w+") as f:
    #     # f.write(json.dumps(info.tolist()))
    #     pickle.dump(json.dumps(info.tolist()), f)
    with open(os.path.join(outputPath, "{}".format(snn_model_darlang["connectConfig"][i]["synapses"])), "wb") as f:
        pickle.dump(info.tolist(), f)


# save neuronsgroup info list, each item  (neuron count, neuron v_thresh, min_weight, max_weight)
neurons_info=[]
for i in range(len(br2_neurons)):
    print("neuron count={}, method={}, events={}, vthresh={} ".format(br2_neurons[i].N,br2_neurons[i].method_choice, br2_neurons[i].events,best_vthresh),flush=True)
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
# print("spike_monitor vals={}".format([list(e/brian2.ms) for e in br2_monitor.spike_trains().values()]))
# last_layer_spikes =[list(e/brian2.ms) for e in br2_monitor.spike_trains().values()]
# spike_tuples=[]
# for cls in range(len(last_layer_spikes)):
#     for i in range(len(last_layer_spikes[cls])):
#         spike_tuples.append([cls, int(last_layer_spikes[cls][i])])

# output_spike_info ={"cls_names":[str(x) for x in range(len(last_layer_spikes))], "spike_tuples":spike_tuples}

# last layer state v info
layer_conn_info = []
for i in range(len(br2_synapses)):
    prev_layer_neuron_count = br2_neurons[i].N
    current_layer_neuron_count = br2_neurons[i+1].N
    connect_ratio = np.prod(np.shape(br2_synapses[i].w)) / (prev_layer_neuron_count*current_layer_neuron_count)
    curr_layer_avg_conn = len(list(br2_synapses[i].j))/len(set(list(br2_synapses[i].j)))
    print("layer {} connect ratio ={}, avg neuron connect count={}".format(i, connect_ratio, curr_layer_avg_conn), flush=True)
    layer_conn_info.append({"idx":i, "ratio": ["{:.3f}".format(connect_ratio)], "avg_conn":["{:.3f}".format(curr_layer_avg_conn)]})


brian2_snn_info = {
    "neurons_info":neurons_info,
    "layers_weights":layer_weights,
    # "spikes":output_spike_info,
    "spikes":{
        "snn_test_imgs": snn_test_img_uris,
        "snn_test_spikes": snn_test_output_spikes,
        "snn_input_spikes": snn_test_input_spikes
    },
    "layer_conns": layer_conn_info,
    "extra_simu_info":{
        "simulate_vthresh": best_vthresh,
        "simulate_neuron_dt": sys_param_neurondt,
        "simulate_synapse_dt": sys_param_synapsedt,
        "simulate_delay": sys_param_delay,
        "simulate_dura": sys_param_total_dura,
        "simulate_acc": "{:.2%}".format(acc/50)
    },
    "record_layer_v":{
        "tms": record_layer_v_tms,
        "vals": record_layer_v_vals
    },
    "record_spike_out_info":{
        "spike_count_avgs":record_layers_spike_avg,
        "spike_count_stds":record_layers_spike_std
    },
    "record_layers_wt_info":{
        "record_wts_avg":record_layers_wt_avg,
        "record_wts_std":record_layers_wt_std
    }
}

with open(os.path.join(baseDirPath, "brian2_snn_info.json"), "w+") as f:
    f.write(json.dumps(brian2_snn_info))

stage4_time_use = time.time()
# move to ../inner_scripts directory
shutil.move(os.path.join(baseDirPath, "brian2_snn_info.json"), os.path.join(baseDirPath, "..", "inner_scripts","brian2_snn_info.json"))

print("running darwinlang", flush=True)
sys.path.append(os.path.join(baseDirPath, "..", "darlang"))
import darlang
darlang.run_darlang(os.path.join(outputPath, "snn_digit_darlang.json"),os.path.join(outputPath,"..", "bin_darwin_out"))
print("darwinlang conversion finished.", flush=True)

stage4_time_use = "{:.3f}".format(stage4_time_use - stage3_time_use)
stage3_time_use = "{:.3f}".format(stage3_time_use - stage2_time_use)
stage2_time_use = "{:.3f}".format(stage2_time_use - stage1_time_use)
stage1_time_use = "{:.3f}".format(stage1_time_use - start_time)

end_time = time.time()
total_use_time = "{:.3f} 秒".format(end_time-start_time)
wt_mean = np.mean(wt_statics)
wt_std = np.std(wt_statics)
spk_mean = np.mean(spike_statics)/50
spk_std = np.std(spike_statics)

convert_info = {
    "total_use_time": total_use_time,
    "wt_mean": "{:.3f}".format(float(wt_mean)),
    "wt_std": "{:.3f}".format(float(wt_std)),
    "spk_mean": "{:.3f}".format(float(spk_mean)),
    "spk_std": "{:.3f}".format(float(spk_std)),
    "stage1_time_use":stage1_time_use,
    "stage2_time_use":stage2_time_use,
    "stage3_time_use":stage3_time_use,
    "stage4_time_use":stage4_time_use
}

with open(os.path.join(baseDirPath, "..", "inner_scripts", "convert_statistic_info.json"), "w+") as f:
    f.write(json.dumps(convert_info))

# Add timestamp to config txt file
with open(os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.txt"), "r") as f:
    content = f.read()

content = time.strftime("%Y/%m/%d/%H:%M:%S")+"\n"+content
with open(os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.txt"), "w+") as f:
    f.write(content)
