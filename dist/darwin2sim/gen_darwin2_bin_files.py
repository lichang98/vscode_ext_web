# -*- coding:utf-8 -*
# Generate binary files for darwin2

import sys
import os
import time
import struct
baseDirPath = os.path.dirname(os.path.abspath(__file__))

outputPath = os.path.join(baseDirPath, "model_out", "test", "darlang_out")
if len(sys.argv) > 1:
    outputPath = os.path.join(baseDirPath, "model_out", sys.argv[1], "darlang_out")
sys.path.append(os.path.join(baseDirPath, "..", "darlang"))
import darlang

darlang_json_file = os.path.join(outputPath, "snn_digit_darlang.json")
bin_files_dir = os.path.join(outputPath,"..", "bin_darwin_out")
darlang.run_darlang(darlang_json_file, bin_files_dir)

# Add timestamp to config txt file
with open(os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.txt"), "r") as f:
    content = f.read()

content = time.strftime("%Y/%m/%d/%H:%M:%S")+"\n"+content
with open(os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.txt"), "w+") as f:
    f.write(content)

def convert(file_name,save_name):
    with open(file_name, 'r') as file:
        line = file.readline()
        config_list = file.readlines()
    length = len(config_list)
    
    send_bytes = bytearray()
    for i in range(length):
        send_bytes += struct.pack('Q', int(config_list[i].strip(), 16))
    with open(save_name,"wb") as file:
        # python2
        # file.write(b"{}".format(line))
        # # python3
        file.write(bytes("{}".format(line),'ascii'))
        file.write(send_bytes)


convert(os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.txt"), os.path.join(outputPath,"..", "bin_darwin_out", "1_1config.b"))

