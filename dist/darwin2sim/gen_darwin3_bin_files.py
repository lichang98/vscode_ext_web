# -*- encoding: utf-8 -*-
import sys
import pickle
import numpy as np
import os
from os import path
import subprocess
import shutil
import pack_bin_files

baseDirPath = os.path.dirname(os.path.abspath(__file__))
snn_model_path = os.path.join(baseDirPath, "model_out", "test", "darlang_out")
darwin3_compiler = os.path.join(baseDirPath, "..", "inner_scripts", "darwin3_compiler", "run_dwnc32.exe")

vth = 1
# argv 1: project name
if len(sys.argv) > 1:
    snn_model_path = os.path.join(baseDirPath, "model_out", sys.argv[1], "darlang_out")

if len(sys.argv) > 2:
    vth = int(sys.argv[2])

def load_pickle_weight(wt_file):
    with open(wt_file, "rb") as f:
        content = pickle.load(f)

    content = np.array(content, dtype=np.int64)
    i,j,w = content[:, 0], content[:, 1], content[:, 2]
    return i,j,w


connections = {}
last_idx = 0
for conn_file in os.listdir(snn_model_path):
    if "out" in conn_file:
        last_idx = int(conn_file.split(".")[0].split("_")[1])

i,j,w = load_pickle_weight(path.join(snn_model_path, "input_to_layer_1.pickle"))
connections[(0, 1)] = np.array([i + (0 << 14), j + (1 << 14), w], dtype=np.int64).T
for idx in range(1, last_idx):
    i,j,w = load_pickle_weight(path.join(snn_model_path, "layer_{}_to_layer_{}.pickle".format(idx, idx + 1)))
    connections[(idx, idx + 1)] = np.array([i + (idx << 14), j + ((idx + 1) << 14), w], dtype=np.int64).T

i,j,w = load_pickle_weight(path.join(snn_model_path, "layer_{}_to_out.pickle".format(last_idx)))
connections[(last_idx, last_idx + 1)] = np.array([i + (last_idx << 14), j + ((last_idx + 1) << 14), w], dtype=np.int64).T

connections[(last_idx + 1, "output")] = []
out_dim = int(np.max(j)) + 1

for x in range(out_dim):
    connections[(last_idx + 1, "output")].append([x + ((last_idx + 1) << 14), -x - ((last_idx + 1) << 14), 0])

connections[(last_idx + 1, "output")] = np.array(connections[(last_idx + 1, "output")], dtype=np.int64)

if path.exists(path.join(snn_model_path, "..", "bin_darwin3")):
    shutil.rmtree(path.join(snn_model_path, "..", "bin_darwin3"))

os.mkdir(path.join(snn_model_path, "..", "bin_darwin3"))

with open(path.join(snn_model_path, "..", "bin_darwin3", "connections.data"), "wb") as f:
    pickle.dump(connections, f)

cmdStr = [darwin3_compiler, "-connections", path.join(snn_model_path, "..", "bin_darwin3", "connections.data"),
            "-vth", str(vth), "-rsm", "1", "-skip_compile", "-skip_run"]

popen = subprocess.Popen(cmdStr, stdout=subprocess.PIPE, cwd=path.join(snn_model_path, "..", "bin_darwin3"))
popen.wait()
compiler_output = popen.stdout.read()
if len(os.listdir(path.join(snn_model_path, "..", "bin_darwin3"))) > 1:
    print(compiler_output, file=sys.stdout)
else:
    exit(1)

# shutil.make_archive(path.join(snn_model_path, "..", "darwin3_"+sys.argv[1]), "zip", path.join(snn_model_path, "..", "bin_darwin3"))
target_files = list(os.listdir(path.join(snn_model_path, "..", "bin_darwin3")))
target_files = [path.join(snn_model_path, "..", "bin_darwin3", e) for e in target_files]
preprocess_files = list(os.listdir(path.join(snn_model_path, "..", "preprocess")))
preprocess_files = [path.join(snn_model_path, "..", "preprocess", e) for e in preprocess_files]
target_files.extend(preprocess_files)
pack_bin_files.pack_files(target_files, path.join(snn_model_path, "..", "packed_bin_files.dat"))

