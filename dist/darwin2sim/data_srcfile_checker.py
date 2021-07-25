# -*- coding: utf-8 -*-
# Check the format of source data npz file
import numpy as np
import os
import sys

file_path = sys.argv[1]
file_type = int(sys.argv[2]) # 0 for data_x, 1 for data_y
if file_type == 0:
    assert os.path.basename(file_path).count(".") > 0 and os.path.basename(file_path).split(".")[1] == "npz", "输入数据需为 .npz 格式！"
    arr = np.load(file_path)
    assert len(arr.files) == 1 and arr.files[0] == "arr_0", "输入数据需使用numpy.savez(file_name, arr)方式保存！"
    arr = arr["arr_0"]
    # assert len(arr.shape) == 4 and arr.shape[3] == 1, "输入数据的维度需要为 (N, X, Y, 1)！"
    assert np.max(arr) <= 1 and np.min(arr) >=0, "输入数据需要是 [0, 1] 之间的浮点数！"
else:
    assert os.path.basename(file_path).count(".") > 0 and os.path.basename(file_path).split(".")[1] == "npz", "标签数据需要是 One-Hot 方式编码的numpy array, 并保存为 .npz 文件！"
    arr_y = np.load(file_path)
    assert len(arr_y.files) == 1 and arr_y.files[0] == "arr_0", "标签数据需要使用numpy.savez(file_name, arr) 方式保存！"
    arr_y = arr_y["arr_0"]
    assert np.sum(arr_y) == len(arr_y), "标签需要使用 One-Hot 方式编码！"