import os
import sys

from dparser import parse
from codegen import create_config
import codegen.info as info

def run_darlang(target_path, output_path):
    # 获取路径
    info.OUTPUT_PATH = output_path
    path = target_path
    if not os.path.isabs(path):
        path = os.path.join(os.getcwd(), path)

    # 打开文件
    with open(path, encoding='utf-8') as f:
        program = f.read()

    # 解析
    snn = parse(program)

    # 生成二进制
    create_config(path, snn, output_path)
