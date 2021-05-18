# -*- coding:utf-8 -*-
import json
import pickle
from os import path
import os


def pack_files(input_files: list, target_save_name):
    all_content = []
    for file in input_files:
        with open(file, "rb") as f:
            content = f.read()

        all_content.append({
            "fname": os.path.basename(file),
            "content": content
        })

    with open(target_save_name, "wb") as f:
        pickle.dump(all_content, f)


def unpack_files(src_file: str, target_save_dir: str):
    if not path.exists(target_save_dir):
        os.mkdir(target_save_dir)
    with open(src_file, "rb") as f:
        all_content = pickle.load(f)

    for item in all_content:
        with open(path.join(target_save_dir, item["fname"]), "wb+") as f:
            f.write(item["content"])


if __name__ == "__main__":
    # files = ["br2.pkl", "1_1config.b", "connfiles1_1",
    #          "layerWidth1_1", "nodelist1_1",
    #          "input_to_layer_1.pickle", "layer_1_to_layer_2.pickle", "layer_2_to_layer_3.pickle",
    #          "layer_3_to_layer_4.pickle", "layer_4_to_out.pickle"]
    # pack_files(files, "packed_bin_files.dat")
    unpack_files("packed_bin_files.dat", "unpack_target")
