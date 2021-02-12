# -*- coding:utf-8 -*-

from flask import Flask,Response,request
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

@app.route("/snn_imgs/<imgres>")
def getSnnTestImg(imgres):
    with open(path.join(base_path, "..", "darwin2sim", "model_out", "bin_darwin_out", "inputs", imgres), "rb") as f:
        img = f.read()
        return Response(img, mimetype="image/png")

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown', methods=['POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@app.route('/js/<js_file>')
def get_js(js_file):
    with open(path.join(base_path, "..", "..", "src", "resources","js_css","js",js_file), "r",encoding="utf-8") as f:
        content = f.read()
        return Response(content, mimetype="text/javascript")

@app.route("/css/<css_file>")
def get_css(css_file):
    with open(path.join(base_path, "..", "..", "src", "resources","js_css","css",css_file), "r",encoding="utf-8") as f:
        content = f.read()
        return Response(content, mimetype="text/css")

@app.route("/ping", methods=['GET'])
def ping():
    return Response()


if __name__ == "__main__":
    if not isUse("127.0.0.1",6003):
        app.run(host="0.0.0.0", port=6003)