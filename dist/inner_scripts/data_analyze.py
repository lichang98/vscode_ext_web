# -*- coding:utf-8 -*-
"""
This is for data analyze
Generate file with json format content provided for html to display
"""
import json
import numpy as np
import sys
from os import path
from PIL import Image
import shutil

x_norm_file = sys.argv[1]
x_test_file = sys.argv[2]
y_test_file = sys.argv[3]

x_norm = np.load(x_norm_file)["arr_0"]
x_test = np.load(x_test_file)["arr_0"]
y_test = np.load(y_test_file)["arr_0"]

norm_data_count = len(x_norm)
test_data_count = len(x_test)
total_data_count = norm_data_count + test_data_count

num_classes = len(y_test[0])
cls_counts = [0]*num_classes
for i in range(len(y_test)):
    cls = np.argmax(y_test[i])
    cls_counts[cls] += 1



class_labels = set([np.argmax(e) for e in y_test])
# sample_img_arr = np.array(np.squeeze(x_test[1])*255.0,dtype="uint8")
# print("sample_img shape={}".format(np.shape(sample_img_arr)))
# sample_img = Image.fromarray(sample_img_arr)
# sample_img.save(path.join(path.abspath(path.dirname(__file__)), "sample.png"))
hist_gram_splits = np.array(np.linspace(0,255,num=len(class_labels)+1), dtype="int32")
# hist_gram_bins = np.zeros(len(hist_gram_splits),dtype="int32")

# for val in sample_img_arr.flatten():
#     for i in range(1, len(hist_gram_splits)):
#         if val <= hist_gram_splits[i] and val >= hist_gram_splits[i-1]:
#             hist_gram_bins[i-1] += 1

def get_hist_grem_bins(img_arr, hist_gram_splits):
    img = img_arr.flatten()
    hist_gram_bins = np.zeros(len(hist_gram_splits), dtype="int32")
    for val in img:
        for i in range(1, len(hist_gram_splits)):
            if val <= hist_gram_splits[i] and val >= hist_gram_splits[i-1]:
                hist_gram_bins[i-1] +=1
    return hist_gram_bins

hist_bin_names=[]
for i in range(len(hist_gram_splits)-1):
    hist_bin_names.append("{}-{}".format(hist_gram_splits[i],hist_gram_splits[i+1]))
data_info={}
data_info.update({"total_data_count":total_data_count})
data_info.update({"norm_data_count":norm_data_count})
data_info.update({"test_data_count":test_data_count})
data_info.update({"num_classes":num_classes})
data_info.update({"cls_counts":cls_counts})
data_info.update({"hist_bin_names":hist_bin_names})
data_info.update({"sample_imgs":[]})
data_info.update({"test_sample_imgs":[]})

idx=0
sample_idx=0
while len(class_labels) > 0:
    label = np.argmax(y_test[idx])
    print("test labe={}".format(label), end=" ")
    if label in class_labels:
        print("is in class_labels:{}, idx={}".format("y", idx))
        hist_gram_bins = np.zeros(len(hist_gram_splits), dtype="int32")
        sample_img = np.array(np.squeeze(x_test[idx])*255.0, dtype="uint8")
        hist_gram_bin_sample = get_hist_grem_bins(sample_img, hist_gram_splits)
        sample_img = Image.fromarray(sample_img)
        sample_img.save(path.join(path.abspath(path.dirname(__file__)), "sample"+str(sample_idx)+".png"))
        # move to directory under resources
        shutil.move(path.join(path.abspath(path.dirname(__file__)), "sample"+str(sample_idx)+".png"),
                    path.join(path.abspath(path.dirname(__file__)),"..","..","src","resources","script_res", "sample"+str(sample_idx)+".png"))
        data_info["sample_imgs"].append({"sample_img_path": path.join(path.abspath(path.dirname(__file__)),"..","..","src","resources","script_res", "sample"+str(sample_idx)+".png"),
                                        "hist_gram_bins":hist_gram_bin_sample.tolist()})
        class_labels.remove(label)
        sample_idx += 1
    
    idx += 1

class_labels = set([np.argmax(e) for e in y_test])
idx=0
sample_idx=0
while len(class_labels) > 0:
    label = np.argmax(y_test[idx])
    print("test labe={}".format(label), end=" ")
    if label in class_labels:
        print("is in class_labels:{}, idx={}".format("y", idx))
        hist_gram_bins = np.zeros(len(hist_gram_splits), dtype="int32")
        sample_img = np.array(np.squeeze(x_norm[idx])*255.0, dtype="uint8")
        hist_gram_bin_sample = get_hist_grem_bins(sample_img, hist_gram_splits)
        sample_img = Image.fromarray(sample_img)
        sample_img.save(path.join(path.abspath(path.dirname(__file__)), "test_sample"+str(sample_idx)+".png"))
        # move to directory under resources
        shutil.move(path.join(path.abspath(path.dirname(__file__)), "test_sample"+str(sample_idx)+".png"),
                    path.join(path.abspath(path.dirname(__file__)),"..","..","src","resources","script_res", "test_sample"+str(sample_idx)+".png"))
        data_info["test_sample_imgs"].append({"test_sample_img_path": path.join(path.abspath(path.dirname(__file__)),"..","..","src","resources","script_res", "test_sample"+str(sample_idx)+".png"),
                                        "hist_gram_bins":hist_gram_bin_sample.tolist()})
        class_labels.remove(label)
        sample_idx += 1
    
    idx += 1

with open(path.join(path.abspath(path.dirname(__file__)), "data_info.json"),"w+",encoding="utf-8") as f:
    json.dump(data_info, f)


# save data
# data_info = {"total_data_count":total_data_count, "norm_data_count":norm_data_count, "test_data_count":test_data_count, \
#     "num_classes":num_classes, 'cls_counts':cls_counts, "hist_bin_names":hist_bin_names,"hist_grams":hist_gram_bins.tolist()}

# with open(path.join(path.abspath(path.dirname(__file__)), "data_info.json"),"w+",encoding="utf-8") as f:
#     json.dump(data_info, f)
