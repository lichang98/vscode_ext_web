# -*- coding:utf-8 -*-

from flask import Flask,Response
from os import path
import socket
app = Flask(__name__)

base_path = path.dirname(path.abspath(__file__))

def isUse(ip, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((ip, int(port)))
        sock.shutdown(2)
        return True
    except Exception as e:
        return False

@app.route("/img/<imgres>")
def getImg(imgres):
    print("path = "+path.join(base_path, imgres))
    with open(path.join(base_path, "layer_vis_imgs",imgres),"rb") as f:
        img = f.read()
        return Response(img, mimetype="image/png")

if __name__ == "__main__":
    if not isUse("127.0.0.1",6003):
        app.run(host="0.0.0.0", port=6003)