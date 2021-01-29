# -*- coding:utf-8 -*-
# parse pickle format file and generate a temp file of the original content

import pickle
from os import path
import sys
import json

base_path = path.join(path.dirname(path.abspath(__file__)))

target_file_path = sys.argv[1]

tmp_file = path.join(base_path, path.basename(target_file_path))

with open(target_file_path, "rb") as f:
    content = pickle.load(f)

with open(tmp_file, "w+") as f:
    f.write(json.dumps(content))



