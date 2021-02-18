import json
import pickle
import math
import os
import sys

file_path =''
dir_path =''
color_dict = {
    "PINK": "#FF9999",
    "blue": "#99CCFF",
    "PURPLE": "#CC99CC",
    "YELLOW": "#FFFF99",
    "GREEN": "#99FF99",
    "RED": "#FFCCFF",
    "orange": "#FFCC99",
    "yellow": "#00FFFF",
}
color_list = list(color_dict.keys())

def get_index(node_json):
    layer, index = node_json["name"].split(":")
    return int(index)

def get_network(file):
    f = open(file, 'r')
    network = json.load(f)
    f.close()
    projectName = network['projectName']
    neurongroup = network['neuronGroups']
    netdepth = network['netDepth']
    connectconfig = network['connectConfig']

    neuronlist_id = {}  # 神经元组 名字 到 id 对照的字典
    max_neuron = 0
    for id in range(netdepth):
        layerName = neurongroup[id]['layerName']
        neuronlist_id[layerName] = id
        neurongroup[id]['out'] = []  # 该层神经元指向的神经元层
        neurongroup[id]['in'] = 0 #指向该层的神经元数
        if neurongroup[id]['neuronSize'] > max_neuron:
            max_neuron = neurongroup[id]['neuronSize']

    for connect in connectconfig:
        neurongroup[neuronlist_id[connect['src']]]['out'].append(connect['dst'])
        neurongroup[neuronlist_id[connect['dst']]]['in'] += 1  ##入度
        # f = open(file_path + connect['synapses'], 'r')
        # print(f)
        # f.close()

    network['max_neuron'] = max_neuron
    network['neuronlist_id'] = neuronlist_id
    return network

def is_FNN(network):
    neurongroup = network['neuronGroups']
    for neuron in neurongroup:
        if(len(neuron['out']) > 1):
            return False
    return True

def connection(file):
    back = file.split('.')[-1]
    if back == 'txt':
        f = open(file, 'r')
        cons = f.readlines()
        file_con = []
        for line in cons:
            con = line.split()
            src = int(float(con[0]))
            dst = int(float(con[1]))
            weight = int(float(con[2]))
            file_con.append((src, dst, weight))
        f.close()
        return file_con
    f = open(file, 'rb')
    con = pickle.load(f)
    f.close()
    return con

def FNN(network): 
    layers = {}
    x_coord = 0
    neurongroup = network['neuronGroups']
    netdepth = network['netDepth']
    connectconfig = network['connectConfig']
    neuronlist_id = network['neuronlist_id']
    max_neuron = network['max_neuron']
    layer = {}
    x = int(max_neuron / 200)
    map_json = {"data": [], "links": [], "layers": [], "ratio": x, "nums": []}

    for neuron in neurongroup: #输入层
        if neuron['in'] == 0:
            layer = neuron
            break
    while(True):
        # if layer['neuronSize'] > 50:
        #     max_id = layer['neuronSize']/x
        # else:
        #     max_id = layer['neuronSize']
        layers.update({layer['layerName']: {"neus": [], "neus_tmp": [], "x": x_coord, "num": layer['neuronSize']}})
        x_coord += 500
        if(len(layer['out']) == 0):
            break
        next_id = layer['out'][0]
        layer = neurongroup[neuronlist_id[next_id]]

    index = 0
    for connect in connectconfig:
        connection_color = color_dict[color_list[index % len(color_list)]]
        source_layer = connect['src']
        dest_layer = connect['dst']
        connnetions = connection(file_path + connect['synapses'])

        max_id1 = math.ceil((layers[source_layer])["num"] / x)
        y1_coord_inc = 2300 / (max_id1 + 1)
        max_id2 = math.ceil((layers[dest_layer])["num"] / x)
        y2_coord_inc = 2300 / (max_id2 + 1)
        y1_coord = 0
        y2_coord = 0

        for con in connnetions:
            source_neus_index = int(int(con[0]) / x)
            dest_neus_index = int(int(con[1]) / x)
            source_neus_name = source_layer + ":" + str(source_neus_index)
            dest_neus_name = dest_layer + ":" + str(dest_neus_index)

            if source_neus_index not in (layers[source_layer])["neus_tmp"]:
                y1_coord += y1_coord_inc
                (layers[source_layer])["neus_tmp"].append(source_neus_index)
                source_neus = {
                    "name": source_neus_name,
                    # "symbolSize": size,
                    "x": (layers[source_layer])["x"],
                    "y": y1_coord,
                    "category": source_layer
                }
                (layers[source_layer])["neus"].append(source_neus)

            if dest_neus_index not in (layers[dest_layer])["neus_tmp"]:
                y2_coord += y2_coord_inc
                (layers[dest_layer])["neus_tmp"].append(dest_neus_index)
                dest_neus = {
                    "name": dest_neus_name,
                    "x": (layers[dest_layer])["x"],
                    "y": y2_coord,
                    "category": dest_layer
                }
                (layers[dest_layer])["neus"].append(dest_neus)

            neus_pair = {
                "source": source_neus_name,
                "target": dest_neus_name,
                # "lineStyle":{
                #     "color":connection_color
                # }
            }
            # if neus_pair in map_json["links"]:
            #     continue

            map_json["links"].append(neus_pair)

        index += 1

    for layer_name, layer_content in layers.items():
        layer_content["neus"].sort(key=get_index)
        map_json["layers"].append(layer_name)
        map_json["nums"].append(layer_content["num"])
        map_json["data"].extend(layer_content["neus"])

    filename = os.path.join(dir_path,'map.json')
    with open(filename, 'w') as outfile:
        json.dump(map_json, outfile)

def SNN(network):
    layers = {}
    neurongroup = network['neuronGroups']
    netdepth = network['netDepth']
    connectconfig = network['connectConfig']
    neuronlist_id = network['neuronlist_id']
    max_neuron = network['max_neuron']
    x = max_neuron / 1000
    map_json = {"data": [], "links": [], "layers": [], "ratio": 1, "nums": []}

    for neuron in neurongroup:
        layers.update({neuron['layerName']: {"neus": [], "neus_tmp": [], "num": neuron['neuronSize']}})

    index = 0
    for connect in connectconfig:
        connection_color = color_dict[color_list[index % len(color_list)]]
        source_layer = connect['src']
        dest_layer = connect['dst']
        connnetions = connection(file_path + connect['synapses'])

        for con in connnetions:
            source_neus_index = int(con[0])
            dest_neus_index = int(con[1])
            source_neus_name = source_layer + ":" + str(source_neus_index)
            dest_neus_name = dest_layer + ":" + str(dest_neus_index)

            if source_neus_index not in (layers[source_layer])["neus_tmp"]:
                (layers[source_layer])["neus_tmp"].append(source_neus_index)
                source_neus = {
                    "name": source_neus_name,
                    "category": source_layer
                }
                (layers[source_layer])["neus"].append(source_neus)

            if dest_neus_index not in (layers[dest_layer])["neus_tmp"]:
                (layers[dest_layer])["neus_tmp"].append(dest_neus_index)
                dest_neus = {
                    "name": dest_neus_name,
                    "category": dest_layer
                }
                (layers[dest_layer])["neus"].append(dest_neus)

            neus_pair = {
                "source": source_neus_name,
                "target": dest_neus_name,
                "lineStyle":{
                    "color":connection_color
                }
            }
            map_json["links"].append(neus_pair)
        index += 1

    ceng = 2
    coord = {}
    cc = netdepth / 4
    while(cc > ceng):
        ceng += 1
    for i in range(ceng):
        if i % 2 == 0:
            coord.update({i: {'x': 0, 'y': i * 500}})
        else:
            coord.update({i: {'x': 500, 'y': i * 500}})
    c_id = 0
    for layer_name, layer_content in layers.items():
        layer_content["neus"].sort(key=get_index)
        c_num = c_id % ceng
        x_coord = coord[c_num]['x']
        y_coord = coord[c_num]['y']
        coord[c_num]['x'] += 1000
        r = 200
        if len(layer_content["neus"]) < 10:
            r = 10
        elif len(layer_content["neus"]) > 500:
            r = 300
        t = 0
        t_inc = 3.14 * 2 / len(layer_content["neus"])
        for node in layer_content["neus"]:
            node["x"] = r * math.cos(t) + x_coord
            node["y"] = r * math.sin(t) + y_coord
            t += t_inc
        map_json["layers"].append(layer_name)
        map_json["nums"].append(layer_content["num"])
        map_json["data"].extend(layer_content["neus"])
        c_id += 1

    filename = os.path.join(dir_path,'map.json')
    with open(filename, 'w') as outfile:
        json.dump(map_json, outfile)

def get_map(file):
    network = get_network(file)
    if(is_FNN(network)):
        FNN(network)
    else:
        SNN(network)


if __name__ == "__main__":
    print("load_start")
    print("正在转化DarwinLang ...")
    file = sys.argv[1]
    dir_path = sys.argv[2]
    # file = 'DarwinLang/mnist/mnist_Lang.json'
    # file = 'DarwinLang/lgn/snn_lgn_lang.json'
    # file = 'DarwinLang/stm/stm.json'
    # file_path = 'DarwinLang/mnist/'
    file_path = os.path.split(file)[0] + '/'
    # print(file_path)
    # get_network(file)
    # network = get_network(file)
    # print(is_FNN(network))
    get_map(file)
    print("load_end")